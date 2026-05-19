import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const AvailableStock = ({ setView, setCheckoutCart }) => {
  const [stock, setStock] = useState([]);
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Only fetch phones that are currently "available"
    const stockQuery = query(
      collection(db, "inventory"),
      where("status", "==", "available"),
    );
    const unsubStock = onSnapshot(stockQuery, (snap) => {
      setStock(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsubStock();
  }, []);

  const toggleSelection = (phone) => {
    setSelectedPhones((prev) => {
      const isSelected = prev.some((p) => p.id === phone.id);
      if (isSelected) {
        return prev.filter((p) => p.id !== phone.id);
      } else {
        return [...prev, phone];
      }
    });
  };

  const proceedToSell = () => {
    if (selectedPhones.length === 0)
      return alert("Please select at least one phone to checkout.");

    // Pass selected items to App.js state, then change view to the Sales page
    setCheckoutCart(selectedPhones);
    setView("sales");
  };

  const filteredStock = stock.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.phoneBrand?.toLowerCase().includes(searchLower) ||
      item.phoneModel?.toLowerCase().includes(searchLower) ||
      item.imei?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "var(--primary)", margin: 0 }}>Available Stock</h2>
        <button
          onClick={proceedToSell}
          disabled={selectedPhones.length === 0}
          style={{
            background: selectedPhones.length > 0 ? "var(--success)" : "#ccc",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: selectedPhones.length > 0 ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          Proceed to Sell ({selectedPhones.length} Selected)
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by Brand, Model, or IMEI..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          boxSizing: "border-box",
          borderRadius: "6px",
          border: "1px solid #ccc",
        }}
      />

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "var(--primary)",
          }}
        >
          Loading Inventory...
        </div>
      ) : filteredStock.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "var(--text-light)",
          }}
        >
          No available stock found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredStock.map((item) => {
            const isChecked = selectedPhones.some((p) => p.id === item.id);
            return (
              <label
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "15px",
                  background: isChecked ? "var(--background)" : "#fff",
                  border: isChecked
                    ? "1px solid var(--primary)"
                    : "1px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSelection(item)}
                  style={{
                    marginRight: "15px",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />
                <div>
                  <strong
                    style={{ fontSize: "1.1rem", color: "var(--text-dark)" }}
                  >
                    {item.phoneBrand} {item.phoneModel}
                  </strong>
                  <br />
                  <small style={{ color: "var(--text-light)" }}>
                    IMEI: {item.imei}
                  </small>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableStock;
