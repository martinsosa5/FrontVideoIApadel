import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus, UserCog, ShieldAlert, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { createPlayerSchema } from "../../schemas/player.schema";
import { usePlayers } from "../../context/PlayerContext";
import ProfileImageCropper from "../Profile/ProfileImageCropper"; 

const PlayerModal = ({ player, onClose }) => {
  const { createNewPlayer, updateExistingPlayer, toggleStatus } = usePlayers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!player;

  const [previewImage, setPreviewImage] = useState(player?.profileImage || "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg");
  
  // 🔥 Nuevo estado para guardar el archivo físico (Blob)
  const [imageBlob, setImageBlob] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: isEditing ? {
      firstName: player.firstName,
      lastName: player.lastName,
      dni: player.dni,
      email: player.email || "",
      phone: player.phone || "",
      birthDate: player.birthDate ? new Date(player.birthDate).toISOString().split('T')[0] : "",
      category: player.category,
      position: player.position || "Ambos",
      gender: player.gender || "Masculino",
    } : {
      position: "Ambos",
      gender: "Masculino",
      category: "7ma",
      birthDate: "",
    }
  });

  const handleImageCropped = (croppedBlob, croppedUrl) => {
    setPreviewImage(croppedUrl); 
    // 🔥 Guardamos el archivo físico, ya no lo pasamos a Base64
    setImageBlob(croppedBlob); 
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    let result;

    // 🔥 ARMAMOS EL PAQUETE FORMDATA
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("dni", data.dni);
    formData.append("email", data.email || "");
    formData.append("phone", data.phone || "");
    formData.append("birthDate", data.birthDate || "");
    formData.append("category", data.category);
    formData.append("position", data.position || "Ambos");
    formData.append("gender", data.gender || "Masculino");

    // Si el usuario subió/recortó una foto nueva, la adjuntamos como archivo
    if (imageBlob) {
      formData.append("profileImage", imageBlob, "profile.jpg");
    }

    if (isEditing) {
      result = await updateExistingPlayer(player._id, formData);
    } else {
      result = await createNewPlayer(formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      onClose();
    } else {
      toast.error(result.message, {
        position: "top-center",
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" }
      });
    }
  };

  const handleToggleStatus = async () => {
    const isActivating = !player.isActive;
    
    const confirmation = await Swal.fire({
      title: isActivating ? '✅ ACTIVAR JUGADOR' : '⚠️ ADVERTENCIA',
      html: isActivating 
        ? `¿Estás seguro de que querés volver a <b>activar</b> a este jugador?<br><br>A partir de ahora podrá volver a ser inscripto en los torneos.`
        : `¿Estás seguro de que querés <b>dar de baja</b> a este jugador?<br><br>Ya no podrá ser inscripto en nuevos torneos, pero su historial y estadísticas quedarán intactos.`,
      icon: isActivating ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isActivating ? '#166534' : '#eab308', 
      cancelButtonColor: '#6c757d',
      confirmButtonText: isActivating ? 'Sí, activar' : 'Sí, dar de baja',
      cancelButtonText: 'Cancelar',
      background: isActivating ? '#dcfce7' : '#fff3cd', 
      color: isActivating ? '#166534' : '#664d03' 
    });

    if (!confirmation.isConfirmed) return;
    
    setIsSubmitting(true);
    const result = await toggleStatus(player._id, !player.isActive);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      onClose();
    } else {
      toast.error(result.message, {
        position: "top-center",
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" }
      });
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                {isEditing ? <UserCog size={22} /> : <UserPlus size={22} />}
                {isEditing ? "Editar Jugador" : "Nuevo Jugador"}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isSubmitting}></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <form onSubmit={handleSubmit(onSubmit)}>
                
                <div className="d-flex justify-content-center mb-2 pt-4">
                  <ProfileImageCropper 
                    currentImage={previewImage} 
                    onImageCropped={handleImageCropped} 
                  />
                </div>

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Datos Personales</h6>
                <div className="row mb-3">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-semibold small">Nombre *</label>
                    <input type="text" className={`form-control bg-white ${errors.firstName ? 'is-invalid' : ''}`} {...register("firstName")} />
                    {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName.message}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold small">Apellido *</label>
                    <input type="text" className={`form-control bg-white ${errors.lastName ? 'is-invalid' : ''}`} {...register("lastName")} />
                    {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName.message}</div>}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-semibold small">DNI *</label>
                    <input type="text" className={`form-control bg-white ${errors.dni ? 'is-invalid' : ''}`} {...register("dni")} />
                    {errors.dni && <div className="invalid-feedback d-block">{errors.dni.message}</div>}
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-semibold small">Teléfono</label>
                    <input type="text" className={`form-control bg-white ${errors.phone ? 'is-invalid' : ''}`} {...register("phone")} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-secondary fw-semibold small">Email</label>
                    <input type="email" className={`form-control bg-white ${errors.email ? 'is-invalid' : ''}`} {...register("email")} />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-4">
                    <label className="form-label text-secondary fw-semibold small">Fecha de Nac. *</label>
                    <input type="date" className={`form-control bg-white ${errors.birthDate ? 'is-invalid' : ''}`} {...register("birthDate")} />
                    {errors.birthDate && <div className="invalid-feedback d-block">{errors.birthDate.message}</div>}
                  </div>
                </div>

                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Perfil Deportivo</h6>
                <div className="row mb-4">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-semibold small">Categoría *</label>
                    <select className={`form-select bg-white ${errors.category ? 'is-invalid' : ''}`} {...register("category")}>
                      <option value="">Seleccionar...</option>
                      <option value="1ra">1ra Categoría</option>
                      <option value="2da">2da Categoría</option>
                      <option value="3ra">3ra Categoría</option>
                      <option value="4ta">4ta Categoría</option>
                      <option value="5ta">5ta Categoría</option>
                      <option value="6ta">6ta Categoría</option>
                      <option value="7ma">7ma Categoría</option>
                      <option value="8va">8va Categoría</option>
                      <option value="Principiantes">Principiantes</option>
                      <option value="Suma 13">Suma 13</option>
                    </select>
                    {errors.category && <div className="invalid-feedback d-block">{errors.category.message}</div>}
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <label className="form-label text-secondary fw-semibold small">Posición</label>
                    <select className="form-select bg-white" {...register("position")}>
                      <option value="Drive">Drive (Derecha)</option>
                      <option value="Revés">Revés (Izquierda)</option>
                      <option value="Ambos">Ambos lados</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-secondary fw-semibold small">Género *</label>
                    <select className="form-select bg-white" {...register("gender")}>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  
                  <div>
                    {isEditing && (
                      <button 
                        type="button" 
                        onClick={handleToggleStatus}
                        disabled={isSubmitting}
                        className={`btn btn-sm fw-bold d-flex align-items-center gap-1 ${player.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      >
                        {player.isActive ? <><ShieldAlert size={16}/> Dar de Baja</> : <><ShieldCheck size={16}/> Activar Jugador</>}
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-light border fw-bold text-secondary" onClick={onClose} disabled={isSubmitting}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn fw-bold text-white shadow-sm px-4" style={{ backgroundColor: "#0f172a" }} disabled={isSubmitting}>
                      {isSubmitting ? "Guardando..." : "Guardar Jugador"}
                    </button>
                  </div>

                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerModal;