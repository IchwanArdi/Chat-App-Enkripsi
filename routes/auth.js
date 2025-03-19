const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Login page
router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/chat');
  }
  res.render('login');
});

// Register page
router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/chat');
  }
  res.render('register');
});

// Register handle
router.post('/register', async (req, res) => {
  const { username, email, password, password2 } = req.body;
  let errors = [];

  // Check required fields
  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Harap isi semua kolom' });
  }

  // Check passwords match
  if (password !== password2) {
    errors.push({ msg: 'Password tidak cocok' });
  }

  // Check password length
  if (password.length < 5) {
    errors.push({ msg: 'Password harus memiliki minimal 5 karakter' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
    });
  } else {
    try {
      // Check if user exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });

      if (userExists) {
        errors.push({ msg: 'Email atau username sudah terdaftar' });
        return res.render('register', {
          errors,
          username,
          email,
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      req.flash('success_msg', 'Anda berhasil registrasi dan dapat login');
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('register', {
        errors: [{ msg: 'Terjadi kesalahan pada server' }],
        username,
        email,
      });
    }
  }
});

// Login handle
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.render('login', {
        errors: [{ msg: 'Username tidak terdaftar' }],
        username,
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('login', {
        errors: [{ msg: 'Password salah' }],
        username,
      });
    }

    // Create session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    res.redirect('/chat');
  } catch (err) {
    console.error(err);
    res.render('login', {
      errors: [{ msg: 'Terjadi kesalahan pada server' }],
      username,
    });
  }
});

// Logout handle
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });
});

router.use('/', (req, res) => {
  res.render('404');
});

module.exports = router;
