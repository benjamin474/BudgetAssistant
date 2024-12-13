const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const router = express.Router();

// Route to send OTP
router.post('/send-otp', sendOtp);

// Route to verify OTP and reset password
router.post('/verify-otp', verifyOtp);

module.exports = router;
