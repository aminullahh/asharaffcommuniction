import React, { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";

import Login from "./components/Login";
import PurchaseForm from "./components/PurchaseForm";
import RecordSale from "./components/RecordSale";
import Ledger from "./components/Ledger";
import OfficeStats from "./components/OfficeStats";
import History from "./components/History";

function App() {
  const [view, setView] = useState("stats");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const shopName = process.env.REACT_APP_SHOP_NAME || "Amtech Phone Manager";

  useEffect(() => {
    document.title = shopName;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [shopName]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontWeight: "bold",
          color: "var(--primary)",
        }}
      >
        Booting Amtech Environment...
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="container">
      <header className="card main-header">
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "6px",
              objectFit: "cover",
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <div>
            <h1 className="brand-title">{shopName}</h1>
            <span className="brand-subtitle">
              Powered by AMTECH DIGITAL SOLUTION
            </span>
          </div>
        </div>
        <nav className="desktop-nav">
          <button
            className={view === "stats" ? "active" : ""}
            onClick={() => setView("stats")}
          >
            Dashboard
          </button>
          <button
            className={view === "records" ? "active" : ""}
            onClick={() => setView("records")}
          >
            Phones In
          </button>
          <button
            className={view === "sales" ? "active" : ""}
            onClick={() => setView("sales")}
          >
            Sell Phone
          </button>
          <button
            className={view === "ledger" ? "active" : ""}
            onClick={() => setView("ledger")}
          >
            Debtors List
          </button>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => setView("history")}
          >
            Audit Logs
          </button>
          <button
            onClick={() => signOut(auth)}
            style={{
              border: "1px solid var(--danger)",
              color: "var(--danger)",
              padding: "6px 12px",
              background: "transparent",
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <main>
        {view === "stats" && <OfficeStats />}
        {view === "records" && <PurchaseForm />}
        {view === "sales" && <RecordSale />}
        {view === "ledger" && <Ledger />}
        {view === "history" && <History />}
      </main>
    </div>
  );
}

export default App;
