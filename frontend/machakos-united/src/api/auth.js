// src/api/auth.js
import apiClient from './client';

export const register = (userData) => apiClient.post('/users/register/', userData);

export const login = (credentials) => apiClient.post('/token/', credentials);

export const refreshToken = (refresh) => apiClient.post('/token/refresh/', { refresh });

export const getProfile = () => apiClient.get('/users/profile/');

export const updateProfile = (profileData) => apiClient.patch('/users/profile/', profileData);

export const requestPasswordReset = (email) => apiClient.post('/users/password-reset/', { email });

export const confirmPasswordReset = (uid, token, newPassword) =>
  apiClient.post('/users/password-reset/confirm/', { uid, token, new_password: newPassword });