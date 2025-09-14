const express = require('express');
const router = express.Router();
const { 
  getPatientStatistics,
  getRegistrationAnalytics
} = require('../controllers/patientController');

// Route for the aggregate counter cards
router.get('/statistics', getPatientStatistics);

// Route for the dynamic registration chart
router.get('/analytics/registrations', getRegistrationAnalytics);

module.exports = router;