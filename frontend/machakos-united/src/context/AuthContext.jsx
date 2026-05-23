// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from token on app start
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const { data } = await authApi.getProfile();
          setUser(data.user);
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const loginUser = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    // Fetch user profile (or you can return user from a custom login endpoint)
    const { data: profileData } = await authApi.getProfile();
    setUser(profileData.user);
    return data;
  };

  const registerUser = async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    setUser(data.user);
    return data;
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUserProfile = async (profileData) => {
    const { data } = await authApi.updateProfile(profileData);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile,
        requestPasswordReset: authApi.requestPasswordReset,
        confirmPasswordReset: authApi.confirmPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);