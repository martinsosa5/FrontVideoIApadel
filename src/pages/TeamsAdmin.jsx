import React, { useState } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { useTeams } from '../context/TeamContext';

import TeamsTable from '../components/TeamsAdmin/TeamsTable';
import TeamModal from '../components/TeamsAdmin/TeamModal';

const TeamsAdmin = () => {
  const { isLoading } = useTeams();
  
  // Estados para manejar la búsqueda y el modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Abrir modal para crear
  const handleOpenNew = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* Título de la sección */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <Users size={28} style={{ color: "#fd7e14" }} /> 
          Gestión de Parejas
        </h3>
        <p className="text-muted small mt-1 mb-0">
          Administrá las parejas registradas en el sistema para los torneos.
        </p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          
          {/* TOOLBAR INTEGRADO (Buscador y Botón) */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-2 border-bottom">
            
            {/* Buscador */}
            <div className="position-relative flex-grow-1" style={{ maxWidth: "400px" }}>
              <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
              <input
                type="text"
                className="form-control bg-light border-0 py-2 ps-5 rounded-3 text-dark fw-medium"
                placeholder="Buscar por apellido o nombre de equipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botón Nueva Pareja */}
            <button 
              className="btn text-white fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm px-4 py-2 transition-all"
              style={{ backgroundColor: "#0f172a" }}
              onClick={handleOpenNew}
            >
              <Plus size={18} /> Nueva Pareja
            </button>
            
          </div>

          {/* TABLA DE EQUIPOS */}
          <TeamsTable 
            searchTerm={searchTerm} 
            isLoading={isLoading} 
          />

        </div>
      </div>

      {/* MODAL PARA CREAR EQUIPO */}
      {isModalOpen && (
        <TeamModal 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

    </div>
  );
};

export default TeamsAdmin;