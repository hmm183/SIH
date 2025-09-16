const express = require('express');
const router = express.Router();

const {
  createPrescription,
  getPrescriptionsByPatient,
  updatePrescription,
  updateMedicineStatus,
  addMedicineToPrescription,  // <-- Import new function
  updateMedicineDetails       // <-- Import new function
} = require('../controllers/PrescriptionController');

// POST a new prescription
router.post('/', createPrescription);

// GET all prescriptions for a specific patient
router.get('/patient/:patientId', getPrescriptionsByPatient);

// PUT (update) an existing prescription by its ID
//router.put('/:prescriptionId/medicines/:medicineId', updateMedicineStatus);
router.put('/:id', updatePrescription);

router.put('/medicines/:prescriptionId/:medicineId/status', updateMedicineStatus); // Example path, use your actual one

router.post('/:id/medicines', addMedicineToPrescription);

// Update a specific medicine's details
router.put('/:prescriptionId/medicines/:medicineId', updateMedicineDetails);

module.exports = router;