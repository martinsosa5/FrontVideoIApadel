// src/components/TeamsAdmin/TeamModal.jsx
import React, { useState, useEffect } from "react";
import { Users, X, Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useTeams } from "../../context/TeamContext";
import { usePlayers } from "../../context/PlayerContext";

const TeamModal = ({ onClose }) => {
  const { createNewTeam } = useTeams();
  const { searchPlayersForModal } = usePlayers();
  
  // Estados
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalPlayers, setModalPlayers] = useState([]); // Lista devuelta por el servidor

  // Ranuras de Asignación
  const [selectedJ1, setSelectedJ1] = useState(null);
  const [selectedJ2, setSelectedJ2] = useState(null);

  const imgDefault = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  // 🔥 FIX: Optimizado para buscar SOLO cuando el usuario escribe
  useEffect(() => {
    // Si el buscador está vacío (al abrir el modal o al borrar el texto),
    // limpiamos la lista y frenamos la petición al servidor. ¡0 consumo!
    if (!searchTerm.trim()) {
      setModalPlayers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(async () => {
      const results = await searchPlayersForModal(searchTerm);
      setModalPlayers(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Validaciones Dinámicas
  const isJ1Selected = selectedJ1 !== null;
  const isJ2Selected = selectedJ2 !== null;
  const bothSelected = isJ1Selected && isJ2Selected;
  const categoryMismatch = bothSelected && selectedJ1.category !== selectedJ2.category;
  const canSubmit = bothSelected && !categoryMismatch && !isSubmitting;

  const handleAssign = (player, slot) => {
    if ((slot === 1 && selectedJ2?._id === player._id) || 
        (slot === 2 && selectedJ1?._id === player._id)) {
      toast.error("Un jugador no puede jugar consigo mismo.", { position: "top-center" });
      return;
    }
    if (slot === 1) setSelectedJ1(player);
    if (slot === 2) setSelectedJ2(player);
  };

  const handleRemove = (slot) => {
    if (slot === 1) setSelectedJ1(null);
    if (slot === 2) setSelectedJ2(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const data = {
      player1: selectedJ1._id,
      player2: selectedJ2._id
    };

    const result = await createNewTeam(data);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, {
        position: "top-center",
        style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
      });
      onClose();
    } else {
      toast.error(result.message, {
        position: "top-center",
        style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" }
      });
    }
  };

  const Slot = ({ title, player, slotNumber }) => (
    <div className="card border-dashed shadow-sm flex-grow-1" style={{ border: '2px dashed #cbd5e1' }}>
      <div className="card-body p-3 text-center position-relative">
        <h6 className="fw-bold text-secondary mb-3">{title}</h6>
        
        {player ? (
          <div className="d-flex flex-column align-items-center animate__animated animate__fadeIn">
            <button 
              className="btn btn-sm btn-danger rounded-circle position-absolute top-0 end-0 m-2 p-1"
              onClick={() => handleRemove(slotNumber)}
              title="Quitar jugador"
            >
              <X size={14} />
            </button>
            <img src={player.profileImage || imgDefault} alt="Perfil" className="rounded-circle object-fit-cover shadow-sm mb-2" style={{ width: "60px", height: "60px" }} />
            <span className="fw-bold text-dark text-uppercase">{player.lastName}</span>
            <span className="text-muted small">{player.firstName}</span>
            <span className="badge bg-secondary mt-2 px-3">{player.category}</span>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center opacity-50 py-3">
            <UserPlaceholder />
            <span className="text-muted small mt-2">Esperando asignación...</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-light">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Users size={22} />
                Armar Nueva Pareja
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isSubmitting}></button>
            </div>

            <div className="modal-body p-0">
              
              <div className="bg-white p-4 border-bottom">
                <div className="d-flex flex-column flex-md-row gap-3">
                  <Slot title="Jugador 1" player={selectedJ1} slotNumber={1} />
                  <Slot title="Jugador 2" player={selectedJ2} slotNumber={2} />
                </div>

                {categoryMismatch && (
                  <div className="alert alert-danger mt-3 mb-0 d-flex align-items-center gap-2 border-0 fw-bold animate__animated animate__headShake">
                    <AlertCircle size={20} />
                    ¡Atención! Los jugadores seleccionados pertenecen a categorías diferentes.
                  </div>
                )}

                {bothSelected && !categoryMismatch && (
                  <div className="alert alert-success mt-3 mb-0 d-flex align-items-center gap-2 border-0 fw-bold animate__animated animate__fadeIn">
                    <CheckCircle2 size={20} />
                    Pareja válida. Categoría: {selectedJ1.category}
                  </div>
                )}
              </div>

              <div className="p-4 bg-light">
                <h6 className="fw-bold text-dark mb-3">Buscar y Asignar Jugadores</h6>
                
                <div className="position-relative mb-3">
                  {isSearching ? (
                     <Loader2 className="position-absolute top-50 start-0 translate-middle-y ms-3 text-padel-orange animate-spin" size={18} />
                  ) : (
                     <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                  )}
                  <input
                    type="text"
                    className="form-control bg-white border shadow-sm py-2 ps-5 rounded-3 text-dark fw-medium"
                    placeholder="Escribí el apellido, nombre o DNI para buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="card border-0 shadow-sm overflow-hidden">
                  <div className="list-group list-group-flush overflow-auto custom-scrollbar" style={{ maxHeight: "300px" }}>
                    
                    {/* 🔥 Mensaje inicial dinámico */}
                    {searchTerm.trim() === "" ? (
                      <div className="text-center py-4 text-muted small fw-medium">
                        Escribí en el cuadro de arriba para buscar jugadores en el sistema...
                      </div>
                    ) : modalPlayers.length === 0 && !isSearching ? (
                      <div className="text-center py-4 text-muted">
                        No se encontraron jugadores que coincidan con la búsqueda.
                      </div>
                    ) : (
                      modalPlayers.map(player => {
                        const isAssigned = selectedJ1?._id === player._id || selectedJ2?._id === player._id;

                        return (
                          <div key={player._id} className={`list-group-item px-3 py-2 d-flex align-items-center justify-content-between ${isAssigned ? 'bg-light opacity-50' : ''}`}>
                            <div className="d-flex align-items-center gap-3">
                              <img src={player.profileImage || imgDefault} alt="Perfil" className="rounded-circle object-fit-cover border" style={{ width: "40px", height: "40px" }} />
                              <div className="d-flex flex-column lh-1">
                                <span className="fw-bold text-dark text-uppercase" style={{ fontSize: "0.9rem" }}>{player.lastName}</span>
                                <span className="text-muted small mt-1">{player.firstName} - DNI: {player.dni}</span>
                              </div>
                              <span className="badge bg-secondary ms-2" style={{ fontSize: "0.7rem" }}>{player.category}</span>
                            </div>

                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-dark fw-bold rounded-pill px-3" onClick={() => handleAssign(player, 1)} disabled={isAssigned || isSubmitting}>Asignar J1</button>
                              <button className="btn btn-sm btn-outline-dark fw-bold rounded-pill px-3" onClick={() => handleAssign(player, 2)} disabled={isAssigned || isSubmitting}>Asignar J2</button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>

            <div className="modal-footer bg-white border-top">
              <button type="button" className="btn btn-light border fw-bold text-secondary" onClick={onClose} disabled={isSubmitting}>
                <X size={18} className="me-1 mb-1" /> Cancelar
              </button>
              <button type="button" className="btn fw-bold text-white shadow-sm px-4" style={{ backgroundColor: canSubmit ? "#0f172a" : "#64748b" }} disabled={!canSubmit} onClick={handleSubmit}>
                {isSubmitting ? "Registrando..." : "Crear Pareja"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
};

const UserPlaceholder = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default TeamModal;