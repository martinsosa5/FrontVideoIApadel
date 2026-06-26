// src/pages/PlayersAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { usePlayers } from '../context/PlayerContext';

import PlayersToolbar from '../components/PlayersAdmin/PlayersToolbar';
import PlayersTable from '../components/PlayersAdmin/PlayersTable';
import PlayerModal from '../components/PlayersAdmin/PlayerModal';

const PlayersAdmin = () => {
  const { loadPlayers, isLoading } = usePlayers();
  
  // Estados para manejar la búsqueda y el modal
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState(null);

  // Cargamos los jugadores al montar la página
  useEffect(() => {
    loadPlayers();
  }, []);

  // Abrir modal para crear
  const handleOpenNew = () => {
    setPlayerToEdit(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (player) => {
    setPlayerToEdit(player);
    setIsModalOpen(true);
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      {/* Título de la sección */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <Users size={28} style={{ color: "#fd7e14" }} /> 
          Gestión de Jugadores
        </h3>
        <p className="text-muted small mt-1 mb-0">
          Administrá el padrón de jugadores, categorías y estados.
        </p>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-4">
          
          <PlayersToolbar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            onOpenNew={handleOpenNew} 
          />

          <PlayersTable 
            searchTerm={searchTerm} 
            onOpenEdit={handleOpenEdit} 
            isLoading={isLoading} 
          />

        </div>
      </div>

      {/* MODAL PARA CREAR/EDITAR */}
      {isModalOpen && (
        <PlayerModal 
          player={playerToEdit} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

    </div>
  );
};

export default PlayersAdmin;