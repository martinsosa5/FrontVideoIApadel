// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import { 
  registerService, 
  loginService, 
  logoutService, 
  verifyTokenRequest, 
  updateProfileRequest,
  changePasswordRequest, 
  changeEmailRequest,
  uploadProfileImageRequest,
  verifyAdminExistsRequest
} from "../services/auth.service.js";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  const signup = async (userData) => {
    try {
      await registerService(userData);
      return true;
    } catch (error) {
      if (Array.isArray(error.response?.data?.errors)) {
        setErrors(error.response.data.errors);
      } else {
        setErrors([error.response?.data?.message || "Error en el registro"]);
      }
      return false;
    }
  };

  const signin = async (userData) => {
    try {
      const data = await loginService(userData);
      setUser(data.user || data); // Depende de cómo lo envíe tu auth.service
      setIsAuthenticated(true);
      
      // 🔥 MAGIA CONTRA SAFARI: Guardamos el token en el teléfono/PC
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return true;
    } catch (error) {
      if (Array.isArray(error.response?.data?.errors)) {
        setErrors(error.response.data.errors);
      } else {
        setErrors([error.response?.data?.message || "Error al iniciar sesión"]);
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
      setUser(null);
      setIsAuthenticated(false);
      
      // 🔥 Limpiamos el token al salir
      localStorage.removeItem("token");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      const data = await updateProfileRequest(userData);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      setErrors([error.response?.data?.message || "Error al actualizar perfil"]);
      return { success: false };
    }
  };

  const changeUserPassword = async (passwords) => {
    try {
      const data = await changePasswordRequest(passwords);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al cambiar la contraseña" };
    }
  };

  const changeUserEmail = async (emailData) => {
    try {
      const data = await changeEmailRequest(emailData);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al actualizar el correo" };
    }
  };

  const changeProfileImage = async (formData) => {
    try {
      const data = await uploadProfileImageRequest(formData);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al subir la imagen" };
    }
  };

  const checkAdminStatus = async () => {
    return await verifyAdminExistsRequest();
  };

  useEffect(() => {
    async function checkLogin() {
      try {
        const res = await verifyTokenRequest();
        if (res.data) {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        // 🔥 Limpiamos por seguridad si el token caducó
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    }
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider value={{
        signup, signin, logout, updateUserProfile, changeUserPassword,
        changeUserEmail, changeProfileImage, checkAdminStatus,
        user, isAuthenticated, errors, loading
      }}>
      {children}
    </AuthContext.Provider>
  );
};