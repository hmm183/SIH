import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { History, PlusCircle } from 'lucide-react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

// 🌐 Import your custom LangContext and useLang hook
import { useLang } from '../../../context/LangContext';

// Import the new components
import HealthMetrics from '../dashboard/HealthMetrics';
import MedicationList from '../dashboard/MedicationList';
import PatientNotes from '../dashboard/PatientNotes';

// Backend URL
const BACKEND_URL = 'http://localhost:5000/api/v1';

export default function PatientDashboard() {
  const { language, t, translateText } = useLang();

  const [init, setInit] = useState(false);
  const [historySummary, setHistorySummary] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [patientNote, setPatientNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [healthSummary, setHealthSummary] = useState(null);
  const [displayedSummary, setDisplayedSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [dailyReadings, setDailyReadings] = useState([]);
  const [newCurrentMed, setNewCurrentMed] = useState({ name: '', dosage: '', frequency: '' });

  async function parseResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch (err) {
        return { success: false, message: 'Invalid JSON response' };
      }
    }
    const text = await res.text();
    return { success: false, message: text };
  }

  const translateNotes = async (notes) => {
    if (language === 'en') {
      return notes;
    }
    try {
      const textsToTranslate = notes.map(note => note.noteText);
      const translatedTexts = await translateText(textsToTranslate, language);
      return notes.map((note, index) => ({
        ...note,
        translatedText: translatedTexts[index],
      }));
    } catch (err) {
      console.error('Notes translation failed:', err);
      return notes;
    }
  };

  const fetchNotes = async (pId) => {
    const token = localStorage.getItem('authToken');
    if (!token || !pId) return;
    try {
      const url = `${BACKEND_URL}/notes/patient/${pId}?includeArchived=${showArchived}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 404) setNotesList([]);
        return;
      }
      const data = await res.json();
      const notes = Array.isArray(data) ? data : data.data ?? data;
      const translatedNotes = await translateNotes(notes);
      setNotesList(translatedNotes);
    } catch (err) {
      console.error('fetchNotes network error:', err);
    }
  };

  const handleCreateNote = async (noteText) => {
    const token = localStorage.getItem('authToken');
    if (!token || !patientId || !noteText.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteText: noteText.trim(), patientId }),
      });
      const parsed = await parseResponse(res);
      if (!res.ok) {
        return;
      }
      const newNote = parsed.data ?? parsed;
      const translatedNote = (await translateNotes([newNote]))[0];
      setNotesList((prev) => [translatedNote, ...prev]);
      setPatientNote('');
    } catch (err) {
      console.error('create note network error:', err);
    }
  };

  const handleUpdateNote = async (noteId) => {
    const token = localStorage.getItem('authToken');
    if (!token || !patientId || !editingText.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noteText: editingText.trim(), patientId }),
      });
      const parsed = await parseResponse(res);
      if (!res.ok) {
        return;
      }
      const updated = parsed.data ?? parsed;
      const translatedUpdatedNote = (await translateNotes([updated]))[0];
      setNotesList((prev) => prev.map((n) => (n._id === noteId ? translatedUpdatedNote : n)));
      setEditingNoteId(null);
      setEditingText('');
    } catch (err) {
      console.error('updateNote network error:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    const token = localStorage.getItem('authToken');
    if (!token || !patientId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) return;
      setNotesList((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error('deleteNote network error:', err);
    }
  };

  const handleRestoreNote = async (noteId) => {
    const token = localStorage.getItem('authToken');
    if (!token || !patientId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/notes/${noteId}/restore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId }),
      });
      if (!res.ok) return;
      const restored = (await parseResponse(res))?.data ?? await parseResponse(res);
      const translatedRestoredNote = (await translateNotes([restored]))[0];
      setNotesList((prev) => prev.map((n) => (n._id === noteId ? translatedRestoredNote : n)));
    } catch (err) {
      console.error('restoreNote network error:', err);
    }
  };

  const handleNoteSubmit = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleCreateNote(patientNote);
    }
  };

  const saveNote = () => handleCreateNote(patientNote);

  // ---------- Health Summary API (from working code) ----------
  const fetchHealthSummary = async (pId) => {
    setSummaryError('');
    setSummaryLoading(true);
    const token = localStorage.getItem('authToken');
    if (!token) {
      setSummaryError('Not authenticated.');
      setSummaryLoading(false);
      return;
    }
    if (!pId) {
      setSummaryError('Missing patientId.');
      setSummaryLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/summary/patient/${pId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setHealthSummary(null);
          setSummaryLoading(false);
          return;
        }
        const text = await res.text();
        setSummaryError(`Failed to fetch summary: ${res.status}`);
        console.error('fetchHealthSummary failed:', res.status, text.slice(0, 400));
        setSummaryLoading(false);
        return;
      }
      const json = await res.json();
      setHealthSummary(json);
      setSummaryLoading(false);
    } catch (err) {
      console.error('fetchHealthSummary network error:', err);
      setSummaryError('Network error while fetching summary.');
      setSummaryLoading(false);
    }
  };

  // ------------------- MODIFIED FUNCTION TO INCLUDE TRANSLATION -------------------
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    setSummaryError('');
    const token = localStorage.getItem('authToken');
    if (!token) {
      setSummaryError('Not authenticated.');
      setGeneratingSummary(false);
      return;
    }
    if (!patientId) {
      setSummaryError('Missing patientId.');
      setGeneratingSummary(false);
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/summary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patientId }),
      });

      const parsed = await parseResponse(res);

      if (!res.ok) {
        console.error('generate summary failed:', res.status, parsed);
        setSummaryError(parsed?.message || parsed?.error || 'Failed to generate summary.');
        setGeneratingSummary(false);
        return;
      }

      const newSummary = {
        summaryContent: parsed.healthSummary,
        generatedAt: new Date().toISOString(),
        sourceData: parsed.source,
      };

      setHealthSummary(parsed); // Update the original summary first
      setShowPrompt(false);
    } catch (err) {
      console.error('generate summary network error:', err);
      setSummaryError('Network error while generating summary.');
    } finally {
      setGeneratingSummary(false);
    }
  };
  // ----------------- END OF MODIFIED FUNCTION -----------------

  // NEW useEffect to handle translation on language or summary change
  useEffect(() => {
    const translateSummaryForDisplay = async () => {
      if (healthSummary) {
        if (language !== 'en') {
          try {
            const translatedTexts = await translateText(healthSummary.summaryContent, language);
            setDisplayedSummary(translatedTexts[0]);
          } catch (translationError) {
            console.error('Translation failed:', translationError);
            setDisplayedSummary(healthSummary.summaryContent); // Fallback to original
          }
        } else {
          setDisplayedSummary(healthSummary.summaryContent); // Use original English text
        }
      } else {
        setDisplayedSummary(''); // Reset if no summary exists
      }
    };

    translateSummaryForDisplay();
  }, [language, healthSummary, translateText]);


  // In PatientDashboard.jsx
  const handleStatusUpdate = async (prescriptionId, medicineId, newStatus) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token; cannot update medicine status.');
      return;
    }
    try {
      const response = await fetch(
        // CORRECTED URL and request body
        `${BACKEND_URL}/prescriptions/medicines/${prescriptionId}/${medicineId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          // CORRECTED request body: send the new status
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to update medicine status:', response.status, text.slice(0, 400));
        return;
      }
      setPrescriptions((prev) =>
        prev.map((p) =>
          p._id === prescriptionId
            ? {
              ...p,
              medicines: (p.medicines ?? []).map((m) =>
                m._id === medicineId ? { ...m, status: newStatus } : m
              ),
            }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to update medicine status:', err);
    }
  };

  const addMedicine = (type) => {
    alert("Functionality not implemented with the new backend. Medicines are fetched from prescriptions.");
  };

  const fetchDailyReadings = async (pId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/readings/patient/${pId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setDailyReadings(Array.isArray(data) ? data : data.data ?? []);
    } catch (error) {
      console.error('Error fetching daily readings:', error);
    }
  };

  const fetchHistorySummary = async (pId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const resp = await fetch(`${BACKEND_URL}/history/patient/${pId}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return;
      const json = await resp.json();
      setHistorySummary(json.data ?? json);
    } catch (err) {
      console.error('Error fetching history summary:', err);
    }
  };

  const fetchPrescriptions = async (pId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      const resp = await fetch(`${BACKEND_URL}/prescriptions/patient/${pId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) return;
      const json = await resp.json();
      const list = json.data ?? json;
      setPrescriptions(Array.isArray(list) ? list : []);
      setPrescriptionCount(Array.isArray(list) ? list.length : 0);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    }
  };

  useEffect(() => {
    initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setInit(true));
    const token = localStorage.getItem('authToken');
    if (!token) return;
    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      return;
    }
    const pId = decoded?.id;
    setPatientId(pId);
    if (!pId) return;

    fetchHistorySummary(pId);
    fetchPrescriptions(pId);
    fetchNotes(pId);
    fetchHealthSummary(pId);
    fetchDailyReadings(pId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reTranslateNotes = async () => {
      if (notesList.length > 0) {
        const translatedNotes = await translateNotes(notesList);
        setNotesList(translatedNotes);
      }
    };
    reTranslateNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (patientId) fetchNotes(patientId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived, patientId]);

  const currentMeds = (prescriptions ?? []).flatMap((p) =>
    (p.medicines ?? []).filter((m) => m.status === 'current').map((m) => ({ ...m, prescriptionId: p._id }))
  );
  const pastMeds = (prescriptions ?? []).flatMap((p) =>
    (p.medicines ?? []).filter((m) => m.status === 'past').map((m) => ({ ...m, prescriptionId: p._id }))
  );

  const activeNotes = notesList.filter((n) => !n.isArchived);
  const archivedNotes = notesList.filter((n) => n.isArchived);

  const formattedHealthData = [...dailyReadings]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((reading) => ({
      day: reading.date ? new Date(reading.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
      s: reading.bloodPressure?.systolic ?? null,
      d: reading.bloodPressure?.diastolic ?? null,
      w: reading.weightKg ?? null,
      p: reading.pulseRate ?? null,
    }));

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <div className="pt-24 p-6 relative z-10">
        <HealthMetrics
          t={t}
          formattedHealthData={formattedHealthData}
          prescriptionCount={prescriptionCount}
        />

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        <MedicationList
          t={t}
          currentMeds={currentMeds}
          pastMeds={pastMeds}
          handleStatusUpdate={handleStatusUpdate}
        />

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <motion.div
            className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/10 dark:border-gray-700 shadow-lg rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(99,102,241,0.6)" }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {t('diseaseHistory')}
            </h3>
            <ul className="space-y-2 mb-4">
              {historySummary && historySummary.length > 0 ? (
                historySummary.map((record, idx) => (
                  <li key={idx} className="text-gray-700 dark:text-gray-300">
                    {record.illnessName} ({record.diagnosisYear})
                  </li>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{t('noHistoryFound')}</p>
              )}
            </ul>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Link to="/patient/history">{t('seeMore')}</Link>
            </motion.button>
          </motion.div>

          <PatientNotes
            t={t}
            patientNote={patientNote}
            setPatientNote={setPatientNote}
            activeNotes={activeNotes}
            archivedNotes={archivedNotes}
            showArchived={showArchived}
            setShowArchived={setShowArchived}
            editingNoteId={editingNoteId}
            setEditingNoteId={setEditingNoteId}
            editingText={editingText}
            setEditingText={setEditingText}
            handleNoteSubmit={handleNoteSubmit}
            handleUpdateNote={handleUpdateNote}
            handleDeleteNote={handleDeleteNote}
            handleRestoreNote={handleRestoreNote}
            saveNote={saveNote}
          />
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        {/* 📝 Health Summary */}
        <motion.div
          className="mt-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl border border-white/10 dark:border-gray-700 shadow-lg rounded-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(59,130,246,0.5)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('healthSummary')}
            </h3>
            <div className="flex items-center gap-2">
              {healthSummary && <small className="text-sm text-gray-500 dark:text-gray-400 mr-2">{t('lastUpdated', { date: formatDate(healthSummary.generatedAt ?? healthSummary.updatedAt ?? healthSummary.createdAt) })}</small>}
              <button
                onClick={handleGenerateSummary}
                disabled={generatingSummary}
                className={`px-3 py-1 rounded-md text-sm ${generatingSummary ? 'bg-gray-400 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                {generatingSummary ? t('generating') : (healthSummary ? t('regenerate') : t('generate'))}
              </button>
            </div>
          </div>
          {summaryLoading ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">{t('loadingSummary')}</div>
          ) : summaryError ? (
            <div className="p-4 bg-red-50 dark:bg-red-900 text-red-700 rounded-md">
              {t('error')}: {summaryError}
            </div>
          ) : healthSummary ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {displayedSummary}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <small className="text-xs text-gray-500 dark:text-gray-400">
                  {t('generatedAt', { date: formatDate(healthSummary.generatedAt ?? healthSummary.updatedAt ?? healthSummary.createdAt) })}
                </small>
                <button onClick={() => setShowPrompt((s) => !s)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  {showPrompt ? t('hidePrompt') : t('showPrompt')}
                </button>
              </div>
              {showPrompt && (
                <pre className="mt-3 p-3 bg-white dark:bg-black/60 rounded-md text-xs text-gray-700 dark:text-gray-200 overflow-auto whitespace-pre-wrap">
                  {healthSummary.sourceData ?? t('noPromptSaved')}
                </pre>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {t('noSummaryFound')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Sub-component: HealthMetrics.jsx
// ... (code for HealthMetrics)

// Sub-component: MedicationList.jsx
// ... (code for MedicationList)

// Sub-component: PatientNotes.jsx
// ... (code for PatientNotes)