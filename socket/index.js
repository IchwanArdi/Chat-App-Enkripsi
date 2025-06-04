const { encryptMessage, decryptMessage } = require('../utils/encryption');
const Message = require('../models/Message');
const User = require('../models/User');

// Fungsi utama untuk mengatur komunikasi via WebSocket
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New WS Connection...');

    // Menyimpan ID pengguna yang terkoneksi
    socket.on('userConnected', (userId) => {
      socket.userId = userId;
      socket.join(userId); // Join ke room pribadi berdasarkan userId
    });

    // Join ke ruang obrolan publik & kirim pesan-pesan lama
    socket.on('joinPublicChat', async () => {
      socket.join('public');
      try {
        const messages = await Message.find({ isPrivate: false }).sort({ createdAt: 1 }).populate('sender', 'username');

        const decryptedMessages = messages.map((msg) => ({
          id: msg._id,
          text: decryptMessage(msg.text),
          sender: msg.sender ? msg.sender.username : 'Deleted User',
          senderId: msg.sender ? msg.sender._id : null,
          receiver: msg.receiver ? msg.receiver.username : 'Deleted User',
          receiverId: msg.receiver ? msg.receiver._id : null,
          createdAt: msg.createdAt,
          isPrivate: msg.isPrivate,
        }));

        socket.emit('previousMessages', decryptedMessages);
      } catch (err) {
        console.error(err);
      }
    });

    // Join ke ruang obrolan privat antara dua user
    socket.on('joinPrivateChat', async ({ otherUserId }) => {
      const userId = socket.userId;
      const chatRoomId = [userId, otherUserId].sort().join('-');
      socket.join(chatRoomId);

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

        const decryptedMessages = messages.map((msg) => ({
          id: msg._id,
          text: decryptMessage(msg.text),
          sender: msg.sender.username,
          senderId: msg.sender._id,
          receiver: msg.receiver.username,
          receiverId: msg.receiver._id,
          createdAt: msg.createdAt,
          isPrivate: true,
        }));

        socket.emit('previousPrivateMessages', { messages: decryptedMessages, otherUserId });
      } catch (err) {
        console.error(err);
      }
    });

    // Kirim pesan ke chat publik
    socket.on('publicMessage', async ({ text, userId }) => {
      try {
        const user = await User.findById(userId);
        if (!user) return;

        const encryptedText = encryptMessage(text);
        const message = new Message({ text: encryptedText, sender: userId, isPrivate: false });
        await message.save();

        io.to('public').emit('message', {
          id: message._id,
          text,
          sender: user.username,
          senderId: user._id,
          createdAt: message.createdAt,
          isPrivate: false,
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Kirim pesan privat ke user tertentu
    socket.on('privateMessage', async ({ text, senderId, receiverId }) => {
      try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !receiver) return;

        const encryptedText = encryptMessage(text);
        const message = new Message({
          text: encryptedText,
          sender: senderId,
          receiver: receiverId,
          isPrivate: true,
        });
        await message.save();

        const chatRoomId = [senderId, receiverId].sort().join('-');

        io.to(chatRoomId).emit('privateMessage', {
          id: message._id,
          text,
          sender: sender.username,
          senderId: sender._id,
          receiver: receiver.username,
          receiverId: receiver._id,
          createdAt: message.createdAt,
          isPrivate: true,
        });

        // Notifikasi ke penerima kalau ada pesan baru
        io.to(receiverId).emit('newPrivateMessage', {
          from: sender.username,
          fromId: sender._id,
        });
      } catch (err) {
        console.error(err);
      }
    });

    // Event saat user disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
