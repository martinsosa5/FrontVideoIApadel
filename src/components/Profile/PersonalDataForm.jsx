import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { updateProfileSchema } from "../../schemas/auth.schema.js";
import { Phone, MapPin, Loader2 } from "lucide-react";

const PersonalDataForm = () => {
  const { user, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "", lastName: user?.lastName || "",
      phone: user?.personalInfo?.phone || "", address: user?.personalInfo?.address || "",
    }
  });

  const onSubmitPersonalData = async (data) => {
    setIsUpdating(true);
    const result = await updateUserProfile(data);
    if (result.success) toast.success(result.message, { position: "top-center", style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
    else toast.error("Hubo un error al actualizar los datos.");
    setIsUpdating(false);
  };

  return (
    <>
      <h5 className="fw-bold mb-4">Actualizar Información</h5>
      <form onSubmit={handleSubmit(onSubmitPersonalData)}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label fw-medium">Nombre</label>
            <input type="text" maxLength={50} className={`form-control rounded-3 ${errors.firstName ? 'is-invalid' : ''}`} {...register("firstName")} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') }} />
            {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium">Apellido</label>
            <input type="text" maxLength={50} className={`form-control rounded-3 ${errors.lastName ? 'is-invalid' : ''}`} {...register("lastName")} onInput={(e) => { e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') }} />
            {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium"><Phone size={16} className="me-1 text-secondary" /> Teléfono</label>
            <input type="text" maxLength={15} placeholder="Ej: 3811234567" className={`form-control rounded-3 ${errors.phone ? 'is-invalid' : ''}`} {...register("phone")} onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, '') }} />
            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label fw-medium"><MapPin size={16} className="me-1 text-secondary" /> Dirección</label>
            <input type="text" maxLength={100} placeholder="Calle, Barrio..." className={`form-control rounded-3 ${errors.address ? 'is-invalid' : ''}`} {...register("address")} />
            {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
          </div>
        </div>
        <div className="mt-4 text-end">
          {/* Botón Naranja */}
          <button type="submit" disabled={isUpdating} className="btn rounded-3 px-4 fw-bold d-inline-flex align-items-center gap-2 text-white" style={{ backgroundColor: "#0f172a", border: "none" }}>
            {isUpdating ? <><Loader2 size={18} className="animate-spin" /> Actualizando...</> : <> Actualizar Información</>}
          </button>
        </div>
      </form>
    </>
  );
};

export default PersonalDataForm;