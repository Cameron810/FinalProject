const asyncHandler = require('express-async-handler')
const Student = require('../model/studentModel')
const RSO = require('../model/rsoModel')

// @desc    Get students for the logged-in admin's RSO
// @route   GET /api/students
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
  const rso = await RSO.findById(req.user.rso).populate('students')

  if (!rso) {
    res.status(404)
    throw new Error('RSO not found')
  }

  res.status(200).json(rso.students)
})

// @desc    Add a student to the logged-in admin's RSO
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const { studentId, firstName, lastName, email } = req.body

  if (!studentId || !firstName || !lastName) {
    res.status(400)
    throw new Error('Please provide student ID, first name, and last name')
  }

  const rso = await RSO.findById(req.user.rso)

  if (!rso) {
    res.status(404)
    throw new Error('RSO not found')
  }

  // Look for an existing student using the unique student ID.
  // This allows the same student to belong to multiple RSOs.
  let student = await Student.findOne({ studentId })

  if (!student) {
    student = await Student.create({
      studentId,
      firstName,
      lastName,
      email,
    })
  }

  // Don't add the same student to the same RSO twice.
  if (!rso.students.some(id => id.toString() === student._id.toString())) {
    rso.students.push(student._id)
    await rso.save()
  }

  res.status(201).json(student)
})

// @desc    Update a student belonging to the logged-in admin's RSO
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const rso = await RSO.findById(req.user.rso)

  if (!rso) {
    res.status(404)
    throw new Error('RSO not found')
  }

  // Verify that this student belongs to this admin's RSO.
  const belongsToRSO = rso.students.some(
    id => id.toString() === req.params.id
  )

  if (!belongsToRSO) {
    res.status(403)
    throw new Error('Student does not belong to your RSO')
  }

  const student = await Student.findById(req.params.id)

  if (!student) {
    res.status(404)
    throw new Error('Student not found')
  }

  const { studentId, firstName, lastName, email } = req.body

  student.studentId = studentId || student.studentId
  student.firstName = firstName || student.firstName
  student.lastName = lastName || student.lastName
  student.email = email !== undefined ? email : student.email

  const updatedStudent = await student.save()

  res.status(200).json(updatedStudent)
})

// @desc    Delete a student from the logged-in admin's RSO
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const rso = await RSO.findById(req.user.rso)

  if (!rso) {
    res.status(404)
    throw new Error('RSO not found')
  }

  const studentIndex = rso.students.findIndex(
    id => id.toString() === req.params.id
  )

  if (studentIndex === -1) {
    res.status(403)
    throw new Error('Student does not belong to your RSO')
  }

  const studentId = rso.students[studentIndex]

  // Remove the student from this RSO.
  rso.students.splice(studentIndex, 1)
  await rso.save()

  // Only delete the actual student document if no RSO references it anymore.
  const stillUsed = await RSO.exists({
    students: studentId,
  })

  if (!stillUsed) {
    await Student.findByIdAndDelete(studentId)
  }

  res.status(200).json({
    message: 'Student removed from RSO',
  })
})

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
}