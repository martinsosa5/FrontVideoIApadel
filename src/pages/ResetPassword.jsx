// src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, AlertTriangle, KeyRound, Loader2 } from "lucide-react";

import { resetPasswordSchema } from "../schemas/auth.schema";
import { resetPassword, verifyResetTokenRequest } from "../services/auth.service"; 

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isExpired, setIsExpired] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setIsExpired(true);
      setIsValidating(false);
      return;
    }

    const checkTokenValidity = async () => {
      try {
        await verifyResetTokenRequest(token);
        setIsExpired(false);
      } catch (error) {
        setIsExpired(true);
      } finally {
        setIsValidating(false);
      }
    };

    checkTokenValidity();
  }, [token]);

  const onSubmit = async (data) => {
    try {
      const response = await resetPassword(token, data.password);
      
      toast.success(response.message || "¡Contraseña actualizada con éxito!", {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      
      setTimeout(() => {
        // 🔥 CORRECCIÓN: Te manda al login del staff
        navigate("/admin/staff/login", { replace: true });
      }, 2500);

    } catch (err) {
      toast.error(err.response?.data?.message || "Error. El enlace pudo haber expirado justo ahora.", {
        position: "top-center",
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" }
      });
    }
  };

  // ESTADO 1: CARGANDO (Mismo fondo naranja/azul)
  if (isValidating) {
    return <div className="min-vh-100" style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}></div>;
  }

  // ESTADO 2: ENLACE EXPIRADO O INVÁLIDO
  if (isExpired) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative" style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}> 
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent animate__animated animate__zoomIn" style={{ maxWidth: '450px', width: '100%' }}>
          
          <div 
            className="p-2 text-center text-white"
            style={{ 
              backgroundColor: "#fd7e14", // Cabecera Naranja
              borderBottom: "4px solid #0f172a" // Línea Azul
            }}
          >
            <img 
              src="/imagenes/logo-mvc.png" // Logo del torneo
              alt="Logo Torneo Padel" 
              style={{ height: '60px', objectFit: 'contain' }}
              className="mb-1 drop-shadow"
            />
            <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
              <h3 className="fw-bold m-0 text-white">Restablecer Acceso</h3>
              <KeyRound size={26} className="text-white" />
            </div>
          </div>

          <div className="card-body p-4 p-md-5 bg-white text-center">
            <AlertTriangle size={50} className="mb-3 text-danger mx-auto" />
            <h4 className="fw-bold text-dark mb-3">Enlace Expirado</h4>
            <p className="text-muted mb-4 fw-medium small">
              Por motivos de seguridad, los enlaces de recuperación solo son válidos por 10 minutos o para un único uso.
            </p>
            <Link to="/forgot-password" className="btn w-100 py-2 fw-bold shadow-sm rounded-3 text-white" style={{ backgroundColor: "#0f172a" }}>
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 3: FORMULARIO ACTIVO
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative" style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}>
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent animate__animated animate__fadeIn" style={{ maxWidth: '450px', width: '100%' }}>
        
        <div 
          className="p-2 text-center text-white"
          style={{ 
            backgroundColor: "#fd7e14", // Cabecera Naranja
            borderBottom: "4px solid #0f172a" // Línea Azul
          }}
        >
          <img 
            src="/imagenes/logo-mvc.png" // Logo del torneo
            alt="Logo Torneo Padel" 
            style={{ height: '60px', objectFit: 'contain' }}
            className="mb-1 drop-shadow"
          />
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <h3 className="fw-bold m-0 text-white">Nueva Contraseña</h3>
            <KeyRound size={26} className="text-white" />
          </div>
        </div>
        
        <div className="card-body p-4 p-md-5 bg-white">
          <p className="text-center text-muted mb-4 fw-medium small">
            Ingresá y confirmá tu nueva contraseña para recuperar el acceso a tu cuenta.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            
            <div className="mb-3">
              <label className="form-label text-secondary fw-semibold">Nueva contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={30}
                  className={`form-control bg-light border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-start-0 cursor-pointer text-muted" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && <div className="invalid-feedback d-block fw-medium text-danger">{errors.password.message}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold">Repetir contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={30}
                  className={`form-control bg-light border-start-0 border-end-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-start-0 cursor-pointer text-muted" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.confirmPassword && <div className="invalid-feedback d-block fw-medium text-danger">{errors.confirmPassword.message}</div>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn w-100 py-2 fw-bold shadow-sm text-white rounded-3 d-flex justify-content-center align-items-center gap-2"
              style={{ backgroundColor: "#0f172a", border: "none" }} // Botón Azul Oscuro
            >
              {isSubmitting ? (
                <><Loader2 size={18} className="animate-spin" /> Guardando...</>
              ) : (
                "Cambiar Contraseña"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;