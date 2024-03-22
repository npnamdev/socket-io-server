const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "https://test-real-time.vercel.app/",
      methods: ["GET", "POST"]
    }
});

mongoose.connect('mongodb+srv://root:s0bDv151OKKGsAlf@cluster0.ozrpd5z.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let inputValue = ''; // Biến lưu trữ giá trị input hiện tại

io.on('connection', (socket) => {
  console.log('Client connected');

  // Gửi giá trị input hiện tại cho client mới kết nối
  socket.emit('updateInput', inputValue);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('updateInput', (data) => {
    inputValue = data; // Cập nhật giá trị input mới
    console.log('New input value:', inputValue); // In giá trị mới để kiểm tra
    // Phát lại giá trị input cho tất cả các client ngoại trừ client gửi yêu cầu cập nhật
    socket.broadcast.emit('updateInput', data); 
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
