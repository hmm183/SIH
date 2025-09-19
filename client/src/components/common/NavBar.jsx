import React, { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useLang } from "../../context/LangContext";
import MigrantModal from "../modals/MigrantModal";
import DoctorModal from "../modals/DoctorModal";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showMigrantModal, setShowMigrantModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);

  const { language, setLanguage, t, languages } = useLang();

  const [doctorToken, setDoctorToken] = useState(null);
  const [patientToken, setPatientToken] = useState(null);

  useEffect(() => {
    setDoctorToken(localStorage.getItem("doctorAuthToken"));
    setPatientToken(localStorage.getItem("authToken"));
  }, []);

  const handleThemeAndLightToggle = () => {
    toggleDarkMode();
  };

  const changeLanguage = (code) => {
    setLanguage(code);
    setShowLangMenu(false);
  };

  const redirectToAuth = () => {
    window.location.href = "/auth";
  };

  const redirectToDocAuth = () => {
    window.location.href = "/doctor/auth";
  };

  const handleLogout = (type) => {
    if (type === "doctor") {
      localStorage.removeItem("doctorAuthToken");
    } else if (type === "patient") {
      localStorage.removeItem("authToken");
    }
    window.location.reload();
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center text-2xl font-bold text-blue-600 dark:text-blue-400">
              <a href="/">SwiftMediLink</a>
            </div>

            {/* Navbar Links */}
            <div className="hidden md:flex space-x-6 items-center">
              <a
                href="/"
                className="text-gray-800 dark:text-gray-200 hover:text-blue-500"
              >
                {t("home")}
              </a>
              <a
                href="#about"
                className="text-gray-800 dark:text-gray-200 hover:text-blue-500"
              >
                {t("about")}
              </a>

              {/* ✅ Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowServicesMenu(!showServicesMenu)}
                  className="text-gray-800 dark:text-gray-200 hover:text-blue-500 focus:outline-none"
                >
                  {t("services")} ▼
                </button>
                {showServicesMenu && (
                  <div className="absolute left-0 mt-2 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                    <a
                      href="/disease-prediction"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("aiAnalyzer1") || "AI Disease Image Analyzer"}
                    </a>
                    <a
                      href="/disease-symptom-prediction"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("aiAnalyzer2") || "AI Symptom Analyzer"}
                    </a>
                    <a
                      href="/hotspot-map"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("hotspot")}
                    </a>
                    {/* ✅ New links for Prescriptions */}
                    <a
                      href="/prescriptions"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("myPrescriptions") || "My Prescriptions"}
                    </a>
                    <a
                      href="/prescription/process"
                      className="block px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {t("processPrescription") || "Process Prescription"}
                    </a>
                  </div>
                )}
              </div>

              {/* Doctor Auth Button */}
              {doctorToken ? (
                <button
                  onClick={() => handleLogout("doctor")}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  {t("logout") || "Logout"}
                </button>
              ) : (
                <button
                  onClick={redirectToDocAuth}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  {t("doctorSignIn")}
                </button>
              )}

              {/* Patient Auth Button */}
              {patientToken ? (
                <button
                  onClick={() => handleLogout("patient")}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  {t("logout") || "Logout"}
                </button>
              ) : (
                <button
                  onClick={redirectToAuth}
                  className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                >
                  {t("patientSignIn")}
                </button>
              )}

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {language.toUpperCase()} ▼
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => changeLanguage(lang.value)}
                        className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark/Light Toggle */}
              <button
                onClick={handleThemeAndLightToggle}
                className="ml-4 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <DoctorModal
        show={showDoctorModal}
        onClose={() => setShowDoctorModal(false)}
      />
      <MigrantModal
        show={showMigrantModal}
        onClose={() => setShowMigrantModal(false)}
      />
    </>
  );
};

export default Navbar;