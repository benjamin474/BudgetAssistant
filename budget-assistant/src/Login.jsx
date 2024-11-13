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
                navigate('/home');
            }
        }
    } catch (error) {
        alert('尚未註冊帳號');
        console.error('Login error:', error);
    }
};

  return (
    <div className="login-container">
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
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
          <label htmlFor="password">Password:</label>
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
        
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>

      <div className="link">
        <Link to="/sign-up"> Sign Up</Link> | 
        <Link to="/forgot-password"> Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
