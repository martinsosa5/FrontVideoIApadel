// src/pages/ForgotPassword.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, ArrowLeft } from "lucide-react"; 
import toast from "react-hot-toast";
import Swal from "sweetalert2"; 
import { forgotPasswordSchema } from "../schemas/auth.schema";
import { requestPasswordReset } from "../services/auth.service";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    Swal.fire({
      title: 'Enviando correo',
      html: 'Por favor esperá, estamos preparando las instrucciones...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await requestPasswordReset(data.email);
      Swal.close();
      
      toast.success(response.message || "¡Instrucciones enviadas! Revisá tu correo.", { 
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      
      reset(); 

      setTimeout(() => {
        // 🔥 CORRECCIÓN: Ruta actualizada al login del torneo
        navigate("/admin/staff/login", { replace: true });
      }, 3000);

    } catch (err) {
      Swal.close(); 
      const errorMessage = err.response?.data?.message || "Error al enviar las instrucciones.";
      toast.error(errorMessage, { 
        position: "top-center",
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } 
      });
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3"
      // Gradiente actualizado: Naranja a Azul Oscuro
      style={{ background: "linear-gradient(135deg, rgb(183, 203, 248) 20%, #fd7e14 100%)" }}
    >
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent animate__animated animate__fadeIn" style={{ maxWidth: '450px', width: '100%' }}>
        
        <div 
          className="p-2 text-center text-white"
          style={{ 
            backgroundColor: "#fd7e14", // Cabecera Naranja
            borderBottom: "4px solid #0f172a" // Línea inferior Azul
          }}
        >
          <img 
            src="/imagenes/logo-mvc.png" // Logo del Torneo
            alt="Logo Torneo Padel" 
            style={{ height: '60px', objectFit: 'contain' }}
            className="mb-1 drop-shadow"
          />
          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
            <h3 className="fw-bold m-0 text-white">Recuperar Contraseña</h3>
            <KeyRound size={26} className="text-white" />
          </div>
        </div>
        
        <div className="card-body p-4 p-md-5 bg-white">
          <p className="text-center text-muted mb-4 fw-medium small">
            Ingresá tu correo y te enviaremos un enlace seguro para que puedas elegir una nueva contraseña.
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
            
            <div className="mb-4">
              <label className="form-label text-secondary fw-semibold">Email Registrado</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Mail size={18} className="text-muted" />
                </span>
                <input
                  type="email"
                  maxLength={80}
                  className={`form-control bg-light border-start-0 ${errors.email ? "is-invalid" : ""}`}
                  placeholder="nombre@gmail.com"
                  disabled={isSubmitting} 
                  {...register("email")}
                />
                {errors.email && <div className="invalid-feedback d-block fw-medium text-danger">{errors.email.message}</div>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="btn w-100 py-2 mb-4 fw-bold shadow-sm text-white rounded-3 d-flex justify-content-center align-items-center gap-2"
              style={{ backgroundColor: "#0f172a", border: "none" }} // Botón Azul Oscuro
            >
              {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
            </button>

            <hr className="text-secondary opacity-25 mb-3" />
            <div className="text-center">
              <p className="small text-muted mb-0">
                ¿Recordaste tu contraseña? <br/>
                {/* 🔥 CORRECCIÓN: Ruta actualizada al login del torneo */}
                <Link to="/admin/staff/login" className="text-decoration-none fw-bold mt-1 d-inline-block" style={{ color: "#0f172a" }}>
                  <ArrowLeft size={14} className="me-1" /> Volver al Login
                </Link>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;