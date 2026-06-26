// src/pages/TournamentsAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Trophy, Plus, Search, ArrowUpDown } from 'lucide-react';
import { useTournaments } from '../context/TournamentContext';
import InscriptionModal from '../components/TournamentsAdmin/InscriptionModal';
import TournamentModal from '../components/TournamentsAdmin/TournamentModal';
import TournamentsTable from '../components/TournamentsAdmin/TournamentsTable';

const TournamentsAdmin = () => {
  const { loadTournaments, isLoading } = useTournaments();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); 
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null); 
  const [inscriptionTournament, setInscriptionTournament] = useState(null); 

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleCloseTournamentModal = () => {
    setIsCreateModalOpen(false);
    setEditingTournament(null);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* Encabezado */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <Trophy size={28} style={{ color: "#fd7e14" }} /> 
          Control de Torneos
        </h3>
        <p className="text-muted small mt-1 mb-0">
          Creá nuevas competencias y gestioná el padrón de parejas inscriptas por categoría.
        </p>
      </div>

      {/* Tarjeta Contenedora Principal */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          
          {/* Toolbar de Filtros */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
            
            {/* Buscador por Nombre */}
            <div className="position-relative flex-grow-1" style={{ maxWidth: "350px" }}>
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                className="form-control bg-light border-0 py-2 ps-5 rounded-3 text-dark fw-medium"
                placeholder="Buscar por nombre del torneo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro de Ordenamiento por Fecha y Botón de Creación */}
            <div className="d-flex align-items-center gap-2 self-end w-100 w-md-auto justify-content-between justify-content-md-end">
              
              <div className="d-flex align-items-center gap-2 text-secondary bg-light px-3 py-2 rounded-3 border-0">
                <ArrowUpDown size={16} />
                <select 
                  className="bg-transparent border-0 fw-semibold text-secondary cursor-pointer"
                  style={{ outline: "none", fontSize: "0.9rem" }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Más recientes primero</option>
                  <option value="asc">Más antiguos primero</option>
                </select>
              </div>

              <button 
                className="btn text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm px-4 py-2"
                style={{ backgroundColor: "#0f172a" }}
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus size={18} /> Nuevo Torneo
              </button>
            </div>
            
          </div>

          {/* TABLA DE TORNEOS */}
          <TournamentsTable 
            searchTerm={searchTerm} 
            sortOrder={sortOrder} 
            onManageInscriptions={(tournament) => setInscriptionTournament(tournament)}
            onEditTournament={(tournament) => setEditingTournament(tournament)}
          />

        </div>
      </div>

      {/* MODALES CONECTADOS */}
      {(isCreateModalOpen || editingTournament) && (
        <TournamentModal 
          tournament={editingTournament} 
          onClose={handleCloseTournamentModal} 
        />
      )}
      
      {inscriptionTournament && (
        <InscriptionModal 
          tournament={inscriptionTournament} 
          onClose={() => setInscriptionTournament(null)} 
        />
      )}

    </div>
  );
};

export default TournamentsAdmin;