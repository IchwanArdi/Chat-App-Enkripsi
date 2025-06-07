const http = require('http');
const app = require('./app');
const socketHandler = require('./socket');
const { Server } = require('socket.io');

// Membuat server HTTP dari aplikasi Express
const server = http.createServer(app);

// Menghubungkan Socket.IO ke server dengan konfigurasi CORS
const io = new Server(server, {
  cors: {
    origin: 'https://chat-app-enkripsi.vercel.app', // ganti dengan domain frontend kamu
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Menjalankan handler untuk semua event socket
socketHandler(io);

// Menentukan port dan menjalankan server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
