const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  status: {
    type: String,
    enum: ['current', 'past'], // Only allows these two values
    default: 'current',         // New medicines are 'current' by default
  }, // <-- ADDED
});

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' , required: true },
  date: { type: Date, default: Date.now },
  medicines: [medicineSchema],
  prescriptionUrl: { type: String },
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;