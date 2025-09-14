const DiseaseHistory = require('../models/diseaseHistoryModel'); // Adjust path as needed

/**
 * @desc    Create a new disease history entry
 * @route   POST /api/history
 * @access  Private
 */
exports.createDiseaseHistory = async (req, res) => {
  try {
    // Destructure all expected fields from the request body
    const {
      patientId,
      illnessName,
      diagnosisDate,
      initialSymptoms,
      remarks,
      medicinesPrescribed,
      prescribedBy,
      status,
      hospital,
    } = req.body;

    // A patientId is essential to link the history to a patient
    if (!patientId) {
      return res.status(400).json({ message: 'Patient ID is required.' });
    }

    const newHistoryEntry = await DiseaseHistory.create({
      patientId,
      illnessName,
      diagnosisDate,
      initialSymptoms,
      remarks,
      medicinesPrescribed,
      prescribedBy,
      status,
      hospital,
    });

    res.status(201).json(newHistoryEntry);
  } catch (error) {
    console.error('Error creating disease history:', error);
    res.status(500).json({ message: 'Server error while creating history entry.' });
  }
};

/**
 * @desc    Get all disease history for a specific patient
 * @route   GET /api/history/patient/:patientId
 * @access  Private
 */
exports.getHistoryByPatient = async (req, res) => {
  try {
    const history = await DiseaseHistory.find({ patientId: req.params.patientId })
      .populate('prescribedBy', 'fullName username specialization') // Get doctor's details
      .sort({ diagnosisDate: -1 }); // Show most recent first

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching disease history:', error);
    res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

/**
 * @desc    Update an existing disease history entry
 * @route   PUT /api/history/:id
 * @access  Private
 */
exports.updateDiseaseHistory = async (req, res) => {
  try {
    const updatedHistory = await DiseaseHistory.findByIdAndUpdate(
      req.params.id,
      req.body, // Pass the entire request body to update fields
      { new: true, runValidators: true } // Return the updated document and run validations
    );

    if (!updatedHistory) {
      return res.status(404).json({ message: 'History record not found.' });
    }

    res.status(200).json(updatedHistory);
  } catch (error) {
    console.error('Error updating disease history:', error);
    res.status(500).json({ message: 'Server error while updating history.' });
  }
};


exports.getHistorySummaryByPatient = async (req, res) => {
  try {
    // 1. Find all history records for the patient.
    // .select() efficiently fetches only the fields we need from the database.
    const historyRecords = await DiseaseHistory.find({ patientId: req.params.patientId })
      .select('illnessName diagnosisDate')
      .sort({ diagnosisDate: -1 }); // Show most recent first

    // 2. Transform the data to the desired format (illnessName and diagnosisYear).
    const summary = historyRecords.map(record => ({
      illnessName: record.illnessName,
      diagnosisYear: record.diagnosisDate ? record.diagnosisDate.getFullYear() : 'N/A',
    }));

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching disease history summary:', error);
    res.status(500).json({ message: 'Server error while fetching history summary.' });
  }
};