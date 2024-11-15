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
    console.log("Attempting login with password:", formData.password);  // Debugging line
    try {
        const response = await fetch('http://localhost:3001/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || 'Login failed');
        }

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            alert('Login successful');
            navigate('/Add-transaction');
        } else {
            alert('Login failed: Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message.includes('NetworkError') ? 'Network error. Please try again later.' : error.message);
    }
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
        <h2 className="login-header">Log In</h2>

        {/* Social media sign-in buttons */}
        <div className="social-login">
          <p>Sign in with</p>
          <div className="social-buttons">
            <button className="social-button facebook">F</button>
            <button className="social-button twitter">T</button>
            <button className="social-button linkedin">L</button>
          </div>
        </div>

        <div className="divider">
          <span>Or</span>
        </div>

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
