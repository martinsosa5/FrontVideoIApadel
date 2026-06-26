import React from "react";
import { ChevronRight } from "lucide-react";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const GroupCard = ({ group, onClick }) => {
  return (
    <div 
      className="card border shadow-sm h-100 rounded-4 bg-white"
      style={{ cursor: "pointer" }}
      onClick={() => onClick(group)}
    >
      {/* 🔥 Cabecera del Grupo: Ahora en Naranja */}
      <div className="card-header border-bottom-0 pt-3 pb-3 px-4 rounded-top-4" style={{ backgroundColor: "#0f172a" }}>
        <h5 className="fw-bold text-white m-0 text-center">
          {group.name}
        </h5>
      </div>
      
      {/* Cuerpo: Listado de parejas con fotos */}
      <div className="card-body p-4">
        <div className="d-flex flex-column gap-3">
          {group.teams?.map((team, index) => (
            <div key={team._id || index} className="d-flex align-items-center border p-2 rounded-3 shadow-sm bg-white">
              
              {/* Número del equipo en GRIS, MÁS GRANDE y sin fondo */}
              <div 
                className="fw-bold text-secondary text-center flex-shrink-0 ms-1 me-3" 
                style={{ width: "20px", fontSize: "1.2rem" }}
              >
                {index + 1}
              </div>
              
              {/* Avatares Solapados */}
              <div className="d-flex align-items-center me-3 flex-shrink-0">
                <img 
                  src={team.player1?.profileImage || DEFAULT_AVATAR} 
                  alt="P1" 
                  className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" 
                  style={{ width: "36px", height: "36px", zIndex: 2 }} 
                />
                <img 
                  src={team.player2?.profileImage || DEFAULT_AVATAR} 
                  alt="P2" 
                  className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" 
                  style={{ width: "36px", height: "36px", marginLeft: "-14px", zIndex: 1 }} 
                />
              </div>
              
              {/* 🔥 Nombre de los Jugadores Formato Profesional */}
              <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                <div className="text-truncate">
                  <span className="fw-bold text-dark text-uppercase">{team.player1?.lastName}</span> <span className="text-dark">{team.player1?.firstName}</span>
                </div>
                <div className="text-truncate" style={{ marginTop: "2px" }}>
                  <span className="fw-bold text-dark text-uppercase">{team.player2?.lastName}</span> <span className="text-dark">{team.player2?.firstName}</span>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer Blanco Centrado */}
      <div className="card-footer bg-white border-top pb-3 pt-3 px-4 text-center rounded-bottom-4">
        <span className="fw-bold small d-flex align-items-center justify-content-center gap-1 w-100" style={{ color: "#fd7e14" }}>
          Ver detalles y partidos <ChevronRight size={16} />
        </span>
      </div>
    </div>
  );
};

export default GroupCard;