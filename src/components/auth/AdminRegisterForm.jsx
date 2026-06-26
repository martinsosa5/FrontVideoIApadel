// src/components/auth/AdminRegisterForm.jsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, CreditCard, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react"; 
import toast from "react-hot-toast";

import { registerSchema } from "../../schemas/auth.schema.js";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const { signup, errors: registerErrors } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (registerErrors && registerErrors.length > 0) {
      registerErrors.forEach((error) => {
        toast.error(error, {
          position: "top-center",
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold", border: "1px solid #f87171" },
        });
      });
      setIsSubmitting(false); 
    }
  }, [registerErrors]);

  const onSubmit = handleSubmit(async (values) => {
    const { confirmPassword, ...dataToBackend } = values;
    setIsSubmitting(true);

    try {
      const isSuccess = await signup(dataToBackend);
      if (isSuccess) {
        toast.success("¡Administrador registrado con éxito! Redirigiendo...", {
          duration: 4000,
          position: "top-center",
          style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" },
        });

        setTimeout(() => {
          navigate("/admin/staff/login"); 
        }, 3000);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-transparent animate__animated animate__fadeIn">
      
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
        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
          <h3 className="fw-bold m-0 text-white">Registro Admin</h3>
          <UserPlus size={26} />
        </div>
      </div>

      <div className="card-body p-4 p-md-5 bg-white">
        <form onSubmit={onSubmit}>
          <div className="row mb-3">
            <div className="col-md-6 mb-3 mb-md-0">
              <label className="form-label text-secondary fw-semibold">Nombre</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className={`form-control bg-light border-start-0 ${errors.firstName ? "is-invalid" : ""}`}
                  placeholder="Ej: Martín"
                  maxLength={50}
                  onInput={(e) => { e.target.value = e.target.value.replace(/[0-9]/g, ""); }}
                  {...register("firstName")}
                />
                {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label text-secondary fw-semibold">Apellido</label>
              <input
                type="text"
                className={`form-control bg-light ${errors.lastName ? "is-invalid" : ""}`}
                placeholder="Ej: Pérez"
                maxLength={50}
                onInput={(e) => { e.target.value = e.target.value.replace(/[0-9]/g, ""); }}
                {...register("lastName")}
              />
              {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary fw-semibold">DNI</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <CreditCard size={18} className="text-muted" />
              </span>
              <input
                type="text"
                className={`form-control bg-light border-start-0 ${errors.dni ? "is-invalid" : ""}`}
                placeholder="Sin puntos ni espacios"
                maxLength={8}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }}
                {...register("dni")}
              />
              {errors.dni && <div className="invalid-feedback d-block">{errors.dni.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary fw-semibold">Correo Electrónico</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Mail size={18} className="text-muted" />
              </span>
              <input
                type="email"
                className={`form-control bg-light border-start-0 ${errors.email ? "is-invalid" : ""}`}
                placeholder="admin@torneo.com"
                maxLength={100}
                {...register("email")}
              />
              {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6 mb-3 mb-md-0">
              <label className="form-label text-secondary fw-semibold">Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control bg-light border-start-0 border-end-0 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Mínimo 8 caracteres"
                  maxLength={30}
                  {...register("password")}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-start-0 cursor-pointer" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} className="text-muted"/> : <Eye size={18} className="text-muted"/>}
                </button>
                {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label text-secondary fw-semibold">Repetir Contraseña</label>
              <div className="input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`form-control bg-light border-end-0 ${errors.confirmPassword ? "is-invalid" : ""}`}
                  placeholder="Repite tu contraseña"
                  maxLength={30}
                  {...register("confirmPassword")}
                />
                <button 
                  type="button" 
                  className="input-group-text bg-light border-start-0 cursor-pointer" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} className="text-muted"/> : <Eye size={18} className="text-muted"/>}
                </button>
                {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword.message}</div>}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn w-100 py-2 fw-bold shadow-sm mt-2 d-flex align-items-center justify-content-center gap-2 text-white"
            style={{ backgroundColor: "#0f172a", border: "none" }} // Botón Azul Oscuro
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin" /> Registrando...</>
            ) : (
              "Crear Cuenta Administrativa"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminRegisterForm;