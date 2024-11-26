import React, { useState, useEffect } from 'react';
import AddNewTransaction from './AddNewTransaction';
import AddNewKind from '../components/AddNewKind';
import TransactionGrid from '../components/TransactionGrid';
import { useNavigate } from 'react-router-dom';

const AddTransactionWithDate = () => {
    const [transactions, setTransactions] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleTransactionAdded = (transaction) => {
        setTransactions([...transactions, transaction]);
    };

    const handleKindAdded = (newKind) => {
        console.log('New kind added:', newKind);
    };

    const handleKindDeleted = (kindId) => {
        console.log('Kind deleted:', kindId);
    };

    return (
        <div>
            <AddNewTransaction onTransactionAdded={handleTransactionAdded} token={token} />
            <AddNewKind token={token} onKindAdded={handleKindAdded} onKindDeleted={handleKindDeleted} />
            <TransactionGrid transactions={transactions} />
        </div>
    );
};

export default AddTransactionWithDate;
