import { useState } from 'react';
import './ForgotPassword.css';
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const sendOtp = async () => {
    try {
      // API call to send OTP
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }
  
      setOtpSent(true); // Update state if OTP is sent successfully
      alert('OTP has been sent to your email.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('There was a problem sending the OTP. Please try again.');
    }
  };
  
  

  const verifyOtpAndResetPassword = async () => {
  try {
    // API call to verify OTP and reset password
    const response = await fetch('http://localhost:3001/api/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        newPassword,
      }),
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorMessage = await response.text();
      alert(`Error: ${errorMessage}`);
    } else {
      alert('Password reset successful');
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    alert('There was an error resetting your password. Please try again.');
  }
};


return (
  <div className="forgot-password-container">
    <div className="forgot-password-card">
      <h2>Forgot Password</h2>
      {!otpSent ? (
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="styled-input"
          />
          <button onClick={sendOtp} className="styled-button">Send OTP</button>
        </div>
      ) : (
        <div className="input-group">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="styled-input"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="styled-input"
          />
          <button onClick={verifyOtpAndResetPassword} className="styled-button">Reset Password</button>
        </div>
      )}
    </div>
  </div>
);
}

export default ForgotPassword;
