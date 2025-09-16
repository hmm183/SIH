import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { jwtDecode } from 'jwt-decode'; // <-- 1. IMPORT JWT-DECODE
import {
  User,
  Pill,
  HeartPulse,
  MessageSquare,
  Send,
  History,
  Edit,
  PlusCircle,
  MapPin,
  Trash2,
} from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

// --- Helper Hook for Debouncing Search Input ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// --- Add History Modal Component ---
const AddHistoryModal = ({ patientId, onClose, onSave }) => {
  // 2. 'prescribedBy' is removed from the form state
  const [formData, setFormData] = useState({
    illnessName: "",
    diagnosisDate: new Date().toISOString().split("T")[0],
    initialSymptoms: "",
    remarks: "",
    medicinesPrescribed: "",
    status: "ongoing",
    hospital: "",
    address: "",
    location: { type: "Point", coordinates: [0, 0] },
  });

  const [addressSearch, setAddressSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const debouncedSearchTerm = useDebounce(addressSearch, 500);

  useEffect(() => {
    const searchAddresses = async () => {
      if (debouncedSearchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedSearchTerm}`
      );
      const data = await res.json();
      setSearchResults(data);
    };
    searchAddresses();
  }, [debouncedSearchTerm]);

  const handleSelectAddress = (result) => {
    const newAddress = result.display_name;
    const newLocation = {
      type: "Point",
      coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
    };
    setFormData({ ...formData, address: newAddress, location: newLocation });
    setAddressSearch(newAddress);
    setSearchResults([]);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation is not supported by your browser.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        handleSelectAddress({
          display_name: data.display_name,
          lon: longitude,
          lat: latitude,
        });
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    // 3. Manual validation for doctor ID is removed
    const processedData = {
      ...formData,
      patientId,
      initialSymptoms: formData.initialSymptoms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      medicinesPrescribed: formData.medicinesPrescribed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onSave(processedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6">Add New Disease History</h2>
        <div className="space-y-4">
          {/* 4. The manual input field for 'prescribedBy' is REMOVED from the form */}
          <input type="text" name="illnessName" value={formData.illnessName} onChange={handleChange} placeholder="Illness Name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="date" name="diagnosisDate" value={formData.diagnosisDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <textarea name="initialSymptoms" value={formData.initialSymptoms} onChange={handleChange} placeholder="Initial Symptoms (comma-separated)" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <textarea name="medicinesPrescribed" value={formData.medicinesPrescribed} onChange={handleChange} placeholder="Medicines Prescribed (comma-separated)" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} placeholder="Hospital" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="ongoing">Ongoing</option>
            <option value="resolved">Resolved</option>
          </select>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Location / Address</label>
            <div className="flex items-center">
              <input type="text" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder="Search for an address" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md" />
              <button onClick={handleGetCurrentLocation} disabled={isLocating} className="bg-blue-500 text-white p-2.5 mt-1 rounded-r-md disabled:bg-blue-300">
                <MapPin size={20}/>
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                {searchResults.map(result => <li key={result.place_id} onClick={() => handleSelectAddress(result)} className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100">{result.display_name}</li>)}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Edit History Modal Component ---
const EditHistoryModal = ({ historyItem, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    illnessName: historyItem.illnessName || "",
    diagnosisDate: historyItem.diagnosisDate ? new Date(historyItem.diagnosisDate).toISOString().split("T")[0] : "",
    initialSymptoms: (historyItem.initialSymptoms || []).join(", "),
    remarks: historyItem.remarks || "",
    medicinesPrescribed: (historyItem.medicinesPrescribed || []).join(", "),
    // 'prescribedBy' is removed from the editable form state
    status: historyItem.status || "ongoing",
    hospital: historyItem.hospital || "",
    address: historyItem.address || "",
    location: historyItem.location || { type: "Point", coordinates: [0, 0] },
  });
  
  const [addressSearch, setAddressSearch] = useState(historyItem.address || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const debouncedSearchTerm = useDebounce(addressSearch, 500);

  useEffect(() => {
    const searchAddresses = async () => {
      if (debouncedSearchTerm.length < 3) {
        setSearchResults([]);
        return;
      }
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${debouncedSearchTerm}`
      );
      const data = await res.json();
      setSearchResults(data);
    };
    searchAddresses();
  }, [debouncedSearchTerm]);

  const handleSelectAddress = (result) => {
    const newAddress = result.display_name;
    const newLocation = {
      type: "Point",
      coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
    };
    setFormData({ ...formData, address: newAddress, location: newLocation });
    setAddressSearch(newAddress);
    setSearchResults([]);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation)
      return alert("Geolocation is not supported by your browser.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        handleSelectAddress({
          display_name: data.display_name,
          lon: longitude,
          lat: latitude,
        });
        setIsLocating(false);
      },
      () => {
        alert("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

   const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

   const handleSave = () => {
     const processedData = {
       ...formData,
       initialSymptoms: formData.initialSymptoms.split(",").map((s) => s.trim()).filter(Boolean),
       medicinesPrescribed: formData.medicinesPrescribed.split(",").map((s) => s.trim()).filter(Boolean),
     };
     onSave(historyItem._id, processedData);
   };

  return (
     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold mb-6">Edit Disease History</h2>
        <div className="space-y-4">
          <input type="text" name="illnessName" value={formData.illnessName} onChange={handleChange} placeholder="Illness Name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <input type="date" name="diagnosisDate" value={formData.diagnosisDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <textarea name="initialSymptoms" value={formData.initialSymptoms} onChange={handleChange} placeholder="Initial Symptoms (comma-separated)" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <textarea name="medicinesPrescribed" value={formData.medicinesPrescribed} onChange={handleChange} placeholder="Medicines Prescribed (comma-separated)" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} placeholder="Hospital" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"/>
          <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Remarks" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
          <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="ongoing">Ongoing</option>
            <option value="resolved">Resolved</option>
          </select>
           <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Location / Address</label>
            <div className="flex items-center">
              <input type="text" value={addressSearch} onChange={(e) => setAddressSearch(e.target.value)} placeholder="Search for an address" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md" />
              <button onClick={handleGetCurrentLocation} disabled={isLocating} className="bg-blue-500 text-white p-2.5 mt-1 rounded-r-md disabled:bg-blue-300">
                <MapPin size={20}/>
              </button>
            </div>
            {searchResults.length > 0 && (
              <ul className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                {searchResults.map(result => <li key={result.place_id} onClick={() => handleSelectAddress(result)} className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100">{result.display_name}</li>)}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save Changes</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Add Medicine Modal Component ---
const AddMedicineModal = ({ prescriptionId, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: '', dosage: '', frequency: '', duration: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSave = () => {
        if (!formData.name.trim()) return alert('Medicine name is required.');
        onSave(prescriptionId, formData);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Add New Medicine</h2>
                <div className="space-y-4">
                    <input type="text" name="name" placeholder="Medicine Name (e.g., Paracetamol)" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="dosage" placeholder="Dosage (e.g., 500mg)" value={formData.dosage} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="frequency" placeholder="Frequency (e.g., Twice a day)" value={formData.frequency} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="duration" placeholder="Duration (e.g., 5 days)" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Add Medicine</button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Edit Medicine Modal Component ---
const EditMedicineModal = ({ medicine, prescriptionId, onClose, onSave }) => {
    const [formData, setFormData] = useState({ name: medicine.name, dosage: medicine.dosage || '', frequency: medicine.frequency || '', duration: medicine.duration || '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSave = () => {
        if (!formData.name.trim()) return alert('Medicine name is required.');
        onSave(prescriptionId, medicine._id, formData);
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">Edit Medicine</h2>
                <div className="space-y-4">
                    <input type="text" name="name" placeholder="Medicine Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="dosage" placeholder="Dosage" value={formData.dosage} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="frequency" placeholder="Frequency" value={formData.frequency} onChange={handleChange} className="w-full p-2 border rounded"/>
                    <input type="text" name="duration" placeholder="Duration" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded"/>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md">Save Changes</button>
                </div>
            </motion.div>
        </div>
    );
};

// --- Chatbot Component ---
const Chatbot = ({ patientId }) => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([{ from: 'ai', text: 'Ask a specific question about this patient\'s history, medications, or vitals.' }]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;
        const newMessages = [...messages, { from: 'user', text: prompt }];
        setMessages(newMessages);
        const userQuery = prompt;
        setPrompt('');
        setIsLoading(true);

        try {
            const res = await fetch(`${BACKEND_URL}/api/v1/summary/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId, userQuery })
            });
            if (!res.ok) throw new Error("Failed to get response from AI assistant.");
            const data = await res.json();
            setMessages([...newMessages, { from: 'ai', text: data.answer || 'Sorry, I could not find an answer.' }]);
        } catch (error) {
            setMessages([...newMessages, { from: 'ai', text: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><MessageSquare className="mr-2"/> AI Health Assistant</h3>
            <div className="flex-grow bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <p className={`max-w-xs md:max-w-md p-3 rounded-2xl whitespace-pre-wrap ${msg.from === 'ai' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                           {msg.text}
                        </p>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><p className="p-3 rounded-2xl bg-gray-200">Analyzing...</p></div>}
            </div>
            <div className="flex">
                <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Summarize current medications..." onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="w-full p-2 border rounded-l-lg outline-none" />
                <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 text-white px-4 rounded-r-lg disabled:bg-indigo-400"><Send/></button>
            </div>
        </div>
    );
};


// --- Main Patient Profile Page ---
export default function PatientProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [readings, setReadings] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const [editingHistory, setEditingHistory] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddingMedicine, setIsAddingMedicine] = useState(null);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [patientRes, presRes, readRes, histRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/v1/patients/${id}`),
          fetch(`${BACKEND_URL}/api/v1/prescriptions/patient/${id}`),
          fetch(`${BACKEND_URL}/api/v1/readings/patient/${id}`),
          fetch(`${BACKEND_URL}/api/v1/history/patient/${id}`),
        ]);
        if (!patientRes.ok) throw new Error("Failed to fetch patient details.");
        setPatient(await patientRes.json());
        setPrescriptions(presRes.ok ? await presRes.json() : []);
        setReadings(readRes.ok ? await readRes.json() : []);
        setHistory(histRes.ok ? await histRes.json() : []);
      } catch (err) {
        setError(err.message);
      }
    };
    if (id) fetchAllData();
  }, [id]);

  const handleSaveHistory = async (historyId, updatedDataFromModal) => {
    try {
      const token = localStorage.getItem('doctorAuthToken');
      if (!token) {
        return alert("Authentication error. Please log in as a doctor.");
      }
      const decodedToken = jwtDecode(token);
      const doctorId = decodedToken.id;

      const completeData = {
        ...updatedDataFromModal,
        prescribedBy: doctorId,
      };

      const res = await fetch(`${BACKEND_URL}/api/v1/history/${historyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      });
      if (!res.ok) throw new Error("Failed to update history.");
      const savedHistory = await res.json();
      setHistory(
        history.map((item) => (item._id === historyId ? savedHistory : item))
      );
      setEditingHistory(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNewHistory = async (newHistoryDataFromModal) => {
    try {
      const token = localStorage.getItem('doctorAuthToken');
      if (!token) {
        return alert("Authentication error. Please log in as a doctor.");
      }
      const decodedToken = jwtDecode(token);
      const doctorId = decodedToken.id;

      const completeData = {
        ...newHistoryDataFromModal,
        prescribedBy: doctorId,
      };

      const res = await fetch(`${BACKEND_URL}/api/v1/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completeData),
      });
      if (!res.ok) throw new Error("Failed to add new history record.");
      const savedEntry = await res.json();
      setHistory([savedEntry, ...history]);
      setIsAddModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };
  
  const handleDeleteHistory = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this history record?")) {
        return;
    }
    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/history/${historyId}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete history record.');
        setHistory(history.filter(item => item._id !== historyId));
    } catch (err) {
        alert(err.message);
    }
  };

  const updatePrescriptionInState = (updatedPrescription) => {
      setPrescriptions(prescriptions.map(p => p._id === updatedPrescription._id ? updatedPrescription : p));
  };

  const handleAddMedicine = async (prescriptionId, medicineData) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/v1/prescriptions/${prescriptionId}/medicines`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(medicineData),
          });
          if (!res.ok) throw new Error('Failed to add medicine.');
          const updatedPrescription = await res.json();
          updatePrescriptionInState(updatedPrescription);
          setIsAddingMedicine(null);
      } catch (err) {
          alert(err.message);
      }
  };

  const handleUpdateMedicine = async (prescriptionId, medicineId, medicineData) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/v1/prescriptions/${prescriptionId}/medicines/${medicineId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(medicineData),
          });
          if (!res.ok) throw new Error('Failed to update medicine.');
          const updatedPrescription = await res.json();
          updatePrescriptionInState(updatedPrescription);
          setEditingMedicine(null);
      } catch (err) {
          alert(err.message);
      }
  };
    
  const handleMedicineStatusChange = async (prescriptionId, medicineId, newStatus) => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/v1/prescriptions/medicines/${prescriptionId}/${medicineId}/status`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
          });
          if (!res.ok) throw new Error('Failed to update status.');
          const updatedPrescription = await res.json();
          updatePrescriptionInState(updatedPrescription);
      } catch (err) {
          alert(err.message);
      }
  };

  if (error) return <div className="pt-20 p-6 text-red-500 text-center">{error}</div>;
  if (!patient) return <div className="pt-20 p-6 text-center">Loading patient profile...</div>;

  return (
    <div className="pt-20 p-6 bg-gray-50 min-h-screen">
        {isAddModalOpen && (
            <AddHistoryModal
                patientId={id}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddNewHistory}
            />
        )}
        {editingHistory && (
            <EditHistoryModal
                historyItem={editingHistory}
                onClose={() => setEditingHistory(null)}
                onSave={handleSaveHistory}
            />
        )}
        {isAddingMedicine && (
            <AddMedicineModal 
                prescriptionId={isAddingMedicine} 
                onClose={() => setIsAddingMedicine(null)} 
                onSave={handleAddMedicine} 
            />
        )}
        {editingMedicine && (
            <EditMedicineModal 
                prescriptionId={editingMedicine.prescriptionId} 
                medicine={editingMedicine.medicine} 
                onClose={() => setEditingMedicine(null)} 
                onSave={handleUpdateMedicine} 
            />
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-lg mb-6">
            <div className="flex items-center">
                <User size={48} className="text-indigo-500 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{patient.fullName}</h1>
                    <p className="text-gray-500">{patient.age} years old - {patient.gender}</p>
                </div>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-700 flex items-center"><History className="mr-2" /> Disease History</h3>
                        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-indigo-200">
                            <PlusCircle size={16} className="mr-1" /> Add New
                        </button>
                    </div>
                    <div className="space-y-2">
                        {history.length > 0 ? (
                            history.map((h) => (
                                <div key={h._id} className="p-2 border-b flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold">{h.illnessName}</p>
                                        <p className="text-sm text-gray-600">Diagnosed: {new Date(h.diagnosisDate).toLocaleDateString()} | Status: <span className="font-medium">{h.status}</span></p>
                                        {h.prescribedBy ? (
                                            <p className="text-xs text-gray-500 mt-1">By: Dr. {h.prescribedBy.name || "N/A"}</p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingHistory(h)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteHistory(h._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">No disease history found.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><Pill className="mr-2"/> Prescriptions</h3>
                    {prescriptions.length > 0 ? prescriptions.map(p => (
                        <div key={p._id} className="mb-4 p-4 border rounded-lg shadow-sm">
                            <div className="flex justify-between items-center border-b pb-2 mb-3">
                                <div>
                                    <p className="font-semibold text-gray-800">Prescribed on {new Date(p.date).toLocaleDateString()}</p>
                                    {p.doctorId && <p className="text-sm text-gray-500">by Dr. {p.doctorId.fullName || 'N/A'}</p>}
                                </div>
                                <button onClick={() => setIsAddingMedicine(p._id)} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-indigo-200">
                                    <PlusCircle size={16} className="mr-1"/> Add Medicine
                                </button>
                            </div>
                            <ul className="space-y-3">
                                {p.medicines.map(med => (
                                    <li key={med._id} className="flex items-center justify-between text-gray-700 hover:bg-gray-50 p-2 rounded-md">
                                        <div>
                                            <p className="font-medium">{med.name} <span className="text-gray-500 font-normal">- {med.dosage}</span></p>
                                            <p className="text-sm text-gray-500">{med.frequency} for {med.duration}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <select 
                                                value={med.status}
                                                onChange={(e) => handleMedicineStatusChange(p._id, med._id, e.target.value)}
                                                className={`text-sm rounded-full px-2 py-0.5 outline-none cursor-pointer ${med.status === 'current' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                                            >
                                                <option value="current">Current</option>
                                                <option value="past">Past</option>
                                            </select>
                                            <button onClick={() => setEditingMedicine({ prescriptionId: p._id, medicine: med })} className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-full">
                                                <Edit size={16} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                                {p.medicines.length === 0 && <p className="text-sm text-gray-500 p-2">No medicines in this prescription.</p>}
                            </ul>
                        </div>
                    )) : <p className="text-gray-500">No prescriptions found.</p>}
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-lg">
                   <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><HeartPulse className="mr-2"/> Daily Vitals</h3>
                   <div className="max-h-60 overflow-y-auto">
                        {readings.length > 0 ? readings.map(r => (
                            <p key={r._id} className="border-b py-1 text-gray-700">
                                <span className="font-semibold">{new Date(r.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}:</span> BP {r.bloodPressure.systolic}/{r.bloodPressure.diastolic}, Pulse {r.pulseRate}
                            </p>
                        )) : <p className="text-gray-500">No daily readings recorded.</p>}
                   </div>
                </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-1">
                <Chatbot patientId={id} />
            </motion.div>
        </div>
    </div>
  );
}