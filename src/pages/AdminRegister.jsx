// src/pages/AdminRegister.jsx
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import AdminRegisterForm from '../components/auth/AdminRegisterForm.jsx'; 
import { useAuth } from "../context/AuthContext.jsx";
import { verifyAdminExistsRequest } from '../services/auth.service'; 

const AdminRegister = () => {
  const { checkAdminStatus } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await verifyAdminExistsRequest();
        setHasAdmin(response.hasAdmin);
      } catch (error) {
        console.error("Error al verificar el administrador", error);
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, []);

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative"
      // Gradiente actualizado: Naranja a Azul Oscuro
      style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-7">
            
            {checking ? (
              <div className="text-center text-white py-5">
                <Loader2 size={40} className="animate-spin mx-auto mb-3 opacity-75" />
                <h5 className="fw-semibold opacity-75">Verificando estado del sistema...</h5>
              </div>
            ) 
            : hasAdmin ? (
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent animate__animated animate__zoomIn">
                <div 
                  className="p-3 text-center text-white"
                  style={{ 
                    backgroundColor: "#fd7e14", // Cabecera Naranja
                    borderBottom: "4px solid #0f172a" // Línea Azul
                  }}
                >
                  <img 
                    src="/imagenes/logo-mvc.png" 
                    alt="Logo" 
                    style={{ height: '55px', objectFit: 'contain' }}
                    className="mb-1 drop-shadow"
                  />
                </div>
                
                <div className="card-body p-4 p-md-5 bg-white text-center">
                  <ShieldAlert size={60} className="mb-3 text-warning mx-auto" />
                  <h4 className="fw-bold text-dark mb-3">Registro No Disponible</h4>
                  <p className="text-muted mb-4 fw-medium" style={{ fontSize: '1.05rem' }}>
                    El sistema ya cuenta con un administrador principal registrado.
                  </p>
                  <div className="p-3 bg-light rounded-3 border">
                    <p className="small text-secondary mb-0">
                      En caso de no poder ingresar al sistema o haber perdido sus credenciales de acceso, por favor contactarse con el <strong>Soporte Técnico</strong>.
                    </p>
                  </div>
                  <div className="mt-4">
                    <a href="/admin/staff/login" className="btn fw-bold px-4 py-2 rounded-3 shadow-sm text-white" style={{ backgroundColor: "#0f172a", border: "none" }}>
                      Ir al inicio de sesión
                    </a>
                  </div>
                </div>
              </div>
            ) 
            : (
              <AdminRegisterForm />
            )}

          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminRegister;