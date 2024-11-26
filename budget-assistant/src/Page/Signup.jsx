import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleChange } from '../Signup/handleChange';
import { handleSubmit } from '../Signup/handleSubmit';
import { handleBack } from '../Signup/handleBack';
import '../style/Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    return (
        <div className="signup-page">
            <div className="signup-container">
                <h2 className="signup-header">Sign Up</h2>
                <form onSubmit={(e) => handleSubmit(e, formData, navigate)} className="signup-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => handleChange(e, formData, setFormData)}
                            placeholder="Enter your email"
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
                            onChange={(e) => handleChange(e, formData, setFormData)}
                            placeholder="Enter your password"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange(e, formData, setFormData)}
                            placeholder="Confirm your password"
                            required
                            className="form-input"
                        />
                    </div>

                    <button type="submit" className="login-button">
                        Sign Up
                    </button>
                    <button type="button" onClick={() => handleBack(navigate)} className='login-button'>Back</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;