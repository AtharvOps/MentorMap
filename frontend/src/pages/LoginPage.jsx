import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/api";
import logo from "../assets/logo.png";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser({ email: cleanEmail, password });
      login(response.data.token, response.data.user);
      toast.success("Welcome back to MentorMap!");
      navigate("/dashboard");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || (err.message === "Network Error" ? "Cannot connect to server. Please ensure backend is running." : "Invalid email or password.");
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "440px", margin: "40px auto 60px" }}>
      <div className="saas-card" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <img
            src={logo}
            alt="MentorMap Logo"
            style={{
              width: "56px",
              height: "56px",
              objectFit: "contain",
              margin: "0 auto 12px",
              display: "block"
            }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Sign In to MentorMap</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            Log in to continue your adaptive learning pathways.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-input)" }}>
              <Mail size={18} color="var(--text-muted)" />
              <input
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontSize: "0.92rem" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
              PASSWORD
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-input)" }}>
              <Lock size={18} color="var(--text-muted)" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontSize: "0.92rem" }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-gradient"
            style={{ width: "100%", padding: "12px", justifyContent: "center", marginTop: "8px" }}
          >
            <span>{loading ? "Signing In..." : "Sign In to MentorMap"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
