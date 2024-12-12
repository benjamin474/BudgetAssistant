import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  processTransactionsByType,
  createPieData,
  createLineChartData,
  createBarData
} from './handleTransactionChart';

// Chart colors
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CDEF', '#ADDCB6', '#FFE0B2', '#FFCCBC', '#E1BEE7'
];

const TransactionCharts = ({ transaction  , selectedChart, quickTimeSelectFlagForLine1,selectedChartForLine1}) => {
  // Bar chart state
  const [selectedYearOfBar, setSelectedYearOfBar] = useState(2024);
  const [selectedMonthOfBar, setSelectedMonthOfBar] = useState(9);


  // Line chart state
  const [timeRange, setTimeRange] = useState('week');
  const [selectedKind, setSelectedKind] = useState('全部');  
  const [transactions, setTransactions] = useState(transaction);

useEffect(() => {
  setTransactions(transaction);
}, [transaction]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-500">
        No transaction data available for the selected period.
      </div>
    );
  }
  

  // Colors for charts
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
    '#96CDEF', '#ADDCB6', '#FFE0B2', '#FFCCBC', '#E1BEE7'
  ];

  // Group transactions by kind for pie chart
  const IncomeKindTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'income') {
      const amount = Math.abs(transaction.amount);
      acc[transaction.kind] = (acc[transaction.kind] || 0) + amount;
    }
    return acc;
  }, {});
  const ExpenseKindTotals = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const amount = Math.abs(transaction.amount);
      acc[transaction.kind] = (acc[transaction.kind] || 0) + amount;
    }
    return acc;
  }, {});

  const IncomePieData = Object.entries(IncomeKindTotals)
    .map(([kind, amount]) => ({
      name: kind || '其他',
      value: amount
    }))
    .filter(item => item.value > 0);
  const ExpensePieData = Object.entries(ExpenseKindTotals)
    .map(([kind, amount]) => ({
      name: kind || '其他',
      value: amount
    }))
    .filter(item => item.value > 0);

  // Group transactions by date for bar chart
  const dateGroups = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date) || 'Unknown Date';
    const month = selectedMonthOfBar;
    const year = selectedYearOfBar;
    if (!acc[`${year}-${month}`]) {
      acc[`${year}-${month}`] = {
        date,
        income: 0,
        expense: 0,
        budget: 0
      };
    }
    const transactionMonth = date.getMonth() + 1;
    const transactionYear = date.getFullYear();
    //console.log(selectedMonthOfBar);
    //console.log(selectedYearOfBar);
    //console.log(transactionMonth);
    //console.log(transactionYear);
    //console.log("           ");
    if (selectedMonthOfBar == transactionMonth && selectedYearOfBar == transactionYear) {

      if (transaction.type === 'income') {
        acc[`${year}-${month}`].income += Math.abs(transaction.amount);

      } else if (transaction.type === 'expense') {
        acc[`${year}-${month}`].expense += Math.abs(transaction.amount);
      } else if (transaction.type === 'budget') {
        acc[`${year}-${month}`].budget += Math.abs(transaction.amount);
      }

    }

    return acc;
  }, {});

  const barData = Object.values(dateGroups);

  // Function to get time period key based on date
  const getTimePeriodKey = (date) => {
    const d = new Date(date);
    switch (timeRange) {
      case 'week':
        // Get week number
        const weekNumber = Math.ceil((d.getDate() + (d.getDay() + 6) % 7) / 7);
        const startDate = new Date(d.getFullYear(), 0, 1); // 每年的第一天
        const days = Math.floor((d - startDate) / (24 * 60 * 60 * 1000)); // 計算距離當年第一天的天數
        const week = Math.ceil((days + 1) / 7); // 計算週數
        return `${(d.getFullYear()).toString() + '年' + (week).toString()}週`;
      case 'month':
        return `${(d.getFullYear()).toString() + '年' + (d.getMonth() + 1).toString()}月`;
      case 'year':
        return `${d.getFullYear()}年`;
      default:
        return date;
    }
  };
  const allKinds = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.kind || '其他'))];
  // Group transactions by kind and time period for line chart
  const lineData = transactions.reduce((acc, transaction) => {
    if (transaction.type === 'expense') {
      const timePeriodKey = getTimePeriodKey(transaction.date);
      
      const kind = transaction.kind || '其他';
      if (selectedKind === '全部') {
        if (!acc[timePeriodKey]) {
          acc[timePeriodKey] = {
            timePeriod: timePeriodKey,
          };
          allKinds.forEach(kind => {
            acc[timePeriodKey][kind] = 0;
          });
        }
        acc[timePeriodKey][kind] = (acc[timePeriodKey][kind] || 0) + Math.abs(transaction.amount);
      } else {
        
        if (kind === selectedKind) {
          if (!acc[timePeriodKey]) {
            acc[timePeriodKey] = {
              timePeriod: timePeriodKey,
            };
          }
          acc[timePeriodKey][kind] = (acc[timePeriodKey][kind] || 0) + Math.abs(transaction.amount);
        }
      }
    }
    return acc;
  }, {});

  const lineChartData = Object.values(lineData);

  return (
    <div className="w-full space-y-8">
      {selectedChart === '收支預算長條圖' && barData.length > 0 && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center mb-4">
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={selectedKind} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" name="收入" fill="#4CAF50" />
              <Bar dataKey="expense" name="支出" fill="#FF5252" />
              <Bar dataKey="budget" name="預算" fill="#2196F3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

{selectedChart === '收支類別分布' && (
  <div style={{ width: '100%' }}>
    
    {/* 左側收入圓餅圖 */}
    <div style={{ width: '48%', display: 'inline-block', marginRight: '2%'  }} className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">收入類別分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={IncomePieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {IncomePieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* 右側支出圓餅圖 */}
    <div style={{ width: '48%', display: 'inline-block', marginRight: '2%' }}  className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">支出類別分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={ExpensePieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {ExpensePieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
)}
      
      {selectedChart === '支出類別趨勢' && (
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="mb-4">
            
          </div>
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold flex-grow">支出類別趨勢</h3>
              <select
                value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-2 border rounded ml-2"
              disabled={!quickTimeSelectFlagForLine1}
            > <option value="day">日</option>
              <option value="week">週</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
            <select
              value={selectedKind}
              onChange={(e) => setSelectedKind(e.target.value)}
              className="p-2 border rounded ml-2"
            >
              <option value="全部">全部</option>
              {allKinds.map(kind => (
                <option key={kind} value={kind}>{kind}</option>
                ))}
              </select>
              
          </div>
          <ResponsiveContainer width="100%" height={300}>
            
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timePeriod" />
              <YAxis />
              <Tooltip />
              <Legend />
              {allKinds.map((kind, index) => (
                <Line
                  key={kind}
                  type="linear"
                  dataKey={kind}
                  stroke={COLORS[index % COLORS.length]}
                  name={kind}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default TransactionCharts;