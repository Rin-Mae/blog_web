import { createContext, useContext, useState, useEffect, useRef } from "react";
import AuthServices from "../services/AuthServices";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authChecked = useRef(false);

  useEffect(() => {
    if (!authChecked.current) {
      authChecked.current = true;
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await AuthServices.getUser();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const loginResponse = await AuthServices.login(credentials);
    const userData = await AuthServices.getUser();
    const merged = {
      ...userData,
      // Preserve account_status from login (backend includes it on login)
      account_status: loginResponse?.account_status ?? userData?.account_status,
      message: loginResponse?.message,
      status: loginResponse?.status,
    };
    setUser(merged);
    return merged;
  };

  const logout = async () => {
    const response = await AuthServices.logout();
    setUser(null);
    return response;
  };

  const register = async (userData) => {
    const response = await AuthServices.register(userData);
    return response;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
