// src/pages/MatchesAdmin.jsx
import React, { useState, useEffect } from "react";
import { useTournaments } from "../context/TournamentContext";
import { useMatches } from "../context/MatchContext";
import { Calendar, Clock, MapPin, PlayCircle, Filter, Edit2, GitMerge, Save, Trophy } from "lucide-react";
import ManageMatchModal from "../components/MatchesAdmin/ManageMatchModal";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

// 🔥 MICRO-COMPONENTE: RELOJ EN VIVO
const LiveTimer = ({ startTime, className = "" }) => {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diffInSeconds = Math.floor((now - start) / 1000);
      
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      
      setTimeString(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <span className={className}>
      ⏱ {timeString}
    </span>
  );
};

const MatchesAdmin = () => {
  const { tournaments, loadTournaments } = useTournaments();
  const { matches, loadMatchesByCategory, loading, updateMatch } = useMatches();

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 🔥 ESTADOS PARA EL MINI-FORMULARIO DE PROGRAMACIÓN
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", court: "" });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament && selectedCategory) {
      loadMatchesByCategory(selectedTournament, selectedCategory);
      setEditingMatchId(null); // Reseteamos si cambia de categoría
    }
  }, [selectedTournament, selectedCategory]);

  const activeTournament = tournaments.find(t => t._id === selectedTournament);
  
  // 🔥 FIX CRÍTICO: Obtenemos categorías únicas concatenando Nombre + Género
  const getUniqueCategories = (tournament) => {
    if (!tournament) return [];
    return [...new Set(tournament.categories.map(c => `${c.name} ${c.gender}`))];
  };
  
  const categories = getUniqueCategories(activeTournament);

  // 🔥 SISTEMA DE ORDENAMIENTO INTELIGENTE (UX PRO)
  const statusWeight = {
    "En Curso": 1,
    "Pendiente": 2,
    "Finalizado": 3,
    "W.O.": 4
  };

  const filteredMatches = matches
    .filter(m => filterStatus === "Todos" || m.status === filterStatus)
    .sort((a, b) => {
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[a.status] - statusWeight[b.status];
      }

      const dateA = a.date || "A programar";
      const dateB = b.date || "A programar";
      
      if (dateA === "A programar" && dateB !== "A programar") return 1;
      if (dateB === "A programar" && dateA !== "A programar") return -1;
      if (dateA !== dateB) return dateA.localeCompare(dateB);

      const timeA = a.time || "A programar";
      const timeB = b.time || "A programar";

      if (timeA === "A programar" && timeB !== "A programar") return 1;
      if (timeB === "A programar" && timeA !== "A programar") return -1;
      
      return timeA.localeCompare(timeB);
    });

  const getStatusBadge = (status) => {
    switch (status) {
      case "En Curso": return "bg-success text-white shadow-sm"; 
      case "Finalizado": return "bg-danger text-white shadow-sm";
      case "W.O.": return "bg-dark text-white shadow-sm";
      default: return "bg-warning text-dark"; 
    }
  };

  // 🔥 FUNCIONES DE PROGRAMACIÓN RÁPIDA
  const handleEditClick = (match) => {
    setEditingMatchId(match._id);
    setEditForm({
      date: match.date === "A programar" ? "" : match.date,
      time: match.time === "A programar" ? "" : match.time,
      court: match.court === "A asignar" ? "" : match.court
    });
  };

  const handleSaveSchedule = async (matchId) => {
    setIsSavingSchedule(true);
    const result = await updateMatch(matchId, {
      date: editForm.date || "A programar",
      time: editForm.time || "A programar",
      court: editForm.court || "A asignar"
    });
    
    setIsSavingSchedule(false);
    if (result.success) {
      toast.success("Horario asignado correctamente");
      setEditingMatchId(null);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-5 animate__animated animate__fadeIn">
      
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <PlayCircle size={28} style={{ color: "#fd7e14" }} />
          Partidos
        </h3>
        <p className="text-muted small mt-1 mb-0">Gestioná horarios, estados y resultados de los partidos del torneo.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          
          {/* 🔥 BARRA DE HERRAMIENTAS: SELECTS ESTILO "GROUP ADMIN" */}
          <div className="d-flex flex-column flex-md-row gap-3">
            
            {/* SELECT 1: TORNEO (Más ancho) */}
            <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
              <Trophy className="position-absolute top-50 start-0 translate-middle-y ms-3 text-padel-orange" size={18} />
              <select 
                className="form-select bg-light border border-light py-2 ps-5 rounded-3 text-dark fw-bold shadow-sm cursor-pointer" 
                value={selectedTournament} 
                onChange={(e) => { setSelectedTournament(e.target.value); setSelectedCategory(""); }}
                style={{ appearance: "none" }}
              >
                <option value="" disabled>1. Seleccionar Torneo...</option>
                {tournaments.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>

            {/* SELECT 2: CATEGORÍA (Depende del torneo) */}
            <div className="position-relative flex-grow-1" style={{ maxWidth: "350px" }}>
              <Filter className={`position-absolute top-50 start-0 translate-middle-y ms-3 ${selectedTournament ? 'text-primary' : 'text-muted opacity-50'}`} size={18} />
              <select 
                className={`form-select py-2 ps-5 rounded-3 fw-bold shadow-sm cursor-pointer transition-all ${selectedTournament ? 'bg-white border' : 'bg-light border-0 opacity-50'}`}
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)} 
                disabled={!selectedTournament}
                style={{ appearance: "none" }}
              >
                <option value="" disabled>2. Seleccionar Categoría...</option>
                {categories.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
              </select>
            </div>

          </div>
        </div>
      </div>

      {selectedTournament && selectedCategory ? (
        <>
          <div className="d-flex flex-wrap gap-2 mb-4 pb-1">
            <div className="d-flex align-items-center me-2 text-muted fw-bold small">
              <Filter size={16} className="me-1"/> Filtrar:
            </div>
            {["Todos", "Pendiente", "En Curso", "Finalizado"].map(status => (
              <button key={status} className={`btn btn-sm rounded-pill px-4 fw-bold transition-all ${filterStatus === status ? 'text-white shadow-sm' : 'bg-light text-secondary border-0'}`} style={filterStatus === status ? { backgroundColor: "#fd7e14" } : {}} onClick={() => setFilterStatus(status)}>
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-5 text-center d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}>
              <PlayCircle size={40} className="text-muted mb-3 opacity-50" />
              <h5 className="text-dark fw-bold">Sin partidos</h5>
              <p className="text-muted m-0 fw-medium">No hay partidos para mostrar en la categoría <span className="fw-bold">"{selectedCategory}"</span> con este filtro.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredMatches.map(match => {
                
                const hasTeam1 = !!match.team1;
                const hasTeam2 = !!match.team2;
                
                const t1p1 = match.team1?.player1;
                const t1p2 = match.team1?.player2;
                const t1Placeholder = match.placeholderTeam1 || "Por definir";

                const t2p1 = match.team2?.player1;
                const t2p2 = match.team2?.player2;
                const t2Placeholder = match.placeholderTeam2 || "Por definir";

                return (
                  <div key={match._id} className="col-12 col-xl-6">
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-shadow">
                      
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center px-4 py-3 gap-2" style={{ backgroundColor: "#0f172a", color: "white" }}>
                        
                        <div className="d-flex align-items-center gap-3 flex-wrap" style={{ fontSize: "0.90rem" }}>
                          <span className="fw-bold fs-5 d-flex align-items-center gap-2">
                            {match.isPlayoff && <GitMerge size={18} className="text-warning" />}
                            {match.isPlayoff ? match.stage : (match.groupId?.name || "Grupo")}
                          </span>
                          <div className="d-none d-sm-block border-start border-white border-opacity-50" style={{ height: "20px" }}></div>
                          <div className="d-flex align-items-center gap-3 text-white-50 fw-medium">
                            <span className="d-flex align-items-center gap-1 text-white"><MapPin size={15}/> {match.court}</span>
                            <span className="d-flex align-items-center gap-1"><Calendar size={15}/> {match.date}</span>
                            <span className="d-flex align-items-center gap-1"><Clock size={15}/> {match.time}</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center">
                          <div className={`badge rounded-pill px-3 py-1 fw-bold d-flex flex-column align-items-center ${getStatusBadge(match.status)}`} style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                            <span>{match.status}</span>
                            {match.status === "En Curso" && match.startTime && (
                              <LiveTimer startTime={match.startTime} className="mt-1" style={{ fontSize: "0.85rem" }} />
                            )}
                          </div>
                          
                          {match.status === "Finalizado" && match.duration > 0 && (
                            <span className="text-white-50 ms-2 fw-bold" style={{ fontSize: "0.75rem" }}>
                              ⏱ {match.duration} min
                            </span>
                          )}
                        </div>

                      </div>

                      <div className="card-body p-0 bg-white">
                        <div className="bg-light px-4 py-2 d-flex justify-content-end border-bottom text-muted fw-bold" style={{ fontSize: "0.75rem" }}>
                          <div className="d-flex gap-4 pe-2">
                            <span style={{ width: "24px", textAlign: "center" }}>S1</span>
                            <span style={{ width: "24px", textAlign: "center" }}>S2</span>
                            <span style={{ width: "24px", textAlign: "center" }}>S3</span>
                          </div>
                        </div>

                        {/* EQUIPO 1 */}
                        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center flex-shrink-0">
                              <img src={t1p1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", zIndex: 2 }} />
                              <img src={t1p2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", marginLeft: "-15px", zIndex: 1 }} />
                            </div>
                            <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                              {hasTeam1 ? (
                                <>
                                  <div className="text-truncate">
                                    <span className="fw-bold text-dark text-uppercase">{t1p1?.lastName}</span> <span className="text-dark">{t1p1?.firstName}</span>
                                  </div>
                                  <div className="text-truncate" style={{ marginTop: "2px" }}>
                                    <span className="fw-bold text-dark text-uppercase">{t1p2?.lastName}</span> <span className="text-dark">{t1p2?.firstName}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-truncate mt-1">
                                  <span className="fw-bold text-secondary text-uppercase fs-6">{t1Placeholder}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="d-flex gap-4 pe-2 fs-5 fw-bold text-dark">
                            {match.status !== "Pendiente" ? (
                              <>
                                <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set1?.gamesTeam1 || 0}</span>
                                <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set2?.gamesTeam1 || 0}</span>
                                <span style={{ width: "24px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam1 || 0}</span>
                              </>
                            ) : (
                              <>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* EQUIPO 2 */}
                        <div className="d-flex align-items-center justify-content-between px-4 py-3">
                          <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center flex-shrink-0">
                              <img src={t2p1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", zIndex: 2 }} />
                              <img src={t2p2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", marginLeft: "-15px", zIndex: 1 }} />
                            </div>
                            <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                              {hasTeam2 ? (
                                <>
                                  <div className="text-truncate">
                                    <span className="fw-bold text-dark text-uppercase">{t2p1?.lastName}</span> <span className="text-dark">{t2p1?.firstName}</span>
                                  </div>
                                  <div className="text-truncate" style={{ marginTop: "2px" }}>
                                    <span className="fw-bold text-dark text-uppercase">{t2p2?.lastName}</span> <span className="text-dark">{t2p2?.firstName}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="text-truncate mt-1">
                                  <span className="fw-bold text-secondary text-uppercase fs-6">{t2Placeholder}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="d-flex gap-4 pe-2 fs-5 fw-bold text-dark">
                            {match.status !== "Pendiente" ? (
                              <>
                                <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set1?.gamesTeam2 || 0}</span>
                                <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set2?.gamesTeam2 || 0}</span>
                                <span style={{ width: "24px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam2 || 0}</span>
                              </>
                            ) : (
                              <>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                                <span style={{ width: "24px", textAlign: "center" }}>-</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 🔥 FOOTER CON BOTONES Y MINI-FORMULARIO DE PROGRAMACIÓN */}
                      <div className="card-footer bg-white border-top-0 p-3 pt-0 d-flex justify-content-end gap-2">
                        {editingMatchId === match._id ? (
                          <div className="w-100 bg-light p-3 rounded-3 border animate__animated animate__fadeIn">
                            <div className="row g-2 mb-3">
                              <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Fecha</label>
                                <input type="date" className="form-control form-control-sm" value={editForm.date} onChange={(e) => setEditForm({...editForm, date: e.target.value})} />
                              </div>
                              <div className="col-6">
                                <label className="small fw-bold text-secondary mb-1">Hora</label>
                                <input type="time" className="form-control form-control-sm" value={editForm.time} onChange={(e) => setEditForm({...editForm, time: e.target.value})} />
                              </div>
                              <div className="col-12">
                                <label className="small fw-bold text-secondary mb-1">Cancha</label>
                                <select className="form-select form-select-sm" value={editForm.court} onChange={(e) => setEditForm({...editForm, court: e.target.value})}>
                                  <option value="">A asignar</option>
                                  <option value="Cancha 1">Cancha 1</option>
                                  <option value="Cancha 2">Cancha 2</option>
                                  <option value="Cancha 3">Cancha 3</option>
                                </select>
                              </div>
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-sm btn-light border" onClick={() => setEditingMatchId(null)} disabled={isSavingSchedule}>Cancelar</button>
                              <button className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1" style={{ backgroundColor: "#0f172a" }} onClick={() => handleSaveSchedule(match._id)} disabled={isSavingSchedule}>
                                <Save size={14} /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {match.status === "Pendiente" && (
                              <button 
                                className="btn btn-sm btn-outline-secondary fw-bold d-flex align-items-center gap-2 px-3 py-2 rounded-pill transition-all"
                                onClick={() => handleEditClick(match)}
                              >
                                <Calendar size={14} /> Programar
                              </button>
                            )}
                            <button 
                              className="btn btn-sm text-white fw-bold shadow-sm d-flex align-items-center gap-2 px-4 py-2 rounded-pill transition-all"
                              style={{ backgroundColor: "#fd7e14" }}
                              onClick={() => setSelectedMatch(match)}
                            >
                              <Edit2 size={14} /> Gestionar
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div 
          className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" 
          style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}
        >
          <Trophy size={48} className="text-muted mb-3 opacity-25" />
          <h5 className="text-secondary fw-bold">Seleccioná Torneo y Categoría</h5>
          <p className="text-muted m-0">Elegí las opciones en la barra superior para visualizar y gestionar los partidos.</p>
        </div>
      )}
      
      {selectedMatch && (
        <ManageMatchModal 
          match={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}

    </div>
  );
};

export default MatchesAdmin;