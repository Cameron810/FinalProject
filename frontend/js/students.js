// Base API URL.
// The frontend and backend are served by the same Express server.
const API_URL = '/api'

// ===== AUTHENTICATION =====

const token = localStorage.getItem('token')

if (!token) {
  window.location.href = 'index.html'
  throw new Error('No authentication token')
}


// ===== AUTHORIZATION HEADER =====

function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}


// ===== LOGOUT =====

document.getElementById('logoutBtn').addEventListener('click', () => {

  localStorage.removeItem('token')

  window.location.href = 'index.html'

})


// ===== LOAD ADMIN INFORMATION =====

async function loadAdminInfo() {

  try {

    const res = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: authHeader()
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Could not load administrator information')
    }

    document.getElementById('username').textContent =
      data.username

    document.getElementById('rsoName').textContent =
      data.rso

    document.getElementById('sidebarRsoName').textContent =
      data.rso

    document.getElementById('statRsoName').textContent =
      data.rso

  } catch (error) {

    console.error(error)

    localStorage.removeItem('token')

    window.location.href = 'index.html'

  }

}


// ===== GET STUDENTS =====

async function getStudents() {

  const tableBody =
    document.getElementById('studentsTableBody')

  try {

    const res = await fetch(`${API_URL}/students`, {
      method: 'GET',
      headers: authHeader()
    })

    const students = await res.json()

    if (!res.ok) {
      throw new Error(
        students.message || 'Failed to load students'
      )
    }

    renderStudents(students)

  } catch (error) {

    console.error(error)

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="error-state">
          ${error.message}
        </td>
      </tr>
    `

  }

}


// ===== DISPLAY STUDENTS =====

function renderStudents(students) {

  const tableBody =
    document.getElementById('studentsTableBody')

  const count =
    document.getElementById('studentCount')

  count.textContent = students.length

  if (students.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="empty-state">
          No students have been added yet.
        </td>
      </tr>
    `

    return
  }


  tableBody.innerHTML = ''

  students.forEach(student => {

    const row = document.createElement('tr')

    row.innerHTML = `
      <td>${student.studentId}</td>

      <td>
        ${student.firstName} ${student.lastName}
      </td>

      <td>
        ${student.email || '—'}
      </td>

      <td class="action-buttons">

        <button
          class="edit-btn"
          onclick="editStudent('${student._id}')"
        >
          Edit
        </button>

        <button
          class="delete-btn"
          onclick="deleteStudent('${student._id}')"
        >
          Delete
        </button>

      </td>
    `

    tableBody.appendChild(row)

  })

}


// ===== SHOW ADD FORM =====

document
  .getElementById('showAddStudentBtn')
  .addEventListener('click', () => {

    document
      .getElementById('studentFormSection')
      .classList.remove('hidden')

    document
      .getElementById('studentFormTitle')
      .textContent = 'Add Student'

    document
      .getElementById('saveStudentBtn')
      .textContent = 'Add Student'

    document
      .getElementById('studentForm')
      .reset()

    document
      .getElementById('studentDatabaseId')
      .value = ''

  })


// ===== CANCEL FORM =====

document
  .getElementById('cancelStudentBtn')
  .addEventListener('click', () => {

    document
      .getElementById('studentFormSection')
      .classList.add('hidden')

    document
      .getElementById('studentForm')
      .reset()

  })


// ===== ADD / UPDATE STUDENT =====

document
  .getElementById('studentForm')
  .addEventListener('submit', async (e) => {

    e.preventDefault()

    const databaseId =
      document.getElementById('studentDatabaseId').value

    const studentId =
      document.getElementById('studentId').value.trim()

    const firstName =
      document.getElementById('firstName').value.trim()

    const lastName =
      document.getElementById('lastName').value.trim()

    const email =
      document.getElementById('studentEmail').value.trim()


    const studentData = {
      studentId,
      firstName,
      lastName,
      email
    }


    const isEditing = Boolean(databaseId)

    const url = isEditing
      ? `${API_URL}/students/${databaseId}`
      : `${API_URL}/students`

    const method = isEditing
      ? 'PUT'
      : 'POST'


    try {

      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(studentData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data.message || 'Could not save student'
        )
      }


      document
        .getElementById('studentFormMessage')
        .textContent =
          isEditing
            ? 'Student updated successfully.'
            : 'Student added successfully.'


      document
        .getElementById('studentForm')
        .reset()

      document
        .getElementById('studentDatabaseId')
        .value = ''


      document
        .getElementById('studentFormSection')
        .classList.add('hidden')


      await getStudents()

    } catch (error) {

      document
        .getElementById('studentFormMessage')
        .textContent = error.message

    }

  })


// ===== EDIT STUDENT =====

async function editStudent(id) {

  try {

    const res = await fetch(`${API_URL}/students`, {
      method: 'GET',
      headers: authHeader()
    })

    const students = await res.json()

    const student = students.find(
      student => student._id === id
    )

    if (!student) {
      throw new Error('Student not found')
    }


    document
      .getElementById('studentDatabaseId')
      .value = student._id

    document
      .getElementById('studentId')
      .value = student.studentId

    document
      .getElementById('firstName')
      .value = student.firstName

    document
      .getElementById('lastName')
      .value = student.lastName

    document
      .getElementById('studentEmail')
      .value = student.email || ''


    document
      .getElementById('studentFormTitle')
      .textContent = 'Edit Student'

    document
      .getElementById('saveStudentBtn')
      .textContent = 'Save Changes'


    document
      .getElementById('studentFormSection')
      .classList.remove('hidden')


    document
      .getElementById('studentFormSection')
      .scrollIntoView({
        behavior: 'smooth'
      })

  } catch (error) {

    alert(error.message)

  }

}


// ===== DELETE STUDENT =====

async function deleteStudent(id) {

  const confirmed = confirm(
    'Are you sure you want to remove this student from your RSO?'
  )

  if (!confirmed) {
    return
  }


  try {

    const res = await fetch(
      `${API_URL}/students/${id}`,
      {
        method: 'DELETE',
        headers: authHeader()
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(
        data.message || 'Could not delete student'
      )
    }

    await getStudents()

  } catch (error) {

    alert(error.message)

  }

}


// ===== INITIAL PAGE LOAD =====

loadAdminInfo()
getStudents()