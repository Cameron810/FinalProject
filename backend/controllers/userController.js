const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../model/userModel')
const RSO = require('../model/rsoModel')

// Generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  )
}


// @desc    Register a new RSO admin
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {

  const {
    username,
    password,
    rsoName,
  } = req.body


  // Validate required fields
  if (!username || !password || !rsoName) {
    res.status(400)
    throw new Error('Please provide username, password, and RSO name')
  }


  // Check whether username already exists
  const userExists = await User.findOne({ username })

  if (userExists) {
    res.status(400)
    throw new Error('Username already exists')
  }


  // Find the RSO
  let rso = await RSO.findOne({ name: rsoName })


  // If the RSO doesn't exist, create it
  if (!rso) {
    rso = await RSO.create({
      name: rsoName,
      students: [],
    })
  }


  // Hash the password before saving it
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)


  // Create the admin and associate them with the RSO
  const user = await User.create({
    username,
    password: hashedPassword,
    rso: rso._id,
  })


  if (user) {

    res.status(201).json({
      _id: user._id,
      username: user.username,
      rso: rso.name,
      token: generateToken(user._id),
    })

  } else {

    res.status(400)
    throw new Error('Invalid user data')

  }

})


// @desc    Authenticate an RSO admin
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {

  const {
    username,
    password,
  } = req.body


  if (!username || !password) {
    res.status(400)
    throw new Error('Please provide username and password')
  }


  const user = await User.findOne({ username }).populate('rso')


  if (!user) {
    res.status(401)
    throw new Error('Invalid username or password')
  }


  const passwordMatches = await bcrypt.compare(
    password,
    user.password
  )


  if (!passwordMatches) {
    res.status(401)
    throw new Error('Invalid username or password')
  }


  res.status(200).json({
    _id: user._id,
    username: user.username,
    rso: user.rso ? user.rso.name : null,
    token: generateToken(user._id),
  })

})


// @desc    Get current logged-in admin
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).populate('rso')


  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }


  res.status(200).json({
    _id: user._id,
    username: user.username,
    rso: user.rso ? user.rso.name : null,
  })

})


// Export controller functions
module.exports = {
  registerUser,
  loginUser,
  getMe,
}