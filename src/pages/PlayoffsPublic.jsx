// src/pages/PlayoffsPublic.jsx
import React, { useState, useEffect } from "react";
import { Loader2, Trophy, ShieldAlert, Info, Filter, LayoutGrid } from "lucide-react";
import { getPublicMatchesRequest, getPublicTournamentsRequest } from "../services/public.service";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

function PlayoffsPublic() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await getPublicTournamentsRequest();
        const data = res.data.tournaments ? res.data.tournaments : res.data;
        setTournaments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al cargar torneos públicos:", error);
      }
    };
    
    fetchTournaments();
  }, []);

  const selectedTournament = tournaments.find(t => t._id === selectedTournamentId);
  const categoriasDisponibles = selectedTournament 
    ? [...new Set(selectedTournament.categories.map(c => `${c.name} ${c.gender}`))] 
    : [];

  const handleTournamentChange = (e) => {
    setSelectedTournamentId(e.target.value);
    setSelectedCategory(""); 
    setPlayoffMatches([]); 
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const fetchPlayoffs = async () => {
    if (!selectedTournamentId || !selectedCategory) return;

    setIsLoading(true);
    try {
      
      const res = await getPublicMatchesRequest(selectedTournamentId, selectedCategory);
      const matches = res.data.matches || [];

      const playoffOnly = matches.filter(m => m.isPlayoff);

      playoffOnly.sort((a, b) => a._id.localeCompare(b._id));
      setPlayoffMatches(playoffOnly);
    } catch (error) {
      console.error("Error al cargar playoffs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayoffs();
  }, [selectedTournamentId, selectedCategory]); // eslint-disable-line

  const stageData = [
    { name: "16avos de Final", count: 16, color: "#64748b" }, 
    { name: "Octavos de Final", count: 8, color: "#334155" }, 
    { name: "Cuartos de Final", count: 4, color: "#0f172a" }, 
    { name: "Semifinal", count: 2, color: "#fd7e14" },        
    { name: "Final", count: 1, color: "#eab308" }            
  ];

  const firstActiveIndex = stageData.findIndex(s => playoffMatches.some(m => m.stage === s.name));
  const stagesToRender = firstActiveIndex !== -1 ? stageData.slice(firstActiveIndex) : [];

  const renderMiniScore = (match, isTeam1) => {
    if (match.status === "Pendiente") return null;
    if (match.result?.isWalkover) {
      return <span className="text-danger fw-bold" style={{ fontSize: "0.75rem" }}>W.O.</span>;
    }

    const s1 = isTeam1 ? match.result?.set1?.gamesTeam1 : match.result?.set1?.gamesTeam2;
    const s2 = isTeam1 ? match.result?.set2?.gamesTeam1 : match.result?.set2?.gamesTeam2;
    const s3 = isTeam1 ? match.result?.set3?.gamesTeam1 : match.result?.set3?.gamesTeam2;

    return (
      <div className="d-flex gap-2 fw-bold text-dark" style={{ fontSize: "0.85rem" }}>
        <span style={{ width: "14px", textAlign: "center" }}>{s1 ?? '-'}</span>
        <span style={{ width: "14px", textAlign: "center" }}>{s2 ?? '-'}</span>
        <span style={{ width: "14px", textAlign: "center", color: "#fd7e14" }}>{s3 ?? '-'}</span>
      </div>
    );
  };

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold text-uppercase text-padel-orange mb-2">Playoffs</h1>
        <p className="text-muted fs-5">El camino hacia el campeonato</p>
      </div>

      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light d-flex flex-column flex-md-row gap-3 align-items-center">
            <div className="d-flex align-items-center gap-2 text-padel-orange me-md-2">
              <Filter size={24} />
              <span className="fw-bold d-none d-md-block">Filtros:</span>
            </div>
            
            <select 
              className="form-select border-secondary fw-medium" 
              value={selectedTournamentId}
              onChange={handleTournamentChange}
            >
              <option value="" disabled>1. Seleccioná un Torneo...</option>
              {tournaments.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>

            <select 
              className="form-select border-secondary fw-medium" 
              value={selectedCategory}
              onChange={handleCategoryChange}
              disabled={!selectedTournamentId}
            >
              <option value="" disabled>2. Seleccioná una Categoría...</option>
              {categoriasDisponibles.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {!selectedTournamentId || !selectedCategory ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm mt-4 mx-auto" style={{ maxWidth: '600px' }}>
          <Trophy size={60} className="text-padel-orange mb-3 opacity-75 mx-auto" />
          <h4 className="fw-bold text-dark mb-2">¡Elegí tu categoría!</h4>
          <p className="text-muted fs-5 px-4 mb-0">
            Utilizá los filtros de arriba para seleccionar el <strong>Torneo</strong> y la <strong>Categoría</strong>, y vas a poder visualizar el cuadro de llaves y cruces.
          </p>
        </div>
      ) 
      
      : isLoading ? (
        <div className="text-center py-5 my-5">
          <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: '#fd7e14' }} />
          <p className="text-muted fw-medium">Cargando el cuadro principal...</p>
        </div>
      ) 
      
      : playoffMatches.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border shadow-sm my-5">
          <Info size={50} className="text-muted mb-3 mx-auto opacity-50" />
          <h4 className="fw-bold text-dark mb-2">Cuadro aún no definido</h4>
          <p className="text-muted mb-0 fs-5 px-3">
            Las llaves de eliminación directa aparecerán acá cuando termine la fase de zonas o se configuren los cruces.
          </p>
        </div>
      ) 
      
      : (
        <div className="bg-light p-4 rounded-4 shadow-sm border overflow-auto custom-scrollbar">
          <div className="d-flex pb-2 px-2" style={{ minHeight: "600px", gap: "3rem", width: "max-content" }}>
            {stagesToRender.map((stageInfo) => {
              
              let stageMatches = playoffMatches.filter(m => m.stage === stageInfo.name);

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
                <div key={stageInfo.name} className="d-flex flex-column justify-content-around" style={{ minWidth: "300px" }}>
                  
                  <div className="text-center mb-4">
                    <span className="badge text-uppercase px-4 py-2 shadow-sm" style={{ backgroundColor: stageInfo.color, letterSpacing: "1px", borderRadius: "6px", fontSize: "0.85rem" }}>
                      {stageInfo.name}
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-4">
                    {stageMatches.map((match) => {
                      
                      const renderTeam = (teamObj, placeholderText) => {
                        if (match.isDummy) {
                          return (
                            <div className="d-flex align-items-center gap-2 opacity-50 py-1">
                              <ShieldAlert size={20} className="text-muted" />
                              <span className="text-muted fw-bold small text-uppercase">A Clasificar</span>
                            </div>
                          );
                        }

                        if (teamObj && teamObj.player1 && teamObj.player2) {
                          return (
                            <div className="d-flex align-items-center gap-2 py-1">
                              <div className="d-flex align-items-center flex-shrink-0">
                                <img src={teamObj.player1.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "28px", height: "28px", zIndex: 2 }} />
                                <img src={teamObj.player2.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "28px", height: "28px", marginLeft: "-10px", zIndex: 1 }} />
                              </div>
                              <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.1", fontSize: "0.75rem" }}>
                                <div className="text-truncate" style={{ maxWidth: "140px" }}>
                                  <span className="fw-bold text-dark text-uppercase">{teamObj.player1.lastName}</span>
                                </div>
                                <div className="text-truncate" style={{ marginTop: "2px", maxWidth: "140px" }}>
                                  <span className="fw-bold text-dark text-uppercase">{teamObj.player2.lastName}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="d-flex align-items-center gap-2 py-1">
                            <span className="fw-bold text-secondary text-uppercase" style={{ fontSize: "0.75rem" }}>
                              {placeholderText || "Por definir"}
                            </span>
                          </div>
                        );
                      };

                      return (
                        <div key={match._id} className="card shadow-sm position-relative transition-hover" style={{ borderRadius: "8px", border: isFinal ? "2px solid #eab308" : "1px solid #dee2e6" }}>
                          
                          <div className="position-absolute top-0 bottom-0 start-0" style={{ width: "5px", backgroundColor: stageInfo.color, borderTopLeftRadius: "6px", borderBottomLeftRadius: "6px" }}></div>

                          {isFinal && (
                            <div className="position-absolute top-50 start-50 translate-middle opacity-10" style={{ zIndex: 0, pointerEvents: "none" }}>
                              <Trophy size={100} />
                            </div>
                          )}

                          <div className="position-relative ms-1" style={{ zIndex: 1 }}>
                            
                            <div className="d-flex align-items-center justify-content-between p-2 border-bottom bg-white" style={{ borderTopRightRadius: "6px" }}>
                              {renderTeam(match.team1, match.placeholderTeam1)}
                              {renderMiniScore(match, true)}
                            </div>

                            <div className="d-flex align-items-center justify-content-between p-2 bg-light" style={{ borderBottomRightRadius: "6px" }}>
                              {renderTeam(match.team2, match.placeholderTeam2)}
                              {renderMiniScore(match, false)}
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
        </div>
      )}

      <style>{`
        .text-padel-orange { color: #fd7e14; }
        .bg-padel-orange { background-color: #fd7e14; }
        .transition-hover { transition: transform 0.2s ease-in-out, box-shadow 0.2s; }
        .transition-hover:hover { transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        .custom-scrollbar::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

export default PlayoffsPublic;