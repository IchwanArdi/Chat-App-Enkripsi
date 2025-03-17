function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash('error_msg', 'Anda harus login terlebih dahulu');
  res.redirect('/auth/login');
}

module.exports = { ensureAuthenticated };
