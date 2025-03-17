const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// Chat page - Protected route
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('chat', {
    user: req.session.user,
  });
});

module.exports = router;
