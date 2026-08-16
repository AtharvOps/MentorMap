import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signupUser } from "../services/api";
import logo from "../assets/logo.png";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { toast } from "react-toastify";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await signupUser({ name, email, password });
      signup(response.data.token, response.data.user);
      toast.success("Account created successfully! Welcome to MentorMap.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed. Try again.");
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Create Your Account</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
            Unlock personalized AI roadmaps, notes, quizzes, and project missions.
          </p>
        </div>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, marginBottom: "6px" }}>
              FULL NAME
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-input)" }}>
              <User size={18} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: "none", border: "none", outline: "none", color: "var(--text-primary)", width: "100%", fontSize: "0.92rem" }}
                required
              />
            </div>
          </div>

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
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
