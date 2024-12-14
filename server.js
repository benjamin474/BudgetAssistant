require('dotenv').config(); // Load environment variables
console.log(process.env.MONGODB_URI);
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');


const User = require('./models/UserModel');
const TransactionRouter = require('./routes/TransactionRoute');
const UserRouter = require('./routes/UserRoute');
const authRouter = require('./routes/auth');
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

app.use('/api/transactions', TransactionRouter);
app.use('/api/users', UserRouter);
app.use('/api/customized-kinds', CustomizedKindRouter);
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
            return res.status(200).send('Password reset successful, you\'ll go back to login page in 5 seconds');
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


// User Login
app.post('/users/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) { // Compare plain text password
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
        if (isExist) {
            return res.status(400).json({ success: false, message: '帳號已被註冊' });
        }
        const user = new User({ email, username, password: hashedPassword }); // Save hashed password
        await user.save();
        res.status(200).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});





const generateJwt = (user) => {
    const secretKey = process.env.JWT_TOKEN || 'your_jwt_secret';

    const payload = {
        userId: user._id,
        email: user.email,
    };

    const options = {
        expiresIn: '1h', // Token expiration
    };

    return jwt.sign(payload, secretKey, options);
};

// Configure Passport
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3001/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists
                let user = await User.findOne({ googleId: profile.id });
                if (!user) {
                    // If not, create a new user
                    user = await User.findOne({ email: profile.emails[0].value });
                    if (user) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    else {
                        user = await User.create({
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            name: profile.displayName,
                        });
                    }
                }

                // Generate a JWT
                const token = generateJwt(user);

                // Pass token and user to the `done` callback
                done(null, { user, token });
            } catch (error) {
                done(error, null);
            }
        }
    )
);



// Serialize and Deserialize User (Session)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Express middleware
app.use(require('express-session')({ secret: 'your-secret', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }) // Request these scopes
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    async (req, res) => {
        try {
            const { token } = req.user; // Extract token generated by `done`
            res.redirect(`http://localhost:3000/login?token=${token}`);
        } catch (error) {
            console.error('Error during Google login callback:', error);
            res.status(500).send('Something went wrong during Google authentication.');
        }
    }
);




app.get('/', (req, res) => res.send('<a href="/auth/google">Login with Google</a>'));

const saveGoogleUser = async (profile) => {
    try {
        const existingUser = await User.findOne({ email: profile.email });

        if (existingUser) {
            console.log('User already exists:', existingUser);
            return existingUser;
        }

        const newUser = new User({
            email: profile.email,
            googleId: profile.id,
            name: profile.name,
            // No password for Google users
        });

        await newUser.save();
        return newUser;
    } catch (error) {
        console.error('Error saving Google user:', error);
        throw error;
    }
};


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming you send token in `Authorization: Bearer <token>`

    if (!token) {
        return res.status(403).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_TOKEN || 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = decoded; // Attach user data to the request
        next();
    });
};

// Use `verifyToken` middleware on protected routes
app.use('/add-transaction', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to the transaction page!' });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
