const CryptoJS = require('crypto-js');
const dotenv = require('dotenv');

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Fungsi untuk mengenkripsi pesan
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
};

// Fungsi untuk mendekripsi pesan
const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encryptMessage, decryptMessage };
