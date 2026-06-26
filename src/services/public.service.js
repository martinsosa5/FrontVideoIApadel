import axios from "../api/axios.js"; 

// =======================================================
// SERVICIOS PÚBLICOS (Conectan con /api/public/...)
// =======================================================

export const getPublicTournamentsRequest = () => {
  return axios.get("/public/tournaments"); 
};

export const getPublicPlayersRequest = (page = 1, limit = 12, search = "") => {
  // Corregido: Ahora apunta a tu public.routes.js
  return axios.get("/public/players", {
    params: { page, limit, search }
  });
};

export const getPublicTeamsRequest = (page = 1, limit = 12, search = "") => {
  // Corregido: Ahora apunta a tu public.routes.js
  return axios.get("/public/teams", {
    params: { page, limit, search }
  });
};

export const getPublicMatchesRequest = (tournamentId, category) => {
  // Corregido: Ahora apunta a tu public.routes.js
  return axios.get('/public/matches', { 
    params: { tournamentId, category } 
  });
};

export const getPublicGroupsRequest = (tournamentId, category) => {
  // Corregido: Ahora apunta a tu public.routes.js
  return axios.get('/public/groups', { 
    params: { tournamentId, category } 
  });
};