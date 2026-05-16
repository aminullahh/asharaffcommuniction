import React, { useState } from "react";
import { auth } from "../services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Access Denied: Invalid Email or Password");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: "400px", marginTop: "40px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <h2 style={{ color: "var(--primary)", margin: 0 }}>System Access</h2>
          <small style={{ color: "var(--text-light)" }}>
            AMTECH PHONE MANAGER WORKSTATION
          </small>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Administrator Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Secure Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p
              style={{
                color: "var(--danger)",
                margin: 0,
                fontWeight: "bold",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </p>
          )}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
