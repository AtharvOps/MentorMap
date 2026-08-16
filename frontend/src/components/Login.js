import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "lottie-react";
import loginAnimation from "../assets/login-animation.json";
import "./Login.css";


import { loginUser } from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const cleanEmail = formData.email.trim();

    try {
      const response = await loginUser({ email: cleanEmail, password: formData.password });
      const token = response.data.token;

      if (token) {
        localStorage.setItem("token", token);
      }
      setSuccess("Login successful! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again.";
      setError(errMsg);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        {/* Animation Section - Optional, can be removed if not needed */}
        <div className="login-animation-container">
          <Lottie 
            animationData={loginAnimation} 
            loop 
            className="login-animation" 
          />
        </div>

        {/* Form Section */}
        <div className="login-form-container">
          <div className="login-card">
            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Please enter your credentials to login</p>
            </div>

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}
            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="login-button" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="button-loader"></span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <div className="login-footer">
                <p>
                  Don't have an account?{" "}
                  <Link to="/signup" className="signup-link">
                    Sign up here
                  </Link>
                </p>
                <Link to="/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;