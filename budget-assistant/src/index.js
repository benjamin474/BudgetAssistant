import React from 'react';
import ReactDOM from 'react-dom/client';
// import './LoginRegister.css';
// import App from '../../trash/App';
import LoginRegister from './LoginRegister';
import AddTransaction from './AddTransaction';
import EditTransaction from './EditTransaction';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 
// import reportWebVitals from '../../trash/reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AddTransaction />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals



// reportWebVitals();
