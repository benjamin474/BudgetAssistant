import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { calculateTotalsForRange } from './transactionUtils';
import './Add.css';

function Add() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('expense');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('Others');
    const navigate = useNavigate();
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
/*
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Token not found. Please log in again.");
            }
            const response = await fetch('http://localhost:3001/category', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error fetching categories: ${response.status} ${response.statusText}`);
            }
    
            let data = await response.json();
    
            // if (!data.some(category => category.name === 'Others')) {
            //     data = [...data, { name: 'Others', _id: 'others' }];
            // }
    
            setCategories(data);
        } catch (error) {
            console.error(`Failed to fetch categories: ${error.message}`);
        }
    };

    const handleAddCategory = async () => {
        const newCategory = window.prompt("Please enter the new category name:");
        if (!newCategory) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/category', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name: newCategory })
            });
    
            alert("New category added successfully.");
            fetchCategories();
        } catch (error) {
            console.error(`Failed to add category: ${error.message}`);
        }
    };
    

    const handleDeleteCategory = async () => {
        if (selectedCategory === 'Others') {
            alert("The 'Others' category is default and cannot be deleted.");
            return;
        }
        const confirmDelete = window.confirm(
            "Are you sure to delete this selected category? This action cannot be undone."
        );
        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3001/category/${selectedCategory._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (!response.ok) throw new Error(`Error deleting category: ${response.statusText}`);

                alert("Category deleted successfully.");
                fetchCategories();
                setSelectedCategory('Others');
            } catch (error) {
                console.error(`Failed to delete category: ${error.message}`);
            }
        }
    };
*/
    const handleBack = () => {
        navigate('/home');
    };


    return (
        <div>
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
                {/* <label>
                    分類(Category):
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        {categories.map((category, index) => (
                            <option key={index} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label> */}
                {/* <div className="category-buttons">
                    <button type="button" className="btn-add" onClick={handleAddCategory}>Add Category</button>
                    <button type="button" className="btn-delete" onClick={handleDeleteCategory}>Delete Category</button>
                </div> */}
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
