const express = require('express');
const router = express.Router();

const {
  createDiseaseHistory,
  getHistoryByPatient,
  updateDiseaseHistory,
  getHistorySummaryByPatient,
} = require('../controllers/historyController');

// POST: Create a new history entry
router.post('/', createDiseaseHistory);

// GET: Get a summarized history for a patient
router.get('/patient/:patientId/summary', getHistorySummaryByPatient);

// GET: Get the full history for a patient
// This route is placed after the more specific '/summary' route to avoid conflicts
router.get('/patient/:patientId', getHistoryByPatient);

// PUT: Update an existing history entry by its unique ID
router.put('/:id', updateDiseaseHistory);

module.exports = router;