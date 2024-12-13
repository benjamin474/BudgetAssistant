const nodemailer = require('nodemailer');

// Set up email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Change this to your email service provider
    auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS,  // Your email password
    },
});

// Function to send OTP email
const sendOtpEmail = (to, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
