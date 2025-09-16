const mongoose = require("mongoose"); // Import mongoose to validate ObjectIDs
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Patient = require("../models/patientModel");
const DiseaseHistory = require("../models/diseaseHistoryModel");
const Prescription = require("../models/prescriptionModel");
const DailyReading = require("../models/dailyReadingModel");

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
      return res.status(400).json({ error: "Patient ID is required." });
    }

    // --- FIX 1: Validate the Patient ID format before querying ---
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res
        .status(400)
        .json({ error: "The provided Patient ID is not a valid format." });
    }

    // --- 1. Fetch all relevant health data ---
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found." });
    }

    const history = await DiseaseHistory.find({ patientId }).sort({
      diagnosisDate: -1,
    });
    const prescriptions = await Prescription.find({ patientId }).sort({
      date: -1,
    });
    const latestReading = await DailyReading.findOne({ patientId }).sort({
      date: -1,
    });

    // --- 2. Construct a detailed prompt from the real data ---
    let ageText = "N/A";
    if (patient.dateOfBirth) {
      const age =
        new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
      ageText = `${age} years old`;
    }

    let prompt = `Generate a concise, professional health summary for a medical professional...\n`;
    prompt += `- Name: ${patient.fullName}\n- Age: ${ageText}\n`;

    // --- FIX 2: Check if latestReading exists before using it ---
    if (latestReading && latestReading.bloodPressure) {
      prompt += `- Latest Vitals: Blood Pressure ${latestReading.bloodPressure.systolic}/${latestReading.bloodPressure.diastolic}\n`;
    }

    if (history.length > 0) {
      prompt +=
        "- Known Conditions: " +
        history.map((h) => `${h.illnessName} (${h.status})`).join(", ") +
        "\n";
    }

    const currentMeds = prescriptions
      .flatMap((p) => p.medicines)
      .filter((m) => m.status === "current");
    if (currentMeds.length > 0) {
      prompt +=
        "- Current Medications: " +
        currentMeds.map((m) => `${m.name} ${m.dosage}`).join(", ");
    } // --- 3. Call the Gemini API ---

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const summary = result.response.text(); // --- 4. Send the summary back ---

    res.status(200).json({
      source: "Gemini 1.5 Flash",
      healthSummary: summary,
    });
  } catch (error) {
    console.error("Error in generateHealthSummary:", error);
    // --- FIX 3: Send back a more detailed error message ---
    res.status(500).json({
      error: "Failed to generate health summary.",
      details: error.message, // This will give you the specific reason for the crash
    });
  }
};

/**
 * @desc     Answer a specific question based on a patient's full health data
 * @route    POST /api/v1/summary/query
 * @access   Private
 */
exports.queryHealthData = async (req, res) => {
  try {
    const { patientId, userQuery } = req.body;
    if (!patientId || !userQuery) {
      return res
        .status(400)
        .json({ error: "Patient ID and user query are required." });
    }
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ error: "Invalid Patient ID format." });
    }

    // 1. Fetch all patient data to build context
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found." });

    // Using the controllers/routes you provided
    const history = await DiseaseHistory.find({ patientId }).sort({
      diagnosisDate: -1,
    });
    const prescriptions = await Prescription.find({ patientId }).sort({
      date: -1,
    });
    const readings = await DailyReading.find({ patientId })
      .sort({ date: -1 })
      .limit(30);

    // 2. Engineer a detailed prompt for the AI
    let context = `CONTEXT: You are a helpful medical AI assistant. Analyze the following health data for patient "${patient.fullName}".\n\n`;
    context += `PATIENT DETAILS:\n- Age: ${patient.age}\n- Gender: ${patient.gender}\n\n`;

    if (history.length > 0) {
      context +=
        "DISEASE HISTORY:\n" +
        history
          .map(
            (h) =>
              `- ${h.illnessName} (Diagnosed: ${new Date(
                h.diagnosisDate
              ).toLocaleDateString()}, Status: ${h.status})`
          )
          .join("\n") +
        "\n\n";
    }
    if (prescriptions.length > 0) {
      const currentMeds = prescriptions
        .flatMap((p) => p.medicines)
        .filter((m) => m.status === "current");
      if (currentMeds.length > 0) {
        context +=
          "CURRENT MEDICATIONS:\n" +
          currentMeds.map((m) => `- ${m.name} ${m.dosage}`).join("\n") +
          "\n\n";
      }
    }
    if (readings.length > 0) {
      context +=
        "RECENT VITALS (last 30 readings):\n" +
        readings
          .map(
            (r) =>
              `- Date: ${new Date(r.date).toLocaleString()}, BP: ${
                r.bloodPressure.systolic
              }/${r.bloodPressure.diastolic}, Pulse: ${r.pulseRate}`
          )
          .join("\n") +
        "\n\n";
    }

    const prompt = `
You are a professional medical AI assistant. 
Always follow this response structure:

1. Patient Summary: Give a very concise health summary based only on the patient's records.  
2. Disease Insights: Briefly explain the patient's diseases/conditions.  
   - If the doctor asks about a specific disease, focus on that disease: explain what it is, risks, and patient-specific history.  
3. Direct Answer: Respond to the doctor’s question clearly, briefly, and to the point.  

⚠️ Important:  
- Be concise, avoid long explanations.  
- Only use information from the patient's records for patient-specific details.  
- If the doctor asks about a disease not in the records, provide only a short general overview of the disease.  

Here is the patient context data:

${context}

Doctor's Question: "${userQuery}"
`;

    // 3. Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // 4. Send the answer back
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in queryHealthData:", error);
    res
      .status(500)
      .json({ error: "Failed to query health data.", details: error.message });
  }
};
