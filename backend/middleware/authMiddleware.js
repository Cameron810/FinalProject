const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')

const User = require('../model/userModel')

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1]

      // Verify the token.
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Find the user and attach them to req.user.
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }

      next()
    } catch (error) {
      res.status(401)
      throw new Error('Not authorized')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

module.exports = {
  protect,
}