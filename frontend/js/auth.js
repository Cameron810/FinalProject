// Base URL for the API.
// Because Express serves the frontend and backend from the same server,
// /api works both locally and when deployed to Render.
const API_URL = '/api'

// ===== REGISTER =====

const registerForm = document.getElementById('registerForm')

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value
    const rsoName = document.getElementById('rsoName').value.trim()

    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          rsoName
        })
      })

      const data = await res.json()

      if (!res.ok) {
        document.getElementById('errorMsg').textContent =
          data.message || 'Registration failed'
        return
      }

      // Save the JWT so the admin can immediately access protected routes.
      localStorage.setItem('token', data.token)

      document.getElementById('successMsg').textContent =
        `Registration successful! Welcome to ${data.rso}.`

      // Send the new admin to the dashboard.
      setTimeout(() => {
        window.location.href = 'dashboard.html'
      }, 1000)

    } catch (err) {
      document.getElementById('errorMsg').textContent =
        'Could not connect to server'
    }
  })
}


// ===== LOGIN =====

const loginForm = document.getElementById('loginForm')

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const username = document.getElementById('username').value.trim()
    const password = document.getElementById('password').value

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        document.getElementById('errorMsg').textContent =
          data.message || 'Login failed'
        return
      }

      // Store JWT for authenticated student-management requests.
      localStorage.setItem('token', data.token)

      window.location.href = 'dashboard.html'

    } catch (err) {
      document.getElementById('errorMsg').textContent =
        'Could not connect to server'
    }
  })
}