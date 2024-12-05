import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleKindAdded } from '../Transaction/handleKindAdded';
import { handleKindDeleted } from '../Transaction/handleKindDeleted';
import { fetchCustomKinds } from '../Transaction/fetchCustomKinds';
import { fetchTransactions } from '../Transaction/fetchTransactions';
import { handleEditTransaction } from '../Transaction/handleEditTransaction';
import { handleDeleteTransaction } from '../Transaction/handleDeleteTransaction';
import { handleLogout } from '../Transaction/handleLogout';
import { formatDate } from '../Transaction/formatDate';
import { resetTime } from '../Transaction/resetTime';
import { handleDownload } from '../Transaction/handleDownload';
import { handleTransactionAdd } from '../Transaction/handleTransactionAdd';
import { handleFileChange } from '../Transaction/handleFileChange';
import AddNewKind from '../Transaction/AddNewKind';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/AddTransaction.css';
import TransactionCharts from '../Transaction/TransactionCharts';

const TransactionPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [kind, setKind] = useState('');
    const [type, setType] = useState('expense');
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [customKinds, setCustomKinds] = useState([]);
    const [file, setFile] = useState(null);
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

    
    useEffect(() => {
        fetchCustomKinds(token, setCustomKinds);
    }, [token]);

    useEffect(() => {
        fetchTransactions(token, setTransactions, navigate);
    }, [token]);

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

    
    const setFormData = (data) => {
        setSelectedDate(data.selectedDate || new Date());
        setAmount(data.amount || '');
        setDescription(data.description || '');
        setKind(data.kind || '其他');
        setFile(data.file || null);
    };

    const { incomeTotal, expenseTotal, netTotal, budgetTotal, remainingBudget } = filteredTransactions.reduce(
        (totals, transaction) => {
            if (transaction.type === 'budget') {
                totals.budgetTotal += transaction.amount;
            } else if (transaction.type === 'income') {
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
            <div className="user-controls">
                <button 
                    onClick={() => navigate('/settings')} 
                    className="settings-btn"
                >
                    ⚙️ 設定
                </button>
                <button 
                    onClick={() => handleLogout(navigate)} 
                    className="logout-btn"
                >
                    登出
                </button>
            </div>
            <h2>請選擇日期，紀錄您的帳務~</h2>

            <div className='date-picker-container'>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy/MM/dd"
                    inline
                />
            </div>
            <button onClick={() => navigate('/add-recurring-transaction')}>新增重複性交易</button>
            <AddNewKind token={token} onKindAdded={(newKind) => handleKindAdded(newKind, customKinds, setCustomKinds, setKind, setType)} onKindDeleted={(kindId) => handleKindDeleted(kindId, customKinds, setCustomKinds)} />
            <form onSubmit={(e) => handleTransactionAdd(e, selectedDate, amount, description, type, kind, file, setFormData, transactions, setTransactions, token)}>
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
                                {customKinds
                                    .filter(customKind => customKind.type === 'expense')
                                    .map(customKind => (
                                        <option key={customKind._id} value={customKind.name}>
                                            {customKind.name}
                                        </option>
                                    ))}
                            </>
                        ) : type === 'income' ? (
                            <>
                                <option value="薪資">薪資</option>
                                <option value="投資">投資</option>
                                <option value="副業">副業</option>
                                <option value="其他">其他</option>
                                {customKinds
                                    .filter(customKind => customKind.type === 'income')
                                    .map(customKind => (
                                        <option key={customKind._id} value={customKind.name}>
                                            {customKind.name}
                                        </option>
                                    ))}
                            </>
                        ) : (
                            <option value="預算">預算</option>
                        )}
                    </select>
                </label>
                <label>
                    上傳文件(File):
                    <input
                        type="file"
                        onChange={(e) => handleFileChange(e, setFile)}
                    />
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
                        const dateDiff = new Date(a.date) - new Date(b.date);
                        if (dateDiff !== 0) return dateDiff;
                        return b.amount - a.amount;
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
                                {transaction.fileUrl && (
                                    <a href={transaction.fileUrl} target="_blank" rel="noopener noreferrer">
                                        查看圖片或影片
                                    </a>
                                )}
                            </div>
                            <button onClick={() => handleEditTransaction(transaction, setFormData, handleDeleteTransaction, transactions, setTransactions, token)}>編輯</button>
                            <button onClick={() => handleDeleteTransaction(transaction._id, transactions, setTransactions, token)}>刪除</button>
                        </div>
                    ))}
            </div>

            <h3>您總共賺到：{incomeTotal}元</h3>
            <h3>您總共花費：{expenseTotal}元</h3>
            <h2>總預算：{budgetTotal}元</h2>
            <h2>淨值：{netTotal}元</h2>
            <h1>預算剩餘：{remainingBudget}元</h1>

            <div className='chart-container'>
                <TransactionCharts transactions={filteredTransactions} />
            </div>
            <button onClick={() => handleDownload(token)}>匯出歷史紀錄</button>
        </div>
    );
};

export default TransactionPage;