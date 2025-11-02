import React, { useEffect, useState } from "react";

export default function PaymentsList() {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/payment/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch payments");
        setPayments(data);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    }
    fetchPayments();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/payment/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete payment");
      setPayments(payments.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const formatAmount = (num) => {
    if (num == null) return "";
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">All Payments</h3>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Bank</th>
              <th>Account Number</th>
              <th>SWIFT</th>
              <th>Bank Location</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id} style={{ border: "1px solid #ddd" }}>
                <td>{p.name}</td>
                <td>{p.bankName}</td>
                <td>{p.accountNumber}</td>
                <td>{p.swiftCode}</td>
                <td>{p.bankLocation}</td>
                <td>
                  {formatAmount(p.amount)} {p.currency || "ZAR"}
                </td>
                <td>{p.paymentReference}</td>
                <td>{p.status || "pending"}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
