# 🔐 Chat App Enkripsi — Real-Time Chat Aman Berbasis Web

Aplikasi chat berbasis web yang mendukung komunikasi **real-time** melalui **public chat** dan **private chat**, dengan fitur **enkripsi pesan menggunakan algoritma AES** untuk menjaga keamanan dan kerahasiaan pesan pengguna.

## 🚀 Fitur Utama

- ✅ Registrasi dan login pengguna
- 💬 Public Chat (obrolan grup)
- 🔒 Private Chat (obrolan pribadi antar pengguna)
- 🛡️ Enkripsi dan dekripsi pesan dengan **AES (Advanced Encryption Standard)**
- 🔐 Password pengguna disimpan secara aman (dengan hashing)
- 🌐 Dibangun dengan stack modern: Node.js, Express, MongoDB, Socket.IO, EJS

---

## 🧰 Teknologi yang Digunakan

- **Frontend**: EJS, HTML, CSS, JavaScript  
- **Backend**: Node.js + Express.js  
- **Database**: MongoDB  
- **Realtime Engine**: Socket.IO  
- **Enkripsi**: CryptoJS (AES)  
- **Autentikasi**: Session + Flash Message

---

## 🔐 Enkripsi AES

Aplikasi ini menggunakan **AES (Advanced Encryption Standard)** untuk mengenkripsi setiap pesan sebelum disimpan ke database. Proses enkripsi dan dekripsi dilakukan di sisi server menggunakan modul `crypto-js`.

```js
// utils/encryption.js
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
};

const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
