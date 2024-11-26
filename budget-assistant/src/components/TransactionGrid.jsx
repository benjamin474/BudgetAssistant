import React from 'react';

const TransactionGrid = ({ transactions, onEdit, onDelete }) => (
    <div className="transaction-grid">
        {transactions.map((transaction) => (
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
                <button onClick={() => onEdit(transaction)}>編輯</button>
                <button onClick={() => onDelete(transaction._id)}>刪除</button>
            </div>
        ))}
    </div>
);

export default TransactionGrid;
