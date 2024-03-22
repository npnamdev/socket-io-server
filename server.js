const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

mongoose.connect('mongodb+srv://root:s0bDv151OKKGsAlf@cluster0.ozrpd5z.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define MongoDB schema and model
const MessageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

let inputValue = '';

// Store online users
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('Client connected');

  // Listen for new messages
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);

    // Save message to MongoDB
    const newMessage = new Message({
      username: msg.username,
      message: msg.message
    });
    newMessage.save();

    // Broadcast message to all clients
    io.emit('chat message', msg);
  });

   // Set username
   socket.on('set username', (username) => {
    onlineUsers[socket.id] = username;
    // Gửi danh sách người dùng trực tuyến hiện tại đến người dùng mới
    socket.emit('online users', Object.values(onlineUsers));
    // Phát thông báo cho tất cả client về người dùng mới kết nối
    io.emit('user connected', username);
    // Cập nhật danh sách người dùng trực tuyến cho tất cả client
    io.emit('online users', Object.values(onlineUsers));
  });

  // Load messages from database when a user connects
  socket.on('load messages', () => {
    Message.find()
      .sort({ timestamp: 1 })
      .then((messages) => {
        socket.emit('load messages', messages);
      })
      .catch((error) => {
        console.error('Error loading messages:', error);
      });
  });

  // Update input value
  socket.emit('updateInput', inputValue);
  socket.on('updateInput', (data) => {
    inputValue = data;
    io.emit('updateInput', data);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    if (username) {
      io.emit('online users', Object.values(onlineUsers));
      io.emit('user disconnected', username);
    }
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
