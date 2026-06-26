import React from "react";
import { Trophy, ShieldAlert } from "lucide-react";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const PlayoffTree = ({ matches }) => {
  // 1. Definimos el orden lógico y cuántos partidos lleva cada fase
  const stageData = [
    { name: "16avos de Final", count: 16, color: "#64748b" }, // Gris
    { name: "Octavos de Final", count: 8, color: "#334155" }, // Slate oscuro
    { name: "Cuartos de Final", count: 4, color: "#fd7e14" }, // Naranja
    { name: "Semifinal", count: 2, color: "#0f172a" },        // Azul muy oscuro
    { name: "Final", count: 1, color: "#eab308" }             // Dorado
  ];

  // 2. Buscamos desde qué fase arranca nuestro cuadro real
  const firstActiveIndex = stageData.findIndex(s => matches.some(m => m.stage === s.name));
  
  // Si no hay partidos, no renderizamos nada
  if (firstActiveIndex === -1) return null;

  // 3. Recortamos las fases para dibujar desde la inicial HASTA LA FINAL siempre
  const stagesToRender = stageData.slice(firstActiveIndex);

  return (
    <div className="d-flex overflow-auto pb-4 px-2" style={{ minHeight: "600px", gap: "3rem" }}>
      {stagesToRender.map((stageInfo) => {
        // Filtramos los partidos reales de esta fase
        let stageMatches = matches.filter(m => m.stage === stageInfo.name);

        // Si no hay partidos suficientes creados, rellenamos con "Vacíos" para dibujar la rama
        if (stageMatches.length < stageInfo.count) {
          const paddedMatches = [...stageMatches];
          for (let i = stageMatches.length; i < stageInfo.count; i++) {
            paddedMatches.push({
              _id: `dummy-${stageInfo.name}-${i}`,
              isDummy: true,
              stage: stageInfo.name,
              status: "Pendiente"
            });
          }
          stageMatches = paddedMatches;
        }

        const isFinal = stageInfo.name === "Final";

        return (
          <div key={stageInfo.name} className="d-flex flex-column justify-content-around" style={{ minWidth: "280px" }}>
            
            {/* Título de la Columna (Fase) */}
            <div className="text-center mb-4">
              <span className="badge text-uppercase px-4 py-2 shadow-sm" style={{ backgroundColor: stageInfo.color, letterSpacing: "1px", borderRadius: "4px" }}>
                {stageInfo.name}
              </span>
            </div>

            {/* Tarjetas de Partidos de esa Fase */}
            <div className="d-flex flex-column gap-4">
              {stageMatches.map((match) => {
                
                // --- COMPONENTE INTERNO PARA RENDERIZAR UN EQUIPO ---
                const renderTeam = (teamObj, placeholderText) => {
                  if (match.isDummy) {
                    return (
                      <div className="d-flex align-items-center gap-2 opacity-50 py-1">
                        <ShieldAlert size={24} className="text-muted" />
                        <span className="text-muted fw-bold small text-uppercase">A Clasificar</span>
                      </div>
                    );
                  }

                  if (teamObj && teamObj.player1 && teamObj.player2) {
                    return (
                      <div className="d-flex align-items-center gap-2 py-1">
                        <div className="d-flex align-items-center flex-shrink-0">
                          <img src={teamObj.player1.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "30px", height: "30px", zIndex: 2 }} />
                          <img src={teamObj.player2.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "30px", height: "30px", marginLeft: "-12px", zIndex: 1 }} />
                        </div>
                        <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.1", fontSize: "0.75rem" }}>
                          <div className="text-truncate" style={{ maxWidth: "160px" }}>
                            <span className="fw-bold text-dark text-uppercase">{teamObj.player1.lastName}</span> <span className="text-dark">{teamObj.player1.firstName}</span>
                          </div>
                          <div className="text-truncate" style={{ marginTop: "2px", maxWidth: "160px" }}>
                            <span className="fw-bold text-dark text-uppercase">{teamObj.player2.lastName}</span> <span className="text-dark">{teamObj.player2.firstName}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="d-flex align-items-center gap-2 py-2">
                      <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.85rem" }}>
                        {placeholderText || "Por definir"}
                      </span>
                    </div>
                  );
                };

                return (
                  <div key={match._id} className="card shadow-sm position-relative" style={{ borderRadius: "6px", border: isFinal ? "2px solid #eab308" : "1px solid #dee2e6" }}>
                    
                    <div className="position-absolute top-0 bottom-0 start-0" style={{ width: "4px", backgroundColor: stageInfo.color, borderTopLeftRadius: "5px", borderBottomLeftRadius: "5px" }}></div>

                    {isFinal && (
                      <div className="position-absolute top-50 start-50 translate-middle opacity-10" style={{ zIndex: 0, pointerEvents: "none" }}>
                        <Trophy size={90} />
                      </div>
                    )}

                    <div className="position-relative ms-1" style={{ zIndex: 1 }}>
                      
                      {/* EQUIPO 1 */}
                      <div className="d-flex align-items-center justify-content-between p-2 border-bottom bg-white" style={{ borderTopRightRadius: "5px" }}>
                        {renderTeam(match.team1, match.placeholderTeam1)}
                        
                        {match.status !== "Pendiente" && !match.isDummy && (
                          <div className="fw-bold text-dark px-2 py-1 bg-light rounded text-center border" style={{ minWidth: "32px", fontSize: "0.9rem" }}>
                            {match.result?.set1?.gamesTeam1 || 0}
                          </div>
                        )}
                      </div>

                      {/* EQUIPO 2 */}
                      <div className="d-flex align-items-center justify-content-between p-2 bg-light" style={{ borderBottomRightRadius: "5px" }}>
                        {renderTeam(match.team2, match.placeholderTeam2)}
                        
                        {match.status !== "Pendiente" && !match.isDummy && (
                          <div className="fw-bold text-dark px-2 py-1 bg-white rounded border text-center" style={{ minWidth: "32px", fontSize: "0.9rem" }}>
                            {match.result?.set1?.gamesTeam2 || 0}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default PlayoffTree;