// src/pages/StaffLogin.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

import { loginSchema } from "../schemas/auth.schema";
import { useAuth } from "../context/AuthContext";

const StaffLogin = () => {
  // --- LÓGICA DE AUTENTICACIÓN REACTIVADA ---
  const [showPassword, setShowPassword] = useState(false);
  const { signin, isAuthenticated, errors: loginErrors } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/staff");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (loginErrors && loginErrors.length > 0) {
      loginErrors.forEach(err => 
        toast.error(err, { 
          position: "top-center",
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } 
        })
      );
    }
  }, [loginErrors]);

  const onSubmit = handleSubmit(async (data) => {
    const isSuccess = await signin(data);
    if (isSuccess) {
        toast.success("¡Ingreso exitoso!", {
            position: "top-center",
            style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
        });
    }
  });

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}
    >
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent" style={{ maxWidth: '450px', width: '100%' }}>
        
        <div 
          className="p-2 text-center text-white"
          style={{ 
            backgroundColor: "#fd7e14", 
            borderBottom: "4px solid #0f172a" 
          }}
        >
          <img 
            src="/imagenes/logo-mvc.png" 
            alt="Logo" 
            style={{ height: '60px', objectFit: 'contain' }}
            className="mb-1 drop-shadow"
          />
          <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
            <h3 className="fw-bold m-0">Acceso Staff</h3>
            {/* Restauramos el icono original de inicio de sesión */}
            <LogIn size={26} />
          </div>
          <p className="small opacity-75 mb-0 text-white">Gestión del Torneo</p>
        </div>
        
        <div className="card-body p-4 p-md-5 bg-white">
          
          {/* =========================================================================
              MENSAJE DE SUSPENSIÓN COMENTADO (PARA USAR EN PRODUCCIÓN SI ES NECESARIO)
              ========================================================================= 
          <div className="text-center">
            <div className="mb-4 d-flex justify-content-center">
              <div className="bg-danger bg-opacity-10 text-danger p-4 rounded-circle d-flex align-items-center justify-content-center">
                <AlertOctagon size={60} strokeWidth={1.5} />
              </div>
            </div>
            <h4 className="fw-bold text-dark mb-3">Sistema Suspendido</h4>
            <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
              El acceso administrativo se encuentra temporalmente inactivo. Por favor, <strong>comunicate con el proveedor del software</strong> para regularizar el servicio y reactivar la plataforma.
            </p>
            <hr className="text-secondary opacity-25 mb-4" />
            <Link 
              to="/" 
              className="btn w-100 py-2 fw-bold shadow-sm text-white rounded-3 d-flex justify-content-center align-items-center gap-2"
              style={{ backgroundColor: "#0f172a", border: "none" }}
            >
              <ArrowLeft size={18} />
              Volver a la vista pública
            </Link>
          </div>
          */}

          {/* === FORMULARIO DE ACCESO FUNCIONAL === */}
          <form onSubmit={onSubmit}>
            
            <div className="mb-3">
              <label className="form-label text-secondary fw-semibold">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Mail size={18} className="text-muted" />
                </span>
                <input
                  type="email"
                  maxLength={80}
                  className={`form-control bg-light border-start-0 ${errors.email ? "is-invalid" : ""}`}
                  placeholder="nombre@gmail.com"
                  {...register("email")}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={30}
                  className={`form-control bg-light border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  {...register("password")}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-start-0 cursor-pointer text-muted" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn w-100 py-2 fw-bold shadow-sm text-white rounded-3"
              style={{ backgroundColor: "#0f172a", border: "none" }}
            >
              Ingresar al Sistema
            </button>
              
            <div className="mt-4 mb-4 text-center">
              <hr className="text-secondary opacity-25 mb-3" />
              <Link 
                to="/forgot-password" 
                className="btn btn-link p-0 text-decoration-none small fw-bold"
                style={{ color: "#0f172a" }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            
          </form>

        </div>
      </div>
    </div>
  );
};

export default StaffLogin;