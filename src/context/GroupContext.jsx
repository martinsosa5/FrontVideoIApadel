import React, { createContext, useContext, useState } from "react";
import { createGroupRequest, getGroupsByTournamentRequest, deleteGroupRequest, updateGroupRequest } from "../services/group.service";

const GroupContext = createContext();

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error("useGroups debe estar dentro de un GroupProvider");
  return context;
};

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadGroups = async (tournamentId, category) => {
    try {
      setLoading(true);
      const res = await getGroupsByTournamentRequest(tournamentId, category);
      setGroups(res.data.groups);
    } catch (error) {
      console.error("Error al cargar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const editGroup = async (id, groupData) => {
    try {
      const res = await updateGroupRequest(id, groupData);
      setGroups((prev) => prev.map((g) => (g._id === id ? res.data.group : g)));
      return { success: true, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error al actualizar el grupo" 
      };
    }
  };

  const createGroup = async (groupData) => {
    try {
      const res = await createGroupRequest(groupData);
      setGroups((prev) => [...prev, res.data.group]);
      return { success: true, message: res.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Error al crear el grupo" 
      };
    }
  };

  const deleteGroup = async (id) => {
    try {
      await deleteGroupRequest(id);
      setGroups((prev) => prev.filter((group) => group._id !== id));
      return { success: true, message: "Grupo eliminado correctamente" };
    } catch (error) {
      return { success: false, message: "Error al eliminar el grupo" };
    }
  };

  return (
    <GroupContext.Provider value={{
      groups,
      loading,
      loadGroups,
      editGroup,
      createGroup,
      deleteGroup
    }}>
      {children}
    </GroupContext.Provider>
  );
};