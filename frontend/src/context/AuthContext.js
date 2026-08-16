import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserProfile } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged in user profile
  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await getUserProfile();
      setUser(response.data);
    } catch (err) {
      // Only force logout if the token is definitely rejected by server (401)
      if (err.response && err.response.status === 401) {
        console.warn("Auth token invalid or expired. Logging out.");
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } else {
        console.error("Error fetching user profile:", err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      fetchUser(newToken);
    }
  };

  const signup = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      fetchUser(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const refreshUser = () => {
    if (token) fetchUser(token);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        signup,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

