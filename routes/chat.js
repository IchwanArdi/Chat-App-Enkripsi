const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const User = require('../models/User');

// Chat page - Protected route
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    // Make sure we're selecting username explicitly
    const users = await User.find({ _id: { $ne: req.session.user.id } })
      .select('username _id') // Ensure username is included
      .sort('username');

    // Check if any users are missing a username
    const validUsers = users.filter((user) => user.username);

    res.render('chat', {
      user: req.session.user,
      users: validUsers, // Only pass users with valid usernames
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get user profile for chat - for AJAX request
router.get('/user/:id', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ username: user.username, id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
