// routes/doctorRoutes.js

const express = require('express');
const router = express.Router();

// Import the controller functions that contain the logic
const {
  createDoctor,
  getAllDoctors,
  getDoctorById,
} = require('../controllers/doctorController');

// Define the routes 🛣

// @desc    Register a new doctor
// @route   POST /api/doctors
router.post('/', createDoctor);

// @desc    Get all doctors
// @route   GET /api/doctors
router.get('/', getAllDoctors);

// @desc    Get a single doctor by their ID
// @route   GET /api/doctors/:id
router.get('/:id', getDoctorById);

module.exports = router;