import React, { useState, useEffect } from "react";
import { useMatches } from "../../context/MatchContext";
import { Activity, Save, LogOut, AlertTriangle, AlertOctagon, GitMerge } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

// MICRO-COMPONENTE: RELOJ EN VIVO
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

  return <span className={className}>⏱ {timeString}</span>;
};

const formatTime = (dateString) => {
  if (!dateString) return "--:--";
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ManageMatchModal = ({ match, onClose }) => {
  const { updateMatch } = useMatches();
  const [isSaving, setIsSaving] = useState(false);
  
  // Detector de cambios sin guardar
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  // ESTADOS PARA EL W.O.
  const [showWalkoverModal, setShowWalkoverModal] = useState(false);
  const [absentTeamId, setAbsentTeamId] = useState("");

  const [status, setStatus] = useState(match.status);
  const [isSuperTieBreak, setIsSuperTieBreak] = useState(match.result?.isSuperTieBreak || false);
  
  const [scores, setScores] = useState({
    set1: { gamesTeam1: match.result?.set1?.gamesTeam1 || 0, gamesTeam2: match.result?.set1?.gamesTeam2 || 0 },
    set2: { gamesTeam1: match.result?.set2?.gamesTeam1 || 0, gamesTeam2: match.result?.set2?.gamesTeam2 || 0 },
    set3: { gamesTeam1: match.result?.set3?.gamesTeam1 || 0, gamesTeam2: match.result?.set3?.gamesTeam2 || 0 }
  });

  // Variables de ayuda para saber si los equipos están definidos
  const hasTeam1 = !!match.team1;
  const hasTeam2 = !!match.team2;

  const handleScoreChange = (set, team, value) => {
    setHasUnsavedChanges(true); 
    const numValue = parseInt(value) || 0;
    setScores(prev => ({
      ...prev,
      [set]: {
        ...prev[set],
        [team]: numValue
      }
    }));
  };

  const handleStatusChange = (newStatus) => {
    setHasUnsavedChanges(true); 
    setStatus(newStatus);
  };

  const handleStbChange = (e) => {
    setHasUnsavedChanges(true); 
    setIsSuperTieBreak(e.target.checked);
  };

  const handleCloseRequest = () => {
    if (hasUnsavedChanges) {
      setShowWarningModal(true); 
    } else {
      onClose(); 
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const updateData = {
      status,
      result: {
        ...scores,
        isSuperTieBreak
      }
    };

    const result = await updateMatch(match._id, updateData);
    setIsSaving(false);

    if (result.success) {
      toast.success("Datos actualizados correctamente");
      setHasUnsavedChanges(false); 
      
      if (status === "Finalizado") {
        onClose();
      }
    } else {
      toast.error(result.message);
    }
  };

  const handleApplyWalkover = async () => {
    if (!absentTeamId) {
      toast.error("Por favor, seleccioná qué equipo NO se presentó.");
      return;
    }

    setIsSaving(true);
    
    const isTeam1Absent = absentTeamId === match.team1?._id;

    const updateData = {
      status: "Finalizado",
      result: {
        set1: {
          gamesTeam1: isTeam1Absent ? 0 : 6,
          gamesTeam2: isTeam1Absent ? 6 : 0
        },
        set2: {
          gamesTeam1: isTeam1Absent ? 0 : 6,
          gamesTeam2: isTeam1Absent ? 6 : 0
        },
        set3: { gamesTeam1: 0, gamesTeam2: 0 },
        isSuperTieBreak: false,
        isWalkover: true, 
        absentTeamId: absentTeamId
      }
    };

    const result = await updateMatch(match._id, updateData);
    setIsSaving(false);

    if (result.success) {
      toast.success("Partido sancionado por ausencia correctamente");
      onClose(); 
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden position-relative">
            
            {/* MODAL DE ADVERTENCIA AL SALIR */}
            {showWarningModal && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(15, 23, 42, 0.8)", zIndex: 1060, backdropFilter: "blur(3px)" }}>
                <div className="card border-0 shadow-lg rounded-4 animate__animated animate__zoomIn" style={{ maxWidth: "420px", width: "90%", backgroundColor: "#ffc107" }}>
                  <div className="card-body p-4 text-center">
                    <AlertTriangle size={45} className="mb-3 text-dark opacity-75" />
                    <h5 className="fw-bold text-dark mb-2">Advertencia de Sistema</h5>
                    <p className="mb-4 text-dark fw-medium" style={{ fontSize: "1.05rem", color: "#453400" }}>
                      Los últimos cambios realizados no se guardaron. Si sale ahora, perderá los datos modificados.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <button className="btn bg-white fw-bold px-4 rounded-pill shadow-sm" style={{ color: "#856404" }} onClick={() => setShowWarningModal(false)}>
                        Quedarme
                      </button>
                      <button className="btn btn-dark fw-bold px-4 shadow-sm rounded-pill" onClick={onClose}>
                        Salir sin guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL DE SANCIÓN POR W.O. */}
            {showWalkoverModal && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(15, 23, 42, 0.85)", zIndex: 1060, backdropFilter: "blur(4px)" }}>
                <div className="card border-0 shadow-lg rounded-4 animate__animated animate__zoomIn" style={{ maxWidth: "450px", width: "90%", backgroundColor: "#fff" }}>
                  
                  <div className="card-header border-0 py-3 d-flex align-items-center justify-content-center gap-2 text-white" style={{ backgroundColor: "#dc3545" }}>
                    <AlertOctagon size={24} />
                    <h5 className="mb-0 fw-bold">Sancionar por Ausencia</h5>
                  </div>
                  
                  <div className="card-body p-4">
                    <p className="text-center text-dark mb-4 fw-medium" style={{ fontSize: "0.95rem" }}>
                      Está a punto de dar el partido por finalizado. El equipo que <strong>NO se presentó</strong> recibirá <strong className="text-danger">0 puntos</strong> en la tabla, y el equipo presente ganará 6-0 / 6-0.
                    </p>
                    
                    <div className="mb-4">
                      <label className="form-label fw-bold text-secondary small fs-6">Seleccione el equipo que <strong>NO</strong> se presentó:</label>
                      <select 
                        className="form-select form-select-lg" 
                        value={absentTeamId} 
                        onChange={(e) => setAbsentTeamId(e.target.value)}
                      >
                        <option value="">-- Elegir Equipo Ausente --</option>
                        {hasTeam1 && (
                          <option value={match.team1._id}>
                            {match.team1?.player1?.lastName} / {match.team1?.player2?.lastName}
                          </option>
                        )}
                        {hasTeam2 && (
                          <option value={match.team2._id}>
                            {match.team2?.player1?.lastName} / {match.team2?.player2?.lastName}
                          </option>
                        )}
                      </select>
                    </div>

                    <div className="d-flex justify-content-center gap-3 mt-2">
                      <button className="btn btn-light border fw-bold text-secondary px-4 rounded-pill" onClick={() => { setShowWalkoverModal(false); setAbsentTeamId(""); }} disabled={isSaving}>
                        Cancelar Sanción
                      </button>
                      <button className="btn btn-danger fw-bold px-4 shadow-sm rounded-pill d-flex align-items-center gap-2" onClick={handleApplyWalkover} disabled={isSaving}>
                        {isSaving ? "Aplicando..." : "Aplicar W.O. Definitivo"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CABECERA */}
            <div className="modal-header border-0 py-3 px-4 text-white" style={{ backgroundColor: "#0f172a" }}>
              <div>
                <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <Activity size={20} className="text-warning" />
                  Gestionar Partido
                </h5>
                {/* 🔥 FIX: Mostrar Categoría y fase correctamente si es Playoff */}
                <span className="text-white-50 small d-flex align-items-center gap-1 mt-1" style={{ fontSize: "0.85rem" }}>
                  {match.isPlayoff && <GitMerge size={14} />}
                  {match.isPlayoff ? match.stage : `${match.groupId?.name || "Grupo"} ${match.groupId?.category ? `(${match.groupId.category})` : ""}`} • {match.court}
                </span>
              </div>
              <button type="button" className="btn-close btn-close-white" onClick={handleCloseRequest} disabled={isSaving}></button>
            </div>

            <div className="modal-body p-0 bg-light">
              
              {/* SECCIÓN 1: ESTADO DEL PARTIDO Y RELOJ EN VIVO */}
              <div className="p-4 border-bottom bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                
                <div>
                  <h6 className="fw-bold text-secondary mb-3 small text-uppercase">Estado Actual</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {["Pendiente", "En Curso", "Finalizado"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`btn btn-sm fw-bold rounded-pill px-4 transition-all ${status === s ? (s === 'En Curso' ? 'btn-success text-white' : s === 'Finalizado' ? 'btn-danger text-white' : 'btn-warning text-dark') : 'btn-outline-secondary border-opacity-50'}`}
                        onClick={() => handleStatusChange(s)}
                      >
                        {s}
                      </button>
                    ))}
                    
                    {/* 🔥 FIX: Solo habilitamos W.O. si ambos equipos están definidos */}
                    {match.status !== "Finalizado" && hasTeam1 && hasTeam2 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger fw-bold rounded-pill px-3 ms-md-2 d-flex align-items-center gap-1"
                        onClick={() => setShowWalkoverModal(true)}
                      >
                        <AlertOctagon size={14} /> Aplicar W.O.
                      </button>
                    )}
                  </div>

                  <div className="d-flex gap-3 mt-3 text-muted bg-light p-2 rounded-3 border" style={{ fontSize: "0.85rem" }}>
                    <span><strong>Inicio:</strong> {formatTime(match.startTime)}</span>
                    <span><strong>Fin:</strong> {formatTime(match.endTime)}</span>
                  </div>
                </div>

                {match.status === "En Curso" && match.startTime && (
                  <div className="d-flex flex-column align-items-end justify-content-center bg-success bg-opacity-10 rounded-3 p-3 border border-success border-opacity-25" style={{ minWidth: "150px" }}>
                    <span className="text-success small fw-bold mb-1 text-uppercase">Tiempo de Juego</span>
                    <LiveTimer startTime={match.startTime} className="fs-3 fw-bold text-success" />
                  </div>
                )}
                {match.status === "Finalizado" && (
                  <div className="d-flex flex-column align-items-end justify-content-center bg-light rounded-3 p-3 border" style={{ minWidth: "150px" }}>
                    <span className="text-secondary small fw-bold mb-1 text-uppercase">Duración Final</span>
                    <span className="fs-3 fw-bold text-dark">⏱ {match.duration || 0} min</span>
                  </div>
                )}

              </div>

              {/* SECCIÓN 2: CARGA DE RESULTADOS */}
              <div className="p-4">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-3">
                  <h6 className="fw-bold text-secondary mb-0 small text-uppercase">Marcador</h6>
                  
                  <div className="bg-warning bg-opacity-10 border border-warning rounded-pill px-3 py-2 shadow-sm d-inline-block">
                    <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                      <input 
                        className="form-check-input mt-0 cursor-pointer" 
                        type="checkbox" 
                        id="stbSwitch" 
                        style={{ transform: "scale(1.2)", margin: "0" }}
                        checked={isSuperTieBreak}
                        onChange={handleStbChange}
                      />
                      <label 
                        className="form-check-label fw-bold cursor-pointer ms-2" 
                        htmlFor="stbSwitch" 
                        style={{ color: "#856404", fontSize: "0.85rem" }}
                      >
                        ⚠️ Activar Súper Tie-Break (3er Set a 10 pts)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card shadow-sm border-0 overflow-hidden">
                  <div className="table-responsive">
                    <table className="table table-borderless mb-0 align-middle text-center">
                      <thead className="table-light border-bottom text-muted small fw-bold">
                        <tr>
                          <th className="text-start ps-4" style={{ width: "50%" }}>Pareja</th>
                          <th style={{ width: "16%" }}>Set 1</th>
                          <th style={{ width: "16%" }}>Set 2</th>
                          <th style={{ width: "16%" }} className={isSuperTieBreak ? "text-warning" : ""}>Set 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        
                        {/* EQUIPO 1 */}
                        <tr className="border-bottom">
                          <td className="text-start ps-4 py-3">
                            {/* 🔥 FIX: Manejo correcto si el equipo es un Placeholder (A definir) */}
                            {hasTeam1 ? (
                              <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center flex-shrink-0">
                                  <img src={match.team1.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "36px", height: "36px", zIndex: 2 }} />
                                  <img src={match.team1.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "36px", height: "36px", marginLeft: "-12px", zIndex: 1 }} />
                                </div>
                                <div className="d-flex flex-column text-start" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                                  <div className="text-truncate">
                                    <span className="fw-bold text-dark text-uppercase">{match.team1.player1?.lastName}</span> <span className="text-dark">{match.team1.player1?.firstName}</span>
                                  </div>
                                  <div className="text-truncate" style={{ marginTop: "2px" }}>
                                    <span className="fw-bold text-dark text-uppercase">{match.team1.player2?.lastName}</span> <span className="text-dark">{match.team1.player2?.firstName}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-2">
                                <span className="badge bg-secondary px-3 py-2 text-uppercase rounded-pill shadow-sm">
                                  {match.placeholderTeam1 || "Por definir"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <input type="number" min="0" className="form-control text-center fw-bold fs-5 p-1" value={scores.set1.gamesTeam1} onChange={(e) => handleScoreChange('set1', 'gamesTeam1', e.target.value)} disabled={match.result?.isWalkover || !hasTeam1} />
                          </td>
                          <td>
                            <input type="number" min="0" className="form-control text-center fw-bold fs-5 p-1" value={scores.set2.gamesTeam1} onChange={(e) => handleScoreChange('set2', 'gamesTeam1', e.target.value)} disabled={match.result?.isWalkover || !hasTeam1} />
                          </td>
                          <td>
                            <input type="number" min="0" className={`form-control text-center fw-bold fs-5 p-1 ${isSuperTieBreak ? 'border-warning text-warning bg-warning bg-opacity-10' : ''}`} value={scores.set3.gamesTeam1} onChange={(e) => handleScoreChange('set3', 'gamesTeam1', e.target.value)} disabled={match.result?.isWalkover || !hasTeam1} />
                          </td>
                        </tr>

                        {/* EQUIPO 2 */}
                        <tr>
                          <td className="text-start ps-4 py-3">
                            {/* 🔥 FIX: Manejo correcto si el equipo es un Placeholder (A definir) */}
                            {hasTeam2 ? (
                              <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center flex-shrink-0">
                                  <img src={match.team2.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "36px", height: "36px", zIndex: 2 }} />
                                  <img src={match.team2.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "36px", height: "36px", marginLeft: "-12px", zIndex: 1 }} />
                                </div>
                                <div className="d-flex flex-column text-start" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                                  <div className="text-truncate">
                                    <span className="fw-bold text-dark text-uppercase">{match.team2.player1?.lastName}</span> <span className="text-dark">{match.team2.player1?.firstName}</span>
                                  </div>
                                  <div className="text-truncate" style={{ marginTop: "2px" }}>
                                    <span className="fw-bold text-dark text-uppercase">{match.team2.player2?.lastName}</span> <span className="text-dark">{match.team2.player2?.firstName}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="py-2">
                                <span className="badge bg-secondary px-3 py-2 text-uppercase rounded-pill shadow-sm">
                                  {match.placeholderTeam2 || "Por definir"}
                                </span>
                              </div>
                            )}
                          </td>
                          <td>
                            <input type="number" min="0" className="form-control text-center fw-bold fs-5 p-1" value={scores.set1.gamesTeam2} onChange={(e) => handleScoreChange('set1', 'gamesTeam2', e.target.value)} disabled={match.result?.isWalkover || !hasTeam2} />
                          </td>
                          <td>
                            <input type="number" min="0" className="form-control text-center fw-bold fs-5 p-1" value={scores.set2.gamesTeam2} onChange={(e) => handleScoreChange('set2', 'gamesTeam2', e.target.value)} disabled={match.result?.isWalkover || !hasTeam2} />
                          </td>
                          <td>
                            <input type="number" min="0" className={`form-control text-center fw-bold fs-5 p-1 ${isSuperTieBreak ? 'border-warning text-warning bg-warning bg-opacity-10' : ''}`} value={scores.set3.gamesTeam2} onChange={(e) => handleScoreChange('set3', 'gamesTeam2', e.target.value)} disabled={match.result?.isWalkover || !hasTeam2} />
                          </td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-footer border-0 bg-light d-flex justify-content-end px-4 py-3">
              <button type="button" className="btn btn-light fw-bold text-secondary border px-4 d-flex align-items-center gap-2" onClick={handleCloseRequest} disabled={isSaving}>
                <LogOut size={16} /> Salir
              </button>
              <button 
                type="button" 
                className="btn text-white fw-bold d-flex align-items-center gap-2 px-4 shadow-sm" 
                style={{ backgroundColor: "#fd7e14" }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Actualizando..." : <><Save size={18} /> Actualizar Datos</>}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ManageMatchModal;