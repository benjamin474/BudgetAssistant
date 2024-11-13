import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { calculateTotalsForRange } from './transactionUtils';
import './Add.css';

function Add() {
    const [selectedDate, setSelectedDate] = useState(new Date()); // 預設為今天的日期
    const [amount, setAmount] = useState(''); // 金額
    const [description, setDescription] = useState(''); // 描述
    const [type, setType] = useState('expense'); // 交易類型，預設為支出
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
            
            // 清空表單
            setAmount('');
            setDescription('');
        } catch (error) {
            console.error(`Failed to save transaction: ${error.message}`);
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
                    分類(Category):
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="expense">支出(Expense)</option>
                        <option value="income">收入(Income)</option>
                    </select>
                </label>
                <div className="category-buttons">
                    <button type="button" className="btn-add">Add Category</button>
                    <button type="button" className="btn-delete">Delete Category</button>
                </div>
                <label>
                    描述(Description):
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </label>
                <button className="btn-info" type="submit">記帳</button>
            </form>
        </div>
    );
}

export default Add;
