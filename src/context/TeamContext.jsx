// src/context/TeamContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getTeamsRequest, createTeamRequest } from "../services/team.service";

const TeamContext = createContext();

export const useTeams = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeams debe ser usado dentro de un TeamProvider");
  return context;
};

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalTeams: 0 });
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carga paginada desde el servidor
  const loadTeams = async (page = 1, limit = 10, search = "") => {
    try {
      setIsLoading(true);
      const res = await getTeamsRequest(page, limit, search);
      setTeams(res.data.teams);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error al cargar equipos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewTeam = async (teamData) => {
    try {
      const res = await createTeamRequest(teamData);
      await loadTeams(1, 10, "");
      return { success: true, message: res.data.message };
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error al crear la pareja";
      setErrors([errorMsg]);
      return { success: false, message: errorMsg };
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // 🔥 FIX: Quitamos el useEffect que llamaba a loadTeams() al montar el Provider.
  // Ahora la tabla maneja sus propios tiempos y parámetros de forma limpia.

  return (
    <TeamContext.Provider value={{ teams, pagination, errors, isLoading, createNewTeam, loadTeams }}>
      {children}
    </TeamContext.Provider>
  );
};