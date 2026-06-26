import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const PublicMatchCard = ({ match }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case "En Curso": return "bg-success text-white"; 
      case "Finalizado": return "bg-danger text-white";
      case "W.O.": return "bg-dark text-white";
      default: return "bg-warning text-dark"; 
    }
  };

  const renderTeam = (team) => {
    if (!team) return <span className="text-muted fw-bold">Por definir</span>;
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="d-flex align-items-center flex-shrink-0">
          <img src={team.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm" style={{ width: "32px", height: "32px", zIndex: 2 }} />
          <img src={team.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm" style={{ width: "32px", height: "32px", marginLeft: "-12px", zIndex: 1 }} />
        </div>
        <div className="d-flex flex-column text-start" style={{ lineHeight: "1.1", fontSize: "0.80rem" }}>
          <div className="text-truncate" style={{ maxWidth: "130px" }}>
            <span className="fw-bold text-dark text-uppercase">{team.player1?.lastName}</span> <span className="text-dark">{team.player1?.firstName}</span>
          </div>
          <div className="text-truncate" style={{ marginTop: "2px", maxWidth: "130px" }}>
            <span className="fw-bold text-dark text-uppercase">{team.player2?.lastName}</span> <span className="text-dark">{team.player2?.firstName}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: "#0f172a", color: "white" }}>
        <div className="d-flex gap-3 text-white-50 fw-medium" style={{ fontSize: "0.75rem" }}>
          <span className="d-flex align-items-center gap-1 text-white"><MapPin size={12}/> {match.court}</span>
          <span className="d-flex align-items-center gap-1"><Calendar size={12}/> {match.date}</span>
          <span className="d-flex align-items-center gap-1"><Clock size={12}/> {match.time}</span>
        </div>
        <span className={`badge rounded-pill ${getStatusBadge(match.status)}`} style={{ fontSize: "0.70rem" }}>
          {match.status}
        </span>
      </div>

      {/* Cuerpo del Partido */}
      <div className="card-body p-0 bg-white">
        <div className="bg-light px-3 py-1 d-flex justify-content-end border-bottom text-muted fw-bold" style={{ fontSize: "0.70rem" }}>
          <div className="d-flex gap-3 pe-1">
            <span style={{ width: "20px", textAlign: "center" }}>S1</span>
            <span style={{ width: "20px", textAlign: "center" }}>S2</span>
            <span style={{ width: "20px", textAlign: "center" }}>S3</span>
          </div>
        </div>

        {/* Equipo 1 */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          {renderTeam(match.team1)}
          <div className="d-flex gap-3 pe-1 fs-6 fw-bold text-dark">
            {match.status !== "Pendiente" ? (
              <>
                <span style={{ width: "20px", textAlign: "center" }}>{match.result?.set1?.gamesTeam1 || 0}</span>
                <span style={{ width: "20px", textAlign: "center" }}>{match.result?.set2?.gamesTeam1 || 0}</span>
                <span style={{ width: "20px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam1 || 0}</span>
              </>
            ) : (
              <><span style={{ width: "20px", textAlign: "center" }}>-</span><span style={{ width: "20px", textAlign: "center" }}>-</span><span style={{ width: "20px", textAlign: "center" }}>-</span></>
            )}
          </div>
        </div>

        {/* Equipo 2 */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2">
          {renderTeam(match.team2)}
          <div className="d-flex gap-3 pe-1 fs-6 fw-bold text-dark">
            {match.status !== "Pendiente" ? (
              <>
                <span style={{ width: "20px", textAlign: "center" }}>{match.result?.set1?.gamesTeam2 || 0}</span>
                <span style={{ width: "20px", textAlign: "center" }}>{match.result?.set2?.gamesTeam2 || 0}</span>
                <span style={{ width: "20px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam2 || 0}</span>
              </>
            ) : (
              <><span style={{ width: "20px", textAlign: "center" }}>-</span><span style={{ width: "20px", textAlign: "center" }}>-</span><span style={{ width: "20px", textAlign: "center" }}>-</span></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMatchCard;