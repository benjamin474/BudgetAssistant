import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleKindAdded } from '../Transaction/handleKindAdded';
import { handleKindDeleted } from '../Transaction/handleKindDeleted';
import { fetchCustomKinds } from '../Transaction/fetchCustomKinds';
import { fetchTransactions } from '../Transaction/fetchTransactions';
import { handleSubmit } from '../Transaction/handleSubmit';
import { handleEditTransaction } from '../Transaction/handleEditTransaction';
import { handleDeleteTransaction } from '../Transaction/handleDeleteTransaction';
import { handleLogout } from '../Transaction/handleLogout';
import { formatDate } from '../Transaction/formatDate';
import { resetTime } from '../Transaction/resetTime';
import { handleDownload } from '../Transaction/handleDownload';
import AddNewKind from '../Transaction/AddNewKind';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../style/AddTransaction.css';
import TransactionCharts from '../Transaction/TransactionCharts';
import { jwtDecode } from 'jwt-decode';
import { getFirstDayOfWeek, getLastDayOfWeek, getFirstDayOfMonth, getLastDayOfMonth, getFirstDayOfYear, getLastDayOfYear } from '../Transaction/handleTransactionChart';
import { fetchUserName } from '../Transaction/fetchUserName';
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
    const [selectedChart, setSelectedChart] = useState('選擇圖表');
    const [allTransactions, setAllTransactions] = useState([]);
    const [chartStartDate, setChartStartDate] = useState(new Date());
    const [quickTimeSelectFlagForLine, setQuickTimeSelectFlagForLine] = useState(false);
    const [selectedChartForLine, setSelectedChartForLine] = useState('currentWeek');
    const [userName, setUserName] = useState('');

    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserName(token, setUserName);
    }, [token]);
    useEffect(() => {
        fetchCustomKinds(token, setCustomKinds);
    }, [token]);

    useEffect(() => {
        fetchTransactions(token, setTransactions, navigate);
        
    }, [token]);
    useEffect(() => {
       setSelectedChartForLine(selectedChartForLine)
    }, [selectedChartForLine]);
    useEffect(() => {
        setChartStartDate(chartStartDate)
    }, [chartStartDate]);
    useEffect(() => {
        setQuickTimeSelectFlagForLine(quickTimeSelectFlagForLine)
    }, [quickTimeSelectFlagForLine]);
    useEffect(() => {
        if (Array.isArray(transactions)) {
            const filtered = transactions.filter((transaction) => {
                const transactionDate = resetTime(new Date(transaction.date));
                return transactionDate >= resetTime(startDate) && transactionDate <= resetTime(endDate);
            });
            setFilteredTransactions(filtered);
            const filteredForChart = transactions.filter((transaction) => {
                const transactionDate = resetTime(new Date(transaction.date));
                if(selectedChartForLine === "currentWeek"){
                return transactionDate >= resetTime(getFirstDayOfWeek(chartStartDate)) && transactionDate <= resetTime(getLastDayOfWeek(chartStartDate));
                }
                else if(selectedChartForLine === "currentDay"){
                    return transactionDate >= resetTime(chartStartDate) && transactionDate <= resetTime(chartStartDate);
                }
                else if(selectedChartForLine === "currentMonth"){
                    return transactionDate >= resetTime(getFirstDayOfMonth(chartStartDate)) && transactionDate <= resetTime(getLastDayOfMonth(chartStartDate));
                }
                else if(selectedChartForLine === "currentYear"){
                    return transactionDate >= resetTime(getFirstDayOfYear(chartStartDate)) && transactionDate <= resetTime(getLastDayOfYear(chartStartDate));
                }
            });
            setAllTransactions(filteredForChart.sort((a, b) => {
                const dateDiff = new Date(a.date) - new Date(b.date);
                if (dateDiff !== 0) return dateDiff;
                return b.amount - a.amount;
            }));
        } else {
            console.error('Transactions is not an array:', transactions);
        }
    }, [startDate, endDate, transactions,chartStartDate,selectedChartForLine]);

    
    const formData = {
        selectedDate,
        amount,
        description,
        type,
        kind
    };

    const setFormData = (data) => {
        setSelectedDate(data.selectedDate || selectedDate);
        setAmount(data.amount || amount);
        setDescription(data.description || description);
        setType(data.type || type);
        setKind(data.kind || kind);
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
            <h2>您好，{userName}，請選擇日期，紀錄您的帳務~</h2>

            <div className='date-picker-container'>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy/MM/dd"
                    inline
                />
            </div>
            <AddNewKind token={token} onKindAdded={(newKind) => handleKindAdded(newKind, customKinds, setCustomKinds, setKind, setType)} onKindDeleted={(kindId) => handleKindDeleted(kindId, customKinds, setCustomKinds)} />
            <form onSubmit={(e) => handleSubmit(e, formData, setFormData, transactions, setTransactions, token)}>
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
            <select value={selectedChart} onChange={(e) => setSelectedChart(e.target.value)}>
                <option value="選擇圖表">選擇圖表</option>
                <option value="收支預算長條圖">收支預算長條圖</option>
                <option value="收支類別分布">收支類別分布</option>
                <option value="支出類別趨勢">支出類別趨勢</option>
            </select>

            {selectedChart !== '選擇圖表' && (<div className="chart-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                    type="checkbox"
                    checked={quickTimeSelectFlagForLine}
                    onChange={() => setQuickTimeSelectFlagForLine(!quickTimeSelectFlagForLine)}
                    id='sync-checkbox'
                    style={{ margin: 0 }}
                />
                <label htmlFor="sync-checkbox">和查詢範圍同步</label>
                <select value={selectedChartForLine} onChange={(e) => setSelectedChartForLine(e.target.value)} disabled={quickTimeSelectFlagForLine}>
                <option value="currentDay">當日</option>
                <option value="currentWeek">當周</option>
                <option value="currentMonth">當月</option>
                <option value="currentYear">當年</option>
                
            </select>
                <DatePicker
                    selected={chartStartDate}
                    onChange={(date) => setChartStartDate(date)}
                    dateFormat="yyyy/MM/dd"
                    className="p-2 border rounded"
                    inline
                />
            </div>)}

            <div className='chart-container'>
                <TransactionCharts 
                    transaction={quickTimeSelectFlagForLine ? filteredTransactions : allTransactions} 
                    selectedChart={selectedChart} 
                    quickTimeSelectFlagForLine1={quickTimeSelectFlagForLine}
                    selectedChartForLine1={selectedChartForLine}
                />
            </div>
            <button onClick={() => handleDownload(token)}>匯出歷史紀錄</button>
        </div>
    );
};

export default TransactionPage;