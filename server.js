const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*', // Allow requests from any origin (for security, specify the domain here)
    methods: ['GET', 'POST']
  }
});

// Store connected users
const users = new Map(); // Map to track connected users

// Serve static files (like HTML, CSS, JS)
app.use(express.static('public'));

// Allow CORS for all routes (optionally restrict to specific origins)
app.use(cors({
  origin: '*', // You can replace '*' with 'https://your-netlify-domain.netlify.app' for better security
  methods: ['GET', 'POST']
}));

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle connection with Socket.io
io.on('connection', (socket) => {
  console.log('New user connected');

  // When a user connects, prompt for their username
  socket.on('setUsername', (username) => {
    users.set(socket.id, username);
    io.emit('updateUsers', Array.from(users.values())); // Broadcast the updated user list
  });

  // Handle message sent by user
  socket.on('chatMessage', (data) => {
    io.emit('message', data); // Broadcast message to all users
  });

  // Handle typing events
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username); // Notify other users that someone is typing
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('updateUsers', Array.from(users.values())); // Broadcast the updated user list
    console.log('User disconnected');
  });
});
