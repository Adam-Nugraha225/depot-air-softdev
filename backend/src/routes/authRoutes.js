const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route untuk Register
router.post('/register', authController.register);

// Route untuk Login (Termasuk handle "Remember Me")
router.post('/login', authController.login);

// Route untuk Login/Register menggunakan Google
router.post('/google-login', authController.googleLogin);

// Route untuk Lupa Password
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;