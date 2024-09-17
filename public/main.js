const socket = io();
let username = '';

// Elements
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const msgInput = document.getElementById('msg');
const usernameModal = document.getElementById('usernameModal');
const chatContainer = document.getElementById('chat-container');
const saveNameBtn = document.getElementById('saveNameBtn');
const usernameInput = document.getElementById('username');
const usersList = document.getElementById('users-list'); // Updated to match HTML
const typingIndicator = document.getElementById('typing-indicator'); // Element for typing indicator

// Show username modal on load if not stored in localStorage
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('username')) {
    username = localStorage.getItem('username');
    usernameModal.style.display = 'none';
    chatContainer.style.display = 'block';  // Show chat container after username is set
    socket.emit('setUsername', username); // Notify server with the username

    // Load messages from localStorage
    loadMessages();
  } else {
    usernameModal.style.display = 'flex';
  }
});

// Save the username to localStorage and hide the modal
saveNameBtn.addEventListener('click', () => {
  username = usernameInput.value.trim();
  if (username) {
    localStorage.setItem('username', username);  // Store username in localStorage
    usernameModal.style.display = 'none';
    chatContainer.style.display = 'block';  // Show chat container after username is set
    socket.emit('setUsername', username); // Notify server with the username
  }
});

// Listen for messages from the server
socket.on('message', (message) => {
  displayMessage(message);
  
  // Save the message to localStorage
  saveMessageToLocalStorage(message);
  
  // Scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Update active users list
socket.on('updateUsers', (userList) => {
  usersList.innerHTML = '';
  userList.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
});

// Display typing indicator
socket.on('typing', (username) => {
  typingIndicator.textContent = `${username} is typing...`;
  // Remove the typing indicator after a few seconds
  setTimeout(() => {
    typingIndicator.textContent = '';
  }, 3000);
});

// Handle form submission
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const msg = msgInput.value;
  
  // Send message to the server
  socket.emit('chatMessage', { username, msg });
  
  // Clear the input field
  msgInput.value = '';
  msgInput.focus();
});

// Handle typing event
msgInput.addEventListener('input', () => {
  socket.emit('typing', username);
});

// Function to display messages with time and date
function displayMessage({ username: senderName, msg }) {
  const div = document.createElement('div');
  div.classList.add('message');
  
  if (senderName === username) {
    div.classList.add('me');
  } else {
    div.classList.add('other');
  }

  // Get current time and date
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString();

  div.innerHTML = `
  <p class="meta">${senderName}</p>
  <p class="text">${msg}</p>
  <p class="meta">${time} / ${date}</p>
`;
  
  chatMessages.appendChild(div);
}

// Function to save message to localStorage
function saveMessageToLocalStorage(message) {
  let messages = JSON.parse(localStorage.getItem('messages')) || [];
  messages.push(message);
  localStorage.setItem('messages', JSON.stringify(messages));
}

// Function to load messages from localStorage
function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('messages')) || [];
  messages.forEach(displayMessage);
}

// Function to clear messages from localStorage (Optional)
// function clearMessages() {
//   localStorage.removeItem('messages');
// }
