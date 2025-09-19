// pages/PrescriptionResultPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api/v1';

export default function PrescriptionResultPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${BACKEND_URL}/ocr-prescriptions/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Could not fetch prescription data.');
        const result = await res.json();
        setData(result);
        // If still processing, poll every 5 seconds
        if (result.status === 'processing') {
          setTimeout(fetchResult, 5000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center bg-blue-50 p-8 rounded-lg">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-blue-800">Processing Prescription...</h2>
          <p className="text-blue-700">This may take a moment. Please wait.</p>
        </div>
      );
    }
    
    if (error) {
       return <div className="text-red-500">{error}</div>;
    }

    if (data.status === 'error') {
       return (
        <div className="flex flex-col items-center justify-center bg-red-50 p-8 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-red-800">Processing Failed</h2>
          <p className="text-red-700">{data.errorMessage}</p>
        </div>
      );
    }

    if (data.status === 'completed') {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="flex items-center text-green-600 mb-4">
              <CheckCircle className="mr-2" />
              <h2 className="text-2xl font-bold">Extraction Complete</h2>
           </div>
           
           <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Extracted Medicines</h3>
              <pre className="bg-gray-100 p-4 rounded-md text-sm whitespace-pre-wrap">
                 {JSON.stringify(data.structuredMedicines, null, 2)}
              </pre>
           </div>
           
           <div>
              <h3 className="font-semibold text-lg mb-2">Original OCR Text</h3>
              <p className="bg-gray-100 p-4 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                 {data.ocrText}
              </p>
           </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Prescription Result</h1>
      {renderContent()}
      <div className="text-center mt-8">
        <Link to="/patient/dashboard" className="text-indigo-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
}