import os
import json
import time
import logging
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator

# Initialize Flask App
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ── Cache ────────────────────────────────────────────────────────────────────
CACHE_FILE = os.path.join(os.path.dirname(__file__), 'translation_cache.json')
_cache_lock = threading.Lock()

translation_cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            translation_cache = json.load(f)
        logging.info(f"Loaded cache: {sum(len(v) for v in translation_cache.values())} entries across {len(translation_cache)} languages.")
    except Exception as e:
        logging.error(f"Failed to load cache: {e}")


def _save_cache():
    """Write cache to disk (must be called while holding _cache_lock)."""
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(translation_cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logging.error(f"Failed to save cache: {e}")


# ── Language mappings ────────────────────────────────────────────────────────
GOOGLE_CODE_MAP = {
    'kok': 'gom',
    'zh': 'zh-CN',
}

# MyMemory requires full language names
MYMEMORY_LANG_MAP = {
    'hi': 'hindi', 'ml': 'malayalam', 'bn': 'bengali', 'mr': 'marathi',
    'ta': 'tamil', 'te': 'telugu', 'as': 'assamese', 'bho': 'bhojpuri',
    'gu': 'gujarati', 'kn': 'kannada', 'kok': 'konkani', 'mai': 'maithili',
    'mni': 'manipuri', 'mni-Mtei': 'manipuri', 'ne': 'nepali',
    'or': 'odia', 'pa': 'punjabi', 'sa': 'sanskrit', 'sd': 'sindhi',
    'ur': 'urdu', 'fr': 'french', 'es': 'spanish', 'de': 'german',
    'zh': 'chinese simplified', 'zh-CN': 'chinese simplified',
    'ar': 'arabic', 'ru': 'russian', 'ja': 'japanese', 'pt': 'portuguese',
}

# Track whether Google is currently rate-limited so we skip it fast
_google_blocked_until = 0  # epoch timestamp


def _google_translate_batch(texts, target_code):
    """Try Google Translate for a small batch. Returns list or raises."""
    global _google_blocked_until
    
    now = time.time()
    if now < _google_blocked_until:
        raise RuntimeError("Google rate-limited, skipping")
    
    translator = GoogleTranslator(source='auto', target=target_code)
    try:
        result = translator.translate_batch(texts)
        return result
    except Exception as e:
        err_str = str(e)
        if 'too many requests' in err_str.lower() or '429' in err_str:
            _google_blocked_until = now + 60  # block for 60 seconds
            logging.warning("Google rate-limited. Blocking Google for 60s.")
        raise


def _mymemory_translate_batch(texts, target_lang_code):
    """Try MyMemory for a small batch. Returns list or raises."""
    mm_name = MYMEMORY_LANG_MAP.get(target_lang_code)
    if not mm_name:
        raise ValueError(f"No MyMemory mapping for '{target_lang_code}'")
    
    from deep_translator import MyMemoryTranslator
    translator = MyMemoryTranslator(source='english', target=mm_name)
    
    MAX_CHARS = 450  # MyMemory limit is 500, leave margin
    
    def _translate_one(text):
        """Translate a single text, splitting into chunks if too long."""
        if len(text) <= MAX_CHARS:
            return translator.translate(text)
        
        # Split long text into sentences and translate each
        import re
        sentences = re.split(r'(?<=[.!?\n])\s+', text)
        translated_parts = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) + 1 <= MAX_CHARS:
                current_chunk += (" " if current_chunk else "") + sentence
            else:
                if current_chunk:
                    translated_parts.append(translator.translate(current_chunk))
                    time.sleep(0.2)
                # If a single sentence is too long, translate it directly (it may fail but worth trying)
                if len(sentence) > MAX_CHARS:
                    # Split by commas or just force chunks
                    for i in range(0, len(sentence), MAX_CHARS):
                        sub = sentence[i:i+MAX_CHARS]
                        translated_parts.append(translator.translate(sub))
                        time.sleep(0.2)
                    current_chunk = ""
                else:
                    current_chunk = sentence
        
        if current_chunk:
            translated_parts.append(translator.translate(current_chunk))
        
        return " ".join(translated_parts)
    
    results = []
    for text in texts:
        try:
            results.append(_translate_one(text))
        except Exception as e:
            logging.warning(f"MyMemory single-item failed for '{text[:40]}...': {e}")
            results.append(text)  # keep original on failure
        time.sleep(0.3)  # small delay to avoid MyMemory rate limits
    return results


