// src/context/TournamentContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { 
  getTournamentsRequest, 
  createTournamentRequest, 
  updateTournamentRequest,
  getTournamentByIdRequest
} from "../services/tournament.service";

const TournamentContext = createContext();

export const useTournaments = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error("useTournaments debe ser usado dentro de un TournamentProvider");
  return context;
};

export const TournamentProvider = ({ children }) => {
  const [tournaments, setTournaments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      const res = await getTournamentsRequest();
      setTournaments(res.data.tournaments);
    } catch (error) {
      console.error("Error al cargar torneos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTournament = async (tournamentData) => {
    try {
      const res = await createTournamentRequest(tournamentData);
      setTournaments([res.data.tournament, ...tournaments]);
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al crear el torneo";
      setErrors([errorMsg]);
      return { success: false, message: errorMsg };
    }
  };

  const editTournamentInfo = async (id, tournamentData) => {
    try {
      const res = await updateTournamentRequest(id, tournamentData);
      setTournaments(tournaments.map((t) => (t._id === id ? res.data.tournament : t)));
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al actualizar el torneo";
      setErrors([errorMsg]);
      return { success: false, message: errorMsg };
    }
  };

  // 🔥 NUEVO: Recibimos name y gender para ubicar la categoría exacta
  const enrollTeam = async (tournamentId, categoryName, categoryGender, teamId) => {
    try {
      const tournament = tournaments.find(t => t._id === tournamentId);
      if (!tournament) return { success: false, message: "Torneo no encontrado" };

      const updatedCategories = tournament.categories.map(cat => {
        const cleanTeamIds = cat.enrolledTeams.map(t => t._id || t);
        // Filtramos asegurándonos de que coincida tanto el nombre como el género
        if (cat.name === categoryName && cat.gender === categoryGender) {
          if (!cleanTeamIds.includes(teamId)) {
            return { ...cat, enrolledTeams: [...cleanTeamIds, teamId] };
          }
        }
        return { ...cat, enrolledTeams: cleanTeamIds };
      });

      // 🔥 Agregamos la bandera isEnrollmentUpdate: true
      const res = await updateTournamentRequest(tournamentId, { 
        categories: updatedCategories,
        isEnrollmentUpdate: true 
      });
      
      setTournaments(tournaments.map(t => t._id === tournamentId ? res.data.tournament : t));
      return { success: true, message: "Pareja inscripta correctamente." };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al inscribir la pareja." };
    }
  };

  // 🔥 NUEVO: Mismo filtro (name + gender) para borrar la pareja
  const unenrollTeam = async (tournamentId, categoryName, categoryGender, teamId) => {
    try {
      const tournament = tournaments.find(t => t._id === tournamentId);
      if (!tournament) return { success: false, message: "Torneo no encontrado" };

      const updatedCategories = tournament.categories.map(cat => {
        const cleanTeamIds = cat.enrolledTeams.map(t => t._id || t);
        if (cat.name === categoryName && cat.gender === categoryGender) {
          return {
            ...cat,
            enrolledTeams: cleanTeamIds.filter(id => id !== teamId)
          };
        }
        return { ...cat, enrolledTeams: cleanTeamIds };
      });

      // 🔥 Agregamos la bandera isEnrollmentUpdate: true
      const res = await updateTournamentRequest(tournamentId, { 
        categories: updatedCategories,
        isEnrollmentUpdate: true
      });
      
      setTournaments(tournaments.map(t => t._id === tournamentId ? res.data.tournament : t));
      return { success: true, message: "Pareja removida de la inscripción." };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al desinscribir la pareja." };
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  return (
    <TournamentContext.Provider value={{ 
      tournaments, errors, isLoading, loadTournaments, createNewTournament, editTournamentInfo, enrollTeam, unenrollTeam 
    }}>
      {children}
    </TournamentContext.Provider>
  );
};