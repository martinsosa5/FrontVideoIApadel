// src/pages/Profile.jsx
import { useState } from "react";
import { User } from "lucide-react";
import ProfileCard from "../components/Profile/ProfileCard";
import PersonalDataForm from "../components/Profile/PersonalDataForm";
import SecuritySettingsForm from "../components/Profile/SecuritySettingsForm";

const Profile = () => {
  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("activeTab") || "personales");
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("activeTab", tab);
  };

  return (
    <div className="container-fluid animate__animated animate__fadeIn">
      <h3 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
        {/* Ícono Naranja */}
        <User size={28} style={{ color: "#fd7e14" }} /> Mi Perfil
      </h3>

      <div className="row g-4">
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="col-12 col-lg-4">
          <ProfileCard />
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            
            <div className="card-header bg-white border-bottom-0 pt-3 pb-0 px-4">
              <ul className="nav nav-underline fw-bold">
                <li className="nav-item">
                  <button 
                    className={`nav-link pb-3 px-3 ${activeTab === "personales" ? "active" : "text-muted"}`} 
                    // Estilos de la pestaña activa: Texto Azul Oscuro, Línea Naranja
                    style={activeTab === "personales" ? { color: "#0f172a", borderBottomColor: "#fd7e14", borderBottomWidth: "3px" } : {}}
                    onClick={() => handleTabChange("personales")}
                  >
                    Datos Personales
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link pb-3 px-3 ${activeTab === "seguridad" ? "active" : "text-muted"}`} 
                    style={activeTab === "seguridad" ? { color: "#0f172a", borderBottomColor: "#fd7e14", borderBottomWidth: "3px" } : {}}
                    onClick={() => handleTabChange("seguridad")}
                  >
                    Seguridad y Accesos
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-4">
              {/* PESTAÑA DATOS PERSONALES */}
              <div className={`animate__animated animate__fadeIn animate__faster ${activeTab === "personales" ? "d-block" : "d-none"}`}>
                <PersonalDataForm />
              </div>

              {/* PESTAÑA SEGURIDAD */}
              <div className={`animate__animated animate__fadeIn animate__faster ${activeTab === "seguridad" ? "d-block" : "d-none"}`}>
                <SecuritySettingsForm />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;