// src/components/TournamentsAdmin/InscriptionModal.jsx
import React, { useState, useEffect } from "react";
import { useTournaments } from "../../context/TournamentContext";
import { useTeams } from "../../context/TeamContext";
import { Search, Users, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const InscriptionModal = ({ tournament, onClose }) => {
  const { tournaments, enrollTeam, unenrollTeam } = useTournaments();
  
  // Extraemos también pagination de tu contexto si lo tienes disponible (ej: totalPages)
  const { teams, loadTeams, totalPages } = useTeams();
  
  // --- ESTADOS DE PAGINACIÓN Y BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const currentTournament = tournaments.find(t => t._id === tournament._id) || tournament;
  const isEnrollmentOpen = currentTournament.status === "Inscripciones Abiertas";

  const activeCategoryObj = currentTournament.categories[activeCategoryIndex];
  const activeCategoryName = activeCategoryObj?.name || "";
  const activeCategoryGender = activeCategoryObj?.gender || "";
  const enrolledTeamIds = activeCategoryObj ? activeCategoryObj.enrolledTeams.map(t => t._id || t) : [];

  // 1. EFECTO DE DEBOUNCE: Espera 500ms después de que el usuario deje de escribir
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Si buscamos algo nuevo, volvemos a la página 1
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. EFECTO DE CARGA: Pide los datos al backend cuando cambia la página o la búsqueda
  useEffect(() => {
    // Asumimos que tu loadTeams acepta (page, limit, search)
    // Pasamos límite de 10 por página.
    loadTeams(currentPage, 10, debouncedSearch);
  }, [currentPage, debouncedSearch]); // eslint-disable-line

  const handleToggleEnrollment = async (team) => {
    const isEnrolled = enrolledTeamIds.includes(team._id);

    // Validación de negocio
    if (!isEnrolled) {
      const p1Cat = team.player1?.category;
      const p2Cat = team.player2?.category;

      if (activeCategoryName !== "Suma 13" && activeCategoryName !== "Principiantes") {
        if (p1Cat !== activeCategoryName && p2Cat !== activeCategoryName) {
          toast.error(
            `No permitido. Jugador 1 es de ${p1Cat || '?'} y Jugador 2 es de ${p2Cat || '?'}. El torneo es de ${activeCategoryName} ${activeCategoryGender}.`, 
            { style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } }
          );
          return;
        }
      }
    }

    if (isEnrolled) {
      const confirm = await Swal.fire({
        title: 'Dar de baja',
        text: `¿Quitar a ${team.name} de la categoría ${activeCategoryName} ${activeCategoryGender}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, quitar'
      });
      if (!confirm.isConfirmed) return;
    }

    setIsProcessing(true);
    let result;
    
    if (isEnrolled) {
      result = await unenrollTeam(currentTournament._id, activeCategoryName, activeCategoryGender, team._id);
    } else {
      result = await enrollTeam(currentTournament._id, activeCategoryName, activeCategoryGender, team._id);
    }
    
    setIsProcessing(false);

    if (result.success) {
      toast.success(result.message, { style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
    } else {
      toast.error(result.message, { style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } });
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Users size={22} className="text-white" /> Gestión de Inscripciones
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isProcessing}></button>
            </div>

            <div className="modal-body p-0 bg-light">
              
              {/* Info del Torneo */}
              <div className="p-3 bg-white border-bottom d-flex flex-column gap-2">
                <div>
                  <h5 className="fw-bold text-dark m-0">{currentTournament.name}</h5>
                  <span className="text-muted small">Estado: {currentTournament.status}</span>
                </div>
                
                {/* Solapas de Categorías */}
                <div className="d-flex gap-2 mt-2 overflow-auto pb-1" style={{ whiteSpace: "nowrap" }}>
                  {currentTournament.categories.map((cat, index) => (
                    <button 
                      key={`${cat.name}-${cat.gender}-${index}`} 
                      onClick={() => setActiveCategoryIndex(index)}
                      className={`btn btn-sm fw-bold rounded-pill px-3 shadow-sm transition-all text-nowrap ${activeCategoryIndex === index ? 'btn-dark' : 'btn-outline-secondary bg-white'}`}
                    >
                      {cat.name} • <span className="fw-normal">{cat.gender}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                {currentTournament.status !== 'Inscripciones Abiertas' && (
                  <div className="alert alert-warning d-flex align-items-center gap-2 py-2 fw-medium border-0 shadow-sm">
                    <AlertTriangle size={18} /> El torneo ya no está en fase de inscripción.
                  </div>
                )}

                {/* Buscador de Parejas */}
                <div className="position-relative mb-4">
                  <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  <input
                    type="text"
                    className="form-control bg-white border-0 py-2 ps-5 rounded-3 text-dark fw-medium shadow-sm"
                    placeholder="Buscar pareja por nombre en todo el sistema..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Lista de Equipos (Vienen directo del Contexto, ya filtrados por el backend) */}
                <div className="bg-white rounded-3 shadow-sm border p-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {teams.length === 0 ? (
                    <p className="text-center text-muted py-3 m-0">No se encontraron parejas.</p>
                  ) : (
                    <ul className="list-group list-group-flush">
                      {teams.map((team) => {
                        const isEnrolled = enrolledTeamIds.includes(team._id);

                        return (
                          <li key={team._id} className="list-group-item d-flex justify-content-between align-items-center py-3 border-bottom">
                            
                            <div className="d-flex align-items-center">
                              <div className="d-flex align-items-center me-3">
                                <img 
                                  src={team.player1?.profileImage || DEFAULT_AVATAR} 
                                  alt="Player 1" 
                                  className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative"
                                  style={{ width: "42px", height: "42px", zIndex: 2 }}
                                />
                                <img 
                                  src={team.player2?.profileImage || DEFAULT_AVATAR} 
                                  alt="Player 2" 
                                  className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative"
                                  style={{ width: "42px", height: "42px", marginLeft: "-15px", zIndex: 1 }}
                                />
                              </div>

                              <div>
                                <div className="fw-bold text-dark fs-6">{team.name}</div>
                                <div className="text-muted small" style={{ fontSize: "0.80rem" }}>
                                  {team.player1?.firstName} {team.player1?.lastName} ({team.player1?.category || 'N/A'}) • {team.player2?.firstName} {team.player2?.lastName} ({team.player2?.category || 'N/A'})
                                </div>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => handleToggleEnrollment(team)}
                              disabled={isProcessing || !isEnrollmentOpen}
                              className={`btn btn-sm fw-bold px-3 rounded-pill shadow-sm transition-all ${isEnrolled ? 'btn-danger' : 'btn-success'} ${!isEnrollmentOpen ? 'opacity-50' : ''}`}
                            >
                              {isEnrolled ? "X Dar de baja" : "+ Inscribir"}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* --- CONTROLES DE PAGINACIÓN --- */}
                <div className="d-flex justify-content-between align-items-center mt-3 px-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                    disabled={currentPage === 1 || isProcessing}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  
                  <span className="text-muted small fw-bold">
                    Página {currentPage} {totalPages ? `de ${totalPages}` : ''}
                  </span>

                  <button 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                    disabled={(totalPages && currentPage >= totalPages) || teams.length < 10 || isProcessing}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Siguiente <ChevronRight size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InscriptionModal;