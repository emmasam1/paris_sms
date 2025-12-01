// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const API_BASE_URL = "https://scholas-v2.onrender.com";
  const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || "fallback-secret-key";

  const navigate = useNavigate(); // ✅ FIXED

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 🔐 Encrypt
  const encryptData = (data) => {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  };

  // 🔓 Decrypt
  const decryptData = (cipherText) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  // Load session
  useEffect(() => {
    try {
      const encUser = sessionStorage.getItem("user");
      const encToken = sessionStorage.getItem("token");

      if (encUser && encToken) {
        const savedUser = decryptData(encUser);
        const savedToken = decryptData(encToken);

        if (savedUser && savedToken) {
          setUser(savedUser);
          setToken(savedToken);
        } else {
          sessionStorage.clear();
        }
      }
    } catch (error) {
      console.error("Session load error:", error);
      sessionStorage.clear();
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save session on changes
  useEffect(() => {
    if (user && token) {
      sessionStorage.setItem("user", encryptData(user));
      sessionStorage.setItem("token", encryptData(token));
    }
  }, [user, token]);

  // ✅ Logout (fixed)
  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    setToken(null);
    navigate("/"); // ✅ FIXED
  };

  const value = {
    API_BASE_URL,
    SECRET_KEY,
    user,
    setUser,
    token,
    setToken,
    loading,
    setLoading,
    initialized,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
