// src/components/StaffModal/CreateStaffForm.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";

import { createStaffSchema } from "../../schemas/staff.schema.js"; 
import { useStaff } from "../../context/StaffContext.jsx";

const CreateStaffForm = ({ onClose }) => {
  const { createNewStaff, errors: contextErrors } = useStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [pendingData, setPendingData] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createStaffSchema),
    defaultValues: { role: 'STAFF' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await createNewStaff(data);
    setIsSubmitting(false);

    if (result.requireConfirmation) {
      setConfirmMessage(result.message);
      setPendingData(data); 
      setShowConfirmAlert(true); 
      return;
    }

    if (result.success) {
      toast.success(result.message || "¡Staff guardado exitosamente!", {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      onClose(); 
    }
  };

  const handleConfirmReactivation = async () => {
    setShowConfirmAlert(false);
    setIsSubmitting(true);
    const dataWithConfirmation = { ...pendingData, confirmarReactivacion: true };
    const result = await createNewStaff(dataWithConfirmation);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      onClose();
    }
  };

  return (
    <div className="animate__animated animate__fadeIn position-relative">
      
      {showConfirmAlert && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
          <div className="card border-warning shadow-lg text-center p-4 animate__animated animate__zoomIn" style={{ maxWidth: '400px' }}>
            <AlertCircle size={48} className="text-warning mx-auto mb-3" />
            <h5 className="fw-bold text-dark mb-2">¡Atención!</h5>
            <p className="text-secondary small mb-4">{confirmMessage}</p>
            <div className="d-flex justify-content-center gap-3">
              <button type="button" className="btn btn-light border fw-bold" onClick={() => setShowConfirmAlert(false)}>Cancelar</button>
              {/* Botón Azul para confirmar reactivación */}
              <button type="button" className="btn fw-bold text-white shadow-sm" style={{ backgroundColor: "#0f172a" }} onClick={handleConfirmReactivation}>Sí, reactivar</button>
            </div>
          </div>
        </div>
      )}

      {/* Cartel informativo Azul */}
      <div className="alert border-0 text-white small mb-4 d-flex align-items-center justify-content-center gap-2 text-center shadow-sm opacity-75" style={{ backgroundColor: "#0f172a" }}>
        <Mail size={16} />
        <span>El staff ingresará con su correo y su <b>DNI como contraseña por defecto.</b></span>
      </div>

      {contextErrors && contextErrors.length > 0 && (
        <div className="alert text-center p-3 mb-4 shadow-sm rounded-3 bg-danger bg-opacity-10 text-danger border-0">
          {contextErrors.map((err, index) => <div key={index} className="fw-bold small">{err}</div>)}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label className="form-label text-secondary fw-semibold small">Nombre</label>
            <input type="text" className={`form-control bg-white ${errors.firstName ? 'is-invalid' : ''}`} {...register("firstName")} />
            {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label text-secondary fw-semibold small">Apellido</label>
            <input type="text" className={`form-control bg-white ${errors.lastName ? 'is-invalid' : ''}`} {...register("lastName")} />
            {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName.message}</div>}
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label className="form-label text-secondary fw-semibold small">DNI</label>
            <input type="text" className={`form-control bg-white ${errors.dni ? 'is-invalid' : ''}`} {...register("dni")} />
            {errors.dni && <div className="invalid-feedback d-block">{errors.dni.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label text-secondary fw-semibold small">Email</label>
            <input type="email" className={`form-control bg-white ${errors.email ? 'is-invalid' : ''}`} {...register("email")} />
            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold text-dark d-block">Rol en el Sistema</label>
          <div className="d-flex gap-3">
            <div className="form-check border p-3 rounded-3 flex-fill bg-white cursor-pointer">
              <input className="form-check-input cursor-pointer" type="radio" value="STAFF" id="roleStaff" {...register("role")} />
              <label className="form-check-label ms-2 fw-medium cursor-pointer" htmlFor="roleStaff">Staff</label>
            </div>
            <div className="form-check border p-3 rounded-3 flex-fill bg-white cursor-pointer">
              <input className="form-check-input cursor-pointer" type="radio" value="ADMIN" id="roleAdmin" {...register("role")} />
              <label className="form-check-label ms-2 fw-medium cursor-pointer" htmlFor="roleAdmin">Administrador</label>
            </div>
          </div>
        </div>

        {/* Botón Principal Azul Oscuro */}
        <button type="submit" disabled={isSubmitting} className="btn w-100 py-3 fw-bold shadow-sm text-white rounded-3" style={{ backgroundColor: "#0f172a", border: "none" }}>
          {isSubmitting ? "Procesando..." : "Guardar Staff"}
        </button>
      </form>
    </div>
  );
};

export default CreateStaffForm;