import React, { useState, useEffect } from "react";
import { db } from "../services/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

const OfficeStats = () => {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);

  // This Filter States
  const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, month, specific-month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 - 11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "sales"), (snap) =>
      setSales(snap.docs.map((d) => d.data())),
    );
    const u2 = onSnapshot(collection(db, "inventory"), (snap) =>
      setInventory(snap.docs.map((d) => d.data())),
    );
    return () => {
      u1();
      u2();
    };
  }, []);

  // This Handle Core Filtering Engine
  const filterRecords = (records, dateKey) => {
    return records.filter((item) => {
      if (!item[dateKey]) return false;

      // This Convert Firestore Timestamp to JS Date object
      const itemDate = item[dateKey].toDate();
      const now = new Date();

      if (timeFilter === "today") {
        return itemDate.toDateString() === now.toDateString();
      }
      if (timeFilter === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= oneWeekAgo;
      }
      if (timeFilter === "month") {
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === "specific-month") {
        return (
          itemDate.getMonth() === Number(selectedMonth) &&
          itemDate.getFullYear() === Number(selectedYear)
        );
      }
      return true;
    });
  };

  // This Run the data through our filtering engine
  const filteredSales = filterRecords(sales, "date");
  const filteredInventory = filterRecords(inventory, "dateAdded");

  // This Handle Math Calculations based on filtered arrays
  const phonesSold = filteredSales.length;
  const phonesIn = filteredInventory.length;
  const totalIncome = filteredSales.reduce(
    (sum, s) => sum + Number(s.totalAmount),
    0,
  );
  const totalExpenses = filteredInventory.reduce(
    (sum, i) => sum + Number(i.costPrice),
    0,
  );
  const netPosition = totalIncome - totalExpenses;

  // This Handle Months utility array for the dropdown selectors
  const monthsName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="card">
      {/* This Handle Friendly Dashboard Heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ color: "var(--primary)", margin: 0 }}>
          Business Overview Dashboard
        </h2>

        {/* This Handle INTERACTIVE CONTROLS CONTAINER */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* This Handle Main Frame Selector */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="all">All-Time Metrics</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="specific-month">Select Specific Month...</option>
          </select>

          {/* This Handle Month-by-Month Pickers */}
          {timeFilter === "specific-month" && (
            <div style={{ display: "flex", gap: "5px" }}>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              >
                {monthsName.map((name, index) => (
                  <option key={index} value={index}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "#fff",
                }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2025">2028</option>
                <option value="2026">2029</option>
                <option value="2027">2030</option>
                <option value="2025">2031</option>
                <option value="2026">2032</option>
                <option value="2027">2033</option>
                <option value="2025">2034</option>
                <option value="2026">2035</option>
                <option value="2027">2036</option>
                <option value="2025">2037</option>
                <option value="2026">2038</option>
                <option value="2027">2039</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* This Handle STATS ANALYTICS DISPLAY TILES */}
      <div className="stats-grid">
        <div
          className="card"
          style={{
            textAlign: "center",
            background: "var(--background)",
            margin: 0,
          }}
        >
          <h3
            style={{ margin: 0, color: "var(--text-light)", fontSize: "1rem" }}
          >
            Phones Brought In
          </h3>
          <p
            style={{
              fontSize: "2.2rem",
              color: "var(--primary)",
              margin: "10px 0",
              fontWeight: "bold",
            }}
          >
            {phonesIn}
          </p>
        </div>
        <div
          className="card"
          style={{
            textAlign: "center",
            background: "var(--background)",
            margin: 0,
          }}
        >
          <h3
            style={{ margin: 0, color: "var(--text-light)", fontSize: "1rem" }}
          >
            Phones Sold
          </h3>
          <p
            style={{
              fontSize: "2.2rem",
              color: "var(--secondary)",
              margin: "10px 0",
              fontWeight: "bold",
            }}
          >
            {phonesSold}
          </p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: "15px" }}>
        <div
          className="card"
          style={{ background: "var(--background)", margin: 0 }}
        >
          <small style={{ color: "var(--text-light)" }}>
            Total Purchases Value
          </small>
          <h3 style={{ margin: "5px 0 0 0", color: "var(--danger)" }}>
            ₦{totalExpenses.toLocaleString()}
          </h3>
        </div>
        <div
          className="card"
          style={{ background: "var(--background)", margin: 0 }}
        >
          <small style={{ color: "var(--text-light)" }}>
            Total Sales Value
          </small>
          <h3 style={{ margin: "5px 0 0 0", color: "var(--primary)" }}>
            ₦{totalIncome.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* This Handle NET PROFIT CARD WITH AUTO COLOR DYNAMICS */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          background: netPosition >= 0 ? "#e6f4ea" : "#fce8e6",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <strong style={{ color: netPosition >= 0 ? "#137333" : "#c5221f" }}>
          Overall Estimated Profit:{" "}
        </strong>
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: netPosition >= 0 ? "var(--success)" : "var(--danger)",
          }}
        >
          ₦{netPosition.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default OfficeStats;
