const express = require('express');
const router = express.Router();

// Home page route
router.get('/', (req, res) => {
  res.render('index', {
    user: req.session.user || null,
  });
});

module.exports = router;
