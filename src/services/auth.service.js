// src/services/auth.service.js
import axios from "../api/axios.js";

// 🔥 ACÁ ESTÁ LA CLAVE: 
// Si en tu app.js del backend pusiste app.use("/api/auth", authRoutes), dejá esta línea así:
// const AUTH_URL = "/api/auth";
// Si usaste la ruta de seguridad que charlamos, cambiala por: "/api/nexa-core-auth"
const AUTH_URL = "/auth"; 

export const registerService = async (user) => {
  const response = await axios.post(`${AUTH_URL}/register`, user);
  return response.data;
};

export const loginService = async (user) => {
  const response = await axios.post(`${AUTH_URL}/login`, user);
  return response.data;
};

export const logoutService = async () => {
  const response = await axios.post(`${AUTH_URL}/logout`);
  return response.data;
};

export const verifyTokenRequest = async () => {
  const response = await axios.get(`${AUTH_URL}/verify`);
  return response; 
};

export const updateProfileRequest = async (userData) => {
  const response = await axios.put(`${AUTH_URL}/update-profile`, userData);
  return response.data;
};

export const changePasswordRequest = async (passwords) => {
  const response = await axios.put(`${AUTH_URL}/change-password`, passwords);
  return response.data;
};

export const changeEmailRequest = async (emailData) => {
  const response = await axios.put(`${AUTH_URL}/change-email`, emailData);
  return response.data;
};

export const uploadProfileImageRequest = async (formData) => {
  const response = await axios.post(`${AUTH_URL}/upload-profile-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await axios.post(`${AUTH_URL}/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axios.post(`${AUTH_URL}/reset-password/${token}`, { newPassword });
  return response.data;
};

export const verifyResetTokenRequest = async (token) => {
  const response = await axios.get(`${AUTH_URL}/verify-reset-token/${token}`);
  return response.data;
};

export const verifyAdminExistsRequest = async () => {
  try {
    const response = await axios.get(`${AUTH_URL}/check-admin`); 
    return response.data;
  } catch (error) {
    console.error("Error en la petición de check-admin", error);
    throw error;
  }
};