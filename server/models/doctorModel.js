const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    // --- Authentication Fields ---
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      // IMPORTANT: Always hash passwords before saving!
      // This is typically done using a pre-save hook with bcrypt.
    },

    // --- Personal & Professional Details ---
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required.'],
      trim: true,
      // Example: "Cardiologist", "General Physician", "Neurologist"
    },
    licenseNumber: {
      type: String,
      required: [true, 'Medical license number is required.'],
      unique: true,
      trim: true,
    },
    qualifications: [
      {
        type: String, // e.g., ["MBBS", "MD in Cardiology"]
        trim: true,
      },
    ],
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;