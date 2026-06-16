"""
Generate static translation JSON files for all supported languages.
Uses the local Python translation service at port 5005.

Usage: python generate_translations.py [lang1] [lang2] ...
       python generate_translations.py          # generates for all languages
       python generate_translations.py hi ml    # generates for Hindi & Malayalam only
"""
import json
import sys
import os
import time
import urllib.request

TRANSLATE_URL = "http://localhost:5005/translate"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "client", "src", "translations")

# All supported languages (minus English which is the base)
ALL_LANGUAGES = [
    "hi", "ml", "bn", "mr", "ta", "te", "as", "bho", "doi",
    "gu", "kn", "kok", "mai", "mni-Mtei", "ne", "or", "pa",
    "sa", "sd", "ur", "fr", "es", "de", "zh", "ar", "ru", "ja", "pt"
]

# Read BASE_TEXTS dynamically by calling extract_base_texts.js
import subprocess

def get_base_texts():
    try:
        script_path = os.path.join(os.path.dirname(__file__), "extract_base_texts.js")
        out = subprocess.check_output(["node", script_path], text=True)
        return json.loads(out)
    except Exception as e:
        print(f"Error calling extract_base_texts.js: {e}")
        sys.exit(1)

BASE_TEXTS = get_base_texts()


def translate_batch(texts, target_lang):
    """Call the local Python translation service."""
    data = json.dumps({"q": texts, "target": target_lang}).encode("utf-8")
    req = urllib.request.Request(
        TRANSLATE_URL,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))
    return result["translations"]


def generate_for_language(lang):
    """Generate translation file for a single language."""
    keys = list(BASE_TEXTS.keys())
    values = list(BASE_TEXTS.values())

    # Filter out empty values
    non_empty = [(k, v) for k, v in zip(keys, values) if v and v.strip()]

    print(f"  Translating {len(non_empty)} strings to '{lang}'...")

    # Batch in groups of 30
    translated = {}
    BATCH = 30
    for i in range(0, len(non_empty), BATCH):
        batch_pairs = non_empty[i:i + BATCH]
        batch_values = [v for _, v in batch_pairs]
        batch_keys = [k for k, _ in batch_pairs]

        try:
            results = translate_batch(batch_values, lang)
            for k, t in zip(batch_keys, results):
                translated[k] = t
            print(f"    Batch {i // BATCH + 1}/{(len(non_empty) + BATCH - 1) // BATCH} OK")
        except Exception as e:
            print(f"    Batch {i // BATCH + 1} FAILED: {e}")
            # Keep originals for failed batch
            for k, v in batch_pairs:
                translated[k] = v

        time.sleep(0.5)  # Small delay between batches

    return translated


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    langs = sys.argv[1:] if len(sys.argv) > 1 else ALL_LANGUAGES

    for lang in langs:
        print(f"\n{'='*50}")
        print(f"Generating translations for: {lang}")
        print(f"{'='*50}")

        translated = generate_for_language(lang)

        output_file = os.path.join(OUTPUT_DIR, f"{lang}.json")
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(translated, f, ensure_ascii=False, indent=2)

        print(f"  Saved {len(translated)} translations to {output_file}")

    # Ensure all other supported languages have at least an empty JSON file
    # to prevent React compilation errors from missing imports.
    for l in ALL_LANGUAGES:
        fpath = os.path.join(OUTPUT_DIR, f"{l}.json")
        if not os.path.exists(fpath):
            with open(fpath, "w", encoding="utf-8") as f:
                json.dump({}, f)

    # Also create an index.js that exports all translations
    index_content = "// Auto-generated - do not edit manually\n"
    index_content += "// Run: python translation_service/generate_translations.py\n\n"

    for lang in ALL_LANGUAGES:
        safe_name = lang.replace("-", "_")
        index_content += f"import {safe_name} from './{lang}.json';\n"

    index_content += "\nconst staticTranslations = {\n"
    for lang in ALL_LANGUAGES:
        safe_name = lang.replace("-", "_")
        index_content += f"  '{lang}': {safe_name},\n"
    index_content += "};\n\nexport default staticTranslations;\n"

    index_file = os.path.join(OUTPUT_DIR, "index.js")
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(index_content)

    print(f"\nCreated index file: {index_file}")
    print("Done!")


if __name__ == "__main__":
    main()
