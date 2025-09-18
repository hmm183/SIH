const Prescription = require('../models/prescriptionModel'); // Adjust the path as needed
const Patient = require('../models/patientModel'); // Corrected model name
const Doctor = require('../models/Doctor'); // Corrected model name

/**
 * @desc    Create a new prescription
 * @route   POST /api/v1/prescriptions
 * @access  Private (e.g., Doctor only)
 */
exports.createPrescription = async (req, res) => {
  try {
    // The 'medicines' field is now optional on creation.
    const { patientId, doctorId, medicines } = req.body;

    // 1. MODIFIED VALIDATION: Only check for patientId and doctorId.
    if (!patientId || !doctorId) {
      return res.status(400).json({ message: 'Missing required fields: patientId and doctorId are required.' });
    }

    // Optional: Check if the patient and doctor actually exist
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({ message: `Patient with ID ${patientId} not found.` });
    }

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return res.status(404).json({ message: `Doctor with ID ${doctorId} not found.` });
    }

    const newPrescription = new Prescription({
      patientId,
      doctorId,
      // 2. MODIFIED CREATION: Safely handle an undefined medicines array.
      // If medicines is not provided in the request, it defaults to an empty array.
      medicines: medicines || [], 
    });

    const savedPrescription = await newPrescription.save();

    // 3. ENHANCED RESPONSE: Populate doctor info on creation for immediate use on the frontend.
    const populatedPrescription = await Prescription.findById(savedPrescription._id)
                                                      .populate('doctorId', 'name');

    res.status(201).json(populatedPrescription);

  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ message: 'Server error while creating prescription.' });
  }
};

/**
 * @desc    Get all prescriptions for a specific patient
 * @route   GET /api/prescriptions/patient/:patientId
 * @access  Private (e.g., Patient or Doctor)
 */
exports.getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name') // Fetches doctor's fullName and specialization
      .sort({ date: -1 }); // Show the most recent prescriptions first

    if (!prescriptions || prescriptions.length === 0) {
      return res.status(404).json({ message: 'No prescriptions found for this patient.' });
    }

    res.status(200).json(prescriptions);

  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Server error while fetching prescriptions.' });
  }
};

/**
 * @desc    Update an existing prescription (e.g., add/remove medicines)
 * @route   PUT /api/prescriptions/:id
 * @access  Private (e.g., Doctor only)
 */
exports.updatePrescription = async (req, res) => {
  try {
    const { medicines } = req.body; // You'll typically only update the medicines array

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { medicines }, // Shorthand for { medicines: medicines }
      { new: true, runValidators: true } // Return the updated doc and run schema validation
    );

    if (!updatedPrescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    res.status(200).json(updatedPrescription);

  } catch (error) {
    console.error('Error updating prescription:', error);
    res.status(500).json({ message: 'Server error while updating prescription.' });
  }
};

/**
 * @desc    Add a new medicine to an existing prescription
 * @route   POST /api/prescriptions/:id/medicines
 * @access  Private (e.g., Doctor only)
 */
exports.addMedicineToPrescription = async (req, res) => {
  try {
    const { name, dosage, frequency, duration } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Medicine name is required.' });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found.' });
    }

    // A new medicine will automatically get status: 'current' from the schema default
    const newMedicine = { name, dosage, frequency, duration };

    prescription.medicines.push(newMedicine);
    
    await prescription.save();

    res.status(201).json(prescription);

  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ message: 'Server error while adding medicine.' });
  }
};

/**
 * @desc    Update a specific medicine's details in a prescription
 * @route   PUT /api/prescriptions/:prescriptionId/medicines/:medicineId
 * @access  Private (e.g., Doctor only)
 */
exports.updateMedicineDetails = async (req, res) => {
  try {
    const { prescriptionId, medicineId } = req.params;
    // Removed 'status' as it's handled by a separate function
    const { name, dosage, frequency, duration } = req.body;

    // Dynamically build the fields to be updated
    const updateFields = {};

    // Check for each field explicitly to allow setting empty strings
    if (name !== undefined) {
        if (name.trim() === '') {
            return res.status(400).json({ message: 'Medicine name cannot be empty.' });
        }
        updateFields['medicines.$.name'] = name;
    }
    if (dosage !== undefined) updateFields['medicines.$.dosage'] = dosage;
    if (frequency !== undefined) updateFields['medicines.$.frequency'] = frequency;
    if (duration !== undefined) updateFields['medicines.$.duration'] = duration;
    
    // Ensure there is at least one field to update
    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    
    const prescription = await Prescription.findOneAndUpdate(
      { "_id": prescriptionId, "medicines._id": medicineId },
      { "$set": updateFields },
      { new: true, runValidators: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription or medicine not found.' });
    }

    res.status(200).json(prescription);

  } catch (error) {
    console.error('Error updating medicine details:', error);
    res.status(500).json({ message: 'Server error while updating medicine details.' });
  }
};

/**
 * @desc    Update ONLY the status of a medicine
 * @route   PATCH /api/prescriptions/:prescriptionId/medicines/:medicineId/status
 * @access  Private
 */
exports.updateMedicineStatus = async (req, res) => {
  try {
    const { prescriptionId, medicineId } = req.params;
    const { status } = req.body;

    // Validate the incoming status
    if (!status || !['current', 'past'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'current' or 'past'." });
    }

    // Find the prescription and update the status of the specific medicine
    const prescription = await Prescription.findOneAndUpdate(
      { "_id": prescriptionId, "medicines._id": medicineId },
      { 
        "$set": { "medicines.$.status": status } 
      },
      { new: true } // Return the updated document
    );

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription or medicine not found.' });
    }

    res.status(200).json(prescription);

  } catch (error) {
    console.error('Error updating medicine status:', error);
    res.status(500).json({ message: 'Server error while updating medicine status.' });
  }
};