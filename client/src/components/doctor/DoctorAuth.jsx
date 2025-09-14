import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LogIn, UserPlus, Mail, KeyRound, User, Stethoscope, Phone, Award, ShieldCheck, CheckCircle2, Fingerprint
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api/v1/verify';

// 1. UPDATED aurguments from fullName to doctorId
const verifyDoctorWithNMC = async (doctorId, licenseNumber) => {
    try {
        const res = await fetch(`${BACKEND_URL}/verify-doctor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // 2. UPDATED payload to send doctorId
            body: JSON.stringify({ doctorId, licenseNumber }),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Verification failed.');
        }
        return data;
    } catch (error) {
        console.error("NMC Verification failed:", error);
        throw error;
    }
};

export default function DoctorAuth() {
    const [isLoginView, setIsLoginView] = useState(true);
    // 3. UPDATED formData state to include doctorId
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', doctorId: '',
        phone: '', specialization: '', licenseNumber: '', qualifications: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [verifiedDoctor, setVerifiedDoctor] = useState(null);
    const navigate = useNavigate();

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
        setSuccess('');
        setVerifiedDoctor(null);
        setFormData({
            username: '', email: '', password: '', doctorId: '',
            phone: '', specialization: '', licenseNumber: '', qualifications: '',
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setVerifiedDoctor(null);

        if (isLoginView) {
           // Login logic remains the same
           try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSuccess('Login successful! Redirecting...');
                setTimeout(() => navigate('/doctor/dashboard'), 1000);
            } catch (err) {
                setError(err.message || 'An unexpected error occurred.');
                setLoading(false);
            }
        } else {
            // REGISTRATION LOGIC
            try {
                setSuccess('Verifying with NMC registry...');
                // 4. UPDATED to pass doctorId to the verification function
                const verificationResult = await verifyDoctorWithNMC(formData.doctorId, formData.licenseNumber);

                if (!verificationResult.verified || !verificationResult.doctor) {
                    throw new Error('Verification failed. Could not retrieve doctor details.');
                }
                
                setVerifiedDoctor(verificationResult.doctor);
                setSuccess('✅ Doctor Verified!');
                
            } catch (err) {
                setError(err.message || 'An unexpected error occurred.');
                setSuccess('');
            } finally {
                setLoading(false);
            }
        }
    };
    
    const inputVariants = { /* ... */ };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Portal</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        {isLoginView ? 'Welcome back!' : 'Create your professional account.'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {!isLoginView && (
                        <>
                            {/* 5. REPLACED "Full Name" input with "Doctor ID" */}
                            <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="relative">
                                <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input name="doctorId" type="text" placeholder="NMC Doctor ID" value={formData.doctorId} onChange={handleChange} required className="w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </motion.div>
                             <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input name="licenseNumber" type="text" placeholder="Registration Number" value={formData.licenseNumber} onChange={handleChange} required className="w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </motion.div>
                        </>
                    )}

                    {/* All other form fields for your system's login/registration */}
                     <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </motion.div>
                    <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                    </motion.div>
                    
                     {!isLoginView && (
                         <>
                             <motion.div variants={inputVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input name="username" type="text" placeholder="Choose a Username" value={formData.username} onChange={handleChange} required className="w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                            </motion.div>
                            {/* You could add other fields like phone, etc. here if needed */}
                         </>
                     )}


                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center">{success}</p>}

                    {verifiedDoctor && (
                        <motion.div
                            className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-600 rounded-xl shadow-sm"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                <CheckCircle2 size={20} />
                                <h3 className="font-semibold">Verified Doctor Details</h3>
                            </div>
                            <p className="text-sm mt-1"><b>Name:</b> {verifiedDoctor.firstName}</p>
                            <p className="text-sm"><b>Registration No:</b> {verifiedDoctor.registrationNo}</p>
                            <p className="text-sm"><b>Address:</b> {verifiedDoctor.address}</p>
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoginView ? 'Login' : 'Verify & Proceed'}
                        {loading && '...'}
                    </motion.button>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={toggleView} className="font-medium text-indigo-600 hover:underline ml-1">
                        {isLoginView ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}