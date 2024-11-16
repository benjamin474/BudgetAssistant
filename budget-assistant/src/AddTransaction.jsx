import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { calculateTotalsForRange } from './transactionUtils';

function AddTransactionWithDate() {
    const [selectedDate, setSelectedDate] = useState(new Date()); // 預設為今天的日期
    const [startDate, setStartDate] = useState(new Date()); // 篩選的起始日期
    const [endDate, setEndDate] = useState(new Date()); // 篩選的結束日期
    const [amount, setAmount] = useState(''); // 金額
    const [description, setDescription] = useState(''); // 描述
    const [type, setType] = useState('expense'); // 交易類型，預設為支出
    const [transactions, setTransactions] = useState([]); // 所有交易紀錄
    const [filteredTransactions, setFilteredTransactions] = useState([]); // 選擇日期的交易紀錄
    const [queryRange, setQueryRange] = useState('day');
    const [editingTransactions, setEditingTransactions] = useState([]);
    const token = localStorage.getItem('token');
    // 從後端獲取交易資料
    useEffect(() => {
        const fetchTransactions = async () => {
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

    //特定日期抓資料
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
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId; // Adjust this based on your token's structure

        const newTransaction = {
            user: userId, // Set the user ID
            date: selectedDate.toLocaleDateString(),
            amount: parseFloat(amount),
            description,
            type,
        };


        try {
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

    const handleEditTransaction = (transaction) =>{
        setAmount(transaction.amount.toString());
        setDescription(transaction.description);
        setEditingTransactions(transaction._id);
    }


    // 刪除交易處理
    const handleDeleteTransaction = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/transactions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // 添加 Authorization header
                },
            });

            if (response.ok) {
                // 更新狀態，移除刪除的交易
                setTransactions(transactions.filter(transaction => transaction._id !== id));
            } else {
                console.error(`Failed to delete transaction: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error deleting transaction: ${error}`);
        }
    };

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

    // 下載成excel
    const handleDownload = async () => {

        const userId = jwtDecode(token).userId;
        try {
            // 發送 GET 請求下載 Excel
            const response = await axios.get(`http://localhost:3001/export-excel/${userId}`, {
                responseType: 'blob', // 指定返回為二進制文件
            });

            // 創建下載連結
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transaction.xlsx`); // 設定下載的檔案名
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Excel:', error);
            alert('Failed to download the file. Please try again.');
        }
    };

    return (
        <div>
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
                    金額(Amount):
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </label>
                <label>
                    描述(Description):
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <label>
                    種類(Type):
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="expense">支出(Expense)</option>
                        <option value="income">收入(Income)</option>
                    </select>
                </label>
                <button className="btn btn-info" type="submit">記帳</button>
            </form>

            {/* 篩選日期範圍的部分 */}
            <h2>查詢範圍</h2>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <div><h1>To</h1></div>
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
            />

            {/* 顯示篩選後的交易紀錄 */}
            <h3>以下是您從{startDate.toLocaleDateString()} 到 {endDate.toLocaleDateString()} 的帳務~</h3>
            <ul>
                {filteredTransactions.map((transaction) => (
                    <li key={transaction._id}>
                        {transaction.date}: {transaction.type} - {transaction.amount} ({transaction.description})
                        {/* 刪除按鈕，點擊時會調用 handleDeleteTransaction 函數 */}
                        
                        <button onClick={() => handleDeleteTransaction(transaction._id)}>刪除</button>
                    </li>
                ))}
            </ul>

            {/* 顯示該天的總金額 */}
            <h3>您總共賺到：{incomeTotal}元</h3>
            <h3>您總共花費：{expenseTotal}元</h3>
            <h1>淨值   ：{netTotal}</h1>

            <button onClick={handleDownload}>Download Excel</button>

            {/* 範圍查詢 */}
            {/* <label htmlFor="queryRange">Select Range:</label>
            <select id="queryRange" value={queryRange} onChange={(e) => setQueryRange(e.target.value)}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
            </select> */}

            {/* <button className="btn btn-danger" onClick={() => {
                const { incomeTotal, expenseTotal } = calculateTotalsForRange(transactions, queryRange);
                console.log(`Income: ${incomeTotal}, Expense: ${expenseTotal}`);
            }}>
                Query Transactions
            </button> */}
        </div>
    );
}

export default AddTransactionWithDate;
