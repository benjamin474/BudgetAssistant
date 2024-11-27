import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { calculateTotalsForRange } from './transactionUtils';
import { useNavigate } from 'react-router-dom';
import './AddTransaction.css';
import TransactionCharts from './TransactionCharts'; // 引入圖表組件

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

    // Extract Token from URL Parameters and Redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            // Save the token to localStorage
            localStorage.setItem('token', tokenFromUrl);

            // Clean up the URL by removing the token from the query parameters
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.pathname);

            // Redirect to the add-transaction page without the token in the URL
            navigate('/add-transaction', { replace: true });
        }
    }, [navigate]);
    


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
    }, [navigate]);

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
    //編輯交易處理
    const handleEditTransaction = (transaction) => {
        console.log("Now we're going to edit your transaction")
        setAmount(transaction.amount);
        setDescription(transaction.description);
        setType(transaction.type);
        setKind(transaction.kind);
        setSelectedDate(new Date(transaction.date));

        handleDeleteTransaction(transaction._id);
    }


    // 刪除交易處理
    const handleDeleteTransaction = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/transactions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                setTransactions(transactions.filter((transaction) => transaction._id !== id));
            } else {
                console.error(`Failed to delete transaction: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error deleting transaction: ${error}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        alert("Log out sussess");
        navigate('../login');
    };

    // 計算該天的總金額
    const { incomeTotal, expenseTotal, netTotal, budgetTotal, remainingBudget } = filteredTransactions.reduce(
        (totals, transaction) => {
            if (transaction.type === 'budget') {
                totals.budgetTotal += transaction.amount;
            }
            else if (transaction.type === 'income') {
                totals.incomeTotal += transaction.amount;
            } else if (transaction.type === 'expense') {
                totals.expenseTotal += transaction.amount;
            }
            totals.netTotal = totals.incomeTotal - totals.expenseTotal;
            totals.remainingBudget = totals.budgetTotal - totals.expenseTotal;
            return totals;
        },
        { incomeTotal: 0, expenseTotal: 0, netTotal: 0, budgetTotal: 0, remainingBudget: 0 }

    );

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
                <button type="submit">記帳</button>
            </form>

            <h2>查詢範圍</h2>
            <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy/MM/dd"
            />
            <div>To</div>
            <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy/MM/dd"
            />

            <h3>以下是您從 {formatDate(startDate)} 到 {formatDate(endDate)} 的帳務~</h3>
            <div className="transaction-grid">
                {filteredTransactions
                    .sort((a, b) => {
                        const dateDiff = new Date(a.date) - new Date(b.date); // 日期由新到舊
                        console.log("DateDiff is : " + dateDiff);
                        if (dateDiff !== 0) return dateDiff;
                        return b.amount - a.amount; // 同日期按金額由大到小
                    })
                    .map((transaction) => (
                        <div key={transaction._id} className="transaction-item">
                            <div className="transaction-kind">{transaction.kind}</div>
                            <div className="transaction-details">
                                <div>{transaction.date}</div>
                                <div>
                                    {transaction.type === 'expense'
                                        ? '支出'
                                        : transaction.type === 'income'
                                            ? '收入'
                                            : '預算'}{' '}
                                    ：<h1>{transaction.amount} 元</h1>
                                </div>
                                <div>{transaction.description || '無描述'}</div>
                            </div>
                            <button onClick={() => handleEditTransaction(transaction)}>編輯</button>
                            <button onClick={() => handleDeleteTransaction(transaction._id)}>刪除</button>
                        </div>
                    ))}
            </div>



            <h3>您總共賺到：{incomeTotal}元</h3>
            <h3>您總共花費：{expenseTotal}元</h3>
            <h2>總預算：{budgetTotal}元</h2>
            <h2>淨值：{netTotal}</h2>
            <h1>預算剩餘：{remainingBudget}元</h1>



            {/* 圖表部分 */}
            <div className='chart-container'>
                <TransactionCharts transactions={filteredTransactions} />
            </div>
            <button onClick={handleDownload}>匯出歷史紀錄</button>

        </div >
    );
}

export default AddTransactionWithDate;
