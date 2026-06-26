// src/pages/PartidosPublic.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Info, Calendar, Clock, MapPin, Trophy, PlayCircle, CheckCircle2, Filter } from 'lucide-react';
// 🔥 IMPORTAMOS LAS DOS FUNCIONES DEL SERVICIO PÚBLICO
import { getPublicMatchesRequest, getPublicTournamentsRequest } from '../services/public.service';

// Mini-componente para el Cronómetro en Vivo
const MatchTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    
    const start = new Date(startTime).getTime();
    
    const interval = setInterval(() => {
      setElapsed(Math.max(0, Date.now() - start));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  if (!startTime) return <span className="text-muted small">--:--</span>;

  const totalSeconds = Math.floor(elapsed / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  const timeString = hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;

  return (
    <div className="d-flex align-items-center justify-content-center text-success fw-bold mt-2" style={{ fontSize: "0.95rem" }}>
      <Clock size={14} className="me-1" /> {timeString}
    </div>
  );
};

function PartidosPublic() {
  // 🔥 ESTADO LOCAL PARA LOS TORNEOS PÚBLICOS
  const [tournaments, setTournaments] = useState([]);
  
  const [activeTab, setActiveTab] = useState('pendientes'); 
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los filtros globales
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // 🔥 CARGAMOS TORNEOS DIRECTO DESDE LA RUTA PÚBLICA SIN TOKEN
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

  // Buscamos el torneo seleccionado para extraer sus categorías
  const selectedTournament = tournaments.find(t => t._id === selectedTournamentId);
  
  const categoriasDisponibles = selectedTournament 
    ? [...new Set(selectedTournament.categories.map(c => `${c.name} ${c.gender}`))] 
    : [];

  // Manejadores de cambios en los filtros
  const handleTournamentChange = (e) => {
    setSelectedTournamentId(e.target.value);
    setSelectedCategory(""); // Reseteamos la categoría al cambiar de torneo
    setMatches([]); // Limpiamos los partidos anteriores
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Función para buscar partidos (solo se ejecuta si hay torneo y categoría)
  const fetchMatches = async () => {
    if (!selectedTournamentId || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      const res = await getPublicMatchesRequest(selectedTournamentId, selectedCategory);
      setMatches(res.data.matches || []);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disparar la búsqueda automáticamente cuando ambos filtros están llenos
  useEffect(() => {
    fetchMatches();
  }, [selectedTournamentId, selectedCategory]); // eslint-disable-line

  // Filtrado de las pestañas
  const getFilteredMatches = () => {
    if (activeTab === 'pendientes') {
      return matches.filter(m => 
        m.status === 'Pendiente' && 
        m.date && m.date !== "A programar" && 
        m.time && m.time !== "A programar"
      );
    } else if (activeTab === 'envivo') {
      return matches.filter(m => m.status === 'En Curso');
    } else {
      return matches.filter(m => m.status === 'Finalizado').reverse();
    }
  };

  const currentMatches = getFilteredMatches();

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      
      {/* Títulos */}
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold text-uppercase text-padel-orange mb-2">Partidos</h1>
        <p className="text-muted fs-5">Seguí los resultados al instante</p>
      </div>

      {/* FILTRO GLOBAL (TORNEO Y CATEGORÍA) */}
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

      {/* Selector de Pestañas (Circulitos) */}
      <div className="d-flex justify-content-center mb-5">
        <div className="bg-light p-1 rounded-pill shadow-sm d-inline-flex border flex-wrap justify-content-center gap-1">
          <button 
            className={`btn rounded-pill px-4 fw-bold transition-all ${activeTab === 'pendientes' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
            onClick={() => setActiveTab('pendientes')}
          >
            <Calendar size={18} className="me-2 mb-1" /> Pendientes
          </button>
          <button 
            className={`btn rounded-pill px-4 fw-bold transition-all ${activeTab === 'envivo' ? 'bg-danger text-white' : 'btn-light text-muted border-0'}`}
            onClick={() => setActiveTab('envivo')}
          >
            <PlayCircle size={18} className="me-2 mb-1" /> En Vivo
          </button>
          <button 
            className={`btn rounded-pill px-4 fw-bold transition-all ${activeTab === 'finalizados' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
            onClick={() => setActiveTab('finalizados')}
          >
            <CheckCircle2 size={18} className="me-2 mb-1" /> Finalizados
          </button>
        </div>
      </div>

      {/* ====================================================
          RENDERIZADO CONDICIONAL
      ======================================================== */}
      
      {/* 1. Si no seleccionó Torneo y Categoría */}
      {!selectedTournamentId || !selectedCategory ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm mt-4 mx-auto" style={{ maxWidth: '600px' }}>
          <Trophy size={60} className="text-padel-orange mb-3 opacity-75 mx-auto" />
          <h4 className="fw-bold text-dark mb-2">¡Buscá tu categoría!</h4>
          <p className="text-muted fs-5 px-4 mb-0">
            Utilizá los filtros de arriba para seleccionar el <strong>Torneo</strong> y la <strong>Categoría</strong> y ver todos los partidos programados, en vivo y los resultados finales.
          </p>
        </div>
      ) 
      
      /* 2. Si está cargando los datos */
      : isLoading ? (
        <div className="text-center py-5 my-5">
          <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: '#fd7e14' }} />
          <p className="text-muted fw-medium">Cargando partidos...</p>
        </div>
      ) 
      
      /* 3. Si no hay resultados para esa pestaña */
      : currentMatches.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border shadow-sm mt-4">
          <Info size={50} className="text-muted mb-3 mx-auto opacity-50" />
          <h4 className="fw-bold text-dark mb-2">Sin partidos para mostrar</h4>
          <p className="text-muted mb-0 fs-5 px-3">
            Actualmente no hay partidos disponibles en la sección <span className="fw-bold text-uppercase">"{activeTab}"</span> para esta categoría.
          </p>
          <button className="btn btn-outline-secondary mt-4 rounded-pill px-4" onClick={fetchMatches}>
            ↻ Actualizar información
          </button>
        </div>
      ) 
      
      /* 4. Si hay partidos (Mismo diseño de tarjetas que tenías) */
      : (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-sm btn-outline-dark rounded-pill shadow-sm" onClick={fetchMatches}>
              ↻ Actualizar ahora
            </button>
          </div>

          <div className="row g-4 justify-content-center">
            {currentMatches.map((match) => {
              let topBorderColor = "#0f172a"; 
              if (match.status === "En Curso") topBorderColor = "#dc3545"; 

              const displayDate = match.date && match.date !== "A programar" ? match.date : "---";
              const displayTime = match.time && match.time !== "A programar" ? match.time : "---";
              const displayCourt = match.court && match.court !== "A asignar" ? match.court : "---";

              const { set1, set2, set3, isSuperTieBreak } = match.result || {};

              const getWeight = (s1, s2) => {
                const n1 = parseInt(s1);
                const n2 = parseInt(s2);
                if (isNaN(n1) && isNaN(n2)) return { fw1: 'text-muted fw-medium', fw2: 'text-muted fw-medium' };
                return {
                  fw1: n1 > n2 ? 'fw-bold text-dark' : 'fw-normal text-secondary',
                  fw2: n2 > n1 ? 'fw-bold text-dark' : 'fw-normal text-secondary'
                };
              };

              const st1 = getWeight(set1?.gamesTeam1, set1?.gamesTeam2);
              const st2 = getWeight(set2?.gamesTeam1, set2?.gamesTeam2);
              const st3 = getWeight(set3?.gamesTeam1, set3?.gamesTeam2);

              return (
                <div key={match._id} className="col-12 col-lg-8">
                  <div 
                    className="card border-0 shadow-sm rounded-4 overflow-hidden transition-hover"
                    style={{ borderTop: `4px solid ${topBorderColor}` }}
                  >
                    {/* ENCABEZADO */}
                    <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0f172a' }}>
                      <div className="d-flex align-items-center">
                        {match.isPlayoff ? (
                          <span className="fw-bold text-padel-orange me-2 d-flex align-items-center gap-1 fs-6">
                            <Trophy size={16} /> 
                            {match.stage || 'Playoff'}
                          </span>
                        ) : (
                          <>
                            <span className="fw-bold text-padel-orange me-2 fs-6">
                              {match.groupId?.name || "Grupo"}
                            </span>
                            <span className="small fw-medium text-white-50">{match.groupId?.category || "Categoría"}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="d-flex flex-column align-items-end text-white small fw-medium gap-1">
                        <div className="d-flex gap-3">
                          <span className="d-flex align-items-center gap-1"><Calendar size={14} /> {displayDate}</span>
                          <span className="d-flex align-items-center gap-1"><Clock size={14} /> {displayTime}</span>
                        </div>
                        <span className="d-flex align-items-center gap-1"><MapPin size={14} /> {displayCourt}</span>
                      </div>
                    </div>

                    {/* CUERPO DE LA TARJETA */}
                    <div className="card-body p-4">
                      
                      <div className="d-flex justify-content-between align-items-center">
                        
                        <div className="d-flex flex-column gap-3" style={{ flex: 1 }}>
                          
                          {/* Equipo 1 */}
                          <div className="d-flex align-items-center gap-3">
                            {match.team1 ? (
                              <>
                                <div className="position-relative" style={{ width: "60px", height: "40px", flexShrink: 0 }}>
                                  <img src={match.team1.player1?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "35px", height: "35px", left: "0", zIndex: 2 }} alt="P1" />
                                  <img src={match.team1.player2?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "35px", height: "35px", left: "20px", zIndex: 1 }} alt="P2" />
                                </div>
                                <div className="d-flex flex-column lh-1">
                                  <span className="text-uppercase fw-bold text-dark mb-1" style={{ fontSize: "0.90rem" }}>{match.team1.player1?.lastName}</span>
                                  <span className="text-uppercase fw-bold text-dark" style={{ fontSize: "0.90rem" }}>{match.team1.player2?.lastName}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm border" style={{ width: "40px", height: "40px", flexShrink: 0 }}>
                                  <span className="text-muted fw-bold">?</span>
                                </div>
                                <span className="text-muted fw-medium" style={{ fontSize: "0.90rem" }}>{match.placeholderTeam1 || 'A definir'}</span>
                              </>
                            )}
                          </div>

                          {/* Equipo 2 */}
                          <div className="d-flex align-items-center gap-3">
                            {match.team2 ? (
                              <>
                                <div className="position-relative" style={{ width: "60px", height: "40px", flexShrink: 0 }}>
                                  <img src={match.team2.player1?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "35px", height: "35px", left: "0", zIndex: 2 }} alt="P1" />
                                  <img src={match.team2.player2?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "35px", height: "35px", left: "20px", zIndex: 1 }} alt="P2" />
                                </div>
                                <div className="d-flex flex-column lh-1">
                                  <span className="text-uppercase fw-bold text-dark mb-1" style={{ fontSize: "0.90rem" }}>{match.team2.player1?.lastName}</span>
                                  <span className="text-uppercase fw-bold text-dark" style={{ fontSize: "0.90rem" }}>{match.team2.player2?.lastName}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm border" style={{ width: "40px", height: "40px", flexShrink: 0 }}>
                                  <span className="text-muted fw-bold">?</span>
                                </div>
                                <span className="text-muted fw-medium" style={{ fontSize: "0.90rem" }}>{match.placeholderTeam2 || 'A definir'}</span>
                              </>
                            )}
                          </div>

                        </div>

                        {/* RESULTADOS */}
                        <div className="d-flex gap-4 ms-3">
                          {match.status === 'Pendiente' ? (
                            <div className="fw-bold text-muted fs-5 align-self-center">VS</div>
                          ) : match.result?.isWalkover ? (
                            <div className="fw-bold text-danger fs-6 align-self-center">W.O.</div>
                          ) : (
                            <>
                              {(set1?.gamesTeam1 !== undefined || set1?.gamesTeam2 !== undefined) && (
                                <div className="d-flex flex-column justify-content-center gap-3 text-center" style={{ height: "100px" }}>
                                  <span className={`fs-5 lh-1 ${st1.fw1}`}>{set1.gamesTeam1 ?? '-'}</span>
                                  <span className={`fs-5 lh-1 ${st1.fw2}`}>{set1.gamesTeam2 ?? '-'}</span>
                                </div>
                              )}
                              
                              {(set2?.gamesTeam1 !== undefined || set2?.gamesTeam2 !== undefined) && (
                                <div className="d-flex flex-column justify-content-center gap-3 text-center" style={{ height: "100px" }}>
                                  <span className={`fs-5 lh-1 ${st2.fw1}`}>{set2.gamesTeam1 ?? '-'}</span>
                                  <span className={`fs-5 lh-1 ${st2.fw2}`}>{set2.gamesTeam2 ?? '-'}</span>
                                </div>
                              )}

                              {(set3?.gamesTeam1 !== undefined || set3?.gamesTeam2 !== undefined) && (
                                <div className="d-flex flex-column justify-content-center gap-3 text-center position-relative" style={{ height: "100px" }}>
                                  {isSuperTieBreak && <span className="position-absolute text-padel-orange fw-bold w-100 text-center" style={{ top: "0px", fontSize: "0.6rem" }}>STB</span>}
                                  <span className={`fs-5 lh-1 ${st3.fw1}`}>{set3.gamesTeam1 ?? '-'}</span>
                                  <span className={`fs-5 lh-1 ${st3.fw2}`}>{set3.gamesTeam2 ?? '-'}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                      </div>

                      {/* ZONA INFERIOR CENTRADA: ESTADOS Y CRONÓMETROS */}
                      {(match.status === "En Curso" || match.status === "Finalizado") && (
                        <div className="mt-4 pt-3 border-top d-flex flex-column align-items-center justify-content-center">
                          
                          {match.status === "En Curso" && (
                            <>
                              <span className="badge bg-danger mb-1 pulse-animation shadow-sm px-3 py-1">EN VIVO</span>
                              <MatchTimer startTime={match.startTime} />
                            </>
                          )}

                          {match.status === "Finalizado" && match.duration > 0 && (
                            <div className="d-flex flex-column align-items-center">
                              <span className="text-muted fw-bold" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Tiempo de juego
                              </span>
                              <span className="text-secondary fw-bold" style={{ fontSize: "0.90rem" }}>
                                {String(Math.floor(match.duration / 60)).padStart(2, '0')}:{String(match.duration % 60).padStart(2, '0')}:00
                              </span>
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      
      <style>{`
        .transition-hover { transition: transform 0.2s ease-in-out; }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
        .text-padel-orange { color: #fd7e14; }
        .bg-padel-orange { background-color: #fd7e14; }
        .pulse-animation {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default PartidosPublic;