import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function AddTransactionWithDate() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('income');
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [editingTransaction, setEditingTransaction] = useState(null);

    useEffect(() => {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }
    }, []);

    useEffect(() => {
        const filtered = transactions.filter(
            (transaction) => {
                const transactionDate = new Date(transaction.date);
                return transactionDate >= startDate && transactionDate <= endDate;
            }
        );
        setFilteredTransactions(filtered);
    }, [startDate, endDate, transactions]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTransaction = {
            id: transactions.length + 1,
            date: selectedDate.toLocaleDateString(),
            amount: parseFloat(amount),
            description,
            type,
        };
        const updatedTransactions = [...transactions, newTransaction];
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        setTransactions([]); // Clear transactions to refresh
        reloadTransactions();
        setAmount('');
        setDescription('');
    };

    const handleDeleteTransaction = (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this transaction?");
        if (confirmed) {
            const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
            localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
            setTransactions([]); // Clear transactions to refresh
            reloadTransactions();
        }
    };

    const handleEditTransaction = (transaction) => {
        setEditingTransaction(transaction);
        setAmount(transaction.amount);
        setDescription(transaction.description);
        setType(transaction.type);
        setSelectedDate(new Date(transaction.date));
    };

    const handleUpdateTransaction = (e) => {
        e.preventDefault();
        const updatedTransactions = transactions.map(transaction =>
            transaction.id === editingTransaction.id ? { ...editingTransaction, amount: parseFloat(amount), description, type, date: selectedDate.toLocaleDateString() } : transaction
        );
        localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        setTransactions([]); // Clear transactions to refresh
        reloadTransactions();
        setEditingTransaction(null);
        setAmount('');
        setDescription('');
        setType('income');
    };

    const reloadTransactions = () => {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            setTransactions(JSON.parse(savedTransactions));
        }
    };

    const totalCost = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    return (
        <div>
            <h2>Add Transaction</h2>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <form onSubmit={editingTransaction ? handleUpdateTransaction : handleSubmit}>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Description:
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <label>
                    Type:
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </label>
                <button type="submit">{editingTransaction ? 'Update Transaction' : 'Add Transaction'}</button>
            </form>

            <h2>Filter Transactions by Date Range</h2>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <button onClick={() => {
                const filtered = transactions.filter(
                    (transaction) => {
                        const transactionDate = new Date(transaction.date);
                        return transactionDate >= startDate && transactionDate <= endDate;
                    }
                );
                setFilteredTransactions(filtered);
            }}>
                Filter Transactions
            </button>

            <h3>Transactions from {startDate.toLocaleDateString()} to {endDate.toLocaleDateString()}</h3>
            <ul>
                {filteredTransactions.map((transaction) => (
                    <li key={transaction.id}>
                        {transaction.date}: {transaction.type} - {transaction.amount} ({transaction.description})
                        <button onClick={() => handleEditTransaction(transaction)}>Edit</button>
                        <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <h3>Total Cost: {totalCost}</h3>
        </div>
    );
}

export default AddTransactionWithDate;
