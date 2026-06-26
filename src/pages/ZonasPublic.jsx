// src/pages/ZonasPublic.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, Info, LayoutGrid, X, Trophy, Calendar, Clock, MapPin, Filter } from 'lucide-react';
// 🔥 IMPORTAMOS LA FUNCIÓN PARA TORNEOS PÚBLICOS
import { getPublicGroupsRequest, getPublicMatchesRequest, getPublicTournamentsRequest } from '../services/public.service';

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

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

function ZonasPublic() {
  // 🔥 ESTADO LOCAL PARA TORNEOS PÚBLICOS
  const [tournaments, setTournaments] = useState([]);
  
  // Estados para los filtros globales
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [groups, setGroups] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para el Modal
  const [selectedGroup, setSelectedGroup] = useState(null);

  // 1. CARGAMOS TORNEOS DIRECTO DESDE LA RUTA PÚBLICA
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

  // 2. Extraer categorías del torneo seleccionado
  const selectedTournament = tournaments.find(t => t._id === selectedTournamentId);
  const categoriasDisponibles = selectedTournament 
    ? [...new Set(selectedTournament.categories.map(c => `${c.name} ${c.gender}`))] 
    : [];

  // 3. Manejadores de cambios
  const handleTournamentChange = (e) => {
    setSelectedTournamentId(e.target.value);
    setSelectedCategory(""); // Reseteamos categoría
    setGroups([]); // Limpiamos la pantalla
    setAllMatches([]);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // 4. Buscar Zonas y Partidos (Solo si ambos filtros están seleccionados)
  const fetchZonasData = async () => {
    if (!selectedTournamentId || !selectedCategory) return;
    
    setIsLoading(true);
    try {
      const [groupsRes, matchesRes] = await Promise.all([
        getPublicGroupsRequest(selectedTournamentId, selectedCategory),
        getPublicMatchesRequest(selectedTournamentId, selectedCategory)
      ]);
      setGroups(groupsRes.data.groups || []);
      setAllMatches(matchesRes.data.matches || []);
    } catch (error) {
      console.error("Error al cargar datos de zonas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disparar la búsqueda automáticamente cuando se selecciona categoría
  useEffect(() => {
    fetchZonasData();
  }, [selectedTournamentId, selectedCategory]); // eslint-disable-line

  // Lógica de cálculo de posiciones (Intacta)
  const calculateStandings = (group) => {
    const groupMatches = allMatches.filter(m => m.groupId?._id === group._id);
    
    let stats = group.teams.map(team => ({
      ...team,
      pts: 0, pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, ds: 0, gf: 0, gc: 0, dg: 0, stb: 0
    }));

    groupMatches.filter(m => m.status === "Finalizado").forEach(match => {
      let t1Id = match.team1?._id || match.team1;
      let t2Id = match.team2?._id || match.team2;

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

      t1Stat.pj += 1; t1Stat.sf += setsT1; t1Stat.sc += setsT2; t1Stat.gf += gamesT1; t1Stat.gc += gamesT2;
      if (winnerId === t1Id) {
        t1Stat.pg += 1; t1Stat.pts += 2;
        if (isStb && setsT1 > setsT2) t1Stat.stb += 1;
      } else {
        t1Stat.pp += 1;
        if (!match.result?.isWalkover) t1Stat.pts += 1;
      }

      t2Stat.pj += 1; t2Stat.sf += setsT2; t2Stat.sc += setsT1; t2Stat.gf += gamesT2; t2Stat.gc += gamesT1;
      if (winnerId === t2Id) {
        t2Stat.pg += 1; t2Stat.pts += 2;
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

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      
      {/* Encabezado */}
      <div className="text-center mb-4">
        <h1 className="display-5 fw-bold text-uppercase text-padel-orange mb-2">Fase de Zonas</h1>
        <p className="text-muted fs-5">Revisá las posiciones y el fixture de cada grupo</p>
      </div>

      {/* 🔥 FILTRO GLOBAL (TORNEO Y CATEGORÍA) */}
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

      {/* ====================================================
          RENDERIZADO CONDICIONAL
      ======================================================== */}
      
      {/* 1. Si no seleccionó Torneo y Categoría */}
      {!selectedTournamentId || !selectedCategory ? (
        <div className="text-center py-5 bg-white rounded-4 border shadow-sm mt-4 mx-auto" style={{ maxWidth: '600px' }}>
          <LayoutGrid size={60} className="text-padel-orange mb-3 opacity-75 mx-auto" />
          <h4 className="fw-bold text-dark mb-2">¡Elegí tu categoría!</h4>
          <p className="text-muted fs-5 px-4 mb-0">
            Utilizá los filtros de arriba para seleccionar el <strong>Torneo</strong> y la <strong>Categoría</strong>, y vas a poder visualizar todas las zonas y tablas de posiciones correspondientes.
          </p>
        </div>
      ) 
      
      /* 2. Si está cargando los datos */
      : isLoading ? (
        <div className="text-center py-5 my-5">
          <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: '#fd7e14' }} />
          <p className="text-muted fw-medium">Cargando grupos...</p>
        </div>
      ) 
      
      /* 3. Si no hay grupos en esa categoría */
      : groups.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-4 border shadow-sm mt-4">
          <Info size={50} className="text-muted mb-3 mx-auto opacity-50" />
          <h4 className="fw-bold text-dark mb-2">Aún no hay grupos definidos</h4>
          <p className="text-muted mb-0 fs-5 px-3">
            Las zonas de esta categoría se publicarán acá cuando estén confirmadas.
          </p>
          <button className="btn btn-outline-secondary mt-4 rounded-pill px-4" onClick={fetchZonasData}>
            ↻ Actualizar información
          </button>
        </div>
      ) 
      
      /* 4. Si hay grupos cargados (Grilla de Tarjetas) */
      : (
        <div className="row g-4 justify-content-center">
          {groups.map(group => (
            <div key={group._id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-hover">
                
                <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ backgroundColor: "#0f172a" }}>
                  <h4 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                   {group.name}
                  </h4>
                </div>

                <div className="card-body p-0">
                  <ul className="list-group list-group-flush">
                    {group.teams.length === 0 ? (
                      <li className="list-group-item py-4 text-center text-muted">Aún no hay parejas</li>
                    ) : (
                      group.teams.map((team, idx) => (
                        <li key={team._id || idx} className="list-group-item px-4 py-3 d-flex align-items-center gap-3 border-bottom">
                          <div className="position-relative" style={{ width: "45px", height: "35px", flexShrink: 0 }}>
                            <img src={team.player1?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "30px", height: "30px", left: "0", zIndex: 2 }} alt="P1" />
                            <img src={team.player2?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "30px", height: "30px", left: "15px", zIndex: 1 }} alt="P2" />
                          </div>
                          <div className="d-flex flex-column lh-1 text-truncate">
                            <span className="text-uppercase fw-bold text-dark mb-1" style={{ fontSize: "0.85rem" }}>{team.player1?.lastName}</span>
                            <span className="text-uppercase fw-bold text-dark" style={{ fontSize: "0.85rem" }}>{team.player2?.lastName}</span>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="card-footer bg-white p-2 border-0 text-center">
                  <button 
                    className="btn w-100 fw-bold py-2 shadow-none transition-hover text-padel-orange"
                    style={{ backgroundColor: "transparent" }}
                    onClick={() => setSelectedGroup(group)}
                  >
                    Ver tabla y partidos 
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL GIGANTE DE DETALLES DEL GRUPO        */}
      {/* ========================================== */}
      {selectedGroup && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.6)' }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                
                {/* Modal Header */}
                <div className="modal-header border-0 py-3 px-4 d-flex justify-content-between align-items-center" style={{ backgroundColor: "#fd7e14" }}>
                  <div>
                    <h4 className="modal-title fw-bold text-white mb-0">{selectedGroup.name}</h4>
                    <span className="text-white-50 small">{selectedGroup.category || "7ma Caballeros"}</span>
                  </div>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setSelectedGroup(null)}
                  ></button>
                </div>

                {/* Modal Body */}
                <div className="modal-body p-0 bg-light">
                  <div className="row g-0 h-100">
                    
                    {/* COLUMNA IZQUIERDA: TABLA DE POSICIONES */}
                    <div className="col-lg-7 p-3 p-md-4 border-end bg-white">
                      <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                        <Trophy size={20} className="text-padel-orange" /> Tabla de Posiciones
                      </h5>
                      
                      <div className="table-responsive rounded-3 border shadow-sm">
                        <table className="table table-hover table-borderless mb-0 align-middle text-center" style={{ fontSize: "0.80rem" }}>
                          <thead className="table-light border-bottom">
                            <tr>
                              <th className="text-start ps-3" style={{ minWidth: "180px" }}>Parejas</th>
                              <th title="Puntos Totales" className="text-primary fs-6">Pts</th>
                              <th title="Partidos Jugados">PJ</th>
                              <th title="Partidos Ganados">PG</th>
                              <th title="Partidos Perdidos">PP</th>
                              <th title="Sets a Favor" className="text-muted border-start">SF</th>
                              <th title="Sets en Contra" className="text-muted">SC</th>
                              <th title="Diferencia de Sets" className="fw-bold text-dark">DS</th>
                              <th title="Games a Favor" className="text-muted border-start">GF</th>
                              <th title="Games en Contra" className="text-muted">GC</th>
                              <th title="Diferencia de Games" className="fw-bold text-dark">DG</th>
                            </tr>
                          </thead>
                          <tbody>
                            {calculateStandings(selectedGroup).map((team, index) => (
                              <tr key={team._id} className="border-bottom">
                                <td className="text-start ps-2 py-3">
                                  <div className="d-flex align-items-center">
                                    <span className="fw-bold text-secondary fs-6 me-2" style={{ width: '15px' }}>{index + 1}</span>
                                    <div className="d-flex align-items-center me-2 flex-shrink-0">
                                      <img src={team.player1?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", zIndex: 2 }} alt="P1" />
                                      <img src={team.player2?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "32px", height: "32px", marginLeft: "-12px", zIndex: 1 }} alt="P2" />
                                    </div>
                                    <div className="d-flex flex-column text-start" style={{ lineHeight: "1.2", fontSize: "0.75rem" }}>
                                      <div className="text-truncate" style={{ maxWidth: "120px" }}>
                                        <span className="fw-bold text-dark text-uppercase">{team.player1?.lastName}</span>
                                      </div>
                                      <div className="text-truncate" style={{ maxWidth: "120px", marginTop: "2px" }}>
                                        <span className="fw-bold text-dark text-uppercase">{team.player2?.lastName}</span>
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
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: FIXTURE (Partidos del Grupo) */}
                    <div className="col-lg-5 p-3 p-md-4 bg-light">
                      <h5 className="fw-bold text-dark mb-4">Fixture y Programación</h5>
                      
                      <div className="d-flex flex-column gap-3">
                        {allMatches.filter(m => m.groupId?._id === selectedGroup._id).length === 0 ? (
                          <div className="text-center py-5 border rounded bg-white">
                            <p className="text-muted m-0">Aún no hay partidos programados.</p>
                          </div>
                        ) : (
                          allMatches.filter(m => m.groupId?._id === selectedGroup._id).map((match) => {
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
                              <div key={match._id} className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ borderTop: `4px solid ${topBorderColor}` }}>
                                
                                {/* Header del Partido */}
                                <div className="px-3 py-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: '#0f172a' }}>
                                  <span className="fw-bold text-padel-orange small">{selectedGroup.name}</span>
                                  <div className="d-flex align-items-center gap-2 text-white small fw-medium" style={{ fontSize: "0.7rem" }}>
                                    <span className="d-flex align-items-center gap-1"><Calendar size={12} /> {displayDate}</span>
                                    <span className="d-flex align-items-center gap-1"><Clock size={12} /> {displayTime}</span>
                                    <span className="d-flex align-items-center gap-1 "><MapPin size={12} /> {displayCourt}</span>
                                  </div>
                                </div>

                                {/* Cuerpo del Partido */}
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between align-items-center">
                                    
                                    {/* Equipos */}
                                    <div className="d-flex flex-column gap-2" style={{ flex: 1 }}>
                                      
                                      {/* Equipo 1 */}
                                      <div className="d-flex align-items-center gap-2">
                                        <div className="position-relative" style={{ width: "45px", height: "30px", flexShrink: 0 }}>
                                          <img src={match.team1?.player1?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "25px", height: "25px", left: "0", zIndex: 2 }} alt="P1" />
                                          <img src={match.team1?.player2?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "25px", height: "25px", left: "15px", zIndex: 1 }} alt="P2" />
                                        </div>
                                        <div className="d-flex flex-column lh-1">
                                          <span className="text-uppercase fw-bold text-dark mb-1" style={{ fontSize: "0.75rem" }}>{match.team1?.player1?.lastName}</span>
                                          <span className="text-uppercase fw-bold text-dark" style={{ fontSize: "0.75rem" }}>{match.team1?.player2?.lastName}</span>
                                        </div>
                                      </div>

                                      {/* Equipo 2 */}
                                      <div className="d-flex align-items-center gap-2 mt-1">
                                        <div className="position-relative" style={{ width: "45px", height: "30px", flexShrink: 0 }}>
                                          <img src={match.team2?.player1?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "25px", height: "25px", left: "0", zIndex: 2 }} alt="P1" />
                                          <img src={match.team2?.player2?.profileImage || DEFAULT_AVATAR} className="rounded-circle border border-2 border-white position-absolute object-fit-cover shadow-sm" style={{ width: "25px", height: "25px", left: "15px", zIndex: 1 }} alt="P2" />
                                        </div>
                                        <div className="d-flex flex-column lh-1">
                                          <span className="text-uppercase fw-bold text-dark mb-1" style={{ fontSize: "0.75rem" }}>{match.team2?.player1?.lastName}</span>
                                          <span className="text-uppercase fw-bold text-dark" style={{ fontSize: "0.75rem" }}>{match.team2?.player2?.lastName}</span>
                                        </div>
                                      </div>

                                    </div>

                                    {/* Resultados */}
                                    <div className="d-flex gap-3 ms-2">
                                      {match.status === 'Pendiente' ? (
                                        <div className="fw-bold text-muted fs-6 align-self-center pe-3">VS</div>
                                      ) : match.result?.isWalkover ? (
                                        <div className="fw-bold text-danger small align-self-center pe-2">W.O.</div>
                                      ) : (
                                        <>
                                          {(set1?.gamesTeam1 !== undefined || set1?.gamesTeam2 !== undefined) && (
                                            <div className="d-flex flex-column justify-content-center gap-3 text-center" style={{ height: "70px" }}>
                                              <span className={`lh-1 ${st1.fw1}`} style={{ fontSize: "0.9rem" }}>{set1.gamesTeam1 ?? '-'}</span>
                                              <span className={`lh-1 ${st1.fw2}`} style={{ fontSize: "0.9rem" }}>{set1.gamesTeam2 ?? '-'}</span>
                                            </div>
                                          )}
                                          {(set2?.gamesTeam1 !== undefined || set2?.gamesTeam2 !== undefined) && (
                                            <div className="d-flex flex-column justify-content-center gap-3 text-center" style={{ height: "70px" }}>
                                              <span className={`lh-1 ${st2.fw1}`} style={{ fontSize: "0.9rem" }}>{set2.gamesTeam1 ?? '-'}</span>
                                              <span className={`lh-1 ${st2.fw2}`} style={{ fontSize: "0.9rem" }}>{set2.gamesTeam2 ?? '-'}</span>
                                            </div>
                                          )}
                                          {(set3?.gamesTeam1 !== undefined || set3?.gamesTeam2 !== undefined) && (
                                            <div className="d-flex flex-column justify-content-center gap-3 text-center position-relative" style={{ height: "70px" }}>
                                              {isSuperTieBreak && <span className="position-absolute text-padel-orange fw-bold w-100 text-center" style={{ top: "-5px", fontSize: "0.5rem" }}>STB</span>}
                                              <span className={`lh-1 ${st3.fw1}`} style={{ fontSize: "0.9rem" }}>{set3.gamesTeam1 ?? '-'}</span>
                                              <span className={`lh-1 ${st3.fw2}`} style={{ fontSize: "0.9rem" }}>{set3.gamesTeam2 ?? '-'}</span>
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>

                                  </div>

                                  {/* Tiempos / En vivo abajo */}
                                  {(match.status === "En Curso" || match.status === "Finalizado") && (
                                    <div className="mt-3 pt-2 border-top d-flex flex-column align-items-center justify-content-center">
                                      {match.status === "En Curso" && (
                                        <>
                                          <span className="badge bg-danger mb-1 pulse-animation px-2" style={{ fontSize: "0.6rem" }}>EN VIVO</span>
                                          <MatchTimer startTime={match.startTime} />
                                        </>
                                      )}
                                      {match.status === "Finalizado" && match.duration > 0 && (
                                        <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: "0.75rem" }}>
                                          <span className="text-muted fw-bold">Tiempo de juego:</span> 
                                          <span className="fw-bold">{String(Math.floor(match.duration / 60)).padStart(2, '0')}:{String(match.duration % 60).padStart(2, '0')}:00</span>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .transition-hover { transition: transform 0.2s ease-in-out; }
        .transition-hover:hover { text-decoration: underline; }
        .text-padel-orange { color: #fd7e14; }
        .bg-padel-orange { background-color: #fd7e14; }
        .pulse-animation { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}

export default ZonasPublic;