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
// --- NEW SUMMARY ROUTE ---
router.get('/patient/:patientId/summary', getHistorySummaryByPatient);

// This should be after the summary route to avoid conflicts
router.get('/patient/:patientId', getHistoryByPatient);



// PUT: Update an existing history entry by its unique ID
router.put('/:id', updateDiseaseHistory);

module.exports = router;