import React, { useState, useEffect } from 'react';
import { format} from 'date-fns';
import { handleAddRecurringTransaction } from '../Transaction/handleAddRecurringTransaction'; // Ensure this function is implemented
import { fetchCustomKinds } from '../Transaction/fetchCustomKinds';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const RecurringTransactionPage = () => {
    const [endDate, setEndDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [kind, setKind] = useState('其他');
    const [type, setType] = useState('expense');
    const [file, setFile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [recurringFrequency, setRecurringFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date());
    const [customKinds, setCustomKinds] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCustomKinds(token, setCustomKinds);
    }, [token]);


    //console.log(format(startDate, 'yyyy/MM/dd'));

    const setFormData = (data) => {
        setStartDate(data.selectedDate || new Date());
        setAmount(data.amount || '');
        setDescription(data.description || '');
        setKind(data.kind || '其他');
        setFile(data.file || null);
    };
    //console.log(format(selectedDate, 'yyyy/MM/dd'));

    return (
        <div>
            <h2>新增重複性交易</h2>
            <form onSubmit={(e) => handleAddRecurringTransaction(e, startDate, amount, description, type, kind, file,setFormData, transactions, setTransactions, endDate, token, recurringFrequency)}>
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
                    上傳圖片(Upload Image):
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <br />
                <label>
                    重複頻率(Frequency):
                    <select value={recurringFrequency} onChange={(e) => setRecurringFrequency(e.target.value)}>            
                        <option value="daily">每日(Daily)</option>
                        <option value="weekly">每週(Weekly)</option>
                        <option value="monthly">每月(Monthly)</option>
                        <option value="yearly">每年(Yearly)</option>
                    </select>
                </label>
                <label>
                    選擇開始日期(Day):
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                            setStartDate(date);
                        }}
                        dateFormat="yyyy/MM/dd"
                    />
                </label>
                <label>
                    終止日期(End Date):
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => {
                            setEndDate(date);
                        }}
                        dateFormat="yyyy/MM/dd"
                    />
                </label>
                <button type="submit">新增重複性交易</button>
            </form>
        </div>
    );
};

export default RecurringTransactionPage;