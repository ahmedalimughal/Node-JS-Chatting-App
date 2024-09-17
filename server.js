const express = require('express');
const http = require('http');
const socketio = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Store connected users
const users = new Map(); // Map to track connected users

// Serve static files (like HTML, CSS, JS)
app.use(express.static('public'));

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
