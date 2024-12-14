import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleKindAdded } from '../Transaction/handleKindAdded';
import { handleKindDeleted } from '../Transaction/handleKindDeleted';
import { fetchCustomKinds } from '../Transaction/fetchCustomKinds';
import { fetchTransactions } from '../Transaction/fetchTransactions';
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
import { jwtDecode } from 'jwt-decode';
import { getFirstDayOfWeek, getLastDayOfWeek, getFirstDayOfMonth, getLastDayOfMonth, getFirstDayOfYear, getLastDayOfYear } from '../Transaction/handleTransactionChart';
import { fetchUserName } from '../Transaction/fetchUserName';
const TransactionPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [quickSearchCurrentDay, setQuickSearchCurrentDay] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [kind, setKind] = useState('其他');
    const [type, setType] = useState('expense');
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [customKinds, setCustomKinds] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedChart, setSelectedChart] = useState('選擇圖表');
    const [allTransactions, setAllTransactions] = useState([]);
    const [chartStartDate, setChartStartDate] = useState(new Date());
    const [quickTimeSelectFlagForLine, setQuickTimeSelectFlagForLine] = useState(false);//
    const [selectedChartForLine, setSelectedChartForLine] = useState('currentWeek');
    const [selectedDateForQuickSearch, setSelectedDateForQuickSearch] = useState('currentWeek');
    const [userName, setUserName] = useState('');
    const [enableQuickSearchFlag, setEnableQuickSearchFlag] = useState(false);//

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
        setQuickSearchCurrentDay(quickSearchCurrentDay)
    }, [quickSearchCurrentDay]);
    useEffect(() => {
        setQuickTimeSelectFlagForLine(quickTimeSelectFlagForLine)//
    }, [quickTimeSelectFlagForLine]);
    useEffect(() => {
        setEnableQuickSearchFlag(enableQuickSearchFlag)//
    }, [enableQuickSearchFlag]);

    useEffect(() => {
        if (Array.isArray(transactions)) {
            if(enableQuickSearchFlag){
                const filtered = transactions.filter((transaction) => {
                const transactionDate = resetTime(new Date(transaction.date));
                return transactionDate >= resetTime(startDate) && transactionDate <= resetTime(endDate);
            })
            setFilteredTransactions(filtered);
            }else{
                const filtered = transactions.filter((transaction) => {
                    const transactionDate = resetTime(new Date(transaction.date));
                    if(selectedDateForQuickSearch === "currentWeek"){
                    return transactionDate >= resetTime(getFirstDayOfWeek(quickSearchCurrentDay)) && transactionDate <= resetTime(getLastDayOfWeek(quickSearchCurrentDay));
                    }
                    else if(selectedDateForQuickSearch === "currentDay"){
                        return transactionDate >= resetTime(quickSearchCurrentDay) && transactionDate <= resetTime(quickSearchCurrentDay);
                    }
                    else if(selectedDateForQuickSearch === "currentMonth"){
                        return transactionDate >= resetTime(getFirstDayOfMonth(quickSearchCurrentDay)) && transactionDate <= resetTime(getLastDayOfMonth(quickSearchCurrentDay));
                    }
                    else if(selectedDateForQuickSearch === "currentYear"){
                        return transactionDate >= resetTime(getFirstDayOfYear(quickSearchCurrentDay)) && transactionDate <= resetTime(getLastDayOfYear(quickSearchCurrentDay));
                    }
                })
                setFilteredTransactions(filtered);
            }
            
            
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
        }}, [startDate, endDate, transactions,chartStartDate,selectedChartForLine,quickSearchCurrentDay,selectedDateForQuickSearch,enableQuickSearchFlag]);

    
    const formData = {
        selectedDate,
        amount,
        description,
        type,
        kind
    };

    const setFormData = (data) => {
        setSelectedDate(data.selectedDate || new Date());
        setAmount(data.amount || '');
        setDescription(data.description || '');
        setKind(data.kind || '其他');
        setType(data.type || 'expense');
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
            <h2>您好，{userName || '使用者'}，請選擇日期，紀錄您的帳務~</h2>

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
            <div>
            <input
                    type="checkbox"
                    checked={setEnableQuickSearchFlag}
                    onChange={() => setEnableQuickSearchFlag(!enableQuickSearchFlag)}
                    //id='quick-search-checkbox'
                    //style={{ margin: 0 }}
                />
                <label>switch</label>
            </div>

            <h2>{(enableQuickSearchFlag) ? '範圍查詢' : '快速查詢'}</h2>

            {(enableQuickSearchFlag) && (
                <div>
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
            </div>
            
            )
            }
            {(!enableQuickSearchFlag) && (
            <div>
            <DatePicker
                selected={quickSearchCurrentDay}
                onChange={(date) => setQuickSearchCurrentDay(date)}
                dateFormat="yyyy/MM/dd"
                inline
            />
            <select value={selectedDateForQuickSearch} onChange={(e) => setSelectedDateForQuickSearch(e.target.value)} disabled={enableQuickSearchFlag}>
                <option value="currentDay">當日</option>
                <option value="currentWeek">當周</option>
                <option value="currentMonth">當月</option>
                <option value="currentYear">當年</option>
                
            </select>
            </div>
            )
            }

            
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

                            <button onClick={() => navigate(`/edit-transaction/${transaction._id}`)}>編輯</button>
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
