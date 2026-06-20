const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.get('/temp-db-url', (req, res) => {
  res.json({ databaseUrl: process.env.DATABASE_URL, directUrl: process.env.DIRECT_URL });
});

module.exports = router;
