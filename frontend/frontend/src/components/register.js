import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

  const handleSubmit = async (e) => {
    e.preventDefault();
//White Listing/Input Validation
    if (!/^\d{13}$/.test(idNumber)) {
      return alert("ID Number must be exactly 13 digits.");
    }

    if (!/^\d{7}$/.test(accountNumber)) {
      return alert("Account Number must be exactly 7 digits.");
    }

    if (!/^(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(password)) {
      return alert(
        "Password must be at least 8 characters long and include at least one special character and one number."
      );
    }

    try {
      const res = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          fullName,
          idNumber,
          accountNumber,
          password,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to register");
      }

      alert("User registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh" }}
    >
      <div
        className="card p-4 shadow"
        style={{ width: "400px", borderRadius: "15px" }}
      >
        <h3 className="text-center mb-4" style={{ color: "black" }}>
          Register
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label style={{ color: "black" }}>Username</label>
            <input
              className="form-control"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div className="form-group mb-3">
            <label style={{ color: "black" }}>Full Name</label>
            <input
              className="form-control"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div className="form-group mb-3">
            <label style={{ color: "black" }}>ID Number</label>
            <input
              className="form-control"
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
              pattern="\d{13}"
              title="Must be exactly 13 digits"
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div className="form-group mb-3">
            <label style={{ color: "black" }}>Account Number</label>
            <input
              className="form-control"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
              pattern="\d{7}"
              title="Must be exactly 7 digits"
              style={{ borderRadius: "8px" }}
            />
          </div>

          <div className="form-group mb-3">
            <label style={{ color: "black" }}>Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              title="At least 8 characters, 1 special character, and 1 number"
              style={{ borderRadius: "8px" }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3"
            style={{ backgroundColor: "#005B3B", color: "white", borderRadius: "8px" }}
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
