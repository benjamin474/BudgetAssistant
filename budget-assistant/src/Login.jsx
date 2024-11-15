import React, { useState, useEffect } from 'react';
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
  //

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
  <div className="login-container">
    <h2>Log In to Lucy™</h2>
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email">Your Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Your Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <div className="remember-forgot">
        <div>
          <input type="checkbox" id="remember" name="remember" /> Remember
          
        </div>
        <Link to="/forgot-password">Forgotten?</Link>
      </div>

      <button type="submit" className="login-button">Log In</button>
    </form>

    <div className="link">
      Don't have an account? <Link to="/sign-up">Sign Up</Link>
    </div>
  </div>
);
};

export default Login;
