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

  // useEffect(() => {
  //   const u1 = onSnapshot(collection(db, "sales"), (snap) => {
  //     const data = snap.docs.map((d) => d.data());
  //     console.log("OfficeStats: Loaded", data.length, "sales from cache.");
  //     setSales(data);
  //   });

  //   const u2 = onSnapshot(collection(db, "inventory"), (snap) => {
  //     const data = snap.docs.map((d) => d.data());
  //     console.log(
  //       "OfficeStats: Loaded",
  //       data.length,
  //       "inventory items from cache.",
  //     );
  //     setInventory(data);
  //   });

  //   return () => {
  //     u1();
  //     u2();
  //   };
  // }, []);
  useEffect(() => {
    // 1. ADDED { serverTimestamps: "estimate" } to generate offline dates
    const u1 = onSnapshot(collection(db, "sales"), (snap) => {
      const data = snap.docs.map((d) =>
        d.data({ serverTimestamps: "estimate" }),
      );
      console.log("OfficeStats: Loaded", data.length, "sales from cache.");
      setSales(data);
    });

    const u2 = onSnapshot(collection(db, "inventory"), (snap) => {
      const data = snap.docs.map((d) =>
        d.data({ serverTimestamps: "estimate" }),
      );
      console.log(
        "OfficeStats: Loaded",
        data.length,
        "inventory items from cache.",
      );
      setInventory(data);
    });

    return () => {
      u1();
      u2();
    };
  }, []);

  // This Handle Core Filtering Engine
  // const filterRecords = (records, dateKey) => {
  //   return records.filter((item) => {
  //     if (!item[dateKey]) return false;

  //     // Robust check: handles both online Firestore Timestamps and offline raw dates
  //     const itemDate = item[dateKey].toDate
  //       ? item[dateKey].toDate()
  //       : new Date(item[dateKey]);
  //     const now = new Date();

  //     if (timeFilter === "today") {
  //       return itemDate.toDateString() === now.toDateString();
  //     }
  //     if (timeFilter === "week") {
  //       const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  //       return itemDate >= oneWeekAgo;
  //     }
  //     if (timeFilter === "month") {
  //       return (
  //         itemDate.getMonth() === now.getMonth() &&
  //         itemDate.getFullYear() === now.getFullYear()
  //       );
  //     }
  //     if (timeFilter === "specific-month") {
  //       return (
  //         itemDate.getMonth() === Number(selectedMonth) &&
  //         itemDate.getFullYear() === Number(selectedYear)
  //       );
  //     }
  //     return true;
  //   });
  // };
  const filterRecords = (records, dateKey) => {
    // 2. If we are looking at "all" time, just return everything immediately!
    if (timeFilter === "all") return records;

    return records.filter((item) => {
      // 3. Fallback: If it's STILL missing a date, count it as today
      const itemDate = item[dateKey]
        ? item[dateKey].toDate
          ? item[dateKey].toDate()
          : new Date(item[dateKey])
        : new Date();

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
          justifyContent: "space-between",
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
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
                <option value="2031">2031</option>
                <option value="2032">2032</option>
                <option value="2033">2033</option>
                <option value="2034">2034</option>
                <option value="2035">2035</option>
                <option value="2036">2036</option>
                <option value="2037">2037</option>
                <option value="2038">2038</option>
                <option value="2039">2039</option>
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
