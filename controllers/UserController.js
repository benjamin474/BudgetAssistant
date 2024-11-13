const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully' }); // Send JSON response
    } catch (error) {
        res.status(400).json({ success: false, message: `Error registering user: ${error.message}` }); // Send JSON response
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' }); // Return JSON response
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' }); // Return JSON response
        }
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret');
        res.status(200).json({ success: true, token }); // Return JSON response
    } catch (error) {
        res.status(500).json({ success: false, message: `Error logging in: ${error.message}` }); // Return JSON response
    }
};