const express = require('express');
const router = express.Router();

const {
  createPrescription,
  getPrescriptionsByPatient,
  updatePrescription,
  updateMedicineStatus
} = require('../controllers/PrescriptionController');

// POST a new prescription
router.post('/', createPrescription);

// GET all prescriptions for a specific patient
router.get('/patient/:patientId', getPrescriptionsByPatient);

// PUT (update) an existing prescription by its ID
router.put('/:prescriptionId/medicines/:medicineId', updateMedicineStatus);
router.put('/:id', updatePrescription);

module.exports = router;