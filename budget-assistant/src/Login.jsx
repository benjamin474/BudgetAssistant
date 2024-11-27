import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('密碼錯誤'); // Password incorrect
        } else {
          throw new Error('Login failed');
        }
      } else {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('token', data.token); // Store the token
          alert('Login successful');
          navigate('/add-transaction');
        }
      }
    } catch (error) {
      alert('尚未註冊帳號');
      console.error('Login error:', error);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend's Google OAuth endpoint
    window.location.href = 'http://localhost:3001/auth/google';
  };
  

  return (
    <div className="login-page">
      
      <div className="login-image-container">
        <img
          src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
          alt="Login illustration"
          className="login-image"
        />
      </div>

      <div className="login-container">
        <h2 className='login-header'>歡迎來到記帳助手~</h2>
        <h2 className="login-header">Log In</h2>

        {/* Social media sign-in buttons */}
        {/* <div className="social-login">
          <p>Sign in with</p>
          <div className="social-buttons">
            <button className="social-button facebook"><img class='icon-set'></img></button>
            <button className="social-button twitter">T</button>
            <button className="social-button linkedin">L</button>
          </div>

        </div>

        <div className="divider">
          <span>Or</span>
        </div> */}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email/Username:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email or username"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>


        <div className="divider">
          <span>Or</span>
        </div>

        {/* Google Login Button */}
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            alt="Google Logo"
            className="google-logo"
          />
          Log in with Google
        </button>

        <div className="additional-links">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
        </div>

        <div className="link">
          Don't have an account? <Link to="/sign-up" className="register-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;