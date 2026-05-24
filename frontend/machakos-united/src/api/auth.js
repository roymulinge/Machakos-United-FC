// src/api/auth.js
import apiClient from './client';

export const register = (userData) => apiClient.post('/api/users/register/', userData);

export const login = (credentials) => apiClient.post('/api/token/', credentials);

export const refreshToken = (refresh) => apiClient.post('/api/token/refresh/', { refresh });

export const getProfile = () => apiClient.get('/api/users/profile/');

export const updateProfile = (profileData) => apiClient.patch('/api/users/profile/', profileData);

export const requestPasswordReset = (email) => apiClient.post('/api/users/password-reset/', { email });

export const confirmPasswordReset = (uid, token, newPassword) =>
  apiClient.post('/api/users/password-reset/confirm/', { uid, token, new_password: newPassword });