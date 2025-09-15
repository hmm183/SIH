const express = require('express');
const router = express.Router();

const {
  generateHealthSummary,
  queryHealthData
} = require('../controllers/healthSummaryController'); // Adjust path if needed

// No middleware is used.
// This route calls the controller that uses real patient data.
router.post('/generate', generateHealthSummary);
router.post('/query', queryHealthData);

module.exports = router;

