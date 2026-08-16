// Import Express — needed to access the Router factory function
const express = require('express')

// Create a Router instance
// keeping route definitions modular and out of the main server.js file
const router = express.Router()

// Import CRUD controller functions from noteController.js
// Each function handles exactly one operation and is mapped to a route + HTTP method below

const {
    getNotes,    // GET    — fetch all notes belonging to the authenticated user
    setNote,     // POST   — create a new note
    updateNote,  // PUT    — overwrite an existing note by ID
    deleteNote   // DELETE — remove a note by ID
} = require('../controllers/noteController')

// Import the `protect` middleware from authMiddleware.js
// `protect` runs BEFORE the controller on any route it's applied to.
// It validates the incoming JWT from the Authorization header, decodes the user ID,
// fetches that user from the DB, and attaches them to req.user.
// If the token is missing, expired, or invalid — it rejects the request with a 401
// and the controller function never runs.
// Please look into this code (../middleware/authMiddleware)

const { protect } = require('../middleware/authMiddleware')

// ---- Routes for /api/notes/ --------------------------
// GET  /api/notes/  → protect runs first, then getNotes (returns all notes for req.user)
// POST /api/notes/  → protect runs first, then setNote  (creates a note owned by req.user)

router.route('/').get(protect, getNotes).post(protect, setNote)

// ---- Routes for /api/notes/:id--------------------------
// PUT    /api/notes/:id → protect runs first, then updateNote (edits note with matching :id)
// DELETE /api/notes/:id → protect runs first, then deleteNote (removes note with matching :id)
// :id is a URL parameter accessible in the controller via req.params.id

router.route('/:id').put(protect, updateNote).delete(protect, deleteNote)

// Export this router so server.js can mount it:
// app.use('/api/notes', require('./routes/noteRoutes'))
// All routes defined above are relative to that /api/notes base path
module.exports = router