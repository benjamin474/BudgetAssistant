const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login route
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name } = ticket.getPayload();

    // Check if the user already exists in the database
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name });
      await user.save();
    }

    // Generate JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
});

module.exports = router;
