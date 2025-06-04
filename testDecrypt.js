const dotenv = require('dotenv');
dotenv.config();

const { decryptMessage } = require('./utils/encryption');

// Contoh data dari database (misalnya dari MongoDB)
const messageData = {
  _id: '683fb586d20e245ece838305',
  text: 'U2FsdGVkX1+0yyArDv+Vznra1XfASQ5vbk5GEgsmndI=',
  sender: 'isna',
  receiver: 'kiki',
  isPrivate: true,
  createdAt: '2025-06-04T01:41:30.451+00:00',
  __v: 0,
};

// Dekripsi isi pesan
const decryptedText = decryptMessage(messageData.text);

// Tampilkan deskripsi lengkap
console.log('Deskripsi Pesan:');
console.log('-------------------------');
console.log(`ID Pesan      : ${messageData._id}`);
console.log(`Isi Pesan     : ${decryptedText}`);
console.log(`ID Pengirim   : ${messageData.sender}`);
console.log(`ID Penerima   : ${messageData.receiver ?? '(tidak ada / pesan publik)'}`);
console.log(`Privasi       : ${messageData.isPrivate ? 'Private' : 'Public'}`);
console.log(`Waktu Dibuat  : ${new Date(messageData.createdAt).toLocaleString()}`);
console.log('-------------------------');
