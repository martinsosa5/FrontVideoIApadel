import axios from "../api/axios.js"; 

// 🔥 Modificado para enviar paginación y búsqueda
export const getTeamsRequest = (page = 1, limit = 10, search = "") => {
  return axios.get("/teams", { params: { page, limit, search } });
};

export const createTeamRequest = (team) => axios.post("/teams", team);