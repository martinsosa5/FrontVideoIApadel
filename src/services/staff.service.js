// src/services/staff.service.js
import axios from "../api/axios.js"; 

export const createStaffRequest = async (staffData) => {
  const response = await axios.post("/staff", staffData);
  return response.data;
};

export const getStaffRequest = async () => {
  const response = await axios.get("/staff");
  return response.data;
};

export const searchUserByDniRequest = async (dni) => {
  const response = await axios.get(`/staff/search/${dni}`);
  return response.data;
};

export const updateStaffPermissionsRequest = async (id, permissionsData) => {
  const response = await axios.put(`/staff/${id}/permissions`, permissionsData);
  return response.data;
};

export const deleteStaffRequest = async (id) => {
  const response = await axios.delete(`/staff/${id}`);
  return response.data;
};