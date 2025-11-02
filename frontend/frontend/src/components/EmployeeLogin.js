import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Check if locked on mount
  useEffect(() => {
    const lockedUntil = localStorage.getItem("employeeLockedUntil");
    if (lockedUntil && Date.now() < parseInt(lockedUntil)) {
      setIsLocked(true);
      setLockTime(parseInt(lockedUntil));
    }
  }, []);

  // Input validation
  const validateInputs = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked
    if (isLocked) {
      const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60);
      alert(`Account temporarily locked. Try again in ${remainingTime} minutes.`);
      return;
    }

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    try {
      const res = await fetch("https://localhost:4433/employee/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Increment login attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        // Lock after 3 failed attempts for 5 minutes
        if (newAttempts >= 3) {
          const lockDuration = 5 * 60 * 1000; // 5 minutes
          const lockedUntil = Date.now() + lockDuration;
          setIsLocked(true);
          setLockTime(lockedUntil);
          localStorage.setItem("employeeLockedUntil", lockedUntil.toString());
          alert("Too many failed attempts. Account locked for 5 minutes.");
          return;
        }

        throw new Error(data.error || "Login failed");
      }

      // Reset attempts on success
      setLoginAttempts(0);
      setIsLocked(false);
      localStorage.removeItem("employeeLockedUntil");

      // Store employee info
      localStorage.setItem("employeeLoggedIn", "true");
      localStorage.setItem("employeeToken", data.token);
      localStorage.setItem("userType", "employee");

      // Welcome message
      setShowWelcome(true);

      setTimeout(() => {
        setShowWelcome(false);
        navigate("/employee-dashboard");
      }, 2500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Lockout message display
  const renderLockMessage = () => {
    if (!isLocked) return null;

    const remainingMinutes = Math.ceil((lockTime - Date.now()) / 1000 / 60);
    return (
      <div className="alert alert-warning mt-3">
        <strong>Account Locked:</strong> Too many failed attempts.
        Try again in {remainingMinutes} minute
        {remainingMinutes !== 1 ? "s" : ""}.
      </div>
    );
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-3">Employee Login</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            className={`form-control ${errors.username ? "is-invalid" : ""}`}
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errors.username) setErrors({ ...errors, username: "" });
            }}
            disabled={isLocked}
          />
          {errors.username && (
            <div className="invalid-feedback">{errors.username}</div>
          )}
        </div>

        <div className="mb-3">
          <input
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            disabled={isLocked}
          />
          {errors.password && (
            <div className="invalid-feedback">{errors.password}</div>
          )}
          <div className="form-text">
            Password must be at least 8 characters with uppercase, lowercase, and numbers.
          </div>
        </div>

        <button
          type="submit"
          className="btn w-100"
          style={{ backgroundColor: "#005B3B", color: "white" }}
          disabled={isLocked}
        >
          {isLocked ? "Account Locked" : "Login"}
        </button>
      </form>

      {loginAttempts > 0 && !isLocked && (
        <div className="alert alert-info mt-3">
          <small>Failed attempts: {loginAttempts}/3</small>
        </div>
      )}

      {renderLockMessage()}

      {showWelcome && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "#005B3B",
              padding: "30px 40px",
              borderRadius: "10px",
              color: "white",
              textAlign: "center",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <h2>Welcome Employee!</h2>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
