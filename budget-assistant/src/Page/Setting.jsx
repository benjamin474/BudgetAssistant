import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Setting.css';
import { handleSetting } from '../Transaction/handleSetting';
import { handleEmailUpdate } from '../Settings/handleEmailUpdate';
import { handlePasswordUpdate } from '../Settings/handlePasswordUpdate';
import { fetchUserInfo } from '../Settings/fetchUserInfo';
import { handleUsernameUpdate } from '../Settings/handleUsernameUpdate';
import { handleGoogleLogin } from '../Login/handleGoogleLogin';

const Setting = () => {
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userInfo, setUserInfo] = useState({ username: '', email: '' });
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchUserInfo(token, setUserInfo, setNewUsername, setNewEmail);
    }, [token]);

    return (
        <div className="settings-container">
            <h2>帳戶設定</h2>
            <div className="user-info">
                <p>
                目前用戶名稱：：{userInfo.username}
                    <button 
                        className="edit-btn"
                        onClick={() => setIsEditingUsername(!isEditingUsername)}
                    >
                        {isEditingUsername ? '取消' : '修改'}
                    </button>
                </p>
                <p>
                    目前 Email：{userInfo.email}
                    <button 
                        className="edit-btn"
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                    >
                        {isEditingEmail ? '取消' : '修改'}
                    </button>
                </p>
                <p>
                    密碼設定
                    <button 
                        className="edit-btn"
                        onClick={() => setIsEditingPassword(!isEditingPassword)}
                    >
                        {isEditingPassword ? '取消' : '修改'}
                    </button>
                </p>
            </div>
            {isEditingUsername && (
                <form onSubmit={(e) => handleUsernameUpdate(e, newUsername, token, setNewUsername)} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="username">新的用戶名稱：</label>
                        <input
                            type="text"
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="輸入新的用戶名稱"
                            required
                        />
                        <button type="submit" className="submit-btn">
                            更新用戶名稱
                        </button>
                    </div>
                </form>
            )}
            {isEditingEmail && (
                <form onSubmit={(e) => handleEmailUpdate(e, newEmail, token, setUserInfo, setIsEditingEmail)} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="email">新的 Email：</label>
                        <input
                            type="email"
                            id="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="輸入新的 Email"
                            required
                        />
                        <button type="submit" className="submit-btn">
                            更新 Email
                        </button>
                    </div>
                </form>
            )}

            {isEditingPassword && (
                <form onSubmit={(e) => handlePasswordUpdate(e, oldPassword, newPassword, token, navigate, setOldPassword, setNewPassword, setIsEditingPassword)} className="settings-form">
                    <div className="form-group">
                        <label htmlFor="oldPassword">目前密碼：</label>
                        <input
                            type="password"
                            id="oldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="輸入目前密碼"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">新密碼：</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="輸入新密碼"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        更新密碼
                    </button>
                </form>
            )}

            <div className="button-group">
                <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => navigate('/add-transaction')}
                >
                    返回
                </button>
            </div>
        </div>
    );
};

export default Setting;