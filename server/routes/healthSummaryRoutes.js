const express = require('express');
const router = express.Router();

const {
  generateHealthSummary,
} = require('../controllers/healthSummaryController'); // Adjust path if needed

// No middleware is used.
// This route calls the controller that uses real patient data.
router.post('/generate', generateHealthSummary);

module.exports = router;

