// server/routes/ocrPrescriptionRoutes.js
const express = require('express');
const router = express.Router();
const {
  processOcrPrescription,
  getOcrPrescriptionResult,
  getPrescriptionsForPatient,
  getOcrPrescriptionCountForPatient, // ✅ Import new function
  getAllMedicinesForPatient,       // ✅ Import new function
} = require('../controllers/ocrPrescriptionController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have auth middleware

// Existing Routes
router.post('/', protect, processOcrPrescription);
router.get('/:id', protect, getOcrPrescriptionResult);
router.get('/patient/:patientId', protect, getPrescriptionsForPatient);

// ======== ✅ NEW ROUTES ADDED BELOW ========
router.get('/patient/:patientId/count', protect, getOcrPrescriptionCountForPatient);
router.get('/patient/:patientId/medicines', protect, getAllMedicinesForPatient);

module.exports = router;