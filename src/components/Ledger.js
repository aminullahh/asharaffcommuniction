import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const Ledger = () => {
  const [debtors, setDebtors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentAmounts, setPaymentAmounts] = useState({});

  useEffect(() => {
    const q = query(collection(db, "sales"), where("debt", ">", 0));
    const unsub = onSnapshot(q, (snap) => {
      setDebtors(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleInputChange = (id, value) => {
    setPaymentAmounts({ ...paymentAmounts, [id]: value });
  };

  const clearOrUpdateDebt = async (debtor) => {
    const payment = Number(paymentAmounts[debtor.id]);
    if (!payment || payment <= 0)
      return alert("Please enter a valid payment amount.");
    if (payment > debtor.debt)
      return alert("Error: Payment can't be higher than what the client owes!");

    const saleRef = doc(db, "sales", debtor.id);
    const newDebt = debtor.debt - payment;
    const newAmountPaid = debtor.amountPaid + payment;

    try {
      await updateDoc(saleRef, {
        debt: newDebt,
        amountPaid: newAmountPaid,
      });

      alert(
        newDebt === 0
          ? "Debt completely cleared!"
          : `Balance updated! Remaining debt: &#8358;${newDebt.toLocaleString()}`,
      );
      setPaymentAmounts({ ...paymentAmounts, [debtor.id]: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to update ledger entry.");
    }
  };

  return (
    <div className="card">
      <h2 style={{ color: "var(--text-main)", marginBottom: "20px" }}>
        Customer Debt Register
      </h2>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}
        >
          Reviewing ledger sheets...
        </div>
      ) : debtors.length === 0 ? (
        <div
          style={{
            color: "var(--success)",
            padding: "20px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          All clean! No active outstanding debts found.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--background)",
                  borderBottom: "2px solid #ddd",
                }}
              >
                <th style={{ padding: "12px" }}>Customer Name</th>
                <th style={{ padding: "12px" }}>Items Secured</th>
                <th style={{ padding: "12px" }}>Total Value</th>
                <th style={{ padding: "12px" }}>Outstanding Balance</th>
                <th style={{ padding: "12px", width: "260px" }}>
                  Process Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {debtors.map((debtor) => (
                <tr key={debtor.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    {debtor.customerName}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                    {debtor.phones?.map((p, idx) => (
                      <div key={idx}>
                        • {p.brand} {p.model} ({p.imei})
                      </div>
                    )) || "N/A"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    &#8358;{Number(debtor.totalAmount).toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      color: "var(--danger)",
                      fontWeight: "bold",
                    }}
                  >
                    &#8358;{Number(debtor.debt).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="number"
                        placeholder="Amount (₦)"
                        value={paymentAmounts[debtor.id] || ""}
                        onChange={(e) =>
                          handleInputChange(debtor.id, e.target.value)
                        }
                        style={{
                          flex: 1,
                          padding: "6px",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => clearOrUpdateDebt(debtor)}
                        style={{
                          background: "var(--success)",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "0.85rem",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Ledger;
