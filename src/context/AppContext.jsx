import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();
const API_BASE_URL = "https://scholas.onrender.com";

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false); // ✅ prevents premature logout

  // ✅ Save session after login
  const saveSession = (userData, tokenData) => {
    sessionStorage.setItem("app_user", JSON.stringify(userData));
    sessionStorage.setItem("app_token", tokenData);
    setUser(userData);
    setToken(tokenData);
  };

  // ✅ Clear session (logout)
  const clearSession = () => {
    sessionStorage.removeItem("app_user");
    sessionStorage.removeItem("app_token");
    setUser(null);
    setToken(null);
  };

  // ✅ Restore session on first load
  useEffect(() => {
    const savedUser = sessionStorage.getItem("app_user");
    const savedToken = sessionStorage.getItem("app_token");

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setInitialized(true); // ✅ mark as initialized after check
  }, []);

  return (
    <AppContext.Provider
      value={{
        API_BASE_URL,
        token,
        user,
        loading,
        setLoading,
        setUser,
        saveSession,
        clearSession,
        initialized, // ✅ expose this
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
