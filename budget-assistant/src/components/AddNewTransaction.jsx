import React from 'react';
import TransactionForm from '../components/TransactionForm';

const AddNewTransaction = ({ onTransactionAdded, token }) => {
    const handleTransactionSubmit = async (transactionData) => {
        try {
            const response = await fetch('http://localhost:3001/transactions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                throw new Error('Failed to save transaction');
            }

            const savedTransaction = await response.json();
            onTransactionAdded(savedTransaction);
        } catch (error) {
            console.error('Failed to add transaction:', error);
        }
    };

    return (
        <div>
            <h2>新增交易</h2>
            <TransactionForm onSubmit={handleTransactionSubmit} />
        </div>
    );
};

export default AddNewTransaction;
