import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authApi.me();
      setUser(response.user);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const sendOtp = async (email, action) => {
    return await authApi.sendOtp(email, action);
  };

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (name, email, password, otp) => {
    const response = await authApi.registerVerify(name, email, password, otp);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response.user;
  };

  const resetPassword = async (email, otp, newPassword) => {
    return await authApi.resetPassword(email, otp, newPassword);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser, sendOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
