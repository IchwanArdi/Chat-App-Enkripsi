const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth'); // Middleware untuk proteksi route, memastikan user sudah login
const User = require('../models/User'); // Model User MongoDB
const Message = require('../models/Message');

// Halaman chat - route ini dilindungi (hanya bisa diakses jika sudah login)
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // Cari semua user kecuali user yang sedang login (req.session.user.id)
    // Pilih hanya field username dan _id saja supaya efisien
    const users = await User.find({ _id: { $ne: req.session.user.id } })
      .select('username _id')
      .sort('username'); // Urutkan berdasarkan username

    // Filter user yang memang punya username valid (tidak kosong/null)
    const validUsers = users.filter((user) => user.username);

    // Render halaman chat dengan mengirim data user yang sedang login dan daftar user lain yang valid
    res.render('chat', {
      user: req.session.user,
      users: validUsers,
    });
  } catch (err) {
    console.error(err);
    // Jika terjadi error server, kirim status 500 dan pesan error
    res.status(500).send('Server Error');
  }
});

// API untuk mendapatkan profil user berdasarkan ID (biasanya dipakai AJAX di frontend)
router.get('/user/:id', ensureAuthenticated, async (req, res) => {
  try {
    // Cari user berdasarkan id dari parameter URL
    const user = await User.findById(req.params.id).select('username');

    if (!user) {
      // Kalau user tidak ditemukan, kirim respons 404 dengan pesan error dalam format JSON
      return res.status(404).json({ error: 'User not found' });
    }

    // Kirim data user dalam format JSON (username dan id)
    res.json({ username: user.username, id: user._id });
  } catch (err) {
    console.error(err);
    // Jika error server, kirim respons 500 dan pesan error dalam JSON
    res.status(500).json({ error: 'Server Error' });
  }
});

// API untuk mengambil semua pesan dengan nama sender dan receiver
router.get('/messages', ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find().populate('sender', 'username').populate('receiver', 'username').sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      id: msg._id,
      text: msg.text,
      sender: msg.sender?.username || 'Unknown',
      receiver: msg.receiver?.username || 'All',
      isPrivate: msg.isPrivate,
      createdAt: msg.createdAt,
    }));

    // ⬇️ Ini akan menampilkan hasil seperti yang kamu inginkan di console terminal server
    console.log(JSON.stringify(formattedMessages, null, 2));

    res.json(formattedMessages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil pesan' });
  }
});

module.exports = router;
