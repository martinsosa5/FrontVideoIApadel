// src/api/axios.js
import axios from "axios";

const instance = axios.create({
  // Si en el .env tenés http://localhost:5000, acá le agregamos el /api automáticamente
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api',
  withCredentials: true, // Lo dejamos activado porque a Chrome le sirve de respaldo
});

// 🔥 ESTA ES LA MAGIA CONTRA SAFARI (Interceptor)
instance.interceptors.request.use(
  (config) => {
    // 1. Buscamos el token en el almacenamiento del navegador (celular o PC)
    const token = localStorage.getItem("token"); 

    // 2. Si hay un token, lo pegamos a la fuerza en el Header de Autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;