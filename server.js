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

const messageSchema = new mongoose.Schema({
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

let inputValue = ''; 



io.on('connection', (socket) => {
  console.log('Client connected');
   socket.on('sendMessage', async (data) => {
    const { message } = data;
    const newMessage = new Message({ message });
    try {
        await newMessage.save();
        io.emit('newMessage', newMessage);
    } catch (error) {
        console.error(error);
    }
});


  socket.emit('updateInput', inputValue);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('updateInput', (data) => {
    inputValue = data; 
    socket.broadcast.emit('updateInput', data); 
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
