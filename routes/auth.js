const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // Untuk hashing password
const User = require('../models/User'); // Model User MongoDB

// Halaman login
router.get('/login', (req, res) => {
  if (req.session.user) {
    // Kalau sudah login, langsung redirect ke halaman chat
    return res.redirect('/chat');
  }
  res.render('login'); // Tampilkan halaman login
});

// Halaman register
router.get('/register', (req, res) => {
  if (req.session.user) {
    // Kalau sudah login, langsung redirect ke chat
    return res.redirect('/chat');
  }
  res.render('register'); // Tampilkan halaman registrasi
});

// Proses registrasi
router.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  // Validasi input, pastikan semua kolom terisi
  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Harap isi semua kolom' });
  }

  // Cek kecocokan password dan konfirmasi password
  if (password !== password2) {
    errors.push({ msg: 'Password tidak cocok' });
  }

  // Cek panjang password minimal 5 karakter
  if (password.length < 5) {
    errors.push({ msg: 'Password harus memiliki minimal 5 karakter' });
  }

  if (errors.length > 0) {
    // Kalau ada error, render halaman register ulang dengan pesan error dan data yang sudah diisi
    res.render('register', {
      errors,
      username,
      email,
    });
  } else {
    try {
      // Cek apakah email atau username sudah terdaftar
      const userExists = await User.findOne({ $or: [{ email }, { username }] });

      if (userExists) {
        errors.push({ msg: 'Email atau username sudah terdaftar' });
        return res.render('register', {
          errors,
          username,
          email,
        });
      }

      // Hash password dengan bcrypt sebelum disimpan ke database
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Buat user baru dan simpan ke database
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      // Kirim pesan sukses dan redirect ke halaman login
      req.flash('success_msg', 'Anda berhasil registrasi dan dapat login');
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      // Kalau terjadi error server, render ulang halaman register dengan pesan error
      res.render('register', {
        errors: [{ msg: 'Terjadi kesalahan pada server' }],
        username,
        email,
      });
    }
  }
});

// Proses login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Cari user berdasarkan username
    const user = await User.findOne({ username });

    if (!user) {
      // Kalau user tidak ditemukan, tampilkan pesan error
      return res.render('login', {
        errors: [{ msg: 'Username tidak terdaftar' }],
        username,
      });
    }

    // Bandingkan password input dengan password hash di database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Kalau password salah, tampilkan pesan error
      return res.render('login', {
        errors: [{ msg: 'Password salah' }],
        username,
      });
    }

    // Kalau valid, buat session user
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    // Redirect ke halaman chat setelah login sukses
    res.redirect('/chat');
  } catch (err) {
    console.error(err);
    // Kalau error server, render ulang halaman login dengan pesan error
    res.render('login', {
      errors: [{ msg: 'Terjadi kesalahan pada server' }],
      username,
    });
  }
});

// Logout: hapus session dan redirect ke homepage
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });
});

// Jika rute yang diakses tidak ada, render halaman 404
router.use('/', (req, res) => {
  res.render('404');
});

module.exports = router;
