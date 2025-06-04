const http = require('http');
const app = require('./app');
const socketHandler = require('./socket');
const socketio = require('socket.io');

// Membuat server HTTP dari aplikasi Express
const server = http.createServer(app);

// Menghubungkan Socket.IO ke server
const io = socketio(server);

// Menjalankan handler untuk semua event socket
socketHandler(io);

// Menentukan port dan menjalankan server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
