import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ token, setToken }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if employee is logged in and get username if customer
  const employeeLoggedIn = localStorage.getItem("employeeLoggedIn") === "true";
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    if (employeeLoggedIn) {
      setShowLogoutModal(true);
    } else {
      // Clear customer data on logout
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setToken(null);
      navigate("/login");
    }
  };

  const confirmEmployeeLogout = () => {
    localStorage.removeItem("employeeLoggedIn");
    localStorage.removeItem("employeeToken");
    setToken(null);
    setShowLogoutModal(false);
    navigate("/employee-login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <nav
        className="navbar navbar-expand-lg"
        style={{ backgroundColor: "#005B3B" }}
      >
        <div className="container-fluid">
          <NavLink className="navbar-brand text-white" to="/">
            INSY7314
          </NavLink>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* Keep navbar content left-aligned */}
            <ul className="navbar-nav me-auto">
              {employeeLoggedIn ? (
                // Employee logged in
                <>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : token ? (
                // Customer logged in
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-white"
                      to="/create-payment"
                    >
                      Make Payment
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-white"
                      to="/payments-list"
                    >
                      Payments List
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-link nav-link text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                // Not logged in
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link text-white" to="/register">
                      Register
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link text-white" to="/login">
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link text-white"
                      to="/employee-login"
                    >
                      Employee Portal
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            {/* ✅ Only show this text when a customer is logged in */}
            {token && !employeeLoggedIn && username && (
              <span className="navbar-text text-white me-3">
                Logged in as Customer: <strong>{username}</strong>
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Employee Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">Confirm Logout</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={cancelLogout}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to logout?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelLogout}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={confirmEmployeeLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
