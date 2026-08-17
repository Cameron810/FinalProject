const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add a username'],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, 'Please add a password'],
    },

    rso: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please add an RSO'],
      ref: 'RSO',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)