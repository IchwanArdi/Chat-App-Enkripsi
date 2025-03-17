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
const { encryptMessage, decryptMessage } = require('./utils/encryption');
const Message = require('./models/Message');
const User = require('./models/User');

io.on('connection', (socket) => {
  console.log('New WS Connection...');

  socket.on('joinChat', async () => {
    // Load previous messages
    try {
      const messages = await Message.find().sort({ createdAt: 1 }).populate('sender', 'username');

      // Send previous messages to the user
      const decryptedMessages = messages.map((msg) => {
        return {
          id: msg._id,
          text: decryptMessage(msg.text),
          sender: msg.sender.username,
          createdAt: msg.createdAt,
        };
      });

      socket.emit('previousMessages', decryptedMessages);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('chatMessage', async ({ text, userId }) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Encrypt the message
      const encryptedText = encryptMessage(text);

      // Save to database
      const message = new Message({
        text: encryptedText,
        sender: userId,
      });

      await message.save();

      // Broadcast the message
      io.emit('message', {
        id: message._id,
        text: text, // Send original text since it will be displayed immediately
        sender: user.username,
        createdAt: message.createdAt,
      });
    } catch (err) {
      console.error(err);
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
