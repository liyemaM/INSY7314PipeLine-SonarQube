import './App.css';
import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import Navbar from "./components/navbar";
import Register from "./components/register";
import Login from "./components/login";
import EmployeeLogin from "./components/EmployeeLogin";
import EmployeeDashboard from "./components/EmployeeDashboard";
// Payment components
import CreatePayment from "./components/CustomerPayment";
import PaymentsList from "./components/PaymentList";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (!token) return <Navigate to="/login" />;
    return children;
  };

  return (
    <div>
      <Navbar token={token} setToken={setToken} />
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} />} />

        {/* Protected payment routes */}
        <Route
          path="/create-payment"
          element={
            <ProtectedRoute>
              <CreatePayment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments-list"
          element={
            <ProtectedRoute>
              <PaymentsList />
            </ProtectedRoute>
          }
        />
<Route path="/employee-login" element={<EmployeeLogin />} />
<Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={token ? "/payments-list" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;
