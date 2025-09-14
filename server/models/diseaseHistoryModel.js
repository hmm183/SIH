const mongoose = require('mongoose');

const diseaseHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Patient', // Reference to the Patient model
  },
  illnessName: {
    type: String,
    required: true,
  },
  diagnosisDate: {
    type: Date,
    default: Date.now,
  },
  initialSymptoms: {
    type: [String],
    default: [],
  },
  remarks: {
    type: String,
  },
  medicinesPrescribed: {
    type: [String],
    default: [],
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    // --- FIX: This reference is crucial for .populate() to work ---
    ref: 'Doctor', 
  },
  status: {
    type: String,
    enum: ['ongoing', 'resolved'],
    default: 'ongoing',
  },
  hospital: {
    type: String,
  },
}, {
  timestamps: true,
});

const DiseaseHistory = mongoose.model('DiseaseHistory', diseaseHistorySchema);
module.exports = DiseaseHistory;