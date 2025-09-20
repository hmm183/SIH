import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

const BACKEND_URL =  `${process.env.REACT_APP_BACKEND_WITHOUT_V1}`;

export default function EmailSummary({ patientId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type can be 'success' or 'error'

  const handleSendEmail = async () => {
    setIsLoading(true);
    setFeedback({ message: '', type: '' });

    const token = localStorage.getItem('authToken'); // Ensure you use the correct token key (e.g., 'doctorAuthToken')
    if (!token) {
      setFeedback({ message: 'Authentication error. Please log in.', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      // ✅ 1. Use the new "generate-and-email" endpoint
      const response = await fetch(`${BACKEND_URL}/api/v1/summary/generate-and-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // ✅ 2. Send patientId in the request body
        body: JSON.stringify({ patientId }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An unknown error occurred.');
      }

      setFeedback({ message: data.message, type: 'success' });

    } catch (error) {
      setFeedback({ message: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
      <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
        <Mail className="mr-2 text-indigo-500" />
        {/* ✅ 3. Updated UI text */}
        Generate & Email Summary
      </h3>
      <p className="text-gray-600 mb-4 text-sm">
        This will generate a new, up-to-date health summary from the patient's latest data and email it to their registered address.
      </p>

      <button
        onClick={handleSendEmail}
        disabled={isLoading}
        className="w-full flex items-center justify-center bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Processing...
          </>
        ) : (
          'Generate and Email Summary'
        )}
      </button>

      {/* Feedback Message Area */}
      {feedback.message && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={18} className="mr-2" /> : <AlertTriangle size={18} className="mr-2" />}
          {feedback.message}
        </div>
      )}
    </div>
  );
}