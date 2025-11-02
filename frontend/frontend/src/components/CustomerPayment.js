import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePayment() {
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankLocation, setBankLocation] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ZAR");
  const [paymentReference, setPaymentReference] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const exchangeRates = {
    ZAR: 1,
    GBP: 23.16,
    USD: 17.18,
  };

  const banks = [
    "ABSA 632005",
    "Standard Bank 051001",
    "FNB 250655",
    "Nedbank 198765",
    "Capitec 470010",
    "Discovery Bank 580105",
    "TymeBank 989234",
    "Bank Zero 051510",
    "African Bank 436009",
    "Ubank 501009",
    "Bidvest Bank 462005",
    "Sasfin Bank 630417",
    "Grindrod Bank 580105",
    "GBS Mutual Bank 420100",
    "Finbond Mutual Bank 430100",
    "Albaraka Bank 630428",
    "HBZ Bank 630409",
    "Land Bank 630157",
    "Postbank 460105",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
//White Listing/Input Validation
    if (!/^\d{7}$/.test(accountNumber)) {
      alert("Account number must be exactly 7 digits.");
      return;
    }

    if (!/^\d{5}$/.test(swiftCode)) {
      alert("SWIFT code must be exactly 5 digits.");
      return;
    }

    if (bankLocation.trim().length < 2) {
      alert("Please enter a valid Country/City with at least 2 characters.");
      return;
    }

    const numericAmount = parseFloat(amount);
    const amountInZAR = numericAmount * (exchangeRates[currency] || 1);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/payment/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          bankName,
          accountNumber,
          swiftCode,
          bankLocation,
          amount: numericAmount,
          currency,
          amountInZAR,
          paymentReference,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save payment");

      alert("Payment saved successfully!");
      navigate("/payments-list");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Dynamically calculate amount in ZAR for display
  const amountInZAR = amount ? (parseFloat(amount) * (exchangeRates[currency] || 1)).toFixed(2) : "0.00";

  return (
    <div className="container mt-4">
      <h3 style={{ color: "black" }}>Make a Payment</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Bank Name</label>
          <select
            className="form-select"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Select Your Bank --
            </option>
            {banks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Account Number</label>
          <input
            className="form-control"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            pattern="\d{7}"
            title="Account number must be exactly 7 digits"
            required
          />
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>SWIFT Code</label>
          <input
            className="form-control"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            pattern="\d{5}"
            title="SWIFT code must be exactly 5 digits"
            required
          />
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Country/City of Bank</label>
          <input
            className="form-control"
            value={bankLocation}
            onChange={(e) => setBankLocation(e.target.value)}
            required
            minLength={2}
            placeholder="Enter full country/city"
          />
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Currency</label>
          <select
            className="form-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          >
            <option value="" disabled>
              -- Select Currency --
            </option>
            <option value="ZAR">ZAR</option>
            <option value="GBP">GBP</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Amount ({currency})</label>
          <input
            type="number"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <small style={{ color: "black" }}>
            Equivalent in ZAR: {amountInZAR} ZAR
          </small>
        </div>

        <div className="form-group mb-2">
          <label style={{ color: "black" }}>Payment Reference (Optional)</label>
          <input
            className="form-control"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />
        </div>

        <button
          className="btn mt-2"
          type="submit"
          style={{ backgroundColor: "#005B3B", color: "white" }}
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}
