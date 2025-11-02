import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, accountNumber, password }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON:\n" + text);
      }

      if (!res.ok) throw new Error(data.error || "Login failed");

      // ✅ Save token and username
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);

      alert("Login successful!");
      navigate("/dashboard");
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
          Login
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
            <label style={{ color: "black" }}>Account Number</label>
            <input
              className="form-control"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
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
              style={{ borderRadius: "8px" }}
            />
          </div>

          <button
            type="submit"
            className="btn w-100 mt-3"
            style={{
              backgroundColor: "#005B3B",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
