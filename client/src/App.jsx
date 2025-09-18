import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomNavbar from "./components/common/NavBar";
import LandingPage from "./components/landing/LandingPage";
import "./index.css";
import "./App.css";
import Footer from "./components/common/Footer";
import PatientDashboard from "./components/patient/dashboard/PatientDashboard";
import DoctorDashboard from "./components/doctor/DoctorDashboard";
import DiseaseHistory from "./components/patient/DiseaseHistory";
import PrescriptionPage from './components/patient/Prescriptions';
import AuthPage from './components/AuthPage';
import DailyReadingsPage from './components/patient/DailyReadingsPage';
import DoctorAuth from './components/doctor/DoctorAuth';
import PatientProfile from './components/patient/PatientProfile';
import DiseasePrediction from "./components/common/image_test";
import HotspotMap from "./components/common/HotspotMap";
import { ThemeProvider, useTheme } from "./context/ThemeContext"; 
import EmergencyManagement from "./components/patient/EmergencyManagement";

// Wrapper to access theme context inside App
function ThemedApp() {
  const { darkMode } = useTheme();

  return (
    <Router>
      <div
        className={
          darkMode
            ? "dark bg-gray-900 text-white min-h-screen flex flex-col"
            : "bg-white text-gray-900 min-h-screen flex flex-col"
        }
      >
        {/* Navbar always visible */}
        <CustomNavbar />

        {/* Routes */}
        <main className="flex-grow dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/patient/history" element={<DiseaseHistory />} />
            {/* <Route path="/patient/prescriptions" element={<PrescriptionPage />} /> */}
            <Route path="/patient/readings" element={<DailyReadingsPage />} />
            <Route path="/doctor/auth" element={<DoctorAuth />} />
            <Route path="/patient/:id" element={<PatientProfile />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/disease-prediction" element={<DiseasePrediction />} />

            <Route
              path="/hotspot-map"
              element={
                <HotspotMap
                  disease="Chickenpox"
                  center={{ lat: 28.6139, lng: 77.2090 }}
                  radius={10}
                />
              }
            />

            <Route
              path="/test-emergency"
              element={
                <div className="container mx-auto p-4">
                  <EmergencyManagement patientId="68bae87b0ab9cc9c53ad1efc" />
                </div>
              }
            />
          </Routes>
        </main>

        {/* Footer always visible */}
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
