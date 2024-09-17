const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});



// CORS configuration
const io = socketio(server, {
  cors: {
    origin: 'https://node-js-chatting-app.vercel.app', // Replace with your actual Netlify domain
    methods: ['GET', 'POST']
  }
});

// Serve static files
app.use(express.static('public'));
app.use(cors({
  origin: 'https://node-js-chatting-app.vercel.app', // Same domain here
  methods: ['GET', 'POST']
}));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('setUsername', (username) => {
    users.set(socket.id, username);
    io.emit('updateUsers', Array.from(users.values()));
  });

  socket.on('chatMessage', (data) => {
    io.emit('message', data);
  });

  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('updateUsers', Array.from(users.values()));
    console.log('User disconnected');
  });
});
