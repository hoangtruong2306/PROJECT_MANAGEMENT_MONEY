import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, register as apiRegister, getMe as apiGetMe, loginGoogle } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trả về user object sau khi load xong (thay vì void)
  const loadUser = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }
    try {
      const res = await apiGetMe();
      const userData = res.data.user || res.data;
      setUser(userData);
      return userData;           // ← trả về để caller dùng ngay
    } catch (err) {
      sessionStorage.removeItem("token");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login() giờ trả về { res, user } để Login.jsx biết role ngay lập tức
  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    const token = res.data.token;
    if (token) sessionStorage.setItem("token", token);
    const userData = await loadUser();   // ← lấy user luôn
    return { res, user: userData };      // ← trả về cả hai
  };

  const loginWithGoogle = async (idToken) => {
    const res = await loginGoogle({ idToken });
    const token = res.data.token;
    if (token) sessionStorage.setItem("token", token);
    const userData = await loadUser();
    return { res, user: userData };
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    const token = res.data.token;
    if (token) sessionStorage.setItem("token", token);
    const userData = await loadUser();
    return { res, user: userData };
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
