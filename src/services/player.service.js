import axios from "../api/axios.js"; 

// 🔥 Modificado para enviar paginación y búsqueda
export const getPlayersRequest = (page = 1, limit = 10, search = "") => {
  return axios.get("/players", { params: { page, limit, search } });
};

export const createPlayerRequest = (formData) => axios.post("/players", formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

export const updatePlayerRequest = (id, formData) => axios.put(`/players/${id}`, formData, {
  headers: { "Content-Type": "multipart/form-data" }
});

export const togglePlayerStatusRequest = (id, isActive) => axios.patch(`/players/${id}/status`, { isActive });