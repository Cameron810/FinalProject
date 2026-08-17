const mongoose = require('mongoose')

const studentSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Please add a student ID'],
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Student', studentSchema)