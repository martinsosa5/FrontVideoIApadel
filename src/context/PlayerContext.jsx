import { createContext, useContext, useState, useEffect } from "react";
import { 
  getPlayersRequest, 
  createPlayerRequest, 
  updatePlayerRequest, 
  togglePlayerStatusRequest 
} from "../services/player.service";

const PlayerContext = createContext();

export const usePlayers = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayers debe ser usado dentro de un PlayerProvider");
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalPlayers: 0 });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // 🔥 Ahora carga paginado
  const loadPlayers = async (page = 1, limit = 10, search = "") => {
    setIsLoading(true);
    try {
      const res = await getPlayersRequest(page, limit, search);
      setPlayers(res.data.players);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Función especial para el buscador del Modal de Equipos (Para no pisar la tabla)
  const searchPlayersForModal = async (searchStr) => {
    try {
      // Traemos hasta 30 resultados rápidos para el modal
      const res = await getPlayersRequest(1, 30, searchStr);
      return res.data.players.filter(p => p.isActive);
    } catch (error) {
      console.error("Error buscando jugadores para el modal:", error);
      return [];
    }
  };

  const createNewPlayer = async (formData) => {
    try {
      const res = await createPlayerRequest(formData);
      // Al crear uno nuevo, recargamos la página 1 para verlo
      await loadPlayers(1, 10, ""); 
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al crear el jugador";
      setErrors([errorMsg]);
      return { success: false, message: errorMsg }; 
    }
  };

  const updateExistingPlayer = async (id, formData) => {
    try {
      const res = await updatePlayerRequest(id, formData);
      setPlayers(players.map((p) => (p._id === id ? res.data.player : p)));
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al actualizar el jugador";
      setErrors([errorMsg]);
      return { success: false, message: errorMsg }; 
    }
  };

  const toggleStatus = async (id, isActive) => {
    try {
      const res = await togglePlayerStatusRequest(id, isActive);
      setPlayers(players.map((p) => (p._id === id ? res.data.player : p)));
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al cambiar estado";
      console.error(error);
      return { success: false, message: errorMsg }; 
    }
  };

  return (
    <PlayerContext.Provider 
      value={{ 
        players,
        pagination, // 🔥 Exponemos la paginación al componente visual
        errors, 
        isLoading, 
        loadPlayers, 
        searchPlayersForModal, // 🔥 Exponemos el buscador
        createNewPlayer, 
        updateExistingPlayer, 
        toggleStatus 
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};