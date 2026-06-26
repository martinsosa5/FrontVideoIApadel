// src/pages/GroupAdmin.jsx
import React, { useState, useEffect } from "react";
import { useTournaments } from "../context/TournamentContext";
import { useGroups } from "../context/GroupContext";
import { Trophy, Plus, LayoutGrid, Filter } from "lucide-react"; // 🔥 Agregamos Filter

import CreateGroupModal from "../components/GroupAdmin/CreateGroupModal";
import GroupCard from "../components/GroupAdmin/GroupCard";
import GroupDetailsModal from "../components/GroupAdmin/GroupDetailsModal";
import EditGroupModal from "../components/GroupAdmin/EditGroupModal";

const GroupAdmin = () => {
  const { tournaments, loadTournaments } = useTournaments();
  const { loadGroups, groups, loading } = useGroups();
  
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  // 🔥 1. Cuando cambia el torneo, reseteamos la categoría para forzar al usuario a elegir
  const handleTournamentChange = (e) => {
    const tournamentId = e.target.value;
    const tournament = tournaments.find(t => t._id === tournamentId);
    setSelectedTournament(tournament || null);
    setSelectedCategory(""); // Siempre vuelve a vacío
  };

  useEffect(() => {
    if (selectedTournament && selectedCategory) {
      loadGroups(selectedTournament._id, selectedCategory);
    }
  }, [selectedTournament, selectedCategory]);

  useEffect(() => {
    if (selectedGroup) {
      const updatedGroup = groups.find(g => g._id === selectedGroup._id);
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
      }
    }
  }, [groups]);

  // Helper: Extrae las categorías únicas con nombre y género concatenados
  const getUniqueCategories = (tournament) => {
    if (!tournament) return [];
    return [...new Set(tournament.categories.map(c => `${c.name} ${c.gender}`))];
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <LayoutGrid size={28} style={{ color: "#fd7e14" }} /> 
          Gestión de Zonas y Grupos
        </h3>
        <p className="text-muted small mt-1 mb-0">
          Administrá los grupos, organizá las parejas por categoría y generá los partidos automáticamente.
        </p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-body p-4">
          
          {/* 🔥 2. BARRA DE HERRAMIENTAS: SELECTS ENSANCHADOS Y SECUENCIALES */}
          <div className="d-flex flex-column flex-xl-row align-items-xl-center gap-3 mb-4 pb-4 border-bottom">
            
            {/* SELECT 1: TORNEO (Más ancho) */}
            <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
              <Trophy className="position-absolute top-50 start-0 translate-middle-y ms-3 text-padel-orange" size={18} />
              <select 
                className="form-select bg-light border border-light py-2 ps-5 rounded-3 text-dark fw-bold shadow-sm cursor-pointer" 
                value={selectedTournament?._id || ""}
                onChange={handleTournamentChange}
                style={{ appearance: "none" }}
              >
                <option value="" disabled>1. Seleccione un Torneo...</option>
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
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
                <option value="" disabled>2. Seleccione Categoría...</option>
                {selectedTournament && getUniqueCategories(selectedTournament).map(catName => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </select>
            </div>

            {/* BOTÓN NUEVO GRUPO (Solo si ambos están seleccionados) */}
            <div className="ms-xl-auto">
              <button 
                className="btn text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm px-4 py-2 w-100 transition-all"
                style={{ backgroundColor: selectedTournament && selectedCategory ? "#0f172a" : "#6c757d" }}
                disabled={!selectedTournament || !selectedCategory}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} /> Nuevo Grupo
              </button>
            </div>
            
          </div>

          {/* 🔥 3. RENDERIZADO SECUENCIAL CONDICIONAL */}
          {!selectedTournament ? (
            <div className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}>
              <Trophy size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="text-secondary fw-bold">Paso 1: Seleccioná un Torneo</h5>
              <p className="text-muted m-0">Elegí un torneo en la barra superior para comenzar.</p>
            </div>
          ) : !selectedCategory ? (
            <div className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}>
              <Filter size={48} className="text-muted mb-3 opacity-25" />
              <h5 className="text-secondary fw-bold">Paso 2: Seleccioná la Categoría</h5>
              <p className="text-muted m-0">Para ver o crear grupos, necesitás elegir una categoría del torneo <strong>{selectedTournament.name}</strong>.</p>
            </div>
          ) : loading ? (
            <div className="p-5 text-center d-flex justify-content-center align-items-center" style={{ minHeight: "250px" }}>
              <div className="spinner-border text-padel-orange" role="status"></div>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-5 text-center bg-light rounded-4 d-flex flex-column justify-content-center align-items-center" style={{ border: "2px dashed #dee2e6", minHeight: "250px" }}>
              <LayoutGrid size={40} className="text-muted mb-3 opacity-50" />
              <h5 className="text-dark fw-bold">Sin grupos configurados</h5>
              <p className="text-muted m-0 fw-medium">No hay grupos creados en la categoría <span className="fw-bold">"{selectedCategory}"</span> todavía.</p>
              <button 
                className="btn btn-outline-dark mt-3 fw-bold rounded-pill px-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Crear el primer grupo
              </button>
            </div>
          ) : (
            <div className="row g-2 mt-2 w-100 text-start m-0">
              {groups.map(group => (
                <div className="col-12 col-md-6 col-xl-4 px-2 mb-3" key={group._id}>
                  <GroupCard 
                    group={group} 
                    onClick={(clickedGroup) => {
                      setSelectedGroup(clickedGroup);
                    }} 
                  />
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* MODALES */}
      {isCreateModalOpen && selectedTournament && (
        <CreateGroupModal
          tournament={selectedTournament}
          categoryName={selectedCategory}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {selectedGroup && (
        <GroupDetailsModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onEditTeams={(groupToEdit) => setEditingGroup(groupToEdit)}
        />
      )}

      {editingGroup && selectedTournament && (
        <EditGroupModal
          group={editingGroup}
          tournament={selectedTournament}
          categoryName={selectedCategory}
          onClose={() => setEditingGroup(null)}
        />
      )}

    </div>
  );
};

export default GroupAdmin;