
// Base URL for all API requests
// In production, change this to your live domain e.g. 'https://yoursite.com/api'
const API_URL = 'http://localhost:5555/api' // dont forget to change this later

// ===== PROTECT THE PAGE =====
// Read the token that was saved to localStorage when the user logged in
const token = localStorage.getItem('token')

// If there is no token, the user is not logged in — send them back to the login page
if (!token) {
  window.location.href = 'index.html'
  throw new Error('No token') // stops the rest of the script from running

}

// ===== AUTH HEADER HELPER =====
// Every request to a protected route must include the JWT token in the Authorization header
// This function returns the headers object so we don't repeat it everywhere
function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // format required by our authMiddleware.js
  }
}

// ===== LOGOUT =====
// When logout is clicked, remove the token from localStorage and go back to login
// Without the token, the user can no longer make authenticated requests
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
})

// ===== GET ALL NOTES =====
async function getNotes() {
  // GET /api/notes — protected route, needs Authorization header
  const res = await fetch(`${API_URL}/notes`, {
    method: 'GET',
    headers: authHeader()
  })

  const notes = await res.json()

  if (!res.ok) {
    // If the request failed, show the error in the notes container
    document.getElementById('notesList').textContent = notes.message || 'Failed to load notes'
    return
  }

  // Pass the notes array to the render function to display them on the page
  renderNotes(notes)
}

// ===== RENDER NOTES TO THE PAGE =====
function renderNotes(notes) {
  const container = document.getElementById('notesList')

  // Clear whatever was previously rendered so we don't get duplicates
  container.innerHTML = ''

  if (notes.length === 0) {
    container.textContent = 'No notes yet. Add one above!'
    return
  }

  // Loop through each note and create HTML elements for it
  notes.forEach(note => {
    const div = document.createElement('div')
    div.innerHTML = `
      <p><strong>ID:</strong> ${note._id}</p>
      <p>${note.text}</p>
      <button onclick="startEdit('${note._id}', '${note.text.replace(/'/g, "\\'")}')">Edit</button>
      <button onclick="deleteNote('${note._id}')">Delete</button>
      <hr>
    `
    container.appendChild(div)
  })
}

// ===== CREATE A NOTE =====
document.getElementById('createNoteForm').addEventListener('submit', async (e) => {
  // Prevent page refresh on form submit
  e.preventDefault()

  const text = document.getElementById('noteText').value

  // POST /api/notes — sends the note text in the request body
  const res = await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ text })
  })

  const data = await res.json()

  if (!res.ok) {
    // Show the error (e.g. "Please add a 'text' field")
    document.getElementById('createMsg').style.color = 'red'
    document.getElementById('createMsg').textContent = data.message || 'Failed to create note'
    return
  }

  // Show success message, clear the input, and refresh the notes list
  document.getElementById('createMsg').style.color = 'green'
  document.getElementById('createMsg').textContent = 'Note created!'
  document.getElementById('noteText').value = ''
  getNotes()
})

// ===== DELETE A NOTE =====
async function deleteNote(id) {
  // Ask the user to confirm before permanently deleting
  const confirmed = confirm('Are you sure you want to delete this note?')
  if (!confirmed) return

  // DELETE /api/notes/:id — the id is in the URL, no request body needed
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || 'Failed to delete note')
    return
  }

  // Refresh the list so the deleted note disappears
  getNotes()
}

// ===== SHOW EDIT FORM =====
// Called when the user clicks the Edit button on a note
// Populates the hidden edit section with the current note's id and text
function startEdit(id, currentText) {
  document.getElementById('editSection').style.display = 'block'
  document.getElementById('editNoteId').value = id         // store id in hidden input
  document.getElementById('editNoteText').value = currentText // pre-fill with current text
  document.getElementById('editMsg').textContent = ''       // clear any previous messages
  // Scroll the edit section into view so the user doesn't have to scroll manually
  document.getElementById('editSection').scrollIntoView()
}

// ===== CANCEL EDIT =====
// Hide the edit form without making any changes
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editSection').style.display = 'none'
})

// ===== SAVE EDIT =====
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  // Read the note id (from the hidden input) and the updated text
  const id = document.getElementById('editNoteId').value
  const text = document.getElementById('editNoteText').value

  // PUT /api/notes/:id — sends the updated text in the request body
  const res = await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ text })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById('editMsg').style.color = 'red'
    document.getElementById('editMsg').textContent = data.message || 'Failed to update note'
    return
  }

  // Show success, hide the edit form, and refresh the notes list
  document.getElementById('editMsg').style.color = 'green'
  document.getElementById('editMsg').textContent = 'Note updated!'
  document.getElementById('editSection').style.display = 'none'
  getNotes()
})

// ===== LOAD NOTES ON PAGE LOAD =====
// Automatically fetch and display all notes when dashboard.html is opened
getNotes()