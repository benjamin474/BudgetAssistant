import React, { useState } from 'react';

const TransactionForm = ({ onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [kind, setKind] = useState('');
    const [type, setType] = useState('expense');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ amount, description, kind, type });
        setAmount('');
        setDescription('');
        setKind('其他');
    };

    return (
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
    );
};

export default TransactionForm;
