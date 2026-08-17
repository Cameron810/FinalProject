const mongoose = require('mongoose')

const rsoSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an RSO name'],
      trim: true,
      unique: true,
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('RSO', rsoSchema)