def translate_safe(texts, target_lang):
    """Translate a list of strings, using cache + Google + MyMemory fallback."""
    if not texts:
        return []

    google_code = GOOGLE_CODE_MAP.get(target_lang, target_lang)

    with _cache_lock:
        if google_code not in translation_cache:
            translation_cache[google_code] = {}
        lang_cache = translation_cache[google_code]

    # ── Partition into cached vs uncached ─────────────────────────────────
    results = [None] * len(texts)
    uncached = []  # list of (original_index, text_str)

    for idx, text in enumerate(texts):
        text_str = str(text) if text is not None else ""
        if not text_str.strip():
            results[idx] = text_str
        elif text_str in lang_cache:
            results[idx] = lang_cache[text_str]
        else:
            uncached.append((idx, text_str))

    if not uncached:
        logging.info(f"All {len(texts)} served from cache for '{google_code}'.")
        return results

    logging.info(f"Need to translate {len(uncached)} texts for '{google_code}' ({len(texts) - len(uncached)} cached).")

    # ── Chunk into small batches (max 10 items, max 2000 chars) ──────────
    chunks = []        # each chunk is list of (orig_idx, text_str)
    cur_chunk = []
    cur_chars = 0
    for item in uncached:
        tlen = len(item[1])
        if len(cur_chunk) >= 10 or cur_chars + tlen > 2000:
            chunks.append(cur_chunk)
            cur_chunk = []
            cur_chars = 0
        cur_chunk.append(item)
        cur_chars += tlen
    if cur_chunk:
        chunks.append(cur_chunk)

    # ── Translate each chunk ─────────────────────────────────────────────
    new_cache_entries = {}

    for chunk_i, chunk in enumerate(chunks):
        chunk_texts = [t for _, t in chunk]
        translated = None

        # 1) Try Google
        try:
            translated = _google_translate_batch(chunk_texts, google_code)
            logging.info(f"  Chunk {chunk_i+1}/{len(chunks)}: Google OK ({len(chunk_texts)} items)")
        except Exception:
            pass

        # 2) Fallback: MyMemory
        if translated is None:
            try:
                translated = _mymemory_translate_batch(chunk_texts, target_lang)
                logging.info(f"  Chunk {chunk_i+1}/{len(chunks)}: MyMemory OK ({len(chunk_texts)} items)")
            except Exception as e:
                logging.error(f"  Chunk {chunk_i+1}/{len(chunks)}: All providers failed: {e}")
                translated = chunk_texts  # keep originals

        # Store results
        for (orig_idx, orig_text), trans_text in zip(chunk, translated):
            results[orig_idx] = trans_text
            if trans_text != orig_text:  # only cache if actually translated
                new_cache_entries[orig_text] = trans_text

        # Small delay between chunks to avoid hammering
        if chunk_i < len(chunks) - 1:
            time.sleep(0.5)

    # ── Update persistent cache ──────────────────────────────────────────
    if new_cache_entries:
        with _cache_lock:
            lang_cache.update(new_cache_entries)
            _save_cache()
        logging.info(f"Cached {len(new_cache_entries)} new translations for '{google_code}'.")

    return results


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON request"}), 400

    q = data.get('q')
    target = data.get('target')

    if not q or not target:
        return jsonify({"error": "Missing 'q' or 'target' parameter"}), 400

    # Normalize: always work with a list internally
    is_list = isinstance(q, list)
    texts = q if is_list else [q]

    translated_texts = translate_safe(texts, target)

    response_data = {
        "translations": translated_texts if is_list else translated_texts[0]
    }
    return jsonify(response_data)


@app.route('/health', methods=['GET'])
def health():
    cache_stats = {lang: len(entries) for lang, entries in translation_cache.items()}
    return jsonify({
        "status": "healthy",
        "cache_languages": len(translation_cache),
        "cache_entries": sum(cache_stats.values()),
        "cache_detail": cache_stats,
        "google_blocked": time.time() < _google_blocked_until,
    })

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "healthy"
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5005))
    logging.info(f"Starting translation service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
