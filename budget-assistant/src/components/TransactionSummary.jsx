import React from 'react';

const TransactionSummary = ({ incomeTotal, expenseTotal, netTotal, budgetTotal, remainingBudget }) => (
    <div>
        <h3>收入總計：{incomeTotal} 元</h3>
        <h3>支出總計：{expenseTotal} 元</h3>
        <h2>預算總計：{budgetTotal} 元</h2>
        <h2>淨值：{netTotal} 元</h2>
        <h1>剩餘預算：{remainingBudget} 元</h1>
    </div>
);

export default TransactionSummary;
