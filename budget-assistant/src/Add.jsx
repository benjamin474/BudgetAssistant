import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { calculateTotalsForRange } from './transactionUtils';
import { useNavigate } from 'react-router-dom';
import fetchGPTResponse from './Axios';
import './Add.css';

function Add() {
    const [selectedDate, setSelectedDate] = useState(new Date()); // 預設為今天的日期
    const [startDate, setStartDate] = useState(new Date()); // 篩選的起始日期
    const [endDate, setEndDate] = useState(new Date()); // 篩選的結束日期
    const [amount, setAmount] = useState(''); // 金額
    const [description, setDescription] = useState(''); // 描述
    const [kind, setKind] = useState('');
    const [type, setType] = useState('expense'); // 交易類型，預設為支出
    const [transactions, setTransactions] = useState([]); // 所有交易紀錄
    const [filteredTransactions, setFilteredTransactions] = useState([]); // 選擇日期的交易紀錄
    const [queryRange, setQueryRange] = useState('day');
    const [editingTransactions, setEditingTransactions] = useState([]);
    const navigate = useNavigate();



    // 從後端獲取交易資料
    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found. Please log in.');
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


    const resetTime = (date) => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 0, 0);
        return newDate;
    }

    useEffect(() => {
        if (Array.isArray(transactions)) {
            const filtered = transactions.filter(
                (transaction) => {
                    const transactionDate = resetTime(new Date(transaction.date));
                    return transactionDate >= resetTime(startDate) && transactionDate <= resetTime(endDate);
                }
            );
            setFilteredTransactions(filtered);
        } else {
            console.error('Transactions is not an array:', transactions);
        }
    }, [startDate, endDate, transactions]);

    // 新增交易處理
    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. Please log in.');
            return;
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId; // Adjust this based on your token's structure



        const newTransaction = {
            user: userId, // Set the user ID
            date: selectedDate.toLocaleDateString(),
            amount: parseFloat(amount),
            description,
            type,
            //gpt classified-------------------------------------------------------------------
            kind: (type === 'expense') ? await fetchGPTResponse(description + "是食物, 日用品, 交通, 娛樂, 健康, 教育, 服飾, 居住, 通訊, 水電, 保險, 投資, 人情, 旅遊, 其他中的哪一類，返回前述最符合的一項，只能回答二或三個字") :
                await fetchGPTResponse(description + "是薪資、投資、副業、租金、補助、禮金、退款、其他中的哪一類，返回前述最符合的一項，只能回答二個字"),
            //如果要使用，在Axios.jsx加上你的金鑰.-------------------------------------------

        };



        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token);
            // 透過API將交易儲存到後端資料庫
            const response = await fetch('http://localhost:3001/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // 添加 Authorization header
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
        } catch (error) {
            console.error(`Failed to save transaction: ${error.message}`);
        }
    };


    const handleBack = () => {
        navigate('../home');
    }

    // 計算該天的總金額
    const { incomeTotal, expenseTotal, netTotal } = filteredTransactions.reduce((totals, transaction) => {
        if (transaction.type == 'income') {
            totals.incomeTotal += transaction.amount;
        }
        else if (transaction.type == 'expense') {
            totals.expenseTotal += transaction.amount;
        }
        totals.netTotal = totals.incomeTotal - totals.expenseTotal;
        return totals;
    }, { incomeTotal: 0, expenseTotal: 0, netTotal: 0 });

    return (

        <div style={{ maxHeight: '100vh', overflowY: 'auto', width: '100vw', padding: '20px' }}>
            <div className='container'>
                <button type="button" className="btn-back" onClick={handleBack}>Back</button>

                <h2>請選擇日期，紀錄您的帳務~</h2>

                {/* 日期選擇器，讓使用者選擇日期 */}
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)} // 當日期改變時更新選擇的日期
                    dateFormat="yyyy/MM/dd"
                    inline
                />

                <form onSubmit={handleSubmit}>
                    <label>
                        種類(Type):
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">支出(Expense)</option>
                            <option value="income">收入(Income)</option>
                        </select>
                    </label>
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
                        ) : (
                            <>
                                <option value="薪資">薪資</option>
                                <option value="投資">投資</option>
                                <option value="副業">副業</option>
                                <option value="其他">其他</option>
                            </>
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

export default Add;
