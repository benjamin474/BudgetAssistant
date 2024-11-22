require('dotenv').config(); // Load environment variables
console.log(process.env.MONGODB_URI); 
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('./models/UserModel'); 
const TransactionRouter = require('./routes/TransactionRoute');
const UserRouter = require('./routes/UserRoute');
const CustomizedKindRouter = require('./routes/customizedKindRoute');

const exportMongoToExcel = require('./exportMongoToExcel');
const app = express();
require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to database..."))
  .catch(error => console.error("MongoDB connection error:", error));

app.use('/transactions', TransactionRouter);
app.use('/users', UserRouter);
app.use('/customized-kinds', CustomizedKindRouter);
let otpStore = {}; // Temporary OTP storage

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).send('Email not found. Please create a new account.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 300000 };

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('OTP sent to your email.');
    } catch (error) {
        console.error('Error sending OTP email:', error);
        res.status(500).send('Error sending email.');
    }
});

// Endpoint to verify OTP and reset password
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (otpStore[email] && otpStore[email].otp === otp && Date.now() < otpStore[email].expiresAt) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).send('User not found');
            }

            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).send('New password cannot be the same as the old password');
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            console.log("New hashed password:", hashedPassword);  // Debugging line
            await user.save();

            delete otpStore[email];
            return res.status(200).send('Password reset successful');
        } catch (err) {
            console.error('Error during password reset:', err);
            return res.status(500).send('Error resetting password');
        }
    } else {
        return res.status(400).send('Invalid or expired OTP');
    }
});

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
