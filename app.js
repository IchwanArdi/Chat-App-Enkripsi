const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const flashGlobal = require('./middleware/flashGlobal');

dotenv.config();
connectDB();

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parsing data dari form dan JSON
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Menyajikan file statis (CSS, JS, gambar, dll)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/icon', express.static(path.join(__dirname, 'public/img')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// Konfigurasi session menggunakan MongoDB sebagai penyimpanan
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60,
    }),
  })
);

// Middleware untuk flash message (pesan sementara seperti notifikasi sukses/gagal)
app.use(flash());
app.use(flashGlobal);

// Routing ke berbagai bagian aplikasi
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/chat', require('./routes/chat'));

module.exports = app;
