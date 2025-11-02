import React, { useState, useEffect, useCallback } from "react";

export default function EmployeeDashboard() {
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [currentAction, setCurrentAction] = useState(""); 
  const [filter, setFilter] = useState("all"); 
  const [userType, setUserType] = useState("");


  useEffect(() => {
    const storedUserType = localStorage.getItem("userType");
    setUserType(storedUserType || "employee"); // Default to employee
  }, []);

  // GENERATE RANDOM CODE
  const generateRandomCode = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const fetchPayments = useCallback(async () => {
    try {
      const token = localStorage.getItem("employeeToken");
      if (!token) {
        alert("You must log in first!");
        return;
      }

      const res = await fetch("https://localhost:4433/employee/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch payments");

      // Assign random codes for missing sender/receiver IDs
      data = data.map((p) => ({
        ...p,
        userId: p.userId || generateRandomCode(),
        recipientId: p.recipientId || generateRandomCode(),
      }));

      setPayments(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("employeeToken");
      const res = await fetch(`https://localhost:4433/employee/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatAmount = (amount, currency = "ZAR") => {
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount || 0);
  };

  const handleActionClick = (payment, action) => {
    setCurrentPayment(payment);
    setCurrentAction(action);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (currentPayment && currentAction) {
      updateStatus(currentPayment._id, currentAction);
    }
    setShowModal(false);
    setCurrentPayment(null);
    setCurrentAction("");
  };

  const cancelAction = () => {
    setShowModal(false);
    setCurrentPayment(null);
    setCurrentAction("");
  };

  //FILTER PAYMENTS
  const filteredPayments =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  // Function to get row background color based on status
  const getRowStyle = (status) => {
    switch (status) {
      case "accepted":
        return { backgroundColor: "#d4edda" }; // light green
      case "declined":
        return { backgroundColor: "#f8d7da" }; // light red
      case "pending":
        return { backgroundColor: "#fff3cd" }; // light yellow
      default:
        return {};
    }
  };

  return (
    <div className="container my-4">
      {/* Header with user type */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-success">Transactions</h2>
        <div className="text-end">
          <small className="text-muted">Logged in as:</small>
          <div className="fw-bold text-success">{userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : "Employee"}</div>
        </div>
      </div>

      {/* Filter dropdown */}
      <div className="mb-3 d-flex justify-content-end">
        <select
          className="form-select w-auto"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {filteredPayments.length === 0 ? (
        <p className="text-center">No payments found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Amount</th>
                <th>From (Sender)</th>
                <th>To (Receiver)</th>
                <th>SWIFT Code</th>
                <th>Provider</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p._id} style={getRowStyle(p.status)}>
                  <td>{formatAmount(p.amount, p.currency)}</td>
                  <td>{p.userId}</td> {/* Sender */}
                  <td>{p.recipientId}</td> {/* Receiver */}
                  <td>{p.swiftCode || "N/A"}</td>
                  <td>{p.provider || "SWIFT"}</td>
                  <td className="d-flex gap-2">
                    {p.status === "pending" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleActionClick(p, "accepted")}
                        >
                          Verify
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleActionClick(p, "declined")}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(3px)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-success">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  Confirm {currentAction === "accepted" ? "Acceptance" : "Decline"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={cancelAction}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to{" "}
                {currentAction === "accepted" ? "accept" : "decline"} this payment of{" "}
                <strong>
                  {currentPayment && formatAmount(currentPayment.amount, currentPayment.currency)}
                </strong>
                ?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={cancelAction}>
                  Cancel
                </button>
                <button
                  className={`btn ${currentAction === "accepted" ? "btn-success" : "btn-danger"}`}
                  onClick={confirmAction}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}