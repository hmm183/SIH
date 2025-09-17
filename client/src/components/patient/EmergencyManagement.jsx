import React, { useState, useEffect } from 'react';
import { Shield, UserPlus, Phone, Hospital, Stethoscope, Edit, Trash2, PlusCircle, X } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

// Reusable modal component for forms
const FormModal = ({ title, isOpen, onClose, children, onSave }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-down">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="space-y-4">{children}</div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    );
};

// Main Component
export default function EmergencyManagement({ patientId }) {
    const [contacts, setContacts] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Contact modal
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [currentContact, setCurrentContact] = useState(null);
    const [contactFormData, setContactFormData] = useState({ name: '', relationship: '', phone: '' });

    // State for Doctor modal
    const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [doctorFormData, setDoctorFormData] = useState({ name: '', specialty: '', phone: '', hospitalAffiliation: '' });
    
    // State for Hospital modal
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [currentHospital, setCurrentHospital] = useState(null);
    const [hospitalFormData, setHospitalFormData] = useState({ name: '', address: '', phone: '' });

    // --- Data Fetching ---
    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }
            const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

            try {
                // Fetch all data in parallel
                const responses = await Promise.all([
                    fetch(`${BACKEND_URL}/api/v1/emergency-contacts/patient/${patientId}`, { headers }),
                    fetch(`${BACKEND_URL}/api/v1/emergency-doctors`, { headers }),
                    fetch(`${BACKEND_URL}/api/v1/emergency-hospitals`, { headers })
                ]);
                
                // Process responses, treating 404 as an empty array
                const [contactsRes, doctorsRes, hospitalsRes] = responses;
                setContacts(contactsRes.ok ? await contactsRes.json() : []);
                setDoctors(doctorsRes.ok ? await doctorsRes.json() : []);
                setHospitals(hospitalsRes.ok ? await hospitalsRes.json() : []);

            } catch (err) {
                console.error("Failed to fetch emergency data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) fetchAllData();
    }, [patientId]);

    // --- Generic API Handler ---
    const apiHandler = async (url, method, body = null) => {
        const token = localStorage.getItem('authToken');
        const options = {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        };
        if (body) options.body = JSON.stringify(body);
        const res = await fetch(url, options);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return method === 'DELETE' ? res.ok : res.json();
    };

    // --- CRUD Handlers for CONTACTS ---
    const handleSaveContact = async () => {
        const url = currentContact ? `${BACKEND_URL}/api/v1/emergency-contacts/${currentContact._id}` : `${BACKEND_URL}/api/v1/emergency-contacts`;
        const method = currentContact ? 'PUT' : 'POST';
        const body = currentContact ? contactFormData : { ...contactFormData, patientId };
        try {
            const saved = await apiHandler(url, method, body);
            setContacts(currentContact ? contacts.map(c => c._id === saved._id ? saved : c) : [...contacts, saved]);
            setIsContactModalOpen(false);
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const handleDeleteContact = async (id) => {
        if (!window.confirm("Delete this contact?")) return;
        try {
            await apiHandler(`${BACKEND_URL}/api/v1/emergency-contacts/${id}`, 'DELETE');
            setContacts(contacts.filter(c => c._id !== id));
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const openContactModal = (contact = null) => {
        setCurrentContact(contact);
        setContactFormData(contact ? { name: contact.name, relationship: contact.relationship, phone: contact.phone } : { name: '', relationship: '', phone: '' });
        setIsContactModalOpen(true);
    };

    // --- CRUD Handlers for DOCTORS ---
    const handleSaveDoctor = async () => {
        const url = currentDoctor ? `${BACKEND_URL}/api/v1/emergency-doctors/${currentDoctor._id}` : `${BACKEND_URL}/api/v1/emergency-doctors`;
        const method = currentDoctor ? 'PUT' : 'POST';
        try {
            const saved = await apiHandler(url, method, doctorFormData);
            setDoctors(currentDoctor ? doctors.map(d => d._id === saved._id ? saved : d) : [...doctors, saved]);
            setIsDoctorModalOpen(false);
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const handleDeleteDoctor = async (id) => {
        if (!window.confirm("Delete this doctor?")) return;
        try {
            await apiHandler(`${BACKEND_URL}/api/v1/emergency-doctors/${id}`, 'DELETE');
            setDoctors(doctors.filter(d => d._id !== id));
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const openDoctorModal = (doctor = null) => {
        setCurrentDoctor(doctor);
        setDoctorFormData(doctor ? { name: doctor.name, specialty: doctor.specialty, phone: doctor.phone, hospitalAffiliation: doctor.hospitalAffiliation } : { name: '', specialty: '', phone: '', hospitalAffiliation: '' });
        setIsDoctorModalOpen(true);
    };

    // --- CRUD Handlers for HOSPITALS ---
    const handleSaveHospital = async () => {
        const url = currentHospital ? `${BACKEND_URL}/api/v1/emergency-hospitals/${currentHospital._id}` : `${BACKEND_URL}/api/v1/emergency-hospitals`;
        const method = currentHospital ? 'PUT' : 'POST';
        try {
            const saved = await apiHandler(url, method, hospitalFormData);
            setHospitals(currentHospital ? hospitals.map(h => h._id === saved._id ? saved : h) : [...hospitals, saved]);
            setIsHospitalModalOpen(false);
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const handleDeleteHospital = async (id) => {
        if (!window.confirm("Delete this hospital?")) return;
        try {
            await apiHandler(`${BACKEND_URL}/api/v1/emergency-hospitals/${id}`, 'DELETE');
            setHospitals(hospitals.filter(h => h._id !== id));
        } catch (error) { alert(`Error: ${error.message}`); }
    };
    const openHospitalModal = (hospital = null) => {
        setCurrentHospital(hospital);
        setHospitalFormData(hospital ? { name: hospital.name, address: hospital.address, phone: hospital.phone } : { name: '', address: '', phone: '' });
        setIsHospitalModalOpen(true);
    };

    if (loading) return <div>Loading Emergency Info...</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                    <Shield className="mr-2 text-red-500"/> Emergency Center
                </h3>
                
                <div className="space-y-8">
                    {/* Emergency Contacts Section */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 flex items-center"><UserPlus className="mr-2 text-blue-600"/>Patient's Contacts</h4>
                            <button onClick={() => openContactModal()} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-blue-200">
                                <PlusCircle size={16} className="mr-1"/> Add New
                            </button>
                        </div>
                        <div className="space-y-2">
                            {contacts.length > 0 ? contacts.map(c => (
                                <div key={c._id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                                    <div>
                                        <p className="font-semibold">{c.name} <span className="text-sm font-normal text-gray-500">- {c.relationship}</span></p>
                                        <p className="text-sm text-gray-600 flex items-center mt-1"><Phone size={14} className="mr-2"/>{c.phone}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openContactModal(c)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteContact(c._id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 text-sm">No emergency contacts found. Click 'Add New' to create one.</p>}
                        </div>
                    </section>

                    {/* Emergency Doctors Section */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 flex items-center"><Stethoscope className="mr-2 text-green-600"/>System Doctors</h4>
                            <button onClick={() => openDoctorModal()} className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-green-200">
                                <PlusCircle size={16} className="mr-1"/> Add New
                            </button>
                        </div>
                         <div className="space-y-2">
                            {doctors.length > 0 ? doctors.map(doc => (
                                <div key={doc._id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                                    <div>
                                        <p className="font-semibold">{doc.name} <span className="text-sm font-normal text-gray-500">- {doc.specialty}</span></p>
                                        <p className="text-sm text-gray-600 flex items-center mt-1"><Phone size={14} className="mr-2"/>{doc.phone}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openDoctorModal(doc)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteDoctor(doc._id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 text-sm">No emergency doctors found. Click 'Add New' to create one.</p>}
                        </div>
                    </section>

                    {/* Emergency Hospitals Section */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800 flex items-center"><Hospital className="mr-2 text-red-600"/>System Hospitals</h4>
                            <button onClick={() => openHospitalModal()} className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-200">
                                <PlusCircle size={16} className="mr-1"/> Add New
                            </button>
                        </div>
                         <div className="space-y-2">
                            {hospitals.length > 0 ? hospitals.map(hosp => (
                                <div key={hosp._id} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                                    <div>
                                        <p className="font-semibold">{hosp.name}</p>
                                        <p className="text-sm text-gray-600">{hosp.address}</p>
                                        <p className="text-sm text-gray-600 flex items-center mt-1"><Phone size={14} className="mr-2"/>{hosp.phone}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openHospitalModal(hosp)} className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-gray-100"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteHospital(hosp._id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            )) : <p className="text-gray-500 text-sm">No emergency hospitals found. Click 'Add New' to create one.</p>}
                        </div>
                    </section>
                </div>
            </div>

            {/* Modals */}
            <FormModal title={currentContact ? 'Edit Contact' : 'Add Contact'} isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} onSave={handleSaveContact}>
                <input type="text" value={contactFormData.name} onChange={(e) => setContactFormData({...contactFormData, name: e.target.value})} placeholder="Full Name" className="w-full p-2 border rounded"/>
                <input type="text" value={contactFormData.relationship} onChange={(e) => setContactFormData({...contactFormData, relationship: e.target.value})} placeholder="Relationship" className="w-full p-2 border rounded"/>
                <input type="tel" value={contactFormData.phone} onChange={(e) => setContactFormData({...contactFormData, phone: e.target.value})} placeholder="Phone Number" className="w-full p-2 border rounded"/>
            </FormModal>

            <FormModal title={currentDoctor ? 'Edit Doctor' : 'Add Doctor'} isOpen={isDoctorModalOpen} onClose={() => setIsDoctorModalOpen(false)} onSave={handleSaveDoctor}>
                <input type="text" value={doctorFormData.name} onChange={(e) => setDoctorFormData({...doctorFormData, name: e.target.value})} placeholder="Doctor's Name" className="w-full p-2 border rounded"/>
                <input type="text" value={doctorFormData.specialty} onChange={(e) => setDoctorFormData({...doctorFormData, specialty: e.target.value})} placeholder="Specialty" className="w-full p-2 border rounded"/>
                <input type="tel" value={doctorFormData.phone} onChange={(e) => setDoctorFormData({...doctorFormData, phone: e.target.value})} placeholder="Phone Number" className="w-full p-2 border rounded"/>
                <input type="text" value={doctorFormData.hospitalAffiliation} onChange={(e) => setDoctorFormData({...doctorFormData, hospitalAffiliation: e.target.value})} placeholder="Hospital Affiliation" className="w-full p-2 border rounded"/>
            </FormModal>

            <FormModal title={currentHospital ? 'Edit Hospital' : 'Add Hospital'} isOpen={isHospitalModalOpen} onClose={() => setIsHospitalModalOpen(false)} onSave={handleSaveHospital}>
                <input type="text" value={hospitalFormData.name} onChange={(e) => setHospitalFormData({...hospitalFormData, name: e.target.value})} placeholder="Hospital Name" className="w-full p-2 border rounded"/>
                <input type="text" value={hospitalFormData.address} onChange={(e) => setHospitalFormData({...hospitalFormData, address: e.target.value})} placeholder="Address" className="w-full p-2 border rounded"/>
                <input type="tel" value={hospitalFormData.phone} onChange={(e) => setHospitalFormData({...hospitalFormData, phone: e.target.value})} placeholder="Phone Number" className="w-full p-2 border rounded"/>
            </FormModal>
        </>
    );
}