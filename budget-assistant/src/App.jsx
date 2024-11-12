import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import AddTransaction from './AddTransaction'; // Import your AddTransaction component
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route
            path="/add-transaction"
            element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AddTransaction />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
