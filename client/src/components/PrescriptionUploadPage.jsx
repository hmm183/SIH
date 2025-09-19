import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, FileCheck, Loader } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Define your backend URL
const BACKEND_URL = 'http://localhost:5000/api/v1';

export default function PrescriptionUploadPage() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('select'); // 'select' or 'camera'
  const [status, setStatus] = useState('idle'); // idle, uploading, processing
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Handles file selection from the device
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  // Activates the device camera
  const startCamera = async () => {
    setMode('camera');
    setFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access the camera. Please check permissions.");
      setMode('select');
    }
  };

  // Stops the camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Captures a photo from the camera feed
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], "prescription.jpg", { type: "image/jpeg" });
        setFile(capturedFile);
      }, 'image/jpeg');
      stopCamera();
      setMode('select'); // Go back to the upload view
    }
  };

  // Handles the entire submission process
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file or capture a photo first.');
      return;
    }
    setStatus('uploading');
    setError('');

    try {
      // Step 1: Upload to Cloudinary
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const cloudinaryRes = await fetch(url, { method: "POST", body: formData });
      if (!cloudinaryRes.ok) throw new Error("Upload to Cloudinary failed.");
      const cloudinaryData = await cloudinaryRes.json();

      setStatus('processing');

      // Step 2: Send URL and patientId to our backend
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error("Authentication token not found.");
      }
      
      // WARNING: Insecure - For temporary debugging only.
      // Decoding the token on the frontend to get the patient ID.
      const decodedToken = jwtDecode(token);
      const patientId = decodedToken.id; // Assuming patient ID is in the 'id' field

      const backendRes = await fetch(`${BACKEND_URL}/ocr-prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Sending the patientId from the frontend
        body: JSON.stringify({ 
          fileUrl: cloudinaryData.secure_url,
          patientId: patientId
        }),
      });

      if (!backendRes.ok) throw new Error('Backend failed to accept the file.');
      
      const { recordId } = await backendRes.json();
      
      // Navigate to the results page on success
      navigate(`/prescription/result/${recordId}`);

    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  };
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Process New Prescription</h1>
      {mode === 'camera' ? (
        <div className="text-center">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg shadow-lg mb-4"></video>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <button onClick={capturePhoto} className="px-6 py-3 bg-red-600 text-white rounded-lg mr-4">Capture</button>
          <button onClick={() => { stopCamera(); setMode('select'); }} className="px-6 py-3 bg-gray-500 text-white rounded-lg">Cancel</button>
        </div>
      ) : (
        <div className="bg-gray-50 p-8 rounded-lg shadow-md text-center">
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => document.getElementById('file-upload').click()} className="flex-1 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
              <Upload className="mb-2" /> Upload File
            </button>
            <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf"/>
            <button onClick={startCamera} className="flex-1 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center hover:bg-gray-100">
              <Camera className="mb-2" /> Use Camera
            </button>
          </div>
          
          {file && (
            <div className="text-left bg-green-100 p-3 rounded-lg flex items-center">
              <FileCheck className="text-green-700 mr-2" />
              <p className="text-green-800">Selected: {file.name}</p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={!file || status !== 'idle'}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:bg-gray-400 flex items-center justify-center"
            >
              {status === 'idle' && "Upload and Process"}
              {(status === 'uploading' || status === 'processing') && <Loader className="animate-spin mr-2" />}
              {status === 'uploading' && "Uploading to Cloud..."}
              {status === 'processing' && "Sending to AI for processing..."}
            </button>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}
    </div>
  );
}