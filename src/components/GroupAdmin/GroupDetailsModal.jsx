import React, { useState, useEffect } from "react";
import { useGroups } from "../../context/GroupContext";
import { useMatches } from "../../context/MatchContext"; 
import { X, Calendar, Clock, MapPin, Edit2, Save, Trophy, Users, Plus } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const GroupDetailsModal = ({ group, onClose, onEditTeams }) => {
  // 🔥 Traemos createManualMatch del contexto
  const { matches, loadMatchesByGroup, updateMatch, createManualMatch } = useMatches(); 
  const [loading, setLoading] = useState(true);
  
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", court: "" });
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 Estados para la creación manual de partidos (Solo grupos de 4)
  const [isCreatingManualMatch, setIsCreatingManualMatch] = useState(false);
  const [manualForm, setManualForm] = useState({ team1: "", team2: "" });

  useEffect(() => {
    const fetchMatches = async () => {
      await loadMatchesByGroup(group._id);
      setLoading(false);
    };
    fetchMatches();
  }, [group._id]);

  const canEditTeams = matches.every(m => m.status === "Pendiente");

  const calculateStandings = () => {
    let stats = group.teams.map(team => ({
      ...team,
      pts: 0, pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, ds: 0, gf: 0, gc: 0, dg: 0, stb: 0
    }));

    matches.filter(m => m.status === "Finalizado").forEach(match => {
      let t1Id = match.team1._id || match.team1;
      let t2Id = match.team2._id || match.team2;

      let t1Stat = stats.find(t => t._id === t1Id);
      let t2Stat = stats.find(t => t._id === t2Id);

      if (!t1Stat || !t2Stat) return;

      let s1T1 = parseInt(match.result?.set1?.gamesTeam1) || 0;
      let s1T2 = parseInt(match.result?.set1?.gamesTeam2) || 0;
      let s2T1 = parseInt(match.result?.set2?.gamesTeam1) || 0;
      let s2T2 = parseInt(match.result?.set2?.gamesTeam2) || 0;
      let s3T1 = parseInt(match.result?.set3?.gamesTeam1) || 0;
      let s3T2 = parseInt(match.result?.set3?.gamesTeam2) || 0;

      let isStb = match.result?.isSuperTieBreak || false;

      let setsT1 = 0;
      let setsT2 = 0;
      if (s1T1 > s1T2) setsT1++; else if (s1T2 > s1T1) setsT2++;
      if (s2T1 > s2T2) setsT1++; else if (s2T2 > s2T1) setsT2++;
      if (s3T1 > s3T2) setsT1++; else if (s3T2 > s3T1) setsT2++;

      let gamesT1 = s1T1 + s2T1 + (!isStb ? s3T1 : 0);
      let gamesT2 = s1T2 + s2T2 + (!isStb ? s3T2 : 0);

      let winnerId = setsT1 > setsT2 ? t1Id : t2Id;

      t1Stat.pj += 1;
      t1Stat.sf += setsT1;
      t1Stat.sc += setsT2;
      t1Stat.gf += gamesT1;
      t1Stat.gc += gamesT2;
      if (winnerId === t1Id) {
        t1Stat.pg += 1;
        t1Stat.pts += 2;
        if (isStb && setsT1 > setsT2) t1Stat.stb += 1;
      } else {
        t1Stat.pp += 1;
        if (!match.result?.isWalkover) t1Stat.pts += 1;
      }

      t2Stat.pj += 1;
      t2Stat.sf += setsT2;
      t2Stat.sc += setsT1;
      t2Stat.gf += gamesT2;
      t2Stat.gc += gamesT1;
      if (winnerId === t2Id) {
        t2Stat.pg += 1;
        t2Stat.pts += 2;
        if (isStb && setsT2 > setsT1) t2Stat.stb += 1;
      } else {
        t2Stat.pp += 1;
        if (!match.result?.isWalkover) t2Stat.pts += 1;
      }
    });

    stats.forEach(t => {
      t.ds = t.sf - t.sc;
      t.dg = t.gf - t.gc;
    });

    return stats.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.ds !== a.ds) return b.ds - a.ds;
      return b.dg - a.dg;
    });
  };

  const standings = calculateStandings();

  const handleEditClick = (match) => {
    setEditingMatchId(match._id);
    setEditForm({
      date: match.date === "A programar" ? "" : match.date,
      time: match.time === "A programar" ? "" : match.time,
      court: match.court === "A asignar" ? "" : match.court
    });
  };

  const handleSaveSchedule = async (matchId) => {
    setIsSaving(true);
    const result = await updateMatch(matchId, {
      date: editForm.date || "A programar",
      time: editForm.time || "A programar",
      court: editForm.court || "A asignar"
    });
    
    setIsSaving(false);
    if (result.success) {
      toast.success("Horario asignado correctamente");
      setEditingMatchId(null);
    } else {
      toast.error(result.message);
    }
  };

  // 🔥 NUEVO: Función para guardar el partido manual
  const handleSaveManualMatch = async () => {
    if (!manualForm.team1 || !manualForm.team2) {
      return toast.error("Seleccioná ambas parejas para crear el partido.");
    }
    if (manualForm.team1 === manualForm.team2) {
      return toast.error("Una pareja no puede jugar contra sí misma.");
    }

    setIsSaving(true);
    const result = await createManualMatch({
      tournamentId: group.tournamentId,
      groupId: group._id,
      team1: manualForm.team1,
      team2: manualForm.team2
    });
    
    setIsSaving(false);
    if (result.success) {
      toast.success("Partido creado correctamente.");
      setIsCreatingManualMatch(false);
      setManualForm({ team1: "", team2: "" });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#fd7e14" }}>
              <div>
                <h4 className="modal-title fw-bold text-white mb-0">{group.name}</h4>
                <span className="text-white-50 small">{group.qualificationRule}</span>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <button 
                  className={`btn btn-sm d-flex align-items-center gap-2 fw-bold px-3 py-2 rounded-pill ${canEditTeams ? 'btn-light text-dark shadow-sm' : 'btn-secondary opacity-50'}`}
                  onClick={() => canEditTeams ? onEditTeams(group) : toast.error("No podés editar las parejas porque ya hay partidos iniciados o finalizados.")}
                  title={!canEditTeams ? "Bloqueado: Hay partidos en juego" : "Agregar o quitar parejas"}
                >
                  <Users size={16} /> {canEditTeams ? "Editar Parejas" : "Edición Bloqueada"}
                </button>
                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
              </div>
            </div>

            <div className="modal-body p-0 bg-light">
              {loading ? (
                <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>
              ) : (
                <div className="row g-0">
                  
                  <div className="col-lg-7 p-4 border-end bg-white">
                    <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                      <Trophy size={20} className="text-warning" /> Posiciones
                    </h5>
                    
                    <div className="table-responsive rounded-3 border">
                      <table className="table table-hover table-borderless mb-0 align-middle text-center" style={{ fontSize: "0.80rem" }}>
                        <thead className="table-light border-bottom">
                          <tr>
                            <th className="text-start ps-3" style={{ width: "32%" }}>Participantes</th>
                            <th title="Puntos Totales" className="text-primary">Pts</th>
                            <th title="Partidos Jugados">PJ</th>
                            <th title="Partidos Ganados">PG</th>
                            <th title="Partidos Perdidos">PP</th>
                            <th title="Sets a Favor" className="text-muted border-start">SF</th>
                            <th title="Sets en Contra" className="text-muted">SC</th>
                            <th title="Diferencia de Sets" className="fw-bold text-dark">DS</th>
                            <th title="Games a Favor" className="text-muted border-start">GF</th>
                            <th title="Games en Contra" className="text-muted">GC</th>
                            <th title="Diferencia de Games" className="fw-bold text-dark">DG</th>
                            <th title="Súper Tie-Break Ganados" className="border-start" style={{ color: "#fd7e14" }}>STB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team, index) => (
                            <tr key={team._id} className="border-bottom">
                              <td className="text-start ps-2 py-3">
                                <div className="d-flex align-items-center">
                                  <span className="fw-bold text-secondary fs-6 me-2">{index + 1}</span>
                                  <div className="d-flex align-items-center me-2 flex-shrink-0">
                                    <img src={team.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", zIndex: 2 }} />
                                    <img src={team.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", marginLeft: "-12px", zIndex: 1 }} />
                                  </div>
                                  <div className="d-flex flex-column text-start" style={{ lineHeight: "1.2", fontSize: "0.75rem" }}>
                                    <div className="text-truncate" style={{ maxWidth: "140px" }}>
                                      <span className="fw-bold text-dark text-uppercase">{team.player1?.lastName}</span> <span className="text-dark">{team.player1?.firstName}</span>
                                    </div>
                                    <div className="text-truncate" style={{ maxWidth: "140px", marginTop: "2px" }}>
                                      <span className="fw-bold text-dark text-uppercase">{team.player2?.lastName}</span> <span className="text-dark">{team.player2?.firstName}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="fw-bold text-primary fs-6">{team.pts}</td>
                              <td>{team.pj}</td>
                              <td className="text-success fw-bold">{team.pg}</td>
                              <td className="text-danger fw-bold">{team.pp}</td>
                              <td className="text-muted border-start">{team.sf}</td>
                              <td className="text-muted">{team.sc}</td>
                              <td className="fw-bold text-dark">{team.ds > 0 ? `+${team.ds}` : team.ds}</td>
                              <td className="text-muted border-start">{team.gf}</td>
                              <td className="text-muted">{team.gc}</td>
                              <td className="fw-bold text-dark">{team.dg > 0 ? `+${team.dg}` : team.dg}</td>
                              <td className="fw-bold border-start" style={{ color: "#fd7e14" }}>{team.stb}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="col-lg-5 p-4 bg-light" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    
                    {/* 🔥 MODIFICACIÓN: Título con botón para agregar partido manual si son 4 equipos */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold text-dark mb-0">Fixture y Programación</h5>
                      {group.teams?.length === 4 && (
                        <button 
                          className={`btn btn-sm fw-bold rounded-pill shadow-sm d-flex align-items-center gap-1 ${isCreatingManualMatch ? 'btn-secondary' : 'btn-dark'}`}
                          onClick={() => {
                            setIsCreatingManualMatch(!isCreatingManualMatch);
                            setManualForm({ team1: "", team2: "" });
                          }}
                        >
                          {isCreatingManualMatch ? <X size={14}/> : <Plus size={14}/>} 
                          {isCreatingManualMatch ? "Cancelar" : "Crear Partido"}
                        </button>
                      )}
                    </div>

                    {/* 🔥 FORMULARIO PARA CREAR PARTIDO MANUAL */}
                    {isCreatingManualMatch && (
                      <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <Edit2 size={16} className="text-padel-orange" />
                          <h6 className="fw-bold m-0" style={{ color: "#fd7e14" }}>Nuevo Cruce Manual</h6>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label small fw-bold text-secondary mb-1">Seleccionar Pareja 1</label>
                          <select className="form-select text-sm" value={manualForm.team1} onChange={(e) => setManualForm({...manualForm, team1: e.target.value})}>
                            <option value="">-- Elegir pareja --</option>
                            {group.teams.map(team => (
                              <option key={team._id} value={team._id}>
                                {team.player1?.lastName} / {team.player2?.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label small fw-bold text-secondary mb-1">Seleccionar Pareja 2</label>
                          <select className="form-select text-sm" value={manualForm.team2} onChange={(e) => setManualForm({...manualForm, team2: e.target.value})}>
                            <option value="">-- Elegir pareja --</option>
                            {group.teams.map(team => (
                              <option key={team._id} value={team._id}>
                                {team.player1?.lastName} / {team.player2?.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button 
                          className="btn w-100 text-white fw-bold shadow-sm"
                          style={{ backgroundColor: "#0f172a" }}
                          onClick={handleSaveManualMatch}
                          disabled={isSaving}
                        >
                          {isSaving ? "Guardando..." : "Confirmar Partido"}
                        </button>
                      </div>
                    )}
                    
                    <div className="d-flex flex-column gap-3">
                      {matches.length === 0 ? (
                        <p className="text-muted text-center py-4 border rounded bg-white">
                          No hay partidos generados.
                          {group.teams?.length === 4 && " Creá los cruces manualmente con el botón superior."}
                        </p>
                      ) : (
                        matches.map((match) => (
                          <div key={match._id} className="card border shadow-sm rounded-4 bg-white overflow-hidden">
                            
                            {editingMatchId !== match._id && (
                              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ backgroundColor: "#f8fafc" }}>
                                <div className="d-flex gap-3 text-muted" style={{ fontSize: "0.80rem" }}>
                                  <span className="d-flex align-items-center gap-1"><Calendar size={12}/> {match.date}</span>
                                  <span className="d-flex align-items-center gap-1"><Clock size={12}/> {match.time}</span>
                                  <span className="d-flex align-items-center gap-1 text-primary fw-bold"><MapPin size={12}/> {match.court}</span>
                                </div>
                                
                                {match.status === "Pendiente" ? (
                                  <button 
                                    className="btn btn-sm btn-outline-secondary rounded-pill fw-bold d-flex align-items-center gap-1 px-2 py-0"
                                    onClick={() => handleEditClick(match)}
                                    style={{ fontSize: "0.75rem", height: "24px" }}
                                  >
                                    <Edit2 size={10} /> Programar
                                  </button>
                                ) : (
                                  <span 
                                    className={`badge rounded-pill fw-bold ${match.status === "En Curso" ? "bg-success" : "bg-danger"}`} 
                                    style={{ fontSize: "0.70rem" }}
                                  >
                                    {match.status}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="card-body p-3">
                              
                              {/* CABECERA DE SETS */}
                              {match.status !== "Pendiente" && (
                                <div className="d-flex justify-content-end mb-2 text-muted fw-bold" style={{ fontSize: "0.70rem" }}>
                                  <div className="d-flex gap-3 pe-1">
                                    <span style={{ width: "24px", textAlign: "center" }}>S1</span>
                                    <span style={{ width: "24px", textAlign: "center" }}>S2</span>
                                    <span style={{ width: "24px", textAlign: "center" }}>S3</span>
                                  </div>
                                </div>
                              )}

                              {/* EQUIPO 1 */}
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="d-flex align-items-center flex-shrink-0">
                                    <img src={match.team1?.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", zIndex: 2 }} />
                                    <img src={match.team1?.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", marginLeft: "-12px", zIndex: 1 }} />
                                  </div>
                                  <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.80rem" }}>
                                    <div className="text-truncate">
                                      <span className="fw-bold text-dark text-uppercase">{match.team1?.player1?.lastName}</span> <span className="text-dark">{match.team1?.player1?.firstName}</span>
                                    </div>
                                    <div className="text-truncate" style={{ marginTop: "2px" }}>
                                      <span className="fw-bold text-dark text-uppercase">{match.team1?.player2?.lastName}</span> <span className="text-dark">{match.team1?.player2?.firstName}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* PUNTAJES EQUIPO 1 O "VS" */}
                                {match.status !== "Pendiente" ? (
                                  <div className="d-flex gap-3 pe-1 fs-6 fw-bold text-dark">
                                    <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set1?.gamesTeam1 || 0}</span>
                                    <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set2?.gamesTeam1 || 0}</span>
                                    <span style={{ width: "24px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam1 || 0}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted fw-bold small pe-3">VS</span>
                                )}
                              </div>

                              {/* EQUIPO 2 */}
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-2">
                                  <div className="d-flex align-items-center flex-shrink-0">
                                    <img src={match.team2?.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", zIndex: 2 }} />
                                    <img src={match.team2?.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", marginLeft: "-12px", zIndex: 1 }} />
                                  </div>
                                  <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.80rem" }}>
                                    <div className="text-truncate">
                                      <span className="fw-bold text-dark text-uppercase">{match.team2?.player1?.lastName}</span> <span className="text-dark">{match.team2?.player1?.firstName}</span>
                                    </div>
                                    <div className="text-truncate" style={{ marginTop: "2px" }}>
                                      <span className="fw-bold text-dark text-uppercase">{match.team2?.player2?.lastName}</span> <span className="text-dark">{match.team2?.player2?.firstName}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* PUNTAJES EQUIPO 2 */}
                                {match.status !== "Pendiente" ? (
                                  <div className="d-flex gap-3 pe-1 fs-6 fw-bold text-dark">
                                    <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set1?.gamesTeam2 || 0}</span>
                                    <span style={{ width: "24px", textAlign: "center" }}>{match.result?.set2?.gamesTeam2 || 0}</span>
                                    <span style={{ width: "24px", textAlign: "center", color: "#fd7e14" }}>{match.result?.set3?.gamesTeam2 || 0}</span>
                                  </div>
                                ) : (
                                  <span className="pe-4"></span> 
                                )}
                              </div>

                              {/* FORMULARIO DE EDICIÓN DE HORARIO/CANCHA */}
                              {editingMatchId === match._id && (
                                <>
                                  <hr className="my-3 opacity-25" />
                                  <div className="bg-light p-3 rounded-3 border">
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
                                      <button className="btn btn-sm btn-light border" onClick={() => setEditingMatchId(null)} disabled={isSaving}>Cancelar</button>
                                      <button className="btn btn-sm text-white fw-bold d-flex align-items-center gap-1" style={{ backgroundColor: "#0f172a" }} onClick={() => handleSaveSchedule(match._id)} disabled={isSaving}>
                                        <Save size={14} /> Guardar
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}

                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupDetailsModal;