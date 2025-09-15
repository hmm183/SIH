const mongoose = require('mongoose');
const DiseaseHistory = require('../models/diseaseHistoryModel'); // Adjust path as needed

/**
 * @desc    Create a new disease history entry
 * @route   POST /api/v1/history
 * @access  Public
 */
exports.createDiseaseHistory = async (req, res) => {
  try {
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
      address,   // Location field
      location,  // GeoJSON location object
    } = req.body;

    if (!patientId || !illnessName) {
      return res.status(400).json({ message: 'Patient ID and Illness Name are required.' });
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
      address,
      location,
    });

    res.status(201).json(newHistoryEntry);
  } catch (error) {
    console.error('Error creating disease history:', error);
    res.status(500).json({ message: 'Server error while creating history entry.' });
  }
};

/**
 * @desc    Get all disease history for a specific patient
 * @route   GET /api/v1/history/patient/:patientId
 * @access  Public
 */
exports.getHistoryByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID format.' });
    }
    const history = await DiseaseHistory.find({ patientId: req.params.patientId })
      .populate('prescribedBy', 'name') // Get doctor's details
      .sort({ diagnosisDate: -1 }); // Show most recent first

    res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching disease history:', error);
    res.status(500).json({ message: 'Server error while fetching history.' });
  }
};

/**
 * @desc    Update an existing disease history entry
 * @route   PUT /api/v1/history/:id
 * @access  Public
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

/**
 * @desc    Get a summarized disease history for a patient
 * @route   GET /api/v1/history/patient/:patientId/summary
 * @access  Public
 */
exports.getHistorySummaryByPatient = async (req, res) => {
  try {
    const historyRecords = await DiseaseHistory.find({ patientId: req.params.patientId })
      .select('illnessName diagnosisDate')
      .sort({ diagnosisDate: -1 });

    const summary = historyRecords.map(record => ({
      illnessName: record.illnessName,
      diagnosisYear: record.diagnosisDate ? record.diagnosisDate.getFullYear() : 'N/A',
    }));

    res.status(200).json(summary);
  } catch (error) {
    console.error('Error fetching disease history summary:', error);
    res.status(500).json({ message: 'Server error while fetching history summary.' });
  }
};