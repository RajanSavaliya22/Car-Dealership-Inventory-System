import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    authApi.setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let isCurrent = true;
    authApi
      .fetchMe()
      .then((profile) => {
        if (isCurrent) setUser(profile);
      })
      .catch(() => {
        if (isCurrent) setUser(null);
      });
    return () => {
      isCurrent = false;
    };
  }, [token]);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    setToken(data.access);
    return data;
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
  }

  const value = {
    token,
    user,
    setUser,
    isAuthenticated: Boolean(token),
    isAdmin: Boolean(user?.is_admin),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;