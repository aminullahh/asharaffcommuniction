import React, { useState, useEffect } from "react";
import { auth } from "./services/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  enableNetwork,
  disableNetwork,
  waitForPendingWrites,
} from "firebase/firestore";
import { db } from "./services/firebaseConfig";
import "./App.css";

import Login from "./components/Login";
import PurchaseForm from "./components/PurchaseForm";
import AvailableStock from "./components/AvailableStock"; // Added import
import RecordSale from "./components/RecordSale";
import Ledger from "./components/Ledger";
import PersonalLedger from "./components/PersonalLedger";
import OfficeStats from "./components/OfficeStats";
import History from "./components/History";

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState("stats");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleCloudBackup = async () => {
    try {
      alert(
        "Starting Cloud Sync. Please ensure you are connected to the internet...",
      );

      // 1. Turn the internet ON so Firebase can speak to the cloud servers
      await enableNetwork(db);
      console.log("Network connection opened. Initiating upload queue...");

      // 2. CRITICAL FIX: Wait until all local offline changes are completely uploaded
      await waitForPendingWrites(db);
      console.log(
        "All pending offline records have successfully landed in the cloud database!",
      );

      alert(
        "Backup Complete! Data is safely mirrored in the cloud. Returning to offline mode.",
      );

      // 3. Instantly lock the internet connection down again
      await disableNetwork(db);
      console.log(
        "Network connection safely closed. App is back to local-only mode.",
      );
    } catch (error) {
      console.error("Backup process encountered an error:", error);
      alert(
        "Backup failed. Please check your internet connection or WiFi stability and try again.",
      );

      // Safety net: ensure the app goes back offline even if the sync fails midway
      await disableNetwork(db);
      console.log(
        "Emergency lockdown: App forced back to offline mode following an error.",
      );
    }
  };

  // New state to hold phones when moving from Available Stock to Record Sale
  const [checkoutCart, setCheckoutCart] = useState([]);

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
        Booting Ashraff Environment...
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="container">
      <header className="card main-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
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
            />
            <div>
              <h1 className="brand-title">{shopName}</h1>
              <span className="brand-subtitle">
                Powered by AMTECH DIGITAL SOLUTION
              </span>
            </div>
          </div>

          {/* NEW: Hamburger Button */}
          <button
            className="hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* NEW: Add the dynamic 'open' class to the nav */}
        <nav className={`desktop-nav ${isMobileMenuOpen ? "open" : ""}`}>
          {/* Update your buttons so clicking one closes the mobile menu */}
          <button
            className={view === "stats" ? "active" : ""}
            onClick={() => {
              setView("stats");
              setIsMobileMenuOpen(false);
            }}
          >
            Dashboard
          </button>
          {/* ... add setIsMobileMenuOpen(false) to the rest of your buttons ... */}
          <button
            className={view === "records" ? "active" : ""}
            onClick={() => {
              setView("records");
              setIsMobileMenuOpen(false);
            }}
          >
            Phones In
          </button>
          <button
            className={view === "stock" ? "active" : ""}
            onClick={() => {
              setView("stock");
              setIsMobileMenuOpen(false);
            }}
          >
            Available Stock
          </button>
          <button
            className={view === "sales" ? "active" : ""}
            onClick={() => {
              setView("sales");
              setIsMobileMenuOpen(false);
            }}
          >
            Sell Phone
          </button>
          <button
            className={view === "ledger" ? "active" : ""}
            onClick={() => {
              setView("ledger");
              setIsMobileMenuOpen(false);
            }}
          >
            Debtors List
          </button>
          <button
            className={view === "history" ? "active" : ""}
            onClick={() => {
              setView("history");
              setIsMobileMenuOpen(false);
            }}
          >
            History & Logs
          </button>
          <button
            className={view === "personal" ? "active" : ""}
            onClick={() => {
              setView("personal");
              setIsMobileMenuOpen(false);
            }}
          >
            Personal Debt
          </button>
          <button
            onClick={() => {
              handleCloudBackup(); // 1. Start the backup process
              setIsMobileMenuOpen(false); // 2. Close the mobile hamburger menu
            }}
          >
            Backup to Cloud
          </button>
          <button
            onClick={() => {
              signOut(auth);
              setIsMobileMenuOpen(false);
            }}
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

        {/* Pass setView and setCheckoutCart so the stock page can send items to checkout */}
        {view === "stock" && (
          <AvailableStock setView={setView} setCheckoutCart={setCheckoutCart} />
        )}

        {/* Pass the incoming cart data into RecordSale */}
        {view === "sales" && (
          <RecordSale
            incomingCart={checkoutCart}
            setCheckoutCart={setCheckoutCart}
            setView={setView}
          />
        )}

        {view === "ledger" && <Ledger />}
        {view === "personal" && <PersonalLedger />}
        {view === "history" && <History />}
      </main>
    </div>
  );
}

export default App;
