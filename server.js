require('dotenv').config(); // Load environment variables
console.log(process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const transporter = require('./config/nodemailer');
const User = require('./models/UserModel');
const TransactionRouter = require('./routes/TransactionRoute');
const UserRouter = require('./routes/UserRoute');
const authRouter = require('./routes/auth');
const CustomizedKindRouter = require('./routes/customizedKindRoute');
const otpRoutes = require('./routes/otpRoutes');
const passport = require('./config/passport');// Configure Passport
const verifyToken = require('./middleware/verifyToken');
const exportMongoToExcel = require('./exportMongoToExcel');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/transactions', TransactionRouter);
app.use('/api/users', UserRouter);
app.use('/api/customized-kinds', CustomizedKindRouter);
app.use('/api', otpRoutes); // Add OTP routes
// Express middleware
app.use(require('express-session')({ secret: 'your-secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
// Routes
app.use('/auth', authRouter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to database..."))
    .catch(error => console.error("MongoDB connection error:", error));

// Export MongoDB data to Excel
app.get('/export-excel/:user', async (req, res) => {
    const { user } = req.params;
    console.log(`server : ${user}`);

    try {
        const filePath = await exportMongoToExcel(user); // 產生 Excel 檔案的路徑

        // 傳送檔案給前端
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('Error sending file:', err.message);
                res.status(500).send('Failed to send the file.');
            } else {
                console.log('File sent successfully.');
            }
        });
    } catch (error) {
        console.error('Error exporting Excel:', error.message);
        res.status(500).send(error.message);
    }
});

// User Login
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) { // Compare hashed password
            return res.status(200).json({ success: true, message: 'Login successful' });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error during login' });
    }
});

// User Registration
app.post('/users/register', async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const isExist = await User.findOne({ email });
        if (isExist) { // 檢查帳號是否已被註冊
            return res.status(400).json({ success: false, message: '帳號已被註冊' });
        }
        const user = new User({ email, username, password: hashedPassword }); // Save hashed password
        await user.save();
        res.status(200).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

// Google OAuth2.0 savegoogleuser
const { saveGoogleUser } = require('./services/googleUserService');

// Use `verifyToken` middleware on protected routes
app.use('/add-transaction', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to the transaction page!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
