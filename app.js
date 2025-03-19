const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const http = require('http');
const socketio = require('socket.io');

// Load config
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icon', express.static(__dirname + '/public/img'));
app.use('/src', express.static(__dirname + '/src'));
// app.use(express.static(path.join(__dirname, 'src')));

// Set view engine
app.set('view engine', 'ejs');

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

// Socket.io
// Socket.io
const { encryptMessage, decryptMessage } = require('./utils/encryption');
const Message = require('./models/Message');
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('New WS Connection...');

  // Store user information when they connect
  socket.on('userConnected', (userId) => {
    socket.userId = userId;
    socket.join(userId); // Join a room with the user's ID
  });

  // Join public chat
  socket.on('joinPublicChat', async () => {
    socket.join('public');

    // Load previous public messages
    try {
      const messages = await Message.find({ isPrivate: false }).sort({ createdAt: 1 }).populate('sender', 'username');

      // Send previous messages to the user
      const decryptedMessages = messages.map((msg) => {
        return {
          id: msg._id,
          text: decryptMessage(msg.text),
          sender: msg.sender.username,
          senderId: msg.sender._id,
          createdAt: msg.createdAt,
          isPrivate: false,
        };
      });

      socket.emit('previousMessages', decryptedMessages);
    } catch (err) {
      console.error(err);
    }
  });

  // Join private chat
  socket.on('joinPrivateChat', async ({ otherUserId }) => {
    const userId = socket.userId;
    const chatRoomId = [userId, otherUserId].sort().join('-');

    socket.join(chatRoomId);

    // Load previous private messages between these users
    try {
      const messages = await Message.find({
        isPrivate: true,
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId },
        ],
      })
        .sort({ createdAt: 1 })
        .populate('sender', 'username')
        .populate('receiver', 'username');

      // Send previous messages to the user
      const decryptedMessages = messages.map((msg) => {
        return {
          id: msg._id,
          text: decryptMessage(msg.text),
          sender: msg.sender.username,
          senderId: msg.sender._id,
          receiver: msg.receiver.username,
          receiverId: msg.receiver._id,
          createdAt: msg.createdAt,
          isPrivate: true,
        };
      });

      socket.emit('previousPrivateMessages', { messages: decryptedMessages, otherUserId });
    } catch (err) {
      console.error(err);
    }
  });

  // Public message
  socket.on('publicMessage', async ({ text, userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Encrypt the message
      const encryptedText = encryptMessage(text);

      // Save to database
      const message = new Message({
        text: encryptedText,
        sender: userId,
        isPrivate: false,
      });

      await message.save();

      // Broadcast the message to public room
      io.to('public').emit('message', {
        id: message._id,
        text: text, // Original text for display
        sender: user.username,
        senderId: user._id,
        createdAt: message.createdAt,
        isPrivate: false,
      });
    } catch (err) {
      console.error(err);
    }
  });

  // Private message
  socket.on('privateMessage', async ({ text, senderId, receiverId }) => {
    try {
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      if (!sender || !receiver) return;

      // Encrypt the message
      const encryptedText = encryptMessage(text);

      // Save to database
      const message = new Message({
        text: encryptedText,
        sender: senderId,
        receiver: receiverId,
        isPrivate: true,
      });

      await message.save();

      // Create a unique room ID for these two users (sorted to ensure consistency)
      const chatRoomId = [senderId, receiverId].sort().join('-');

      // Send message to the private room
      io.to(chatRoomId).emit('privateMessage', {
        id: message._id,
        text: text, // Original text for display
        sender: sender.username,
        senderId: sender._id,
        receiver: receiver.username,
        receiverId: receiver._id,
        createdAt: message.createdAt,
        isPrivate: true,
      });

      // Also notify the receiver if they're online but not in this chat
      io.to(receiverId).emit('newPrivateMessage', {
        from: sender.username,
        fromId: sender._id,
      });
    } catch (err) {
      console.error(err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
