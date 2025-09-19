// src/context/LangContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

// 🌍 Supported Languages
const languages = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
  { value: "as", label: "Assamese" },
  { value: "bho", label: "Bhojpuri" },
  { value: "doi", label: "Dogri" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "kok", label: "Konkani" },
  { value: "mai", label: "Maithili" },
  { value: "ml", label: "Malayalam" },
  { value: "mni-Mtei", label: "Meiteilon (Manipuri)" },
  { value: "ne", label: "Nepali" },
  { value: "or", label: "Odia (Oriya)" },
  { value: "pa", label: "Punjabi" },
  { value: "sa", label: "Sanskrit" },
  { value: "sd", label: "Sindhi" },
  { value: "ur", label: "Urdu" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },

];


// ⚠️ TEMPORARY: Replace with env variable & backend proxy later
const BACKEND_URL = "http://localhost:5000/api/v1";

// 📌 Base English dictionary
const BASE_TEXTS = {
  // Landing / Hero
  heroTag: "SwiftMediLink • Fast, Secure Patient Transfers",
  heroHeading: "Medical Records Ready Before Arrival",
  heroDesc:
    "With Aadhaar verification & AI-powered record extraction, doctors receive clean, actionable data before the stretcher arrives. Every second counts — SwiftMediLink saves lives.",
  signIn: "Sign in",
  viewStats: "View stats",
  smarterCare: "Smarter Care Journeys",
  smarterCareDesc:
    "From diagnosis to treatment, every step powered by connected records.",
  multilingual: "Multilingual",
  multilingualDesc: "Hindi • Bengali • Tamil • Malayalam • English",
  featuresHeading: "What you can do",
  featuresDesc:
    "Scan a QR health ID, add visit records, update vaccinations, and view analytics. Built with React, Tailwind CSS, Chart.js & Three.js for a fast, responsive web experience.",
  feature1: "Unified Health Records",
  feature1Desc:
    "Access your complete medical history in one place, including lab results, prescriptions, and past treatments.",
  feature2: "Seamless Hospital Transfers",
  feature2Desc:
    "Quick and secure sharing of patient data between hospitals using the FHIR API for continuity of care.",
  feature3: "Interactive Patient Dashboard",
  feature3Desc:
    "Patients can track their health records, upcoming appointments, and reports with a clean, user-friendly dashboard.",

  // 📊 Stats Section
  chartTitle: "Registered vs Cured",
  demoData: "(Demo Data)",
  totalRegistered: "Total Registered",
  totalCured: "Total Cured",
  cureRate: "Cure Rate",
  activeCases: "Active Cases",
  demoNote: "* Demo values – connect to your API to make these live.",
  footerTitle: "Migrant Health",
  allRights: "All rights reserved.",
  footerBuiltWith: "Built with React, Tailwind CSS, Chart.js & Three.js.",
  features: "Features",
  stats: "Stats",
  registered: "Registered",
  beingCured: "Being Cured",
  cured: "Cured",
  registerWithKyc: "Register with KYC",
  verifyWithDigiLocker: "We'll verify your identity with DigiLocker.",
  startKyc: "Start KYC Process",
  alreadyRegistered: "Already registered? Login here.",
  verifiedDetails: "Your Verified Details",
  completeRegistration: "Complete Your Registration",
  enterEmailPassword: "Your details are verified. Add your email and create a password.",
  email: "Email Address",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  createAccount: "Create Account",
  login: "Login",
  aadhaarNumber: "Aadhaar Number (UID)",
  fullName: "Full Name (as per Aadhaar)",
  password: "Password",
  firstTimeUser: "First time user? Complete KYC to register.",
  initiatingSession: "🚀 Initiating session...",
  fetchingDetails: "📄 Welcome back! Fetching your details...",
  loggingIn: "Logging in...",
  passwordMismatch: "Passwords do not match.",
  enterEmail: "Please enter your email address.",
  userDataNotFound: "User data not found. Please start KYC again.",
  creatingAccount: "Creating your account...",
  kycDesc: "We'll verify your identity with DigiLocker.",
  aadhaarUid: "Aadhaar Number (UID)",
  firstTime: "First time user? Complete KYC to register.",
  emailAddress: "Email Address",

  // 📋 Patient Dashboard
  healthTrends: "Health Trends",
  pulse: "Pulse",
  systolic: "Systolic",
  diastolic: "Diastolic",
  weight: "Weight",
  hospitalVisits: "Hospital Visits",
  prescriptionsStored: "Prescriptions Stored",
  currentMedicines: "Current Medicines",
  pastMedicines: "Past Medicines",
  markAsPast: "Mark as Past",
  noCurrentMedicines: "No current medicines.",
  medicineNamePlaceholder: "Medicine name",
  add: "Add",
  markAsCurrent: "Mark as Current",
  noPastMedicines: "No past medicines.",
  diseaseHistory: "Disease History",
  resolved: "Resolved",
  noHistoryFound: "No history summary found.",
  seeMore: "See More",
  patientNotes: "Patient Notes",
  showArchived: "Show Archived",
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  delete: "Delete",
  noNotesFound: "No notes found.",
  archivedNotes: "Archived Notes",
  restoreNote: "Restore Note",
  writeNotePlaceholder: "Write your symptoms or notes here...",
  saveNote: "Save Note",
  healthSummary: "Health Summary",
  lastUpdated: "Last: {{date}}",
  generating: "Generating...",
  regenerate: "Regenerate",
  generate: "Generate",
  loadingSummary: "Loading summary...",
  error: "Error",
  translationError: "Failed to translate summary. Displaying original text.",
  generatedAt: "Generated: {{date}}",
  hidePrompt: "Hide prompt",
  showPrompt: "Show prompt",
  noPromptSaved: "No prompt saved.",
  noSummaryFound: "No health summary found. Generate one to get a concise overview of the patient's condition.",
  patientDiseaseHistory: "Patient Disease History",

  diagnosisDate: "Diagnosis Date",
  illness: "Illness",
  symptoms: "Symptoms",
  doctor: "Doctor",
  hospital: "Hospital",
  status: "Status",
  ongoing: "Ongoing",
  cured: "Cured",
  loadingHistory: "Loading history...",
  noHistoryFound: "No history records found.",
  myPrescriptions: "My Prescriptions",
  loadingPrescriptions: "Loading prescriptions...",
  dr: "Dr.",
  current: "Current", // used for both status and button text
  past: "Past", // used for both status and button text
  markAs: "Mark as",
  noPrescriptionsFound: "No prescriptions found.",
  home: "Home",
  about: "About",
  services: "Services",
  contact: "Contact",
  doctorSignIn: "Doctor Sign In",
  patientSignIn: "Patient Sign In",
  language: "Language",
  // New keys for DoctorDashboard
  doctorDashboard: "Doctor's Dashboard",
  searchPatientPlaceholder: "Search patient by name...",
  searching: "Searching...",
  patientsUnderTreatment: "Patients Currently Under Treatment",
  name: "Name",
  age: "Age",
  lastUpdate: "Last Update",
  viewProfile: "View Profile",
  noPatientsFound: "No patients currently under treatment.",
  // Patient status translation keys (to be used with the translation function)
  undertreatment: 'Under Treatment',
  discharged: 'Discharged',
  totalPatients: "Total Patients",
  patientsDischarged: "Patients Discharged",
  currentlyTreating: "Currently Treating",
  // 📋 Daily Readings Page
  dailyHealthReadings: "Daily Health Readings",
  addNewReading: "Add New Reading",
  pulseRate: "Pulse Rate",
  weightKg: "Weight (kg)",
  addReading: "Add Reading",
  loadingReadings: "Loading readings...",
  noReadingsFound: "No daily readings have been recorded yet.",
  authenticationError: "Authentication error. Please log in again.",
  invalidToken: "Invalid authentication token.",
  bpPulseRequired: "Blood pressure and pulse rate are required.",
  failedToAddReading: "Failed to add reading.",
  failedToUpdateReading: "Failed to update reading.",
  confirmDelete: "Are you sure you want to delete this reading?",
  deleteNotImplemented: "Delete functionality requires a backend DELETE endpoint.",
  bpm: "BPM", // for Beats Per Minute
  kg: "kg", // for kilograms
  emailAddress: "Email Address",
  password: "Password",
  signIn: "Sign In",
  createAccount: "Create Account",
  doctorPortal: "Doctor Portal",
  welcomeBack: "Welcome back! Please sign in.",
  noAccount: "Sign up",
  'Don\'t have an account?': "Don't have an account?",
  doctorRegistration: "Doctor Registration",
  verifyIdentity: "Verify your identity to register.",
  nmcDoctorId: "NMC Doctor ID",
  registrationNumber: "Registration Number",
  verifyIdentityButton: "Verify Identity",
  alreadyAccount: "Already have an account?",
  loginSuccess: "Login successful.",
  //patient profile
  analyzing: "Analyzing...",
  EnteryourQuestion: "Enter your Question",
  chatbotPlaceholder: "Ask any health-related question...",
  yearsOld: "years old",
  addNew: "Add New",
  prescribedOn: "Prescribed on",
  aiHealthAssistant: "AI Health Assistant",
  askQuestion: "Ask a Question",
  typeMessage: "Type your message...",
  send: "Send",
  addMedicine: "Add Medicine",
  prescriptions: "Prescriptions",
  dailyVitals: "Daily Vitals",
  illnessHistory: "Illness History",
  initialSymptoms: "Initial Symptoms",
  illnessName: "Illness Name",
  medicinesPrescribed: "Medicines Prescribed",
  Hospital: "Hospital",
  remakrs: "Remarks",
  locationAddress: "Location Address",
  searchAddress: "Search address...",
  addHistory: "Add History",
  addNewMedicine: "Add New Medicine",
  medicineName: "Medicine Name",
  dosage: "Dosage",
  frequency: "Frequency",
  duration: "Duration",
  M: "Male",
  F: "Female",
  // Disease Prediction Page
  aiPredictorTitle: "AI Skin Disease Predictor",
  aiPredictorDesc: "Upload an image of a skin condition for AI analysis",
  provideImage: "Provide an Image",
  noImageSelected: "No image selected",
  uploadImage: "Upload Image",
  useCamera: "Use Camera",
  analyzingImage: "Analyzing Image...",
  predictCondition: "Predict Condition",
  cameraAccessError: "Could not access the camera. Please ensure you have given permission.",
  imageAnalyzed: "Image Analyzed",
  confidence: "% Confidence",
  recommendedPrecautions: "Recommended Precautions:",
  disclaimer: "Disclaimer",
  disclaimerText: "This is an AI-based prediction and should not be considered a medical diagnosis. Please consult a healthcare professional for accurate diagnosis and treatment.",
  predictionServerError: "Server returned {{status}}: {{statusText}}",
  predictionErrorMsg: "Error predicting disease. Please try again. Make sure the backend server is running.",
  capturePhoto: "Capture Photo",
  closeCamera: "Close Camera",
  lowConfidenceError: "Low confidence in prediction. Please try with a clearer image or consult a doctor.",
  serverConnectionMessage: " ",
  // Hotspot Map
  loadingMap: "Loading map...",
  selectDisease: "Select Disease",
  chickenpox: "Chickenpox",
  malaria: "Malaria",
  dengue: "Dengue",
  covid19: "COVID-19",
  typhoid: "Typhoid",
  //emergency management
  loadingEmergencyInfo: "Loading Emergency Info...",
  emergencyCenter: "Emergency Center",
  patientsContacts: "Patient's Contacts",
  noContactsFound: "No emergency contacts found. Click 'Add New' to create one.",
  systemDoctors: "System Doctors",
  noDoctorsFound: "No emergency doctors found. Click 'Add New' to create one.",
  systemHospitals: "System Hospitals",
  noHospitalsFound: "No emergency hospitals found. Click 'Add New' to create one.",
  editContact: "Edit Contact",
  addContact: "Add Contact",
  relationship: "Relationship",
  phoneNumber: "Phone Number",
  editDoctor: "Edit Doctor",
  addDoctor: "Add Doctor",
  doctorsName: "Doctor's Name",
  specialty: "Specialty",
  hospitalAffiliation: "Hospital Affiliation",
  editHospital: "Edit Hospital",
  addHospital: "Add Hospital",
  hospitalName: "Hospital Name",
  address: "Address",
  confirmDeleteContact: "Delete this contact?",
  confirmDeleteDoctor: "Delete this doctor?",
  confirmDeleteHospital: "Delete this hospital?",
  requestFailed: "Request failed with status {{status}}",
  aiAnalyzer1: "AI Disease Image Analyzer",
  aiAnalyzer2: "AI Symptom Analyzer",
  hotspot: "Hotspot Map",
};

