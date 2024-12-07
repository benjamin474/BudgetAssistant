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
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

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
    <div className="container main_div">
    <div className="div">
        <button className="btn btn-success mb-4 float-end" onClick={() => handleLogout(navigate)}>
            Log out
        </button>        
    </div>

    <h2 className="mb-4 text-center u_font">請選擇日期，紀錄您的帳務~</h2>
    {/* <h2 className="mb-4 text-center">請選擇日期，紀錄您的帳務~</h2> */}
    <div className="row">
        {/* 左側區塊 */}
        <div className="col-md-6">
        <div className="date-picker-container mb-4 bg-color d-flex justify-content-center">
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="yyyy/MM/dd"
                    inline
                />
            </div>

            <AddNewKind 
                token={token}
                onKindAdded={(newKind) => handleKindAdded(newKind, customKinds, setCustomKinds, setKind, setType)}
                onKindDeleted={(kindId) => handleKindDeleted(kindId, customKinds, setCustomKinds)}
            />

            <form
                className="mb-4"
                onSubmit={(e) => handleSubmit(e, formData, setFormData, transactions, setTransactions, token)}
            >
                <div className="form-group mb-3 u_font">
                    <label>金額 (Amount):
                    <input
                        type="number"
                        className="form-control bg-color"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    /></label>
                </div>

                <div className="form-group mb-3">
                    <label>描述 (Description):
                    <input 
                        type="text"
                        className="form-control"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    /></label>
                </div>

                <div className="form-group mb-3">
                    <label>種類 (Type):
                    <select
                        className="form-control"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="expense">支出 (Expense)</option>
                        <option value="income">收入 (Income)</option>
                        <option value="budget">預算 (Budget)</option>
                    </select></label>
                </div>

                <div className="form-group mb-3">
                    <label>分類 (Kind):
                    <select
                        className="form-control"
                        value={kind}
                        onChange={(e) => setKind(e.target.value)}
                    >
                        {/* 根據不同類型顯示選項 */}
                        {type === 'expense' ? (
                            <>
                                <option value="食物">食物</option>
                                <option value="日用品">日用品</option>
                                <option value="交通">交通</option>
                                <option value="娛樂">娛樂</option>
                                <option value="其他">其他</option>
                                {customKinds
                                    .filter((customKind) => customKind.type === 'expense')
                                    .map((customKind) => (
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
                                    .filter((customKind) => customKind.type === 'income')
                                    .map((customKind) => (
                                        <option key={customKind._id} value={customKind.name}>
                                            {customKind.name}
                                        </option>
                                    ))}
                            </>
                        ) : (
                            <option value="預算">預算</option>
                        )}
                    </select></label>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    記帳
                </button>
                <button className="btn btn-success w-100 mt-3" onClick={() => handleDownload(token)}>
                匯出歷史紀錄
            </button>
            </form>
        </div>

        {/* 右側區塊 */}
        <div className="col-md-6">
            <h2 className="mb-4">查詢範圍</h2>
            <div className="d-flex align-items-center mb-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy/MM/dd"
                    className="form-control me-2"
                />
                <span className="mx-2">To</span>
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy/MM/dd"
                    className="form-control"
                />
            </div>

            <h3 className="mb-4">以下是您從 {formatDate(startDate)} 到 {formatDate(endDate)} 的帳務~</h3>
            <div className="transaction-grid mb-4">
                {filteredTransactions
                    .sort((a, b) => {
                        const dateDiff = new Date(a.date) - new Date(b.date);
                        return dateDiff !== 0 ? dateDiff : b.amount - a.amount;
                    })
                    .map((transaction) => (
                        <div key={transaction._id} className="card mb-3">
                            <div className="card-header">
                                {transaction.kind}
                            </div>
                            <div className="card-body">
                                <div>{transaction.date}</div>
                                <div>
                                    {transaction.type === 'expense'
                                        ? '支出'
                                        : transaction.type === 'income'
                                        ? '收入'
                                        : '預算'}{' '}
                                    ：<strong>{transaction.amount} 元</strong>
                                </div>
                                <div>{transaction.description || '無描述'}</div>
                                <div className="d-flex justify-content-between mt-2">
                                    <button
                                        className="btn btn-warning"
                                        onClick={() =>
                                            handleEditTransaction(
                                                transaction,
                                                setFormData,
                                                handleDeleteTransaction,
                                                transactions,
                                                setTransactions,
                                                token
                                            )
                                        }
                                    >
                                        編輯
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            handleDeleteTransaction(transaction._id, transactions, setTransactions, token)
                                        }
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            <h3>您總共賺到：{incomeTotal} 元</h3>
            <h3>您總共花費：{expenseTotal} 元</h3>
            <h2>總預算：{budgetTotal} 元</h2>
            <h2>淨值：{netTotal} 元</h2>
            <h1 className="text-success">預算剩餘：{remainingBudget} 元</h1>

            <div className="chart-container mb-4">
                <TransactionCharts transactions={filteredTransactions} />
            </div>
        </div>
    </div>
</div>

    );
};

export default TransactionPage;