import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Signup.css';

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

  const handleBack = () => {
    navigate('../login');
  }

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
      <h2>註冊帳號</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">電子郵件:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="輸入您的電子郵件"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">用戶名:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="輸入您的用戶名"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密碼:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="輸入您的密碼"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password2">確認密碼:</label>
          <input
            type="password"
            id="password2"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            placeholder="再次輸入您的密碼"
            required
          />
        </div>
        
        <button type="submit" className="login-button">
          註冊
        </button>
        <button onClick={handleBack} className='login-button'>返回</button>
      </form>
    </div>
  );
};

export default Signup;