import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleKindAdded } from '../Transaction/handleKindAdded';
import { handleKindDeleted } from '../Transaction/handleKindDeleted';
import { fetchCustomKinds } from '../Transaction/fetchCustomKinds';
import { fetchTransactions } from '../Transaction/fetchTransactions';
import AddNewKind from '../Transaction/AddNewKind';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/AddTransaction.css';

const TransactionPage = () => {
    const [editingTransactions, setEditingTransactions] = useState([]);
    const [customKinds, setCustomKinds] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomKinds(token, setCustomKinds);
    }, [token]);

    useEffect(() => {
        fetchTransactions(token, setEditingTransactions);
    }, [token]);

    const handleKindAdded = (newKind) => {
        setCustomKinds([...customKinds, newKind]);
    };

    const handleKindDeleted = (kindId) => {
        setCustomKinds(customKinds.filter(kind => kind._id !== kindId));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div style={{
            height: 'auto',
            minHeight: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            boxSizing: 'border-box',
        }}>
            <button onClick={handleLogout}>Log out</button>
            <h2>請選擇日期，紀錄您的帳務~</h2>

            <div className='date-picker-container'>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy/MM/dd"
                />
            </div>

            <AddNewKind token={token} onKindAdded={handleKindAdded} onKindDeleted={handleKindDeleted} />
        </div>
    );
};

export default TransactionPage;