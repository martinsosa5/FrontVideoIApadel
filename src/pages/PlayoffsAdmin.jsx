import React, { useState, useEffect } from "react";
import { useMatches } from "../context/MatchContext";
import { useTournaments } from "../context/TournamentContext"; 
import { GitMerge, Trophy, Filter, PlusCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

import CreateBracketModal from "../components/PlayoffsAdmin/CreateBracketModal";
import PlayoffTree from "../components/PlayoffsAdmin/PlayoffTree";

const PlayoffsAdmin = () => {
  const { tournaments, loadTournaments } = useTournaments(); 
  const { 
    playoffMatches, 
    loadPlayoffsByCategory, 
    loading, 
    deletePlayoffMatches, 
    consolidatePlayoffs 
  } = useMatches();

  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estados para los nuevos botones
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isConsolidating, setIsConsolidating] = useState(false);

  // Cargamos los torneos al montar la página
  useEffect(() => {
    loadTournaments();
  }, []);

  // Cuando cambian el torneo y la categoría, mandamos a buscar las llaves
  useEffect(() => {
    if (selectedTournament && selectedCategory) {
      loadPlayoffsByCategory(selectedTournament, selectedCategory);
    }
  }, [selectedTournament, selectedCategory]);

  // 🔥 ACTUALIZADO: Combinamos nombre y género, y filtramos duplicados
  const activeTournament = tournaments.find(t => t._id === selectedTournament);
  const categories = activeTournament 
    ? [...new Set(activeTournament.categories.map(c => `${c.name} ${c.gender}`))] 
    : [];

  // Función para manejar el botón de Consolidar
  const handleConsolidate = async () => {
    setIsConsolidating(true);
    const res = await consolidatePlayoffs(selectedTournament, selectedCategory);
    if(res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
    setIsConsolidating(false);
  };

  // Función para manejar la confirmación del modal de Eliminar
  const handleDelete = async () => {
    const res = await deletePlayoffMatches(selectedTournament, selectedCategory);
    setShowDeleteConfirm(false);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container-fluid py-4 px-lg-5 animate__animated animate__fadeIn">
      
      {/* CABECERA */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <GitMerge size={28} style={{ color: "#fd7e14" }} /> 
          Gestión de Playoffs
        </h3>
        <p className="text-muted small mt-1 mb-0">
          Administrá las llaves, cruces y fases finales del torneo.
        </p>
      </div>

      {/* FILTROS */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary small">Torneo Activo</label>
              <select 
                className="form-select form-select-lg rounded-3 fs-6 bg-light border-0 shadow-none" 
                value={selectedTournament} 
                onChange={(e) => { setSelectedTournament(e.target.value); setSelectedCategory(""); }}
              >
                <option value="">Seleccionar Torneo...</option>
                {tournaments.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold text-secondary small">Categoría</label>
              <select 
                className="form-select form-select-lg rounded-3 fs-6 bg-light border-0 shadow-none" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={!selectedTournament}
              >
                <option value="">Seleccionar Categoría...</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA CENTRAL: RENDERIZADO CONDICIONAL */}
      {!selectedTournament || !selectedCategory ? (
        <div className="text-center py-5 text-muted">
          <Trophy size={48} className="opacity-25 mb-3" />
          <h5 className="fw-bold text-secondary">Seleccioná un torneo y categoría</h5>
          <p className="mb-0 small">Para ver o configurar las llaves de playoffs, usá los filtros superiores.</p>
        </div>
      ) : loading ? (
        <div className="p-5 text-center d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : playoffMatches.length === 0 ? (
        <div className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}>
          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: "60px", height: "60px" }}>
            <GitMerge size={30} className="text-secondary opacity-50" />
          </div>
          <h5 className="fw-bold text-dark mb-2">Aún no hay llaves generadas</h5>
          <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px", fontSize: "0.90rem" }}>
            La categoría <strong className="text-dark">{selectedCategory}</strong> todavía no tiene un cuadro de Playoffs configurado.
          </p>
          <button 
            className="btn text-white fw-bold px-4 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: "#fd7e14" }}
            onClick={() => setShowCreateModal(true)}
          >
            <PlusCircle size={18} /> Armar Cuadro de Playoffs
          </button>
        </div>
      ) : (
        <div className="animate__animated animate__fadeIn">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Cuadro Principal - {selectedCategory}</h5>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success btn-sm fw-bold rounded-pill px-3 shadow-sm"
                onClick={handleConsolidate}
                disabled={isConsolidating}
              >
                {isConsolidating ? "Consolidando..." : "Consolidar Clasificados"}
              </button>
              <button 
                className="btn btn-outline-danger btn-sm fw-bold rounded-pill px-3"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar Cuadro
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-4 shadow-sm border p-3">
            <PlayoffTree matches={playoffMatches} />
          </div>
        </div>
      )}

      {/* MODAL PARA CREAR LLAVES */}
      {showCreateModal && (
        <CreateBracketModal 
          tournamentId={selectedTournament} 
          category={selectedCategory} 
          onClose={() => {
            setShowCreateModal(false);
            // Obligamos a recargar la página apenas se cierra el modal
            loadPlayoffsByCategory(selectedTournament, selectedCategory);
          }} 
        />
      )}

      {/* MODAL DE ADVERTENCIA PARA ELIMINAR */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 p-4 text-center">
                <div className="mx-auto bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                  <AlertTriangle size={30} className="text-danger" />
                </div>
                <h4 className="fw-bold text-dark mb-2">¿Eliminar Cuadro?</h4>
                <p className="text-muted small mb-4">
                  Estás a punto de borrar todo el cuadro de playoffs de la categoría <strong>{selectedCategory}</strong>. Se perderán los cruces armados. Esta acción no se puede deshacer.
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button className="btn btn-light fw-bold px-4 rounded-pill border" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
                  <button 
                    className="btn btn-danger fw-bold px-4 rounded-pill shadow-sm"
                    onClick={handleDelete}
                  >
                    Sí, Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default PlayoffsAdmin;