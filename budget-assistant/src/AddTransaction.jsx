import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { calculateTotalsForRange } from './transactionUtils';
import { useNavigate } from 'react-router-dom';
import './AddTransaction.css';

function AddTransactionWithDate() {
    const [selectedDate, setSelectedDate] = useState(new Date()); // 預設為今天的日期
    const [startDate, setStartDate] = useState(new Date()); // 篩選的起始日期
    const [endDate, setEndDate] = useState(new Date()); // 篩選的結束日期
    const [amount, setAmount] = useState(''); // 金額
    const [description, setDescription] = useState(''); // 描述
    const [kind, setKind] = useState(''); // 預設分類
    const [type, setType] = useState('expense'); // 交易類型，預設為支出
    const [transactions, setTransactions] = useState([]); // 所有交易紀錄
    const [filteredTransactions, setFilteredTransactions] = useState([]); // 選擇日期的交易紀錄
    const [queryRange, setQueryRange] = useState('day');
    const [editingTransactions, setEditingTransactions] = useState([]);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // 從後端獲取交易資料
    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Please log in.');
                navigate('../login');
                return;
            }
            try {
                const response = await fetch('http://localhost:3001/transactions', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error fetching transactions: ${response.statusText}`);
                }

                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };

        fetchTransactions();
    }, []);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    const resetTime = (date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    };

    //特定日期抓資料
    useEffect(() => {
        if (Array.isArray(transactions)) {
            const filtered = transactions.filter((transaction) => {
                const transactionDate = resetTime(new Date(transaction.date));
                return transactionDate >= resetTime(startDate) && transactionDate <= resetTime(endDate);
            });
            setFilteredTransactions(filtered);
        } else {
            console.error('Transactions is not an array:', transactions);
        }
    }, [startDate, endDate, transactions]);

    // 新增交易處理
    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId; // Adjust this based on your token's structure

        const newTransaction = {
            user: userId, // Set the user ID
            date: selectedDate.toISOString().split('T')[0],
            amount: parseFloat(amount),
            description,
            type,
            kind, // 使用者選擇的分類
        };

        console.log(selectedDate);
        console.log(selectedDate.toISOString);

        try {
            console.log('Token:', token);
            // 透過API將交易儲存到後端資料庫
            const response = await fetch('http://localhost:3001/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newTransaction),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const savedTransaction = await response.json();

            // 更新狀態
            setTransactions([...transactions, savedTransaction]);

            // 清空表單
            setAmount('');
            setDescription('');
            setKind('其他');
        } catch (error) {
            console.error(`Failed to save transaction: ${error.message}`);
        }
    };

    const handleBack = () => {
        navigate('../home');
    }

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
            <div className='container'>
                <button type="button" className="btn-back" onClick={handleBack}>Back</button>
                <h2>請選擇日期，紀錄您的帳務~</h2>

                <div className='date-picker-container'>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        // 暫時+1
                        dateFormat="yyyy/MM/dd"
                        inline
                    />
                </div>
                <form onSubmit={handleSubmit}>
                    <label>
                        金額(Amount):
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        種類(Type):
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">支出(Expense)</option>
                            <option value="income">收入(Income)</option>
                            <option value="budget">預算(Budget)</option>
                        </select>
                    </label>
                    <label>
                        分類(Kind):
                        <select value={kind} onChange={(e) => setKind(e.target.value)}>
                            {type === 'expense' ? (
                                <>
                                    <option value="食物">食物</option>
                                    <option value="日用品">日用品</option>
                                    <option value="交通">交通</option>
                                    <option value="娛樂">娛樂</option>
                                    <option value="其他">其他</option>
                                </>
                            ) : type === 'income' ? (
                                <>
                                    <option value="薪資">薪資</option>
                                    <option value="投資">投資</option>
                                    <option value="副業">副業</option>
                                    <option value="其他">其他</option>
                                </>

                            ) : (
                                <option value="預算">預算</option>
                            )}
                        </select>
                    </label>
                    <label>
                        描述(Description):
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </label>
                    <button className="btn-binfo" type="submit">記帳</button>
                </form>
            </div>
        </div >
    );
}

export default AddTransactionWithDate;
