import axios from "../api/axios.js";

export const createGroupRequest = (data) => axios.post("/groups", data);

export const getGroupsByTournamentRequest = (tournamentId, category) => 
  axios.get(`/groups?tournamentId=${tournamentId}&category=${category}`);

export const deleteGroupRequest = (id) => axios.delete(`/groups/${id}`);

export const updateGroupRequest = (id, data) => axios.put(`/groups/${id}`, data);