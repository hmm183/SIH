const Patient = require('../models/patientModel'); // Adjust path as needed

/**
 * @desc    Calculate AGGREGATE statistics for the hero counter cards.
 * @route   GET /api/v1/patients/statistics
 * @access  Public
 */
exports.getPatientStatistics = async (req, res) => {
  try {
    // This logic is restored to calculate all original stats
    const underTreatmentCount = await Patient.countDocuments({ status: 'under treatment' });
    const criticalCount = await Patient.countDocuments({ status: 'critical' });
    const dischargedCount = await Patient.countDocuments({ status: 'discharged' });
    const totalPatients = await Patient.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Patient statistics fetched successfully.',
      statistics: {
        patientsBeingCured: underTreatmentCount + criticalCount,
        patientsDischarged: dischargedCount, // This is the 'cured' count
        totalPatients: totalPatients,
      },
    });
  } catch (error) {
    console.error('Error calculating patient statistics:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * @desc    Get monthly registration data for the DYNAMIC CHART.
 * @route   GET /api/v1/patients/analytics/registrations
 * @access  Public
 */
exports.getRegistrationAnalytics = async (req, res) => {
  try {
    const analytics = await Patient.aggregate([
      {
        $project: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);
    res.status(200).json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching registration analytics:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};