const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => res.redirect(process.env.CLIENT_URL)
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'unauthenticated' });
  res.json({ name: req.user.name, email: req.user.email, photo: req.user.photo });
});

router.post('/logout', (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

module.exports = router;
