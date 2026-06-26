import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { changePasswordSchema, changeEmailSchema } from "../../schemas/auth.schema.js";
import { Lock, Mail, Loader2, Eye, EyeOff } from "lucide-react";

const SecuritySettingsForm = () => {
  const { user, changeUserPassword, changeUserEmail } = useAuth();
  
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [showEmailPass, setShowEmailPass] = useState(false);

  // --- FORM 1: CONTRASEÑA ---
  const { register: registerPass, handleSubmit: handleSubmitPass, reset: resetPassForm, formState: { errors: passErrors } } = useForm({
    resolver: zodResolver(changePasswordSchema)
  });

  // --- FORM 2: CORREO ELECTRÓNICO ---
  const { register: registerEmail, handleSubmit: handleSubmitEmail, reset: resetEmailForm, formState: { errors: emailErrors } } = useForm({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: user?.email || "" } 
  });

  const onSubmitPassword = async (data) => {
    setIsChangingPass(true);
    const result = await changeUserPassword(data);
    if (result.success) {
      toast.success(result.message, { position: "top-center", style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
      resetPassForm(); setShowCurrentPass(false); setShowNewPass(false); setShowConfirmPass(false);
    } else {
      toast.error(result.message, { position: "top-center", style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } });
    }
    setIsChangingPass(false);
  };

  const onSubmitEmail = async (data) => {
    if (data.newEmail === user.email) {
      return toast("Ese ya es tu correo actual", { 
        icon: "⚠️", 
        position: "top-center", 
        style: { background: "#fef08a", color: "#854d0e", fontWeight: "bold" } 
      });
    }

    const confirmation = await Swal.fire({
      title: '⚠️ ADVERTENCIA CRÍTICA',
      html: `Estás a punto de cambiar tu correo a:<br><br><b>${data.newEmail}</b><br><br>Si alguna vez olvidás tu contraseña, este correo será la ÚNICA forma de recuperarla. Si es falso o está mal escrito, <b>PERDERÁS EL ACCESO PARA SIEMPRE</b>.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#eab308', 
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, estoy 100% seguro',
      cancelButtonText: 'Cancelar',
      background: '#fff3cd', 
      color: '#664d03' 
    });

    if (!confirmation.isConfirmed) return;

    setIsChangingEmail(true);
    const result = await changeUserEmail(data);
    
    if (result.success) {
      toast.success(result.message, { position: "top-center", style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
      resetEmailForm({ newEmail: data.newEmail });
      setShowEmailPass(false);
    } else {
      toast.error(result.message, { position: "top-center", style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } });
    }
    setIsChangingEmail(false);
  };

  return (
    <>
      {/* Bloque Correo */}
      <div className="mb-5">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><Mail size={20} className="text-secondary" /> Cambiar Correo Electrónico</h5>
        <form className="p-3 bg-light rounded-4 border" onSubmit={handleSubmitEmail(onSubmitEmail)}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">Nuevo Correo Electrónico</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Mail size={18} className="text-muted" /></span>
                <input type="email" maxLength={80} className={`form-control bg-white border-start-0 ${emailErrors.newEmail ? 'is-invalid' : ''}`} placeholder="ejemplo@correo.com" {...registerEmail("newEmail")} />
                {emailErrors.newEmail && <div className="invalid-feedback d-block fw-medium text-danger">{emailErrors.newEmail.message}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">Contraseña Actual (Por seguridad)</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted" /></span>
                <input type={showEmailPass ? "text" : "password"} maxLength={30} className={`form-control bg-white border-start-0 border-end-0 ${emailErrors.currentPassword ? 'is-invalid' : ''}`} placeholder="Ingresá tu contraseña" {...registerEmail("currentPassword")} />
                <button type="button" className="input-group-text bg-white border-start-0 cursor-pointer text-muted" onClick={() => setShowEmailPass(!showEmailPass)}>{showEmailPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                {emailErrors.currentPassword && <div className="invalid-feedback d-block fw-medium text-danger">{emailErrors.currentPassword.message}</div>}
              </div>
            </div>
            <div className="col-12 text-end mt-3">
              {/* Botón Naranja */}
              <button type="submit" disabled={isChangingEmail} className="btn btn-sm rounded-3 px-3 fw-bold d-inline-flex align-items-center gap-2 text-white" style={{ backgroundColor: "#0f172a", border: "none" }}>
                {isChangingEmail ? <><Loader2 size={16} className="animate-spin" /> Verificando...</> : "Actualizar Correo"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Bloque Contraseña */}
      <div className="mb-5">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2"><Lock size={20} className="text-secondary" /> Cambiar Contraseña</h5>
        <form className="p-3 bg-light rounded-4 border" onSubmit={handleSubmitPass(onSubmitPassword)}>
          <div className="row g-3">
            <div className="col-md-12">
              <label className="form-label small fw-bold text-muted">Contraseña Actual</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted" /></span>
                <input type={showCurrentPass ? "text" : "password"} maxLength={30} className={`form-control bg-white border-start-0 border-end-0 ${passErrors.currentPassword ? 'is-invalid' : ''}`} placeholder="••••••••" {...registerPass("currentPassword")} />
                <button type="button" className="input-group-text bg-white border-start-0 cursor-pointer text-muted" onClick={() => setShowCurrentPass(!showCurrentPass)}>{showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                {passErrors.currentPassword && <div className="invalid-feedback d-block fw-medium text-danger">{passErrors.currentPassword.message}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">Nueva Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted" /></span>
                <input type={showNewPass ? "text" : "password"} maxLength={30} className={`form-control bg-white border-start-0 border-end-0 ${passErrors.newPassword ? 'is-invalid' : ''}`} placeholder="••••••••" {...registerPass("newPassword")} />
                <button type="button" className="input-group-text bg-white border-start-0 cursor-pointer text-muted" onClick={() => setShowNewPass(!showNewPass)}>{showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                {passErrors.newPassword && <div className="invalid-feedback d-block fw-medium text-danger">{passErrors.newPassword.message}</div>}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">Repetir Nueva Contraseña</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted" /></span>
                <input type={showConfirmPass ? "text" : "password"} maxLength={30} className={`form-control bg-white border-start-0 border-end-0 ${passErrors.confirmNewPassword ? 'is-invalid' : ''}`} placeholder="••••••••" {...registerPass("confirmNewPassword")} />
                <button type="button" className="input-group-text bg-white border-start-0 cursor-pointer text-muted" onClick={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                {passErrors.confirmNewPassword && <div className="invalid-feedback d-block fw-medium text-danger">{passErrors.confirmNewPassword.message}</div>}
              </div>
            </div>
            <div className="col-12 text-end mt-3">
              {/* Botón Azul Oscuro */}
              <button type="submit" disabled={isChangingPass} className="btn btn-sm rounded-3 px-3 fw-bold d-inline-flex align-items-center gap-2 text-white" style={{ backgroundColor: "#0f172a", border: "none" }}>
                {isChangingPass ? <><Loader2 size={16} className="animate-spin" /> Actualizando...</> : "Actualizar Contraseña"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default SecuritySettingsForm;