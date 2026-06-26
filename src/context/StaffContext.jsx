// src/context/StaffContext.jsx
import { createContext, useContext, useState } from "react";
import toast from "react-hot-toast";
import { 
  createStaffRequest, 
  getStaffRequest,
  updateStaffPermissionsRequest,
  deleteStaffRequest,
  searchUserByDniRequest 
} from "../services/staff.service.js";

const StaffContext = createContext();

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) throw new Error("useStaff debe estar dentro de StaffProvider");
  return context;
};

export const StaffProvider = ({ children }) => {
  const [staffList, setStaffList] = useState([]); 
  const [errors, setErrors] = useState([]);

  const loadStaff = async () => {
    try {
      const data = await getStaffRequest();
      setStaffList(data);
    } catch (error) {
      console.error("Error al cargar staff:", error);
    }
  };

  const createNewStaff = async (staffData) => {
    try {
      const data = await createStaffRequest(staffData);
      await loadStaff(); 
      return { success: true, message: data.message };
    } catch (error) {
      if (error.response?.status === 409 && error.response?.data?.requireConfirmation) {
        return { success: false, requireConfirmation: true, message: error.response.data.message };
      }
      setErrors([error.response?.data?.message || "Error al registrar al staff."]);
      return { success: false };
    }
  };

  const searchUserByDni = async (dni) => {
    try {
      const data = await searchUserByDniRequest(dni);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al buscar el usuario." };
    }
  };

  const updateStaffPermissions = async (id, data) => {
    try {
      const res = await updateStaffPermissionsRequest(id, data);
      setStaffList(staffList.map(s => s._id === id ? res : s));
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar permisos");
      return { success: false };
    }
  };

  const deleteStaffMember = async (id) => {
    try {
      await deleteStaffRequest(id);
      toast.success("Staff eliminado correctamente");
      await loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al eliminar");
    }
  };

  return (
    <StaffContext.Provider value={{ 
      staffList, errors, createNewStaff, loadStaff, searchUserByDni, 
      updateStaffPermissions, deleteStaffMember 
    }}>
      {children}
    </StaffContext.Provider>
  );
};