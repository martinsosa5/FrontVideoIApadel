import React, { createContext, useContext, useState } from "react";
import { 
  getMatchesByGroupRequest, 
  getMatchesByCategoryRequest, 
  updateMatchRequest,
  createPlayoffMatchesRequest,
  getPlayoffsByCategoryRequest,
  deletePlayoffsRequest,
  consolidatePlayoffsRequest,
  createManualMatchRequest // 🔥 NUEVO IMPORT
} from "../services/match.service";

const MatchContext = createContext();

export const useMatches = () => {
  const context = useContext(MatchContext);
  if (!context) throw new Error("useMatches debe estar dentro de un MatchProvider");
  return context;
};

export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Cargar partidos de un grupo específico
  const loadMatchesByGroup = async (groupId) => {
    try {
      const res = await getMatchesByGroupRequest(groupId);
      setMatches(res.data.matches);
    } catch (error) {
      console.error("Error al cargar partidos del grupo:", error);
    }
  };

  // 2. Cargar TODOS los partidos de una categoría
  const loadMatchesByCategory = async (tournamentId, category) => {
    try {
      setLoading(true);
      const res = await getMatchesByCategoryRequest(tournamentId, category);
      setMatches(res.data.matches);
    } catch (error) {
      console.error("Error al cargar los partidos de la categoría:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Actualizar un partido
  const updateMatch = async (matchId, matchData) => {
    try {
      const res = await updateMatchRequest(matchId, matchData);
      setMatches((prev) => prev.map((m) => (m._id === matchId ? res.data.match : m)));
      setPlayoffMatches((prev) => prev.map((m) => (m._id === matchId ? res.data.match : m)));
      return { success: true, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error genérico al actualizar el partido" 
      };
    }
  };

  // 4. Cargar llaves de Playoffs
  const loadPlayoffsByCategory = async (tournamentId, category) => {
    try {
      setLoading(true);
      const res = await getPlayoffsByCategoryRequest(tournamentId, category);
      setPlayoffMatches(res.data.matches);
    } catch (error) {
      console.error("Error al cargar los playoffs:", error);
    } finally {
      setLoading(false);
    }
  };

  // 5. Crear llaves de Playoffs
  const createPlayoffMatches = async (data) => {
    try {
      setLoading(true);
      const res = await createPlayoffMatchesRequest(data);
      setPlayoffMatches(res.data.matches);
      return { success: true, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error al crear las llaves" 
      };
    } finally {
      setLoading(false);
    }
  };

  const deletePlayoffMatches = async (tournamentId, category) => {
    try {
      setLoading(true);
      const res = await deletePlayoffsRequest(tournamentId, category);
      setPlayoffMatches([]); 
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al eliminar" };
    } finally {
      setLoading(false);
    }
  };

  const consolidatePlayoffs = async (tournamentId, category) => {
    try {
      setLoading(true);
      const res = await consolidatePlayoffsRequest({ tournamentId, category });
      await loadPlayoffsByCategory(tournamentId, category); 
      return { success: true, message: res.data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al consolidar" };
    } finally {
      setLoading(false);
    }
  };

  // 🔥 6. NUEVO: Crear un partido manualmente (Para grupos de 4)
  const createManualMatch = async (data) => {
    try {
      setLoading(true);
      const res = await createManualMatchRequest(data);
      // Recargamos los partidos del grupo al instante para ver el nuevo partido creado
      await loadMatchesByGroup(data.groupId);
      return { success: true, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error al crear el partido manualmente." 
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <MatchContext.Provider value={{
      matches,
      playoffMatches,
      loading,
      loadMatchesByGroup,
      loadMatchesByCategory,
      updateMatch,
      loadPlayoffsByCategory,
      createPlayoffMatches,
      deletePlayoffMatches,
      consolidatePlayoffs,
      createManualMatch // 🔥 EXPONEMOS LA NUEVA FUNCIÓN
    }}>
      {children}
    </MatchContext.Provider>
  );
};