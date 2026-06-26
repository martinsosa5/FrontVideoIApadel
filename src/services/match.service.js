import axios from "../api/axios.js";

// Trae los partidos de un solo grupo (Usado en el detalle del grupo)
export const getMatchesByGroupRequest = (groupId) => axios.get(`/matches/group/${groupId}`);

// Trae todos los partidos de una categoría específica (Usado en la Mesa de Control)
export const getMatchesByCategoryRequest = (tournamentId, category) => axios.get(`/matches/tournament/${tournamentId}/category/${category}`);

// Actualiza un partido (Fechas, horarios o resultados)
export const updateMatchRequest = (id, data) => axios.put(`/matches/${id}`, data);

// 🔥 NUEVO: Crear cuadro de playoffs (Envía un array con los "placeholders")
export const createPlayoffMatchesRequest = (data) => axios.post(`/matches/playoffs`, data);

// 🔥 NUEVO: Traer las llaves de playoffs de una categoría específica
export const getPlayoffsByCategoryRequest = (tournamentId, category) => axios.get(`/matches/playoffs/${tournamentId}/${category}`);

export const deletePlayoffsRequest = (tournamentId, category) => axios.delete(`/matches/playoffs/${tournamentId}/${category}`);
export const consolidatePlayoffsRequest = (data) => axios.post(`/matches/playoffs/consolidate`, data);

// Agregala junto a las demás peticiones que ya tenés ahí
export const createManualMatchRequest = (data) => axios.post("/matches", data);