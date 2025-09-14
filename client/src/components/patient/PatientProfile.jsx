import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Stethoscope, Pill, HeartPulse, MessageSquare, Send } from 'lucide-react';

// A simple Chatbot UI component
const Chatbot = ({ patientId }) => {
    const [prompt, setPrompt] = React.useState('');
    const [messages, setMessages] = React.useState([{ from: 'ai', text: 'How can I help you summarize this patient\'s data?' }]);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSend = async () => {
        if (!prompt.trim()) return;

        const newMessages = [...messages, { from: 'user', text: prompt }];
        setMessages(newMessages);
        setPrompt('');
        setIsLoading(true);

        // Call your backend summary generator
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/v1/summary/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': token },
            body: JSON.stringify({ patientId }) // The backend will use its own detailed prompt
        });
        const data = await res.json();
        
        setMessages([...newMessages, { from: 'ai', text: data.healthSummary || 'Sorry, I could not generate a summary.' }]);
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg h-full flex flex-col">
            <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><MessageSquare className="mr-2"/> AI Health Assistant</h3>
            <div className="flex-grow bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <p className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.from === 'ai' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>
                           {msg.text}
                        </p>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><p className="p-3 rounded-2xl bg-gray-200">Thinking...</p></div>}
            </div>
            <div className="flex">
                <input 
                    type="text" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about this patient..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="w-full p-2 border rounded-l-lg outline-none" 
                />
                <button onClick={handleSend} className="bg-indigo-600 text-white px-4 rounded-r-lg"><Send/></button>
            </div>
        </div>
    );
};


export default function PatientProfile() {
    const { id } = useParams(); // Get patient ID from URL
    const [patient, setPatient] = React.useState(null);
    const [prescriptions, setPrescriptions] = React.useState([]);
    const [readings, setReadings] = React.useState([]);
    // Add state for disease history if you have an endpoint for it

    React.useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('authToken');
            
            // Use Promise.all to fetch data in parallel
            const [patientRes, presRes, readRes] = await Promise.all([
                fetch(`/api/v1/patients/${id}`, { headers: { 'Authorization': token } }),
                fetch(`/api/prescriptions/patient/${id}`, { headers: { 'Authorization': token } }),
                fetch(`/api/readings/patient/${id}`, { headers: { 'Authorization': token } })
            ]);

            setPatient(await patientRes.json());
            setPrescriptions(await presRes.json());
            setReadings(await readRes.json());
        };
        if (id) {
            fetchAllData();
        }
    }, [id]);

    if (!patient) return <div className="pt-20 p-6">Loading patient profile...</div>;

    return (
        <div className="pt-20 p-6 bg-gray-50 min-h-screen">
            {/* Patient Header */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-lg mb-6">
                <div className="flex items-center">
                    <User size={48} className="text-indigo-500 mr-4"/>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{patient.fullName}</h1>
                        <p className="text-gray-500">{patient.age} years old - {patient.gender}</p>
                    </div>
                </div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Prescriptions */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><Pill className="mr-2"/> Prescriptions</h3>
                        {prescriptions.length > 0 ? prescriptions.map(p => (
                            <div key={p._id} className="mb-4 p-3 border-l-4 border-green-500 bg-green-50">
                                <p className="font-semibold text-green-800">Prescribed by Dr. {p.doctorId?.fullName} on {new Date(p.date).toLocaleDateString()}</p>
                                <ul className="list-disc list-inside mt-2">
                                    {p.medicines.map(med => <li key={med._id}>{med.name} - {med.dosage} ({med.status})</li>)}
                                </ul>
                            </div>
                        )) : <p>No prescriptions found.</p>}
                    </motion.div>

                    {/* Daily Readings */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-lg">
                       <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center"><HeartPulse className="mr-2"/> Daily Vitals</h3>
                       {/* You can add a chart here to visualize readings */}
                        <div className="max-h-60 overflow-y-auto">
                            {readings.length > 0 ? readings.map(r => (
                                <p key={r._id} className="border-b py-1">
                                    <span className="font-semibold">{new Date(r.date).toLocaleString()}:</span> BP {r.bloodPressure.systolic}/{r.bloodPressure.diastolic}, Pulse {r.pulseRate}
                                </p>
                            )) : <p>No daily readings recorded.</p>}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Chatbot */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                   <Chatbot patientId={id} />
                </motion.div>
            </div>
        </div>
    );
}