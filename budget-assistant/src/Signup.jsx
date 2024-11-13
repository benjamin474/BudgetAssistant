import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password2) {
      alert('Passwords do not match');
      return;
    }

    fetch('http://localhost:3001/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        username: formData.username,
        password: formData.password
      }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert('Registration successful');
        navigate('/');
      }else if (data.message === 'User already exists') {
        alert('This email is already registered.');
      }else {
        alert('Registration failed: ' + data.message);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('An error occurred during registration');
    });
  };

  return (
    <div className="signup-container">
      <h2>Create account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
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

        <div className="form-group">
          <label htmlFor="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button type="submit" className="login-button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
