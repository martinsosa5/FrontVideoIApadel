import React, { useState, useEffect } from "react";
import { useGroups } from "../../context/GroupContext";
import { useTeams } from "../../context/TeamContext";
import { useMatches } from "../../context/MatchContext"; 
import { Users, Save } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_AVATAR = "https://img.magnific.com/vector-premium/icono-perfil-avatar-predeterminado-imagen-usuario-redes-sociales-icono-avatar-gris-silueta-perfil-blanco-ilustracion-vectorial_561158-3485.jpg";

const EditGroupModal = ({ group, tournament, categoryName, onClose }) => {
  const { editGroup, groups } = useGroups(); 
  const { loadMatchesByGroup } = useMatches(); 
  const { teams, loadTeams } = useTeams();

  const [groupName, setGroupName] = useState(group.name);
  const [qualificationRule, setQualificationRule] = useState(group.qualificationRule);
  const [selectedTeams, setSelectedTeams] = useState(group.teams.map(t => t._id || t));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Igual que en CreateModal, cargamos los equipos del universo
    loadTeams(1, 500, "");
  }, []);

  // 🔥 FIX CRÍTICO: Buscar la categoría uniendo nombre + género
  const currentCatBlock = tournament.categories.find(c => `${c.name} ${c.gender}` === categoryName);
  
  const enrolledTeamIds = currentCatBlock ? currentCatBlock.enrolledTeams.map(t => t._id || t) : [];
  const enrolledTeams = teams.filter(t => enrolledTeamIds.includes(t._id));

  const otherGroups = groups.filter(g => g._id !== group._id);
  const alreadyAssignedTeamIds = otherGroups.flatMap(g => g.teams.map(t => t._id || t));

  const handleToggleTeam = (teamId) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return toast.error("El nombre del grupo es obligatorio.");
    if (selectedTeams.length < 2) return toast.error("Debe seleccionar al menos 2 parejas.");

    setIsProcessing(true);
    const res = await editGroup(group._id, {
      name: groupName,
      teams: selectedTeams,
      qualificationRule
    });
    setIsProcessing(false);

    if (res.success) {
      toast.success(res.message);
      await loadMatchesByGroup(group._id); 
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1060 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1065 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Users size={22} className="text-white" /> 
                Editar {groupName}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isProcessing}></button>
            </div>

            <div className="modal-body bg-light p-4">
              <form onSubmit={handleSubmit}>
                <div className="alert alert-warning py-2 mb-4 shadow-sm" style={{ fontSize: "0.85rem" }}>
                  <strong>Aviso:</strong> Modificar los equipos regenerará automáticamente todos los cruces y partidos pendientes de esta zona.
                </div>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-secondary">Nombre de la Zona</label>
                    <input type="text" className="form-control rounded-3" value={groupName} onChange={(e) => setGroupName(e.target.value)} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-secondary">Regla de Clasificación</label>
                    <select className="form-select rounded-3 cursor-pointer" value={qualificationRule} onChange={(e) => setQualificationRule(e.target.value)}>
                      <option value="Clasifican 1">Clasifica el 1° (Primero)</option>
                      <option value="Clasifican 2">Clasifican 1° y 2° (Dos mejores)</option>
                      <option value="Clasifican 3">Clasifican los 3 mejores</option>
                    </select>
                  </div>
                </div>

                <h6 className="fw-bold text-dark mb-3">Modificar Parejas ({selectedTeams.length} seleccionadas)</h6>
                
                <div className="bg-white rounded-3 shadow-sm border p-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <ul className="list-group list-group-flush">
                    {enrolledTeams.map((team) => {
                      const isAssignedToOther = alreadyAssignedTeamIds.includes(team._id);
                      const isSelected = selectedTeams.includes(team._id);

                      return (
                        <li key={team._id} className={`list-group-item d-flex justify-content-between align-items-center py-3 ${isAssignedToOther ? 'bg-light opacity-75' : ''}`}>
                          <div className="d-flex align-items-center">
                            <input 
                              className="form-check-input me-3 cursor-pointer" 
                              type="checkbox" 
                              style={{ width: "20px", height: "20px" }}
                              checked={isSelected}
                              onChange={() => handleToggleTeam(team._id)}
                              disabled={isAssignedToOther || isProcessing}
                            />
                            
                            <div className="d-flex align-items-center me-3 flex-shrink-0">
                              <img src={team.player1?.profileImage || DEFAULT_AVATAR} alt="P1" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", zIndex: 2 }} />
                              <img src={team.player2?.profileImage || DEFAULT_AVATAR} alt="P2" className="rounded-circle border border-2 border-white object-fit-cover shadow-sm position-relative" style={{ width: "40px", height: "40px", marginLeft: "-15px", zIndex: 1 }} />
                            </div>

                            <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2", fontSize: "0.85rem" }}>
                              <div className="text-truncate">
                                <span className="fw-bold text-dark text-uppercase">{team.player1?.lastName}</span> <span className="text-dark">{team.player1?.firstName}</span>
                              </div>
                              <div className="text-truncate" style={{ marginTop: "2px" }}>
                                <span className="fw-bold text-dark text-uppercase">{team.player2?.lastName}</span> <span className="text-dark">{team.player2?.firstName}</span>
                              </div>
                            </div>
                            
                          </div>
                          {isAssignedToOther && <span className="badge bg-secondary rounded-pill px-3 py-2 shadow-sm">En otro grupo</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-light fw-bold px-4" onClick={onClose} disabled={isProcessing}>Cancelar</button>
                  <button type="submit" className="btn text-white fw-bold d-flex align-items-center gap-2 px-4 shadow-sm" style={{ backgroundColor: "#0f172a" }} disabled={isProcessing || selectedTeams.length < 2}>
                    {isProcessing ? "Guardando..." : <><Save size={18} /> Actualizar Fixture</>}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default EditGroupModal;