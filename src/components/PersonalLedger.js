import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

const PersonalLedger = () => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "owed_to_me",
    reason: "",
  });

  // Pulls only from the "personal_debts" collection, keeping it away from shop data
  useEffect(() => {
    const q = query(collection(db, "personal_debts"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setRecords(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "personal_debts"), {
        name: formData.name,
        amount: Number(formData.amount),
        type: formData.type,
        reason: formData.reason,
        date: new Date().toISOString(),
      });
      // Reset form after saving
      setFormData({ name: "", amount: "", type: "owed_to_me", reason: "" });
    } catch (error) {
      console.error("Error adding personal record: ", error);
    }
  };

  const handleClearRecord = async (id) => {
    if (
      window.confirm(
        "Has this been settled? Click OK to remove it from your records.",
      )
    ) {
      await deleteDoc(doc(db, "personal_debts", id));
    }
  };

  return (
    <div className="card">
      <h2
        style={{
          color: "#4b4b4b",
          borderBottom: "2px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        Personal Debt Records
      </h2>
      <p style={{ color: "var(--text-light)", marginBottom: "20px" }}>
        Suraj Sharif Kabir
      </p>

      <form
        onSubmit={handleAddRecord}
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "30px",
          padding: "15px",
          background: "#f0f4f8",
          borderRadius: "8px",
          border: "1px solid #d9e2ec",
        }}
      >
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          <option value="owed_to_me">People who owe ME</option>
          <option value="i_owe">People I owe</option>
        </select>

        <input
          type="text"
          placeholder="Person's Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{
            padding: "10px",
            flex: 1,
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="number"
          placeholder="Amount (₦)"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="text"
          placeholder="Reason (e.g., Loan, Rent)"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          style={{
            padding: "10px",
            flex: 1,
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#334e68",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Save Record
        </button>
      </form>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* PEOPLE WHO OWE THE CLIENT */}
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "15px",
            border: "2px solid #3eaf7c",
            borderRadius: "8px",
            background: "#f6fdf9",
          }}
        >
          <h3 style={{ color: "#3eaf7c", marginTop: 0 }}>Money Owed To Me</h3>
          {records
            .filter((r) => r.type === "owed_to_me")
            .map((record) => (
              <div
                key={record.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>{record.name}</strong>{" "}
                  -{" "}
                  <span style={{ color: "#3eaf7c", fontWeight: "bold" }}>
                    ₦{record.amount.toLocaleString()}
                  </span>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {record.reason}
                  </div>
                </div>
                <button
                  onClick={() => handleClearRecord(record.id)}
                  style={{
                    background: "#3eaf7c",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Settled
                </button>
              </div>
            ))}
          {records.filter((r) => r.type === "owed_to_me").length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              No records here.
            </p>
          )}
        </div>

        {/* PEOPLE THE CLIENT OWES */}
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "15px",
            border: "2px solid #e26a6a",
            borderRadius: "8px",
            background: "#fdf6f6",
          }}
        >
          <h3 style={{ color: "#e26a6a", marginTop: 0 }}>Money I Owe</h3>
          {records
            .filter((r) => r.type === "i_owe")
            .map((record) => (
              <div
                key={record.id}
                style={{
                  padding: "12px",
                  marginBottom: "8px",
                  background: "white",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1.1rem" }}>{record.name}</strong>{" "}
                  -{" "}
                  <span style={{ color: "#e26a6a", fontWeight: "bold" }}>
                    ₦{record.amount.toLocaleString()}
                  </span>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {record.reason}
                  </div>
                </div>
                <button
                  onClick={() => handleClearRecord(record.id)}
                  style={{
                    background: "#e26a6a",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Settled
                </button>
              </div>
            ))}
          {records.filter((r) => r.type === "i_owe").length === 0 && (
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              No records here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalLedger;