// ✅ Updated Translation function with batching
async function translateText(texts, targetLang) {
  const BATCH_SIZE = 100;
  let allTranslations = [];

  try {
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const response = await fetch(`${BACKEND_URL}/translate`, {
        method: "POST",
        body: JSON.stringify({
          q: batch,
          target: targetLang,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server-side translation error:", errorData.error);
        throw new Error("Translation failed on the server side.");
      }

      const data = await response.json();
      allTranslations = allTranslations.concat(data.translations);
    }

    return allTranslations;
  } catch (err) {
    console.error("Frontend translation network error:", err);
    return Array.isArray(texts) ? texts : [texts];
  }
}


const LangContext = createContext();
export const useLang = () => useContext(LangContext);

export const LangProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(BASE_TEXTS);

  // 🔄 Auto-translate when language changes (skip English)
  useEffect(() => {
    if (language === "en") {
      setTranslations(BASE_TEXTS);
      return;
    }

    const translateAll = async () => {
      const keys = Object.keys(BASE_TEXTS);
      const values = Object.values(BASE_TEXTS);

      // ✅ FIX: Filter out empty strings before translating
      const nonNullValues = values.filter(text => text !== null && text !== '');

      const translated = await translateText(nonNullValues, language);
      const newTranslations = {};

      // ✅ FIX: Map translated values back to their original keys
      let translatedIndex = 0;
      keys.forEach((key, i) => {
        if (values[i] !== null && values[i] !== '') {
          newTranslations[key] = translated[translatedIndex];
          translatedIndex++;
        } else {
          newTranslations[key] = values[i];
        }
      });

      setTranslations(newTranslations);
    };

    translateAll();
  }, [language]);

  // Safe lookup for JSX
  const t = (key, fallback = key) => translations[key] || fallback;

  return (
    <LangContext.Provider
      value={{
        language,
        setLanguage,
        translations,
        setTranslations,
        t,
        languages,
        translateText // ✅ Expose the translateText function
      }}
    >
      {children}
    </LangContext.Provider>
  );
};