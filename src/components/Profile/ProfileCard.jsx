import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import { ShieldCheck, CreditCard, Mail, User } from "lucide-react";
import ProfileImageCropper from "../Profile/ProfileImageCropper";

const ProfileCard = () => {
  const { user, changeProfileImage } = useAuth();
  const [preview, setPreview] = useState(user?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png");

  const handleImageCropped = async (croppedBlob, croppedUrl) => {
    setPreview(croppedUrl);
    
    Swal.fire({
      title: 'Actualizando foto de perfil',
      html: 'Guardando imagen en el servidor, por favor esperá...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const formData = new FormData();
    formData.append("profileImage", croppedBlob, "profile.jpg");

    const result = await changeProfileImage(formData);

    Swal.close();

    if (result.success) {
      toast.success(result.message, { position: "top-center", style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
    } else {
      toast.error(result.message, { position: "top-center" });
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
      {/* Cabecera Azul Oscuro */}
      <div style={{ height: "100px", backgroundColor: "#0f172a" }}></div>
      <div className="card-body text-center position-relative pt-0">
        
        <ProfileImageCropper currentImage={preview} onImageCropped={handleImageCropped} />
        
        <h4 className="fw-bold mt-3 mb-1">{user?.firstName} {user?.lastName}</h4>
        
        {/* Etiqueta Naranja */}
        <span className="badge px-3 py-2 rounded-pill mb-3 text-white bg-dark opacity-50">
          <ShieldCheck size={14} className="me-1" /> Rol: {user?.role}
        </span>
        
        <hr className="text-secondary opacity-25" />
        <div className="text-start mt-4">
          <p className="text-muted small mb-1 text-uppercase fw-bold">Documento</p>
          <p className="d-flex align-items-center gap-2 fw-medium"><CreditCard size={18} className="text-secondary" /> {user?.dni || "No registrado"}</p>
          <p className="text-muted small mb-1 mt-3 text-uppercase fw-bold">Correo Electrónico</p>
          <p className="d-flex align-items-center gap-2 fw-medium text-break"><Mail size={18} className="text-secondary" /> {user?.email}</p>
          <p className="text-muted small mb-1 mt-3 text-uppercase fw-bold">Miembro desde</p>
          <p className="d-flex align-items-center gap-2 fw-medium text-break"><User size={18} className="text-secondary" /> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-AR') : "Fecha desconocida"}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;