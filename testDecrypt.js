const dotenv = require('dotenv');
dotenv.config();

const { decryptMessage } = require('./utils/encryption');

// Contoh data dari database (misalnya dari MongoDB)
const messageData = {
  _id: '683f23eca03b0908a9d0577f',
  text: 'U2FsdGVkX19ds/oD8mln3DHU4pafI2TUFRvmcBxVXA0=',
  sender: '67d76b2fcc83cb735b57abc4',
  receiver: null,
  isPrivate: false,
  createdAt: '2025-06-03T16:33:48.950+00:00',
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
