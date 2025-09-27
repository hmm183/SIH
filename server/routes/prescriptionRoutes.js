const express = require('express');
const router = express.Router();

const {
  createPrescription,
  getPrescriptionsByPatient,
  updatePrescription,
  updateMedicineStatus,
  addMedicineToPrescription,
  updateMedicineDetails,
  deletePrescription,
  deleteMedicineFromPrescription // Ensure this is imported
} = require('../controllers/PrescriptionController');

// Routes for creating a new prescription and getting all for a patient
router.route('/')
  .post(createPrescription);

router.route('/patient/:patientId')
  .get(getPrescriptionsByPatient);

// Routes for a specific prescription by its ID (Update and Delete)
router.route('/:id')
  .put(updatePrescription)
  .delete(deletePrescription);

// Route for adding a new medicine to a prescription
router.route('/:id/medicines')
  .post(addMedicineToPrescription);

// Route for updating a specific medicine's details
router.route('/:prescriptionId/medicines/:medicineId')
  .put(updateMedicineDetails);

// ✅ FIXED: Create a dedicated, explicit route for deleting a medicine
router.route('/:prescriptionId/medicines/:medicineId')
  .delete(deleteMedicineFromPrescription);

// Route for updating a specific medicine's status
router.route('/medicines/:prescriptionId/:medicineId/status')
  .put(updateMedicineStatus);

module.exports = router;