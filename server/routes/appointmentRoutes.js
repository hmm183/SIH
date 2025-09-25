const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getDoctorAppointments, // Import the new controller
  getPatientAppointments,
  getPatientAppointmentCount,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');

router.post('/', bookAppointment);

// New route to get appointments for the logged-in doctor
router.get('/doctor/:doctorId', getDoctorAppointments); 

router.get('/patient/:patientId', getPatientAppointments);
router.get('/patient/:patientId/count', getPatientAppointmentCount);
router.patch('/:appointmentId/status', updateAppointmentStatus); 

module.exports = router;

