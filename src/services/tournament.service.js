import axios from "../api/axios.js"; 

// Obtener todos los torneos
export const getTournamentsRequest = () => axios.get("/tournaments");

// Crear un nuevo torneo
export const createTournamentRequest = (tournamentData) => axios.post("/tournaments", tournamentData);

// Obtener un torneo específico por ID (trae los equipos populados)
export const getTournamentByIdRequest = (id) => axios.get(`/tournaments/${id}`);

// Actualizar un torneo (sirve para cambiar estado o guardar las inscripciones)
export const updateTournamentRequest = (id, tournamentData) => axios.put(`/tournaments/${id}`, tournamentData);