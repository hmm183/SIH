const mongoose = require('mongoose'); // Import mongoose to validate ObjectIDs
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require('../models/patientModel');
const DiseaseHistory = require('../models/diseaseHistoryModel');
const Prescription = require('../models/prescriptionModel');
const DailyReading = require('../models/dailyReadingModel');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @desc    Generate a health summary using real patient data
 * @route   POST /api/v1/summary/generate
 * @access  Public (No Middleware)
 */
exports.generateHealthSummary = async (req, res) => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required.' });
    }

    // --- FIX 1: Validate the Patient ID format before querying ---
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: 'The provided Patient ID is not a valid format.' });
    }

    // --- 1. Fetch all relevant health data ---
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }
    
    const history = await DiseaseHistory.find({ patientId }).sort({ diagnosisDate: -1 });
    const prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });
    const latestReading = await DailyReading.findOne({ patientId }).sort({ date: -1 });

    // --- 2. Construct a detailed prompt from the real data ---
    let ageText = 'N/A';
    if (patient.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
      ageText = `${age} years old`;
    }

    let prompt = `Generate a concise, professional health summary for a medical professional...\n`;
    prompt += `- Name: ${patient.fullName}\n- Age: ${ageText}\n`;

    // --- FIX 2: Check if latestReading exists before using it ---
    if (latestReading && latestReading.bloodPressure) {
      prompt += `- Latest Vitals: Blood Pressure ${latestReading.bloodPressure.systolic}/${latestReading.bloodPressure.diastolic}\n`;
    }

    if (history.length > 0) {
      prompt += "- Known Conditions: " + history.map(h => `${h.illnessName} (${h.status})`).join(', ') + "\n";
    }

    const currentMeds = prescriptions.flatMap(p => p.medicines).filter(m => m.status === 'current');
    if (currentMeds.length > 0) {
      prompt += "- Current Medications: " + currentMeds.map(m => `${m.name} ${m.dosage}`).join(', ');
    }
    
    // --- 3. Call the Gemini API ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    // --- 4. Send the summary back ---
    res.status(200).json({
      source: "Gemini 1.5 Flash",
      healthSummary: summary
    });

  } catch (error) {
    console.error("Error in generateHealthSummary:", error);
    // --- FIX 3: Send back a more detailed error message ---
    res.status(500).json({ 
        error: "Failed to generate health summary.",
        details: error.message // This will give you the specific reason for the crash
    });
  }
};