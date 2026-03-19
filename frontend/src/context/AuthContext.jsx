import React, { createContext, useState, useEffect} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getProfile,
} from "../services/api";

const AuthContext = createContext();

 const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setLoading(true);
          const response = await getProfile();
          setUser(response.user);
        } catch (err) {
          console.error("Failed to load user", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadUser();
  }, [token]);

  const register = async (userData) => {
    try {
      setUser(null);
      setLoading(true);
      const response = await apiRegister(userData);
      setToken(response.token);
      setUser(response.user);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || "Registration failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiLogin(credentials);
      setToken(response.token);
      setUser(response.user);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const { updateProfile: apiUpdateprofile } =
        await import("../services/api.js");
      const response = await apiUpdateprofile(userData);
      if (response.user) {
        setUser(response.user);
      }
      if (response.token) {
        setToken(response.token);
      }

      return { success: true, data: response };
    } catch (err) {
      setError(err.message || "Profile updated failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  const clearError = () => setError(null);
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
};

export {AuthContext, AuthProvider}