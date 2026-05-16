import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

const History = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("dateAdded", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStock(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <div className="card">
      <h2 style={{ color: "var(--primary)", marginBottom: "20px" }}>
        Stock & Purchase Log
      </h2>

      {loading ? (
        <div
          style={{ textAlign: "center", padding: "20px", fontWeight: "bold" }}
        >
          Fetching database records...
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
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Device</th>
                <th style={{ padding: "12px" }}>IMEI</th>
                <th style={{ padding: "12px" }}>Cost Price</th>
                <th style={{ padding: "12px" }}>Supplier Details</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px", fontSize: "0.85rem" }}>
                    {item.dateAdded?.toDate()
                      ? item.dateAdded.toDate().toLocaleDateString()
                      : "Pending"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <strong>{item.phoneBrand}</strong> {item.phoneModel}
                  </td>
                  <td
                    style={{
                      padding: "12px",
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                    }}
                  >
                    {item.imei}
                  </td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>
                    &#8358;{Number(item.costPrice).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px", fontSize: "0.9rem" }}>
                    {item.sellerName || "Unknown"} <br />
                    <small style={{ color: "var(--text-light)" }}>
                      {item.sellerAddress}
                    </small>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        background:
                          item.status === "available" ? "#e6f4ea" : "#feeeee",
                        color:
                          item.status === "available"
                            ? "var(--success)"
                            : "var(--danger)",
                      }}
                    >
                      {item.status === "available" ? "In Stock" : "Sold"}
                    </span>
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

export default History;
