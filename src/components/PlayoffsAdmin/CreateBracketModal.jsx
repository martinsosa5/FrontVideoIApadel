import React, { useState, useEffect } from "react";
import { useMatches } from "../../context/MatchContext";
import { useGroups } from "../../context/GroupContext";
import { GitMerge, Save, Shuffle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const CreateBracketModal = ({ tournamentId, category, onClose }) => {
  const { createPlayoffMatches } = useMatches();
  const { groups, loadGroups } = useGroups(); 
  
  const [stage, setStage] = useState("Cuartos de Final");
  const [isSaving, setIsSaving] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (tournamentId && category) {
      loadGroups(tournamentId, category);
    }
  }, [tournamentId, category]);

  // Generamos los casilleros vacíos según la fase
  const getMatchCount = (s) => {
    if (s === "Final") return 1;
    if (s === "Semifinal") return 2;
    if (s === "Cuartos de Final") return 4;
    if (s === "Octavos de Final") return 8;
    return 0;
  };

  useEffect(() => {
    const count = getMatchCount(stage);
    const newMatches = Array.from({ length: count }, () => ({
      tournamentId,
      category,
      isPlayoff: true,
      stage: stage,
      placeholderTeam1: "",
      placeholderTeam2: "",
      status: "Pendiente",
      result: {
        set1: { gamesTeam1: 0, gamesTeam2: 0 },
        set2: { gamesTeam1: 0, gamesTeam2: 0 },
        set3: { gamesTeam1: 0, gamesTeam2: 0 },
      }
    }));
    setMatches(newMatches);
  }, [stage, tournamentId, category]);

  // 🔥 ACTUALIZADO: Filtro a prueba de balas para contemplar nombre y género en objetos poblados
  const filteredGroups = groups.filter(g => {
    const isSameTournament = 
      g.tournamentId === tournamentId || 
      (g.tournamentId && g.tournamentId._id === tournamentId);

    let groupCategoryName = "";
    if (typeof g.category === "string") {
      groupCategoryName = g.category;
    } else if (g.category && typeof g.category.name === "string") {
      // Concatenamos el género para que el match sea exacto (Ej: "Séptima Masculino")
      groupCategoryName = g.category.gender ? `${g.category.name} ${g.category.gender}` : g.category.name;
    } else {
      groupCategoryName = String(g.category);
    }

    const isSameCategory = groupCategoryName.trim().toLowerCase() === String(category).trim().toLowerCase();

    return isSameTournament && isSameCategory;
  });

  // LOGICA DINÁMICA: Armamos las opciones de puestos basándonos en cuántos equipos hay por grupo
  const placeholderOptions = filteredGroups.flatMap(g => {
    const teamCount = g.teams ? g.teams.length : 3; 
    const options = [];
    for (let i = 1; i <= teamCount; i++) {
      options.push(`${i}º ${g.name}`);
    }
    return options;
  });

  const handlePlaceholderChange = (index, teamNum, value) => {
    const updated = [...matches];
    updated[index][`placeholderTeam${teamNum}`] = value;
    setMatches(updated);
  };

  // CRUCES AUTOMÁTICOS INTELIGENTES CON CANDADO DE SEGURIDAD
  const handleAutoAssign = () => {
    if (filteredGroups.length === 0) {
      return toast.error(`Error: No se encontraron grupos para la categoría "${category}".`);
    }

    const totalRequiredTeams = matches.length * 2; 
    const directClassifiedCount = filteredGroups.length * 2; 

    if (totalRequiredTeams > directClassifiedCount) {
      return toast.error(
        `No se pueden sugerir cruces automáticos para ${stage}. Se requieren ${totalRequiredTeams} equipos, pero la fase regular solo provee ${directClassifiedCount} (1º y 2º). Por favor, configuralo de forma MANUAL para elegir los mejores terceros.`
      );
    }

    if (totalRequiredTeams < filteredGroups.length) {
      return toast.error(
        `La fase de ${stage} es muy chica para tus ${filteredGroups.length} grupos. Seleccioná una fase inicial más alta.`
      );
    }

    const updated = matches.map((m, i) => {
      const g1 = filteredGroups[i % filteredGroups.length];
      const nextIdx = (i + 1) % filteredGroups.length;
      const g2 = filteredGroups[nextIdx];

      return { 
        ...m, 
        placeholderTeam1: `1º ${g1.name}`, 
        placeholderTeam2: `2º ${g2.name}` 
      };
    });
    
    setMatches(updated);
    toast.success("Cruces tradicionales (1º vs 2º) aplicados automáticamente");
  };

  // FUNCIÓN MÁGICA: Genera las rondas subsiguientes hasta la final
  const generateFullTree = (initialMatches, initialStage) => {
    let allMatches = [...initialMatches];
    let currentRoundMatches = [...initialMatches];
    let currentStage = initialStage;

    const getNextStage = (s) => {
      if (s === "Octavos de Final") return "Cuartos de Final";
      if (s === "Cuartos de Final") return "Semifinal";
      if (s === "Semifinal") return "Final";
      return null;
    };

    let nextStage = getNextStage(currentStage);

    // Les ponemos un ID temporal para saber cómo referenciarlos (ej: "Ganador Semi 1")
    currentRoundMatches.forEach((m, idx) => { m.tempName = `${currentStage.replace(" de Final", "")} ${idx + 1}`; });

    while (nextStage) {
      const nextRoundMatches = [];
      for (let i = 0; i < currentRoundMatches.length; i += 2) {
        const m1 = currentRoundMatches[i];
        const m2 = currentRoundMatches[i + 1];
        
        const newMatch = {
          tournamentId,
          category,
          isPlayoff: true,
          stage: nextStage,
          placeholderTeam1: `Ganador ${m1.tempName}`,
          placeholderTeam2: `Ganador ${m2.tempName}`,
          status: "Pendiente",
          result: {
            set1: { gamesTeam1: 0, gamesTeam2: 0 },
            set2: { gamesTeam1: 0, gamesTeam2: 0 },
            set3: { gamesTeam1: 0, gamesTeam2: 0 },
          }
        };
        
        newMatch.tempName = `${nextStage.replace(" de Final", "")} ${nextRoundMatches.length + 1}`;
        nextRoundMatches.push(newMatch);
        allMatches.push(newMatch);
      }
      currentRoundMatches = nextRoundMatches;
      nextStage = getNextStage(nextStage);
    }

    // Limpiamos los "tempName" antes de mandar a la base de datos
    return allMatches.map(({ tempName, ...rest }) => rest);
  };

  const handleSave = async () => {
    if (matches.some(m => !m.placeholderTeam1 || !m.placeholderTeam2)) {
      return toast.error("Por favor, completa todos los casilleros antes de guardar. Usa los combobox.");
    }

    setIsSaving(true);
    
    // Antes de guardar, expandimos el árbol hasta la Final
    const fullTreeMatches = generateFullTree(matches, stage);
    
    const result = await createPlayoffMatches({ tournamentId, category, matches: fullTreeMatches });
    setIsSaving(false);

    if (result.success) {
      toast.success("Cuadro generado con éxito");
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header border-0 py-3 px-4 text-white" style={{ backgroundColor: "#0f172a" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <GitMerge size={20} className="text-warning" />
                Armar Cuadro de Playoffs
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isSaving}></button>
            </div>

            <div className="modal-body p-4 bg-light">
              <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center gap-3 mb-4 rounded-3">
                <AlertTriangle className="text-warning flex-shrink-0" size={30} />
                <div className="small">
                  <strong>Atención de Cruces:</strong> Definí la fase inicial y los cruces teóricos. 
                  Si tenés esquemas impares (ej: mejores terceros), seleccioná los puestos manualmente en los selectores.
                  <br/><span className="fw-bold mt-1 d-block text-dark">💡 El sistema generará automáticamente las rondas siguientes hasta la Final.</span>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-bold small">Fase de Inicio</label>
                  <select className="form-select border-0 shadow-sm" value={stage} onChange={(e) => setStage(e.target.value)}>
                    <option value="Octavos de Final">Octavos de Final (16 equipos)</option>
                    <option value="Cuartos de Final">Cuartos de Final (8 equipos)</option>
                    <option value="Semifinal">Semifinal (4 equipos)</option>
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button 
                    type="button"
                    className="btn btn-outline-primary w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm bg-white" 
                    onClick={handleAutoAssign}
                  >
                    <Shuffle size={18} /> Sugerir Cruces Automáticos
                  </button>
                </div>
              </div>

              {/* MUESTRA UNA ADVERTENCIA SI NO HAY OPCIONES */}
              {placeholderOptions.length === 0 ? (
                <div className="text-center py-4 text-danger fw-bold border border-danger rounded-3 bg-white">
                  No se encontraron grupos para cruzar. Verificá que la categoría {category} tenga grupos asignados en este torneo.
                </div>
              ) : (
                <div className="matches-list pe-2" style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {matches.map((m, index) => (
                    <div key={index} className="card border-0 shadow-sm mb-3 rounded-3">
                      <div className="card-body p-3">
                        <div className="row align-items-center g-2">
                          <div className="col-5">
                            <select 
                              className="form-select form-select-sm border-0 bg-light fw-bold text-dark" 
                              value={m.placeholderTeam1}
                              onChange={(e) => handlePlaceholderChange(index, 1, e.target.value)}
                            >
                              <option value="">-- Seleccionar Equipo 1 --</option>
                              {placeholderOptions.map(opt => <option key={`1-${opt}`} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                          <div className="col-2 text-center fw-bold text-muted small">VS</div>
                          <div className="col-5">
                            <select 
                              className="form-select form-select-sm border-0 bg-light fw-bold text-dark" 
                              value={m.placeholderTeam2}
                              onChange={(e) => handlePlaceholderChange(index, 2, e.target.value)}
                            >
                              <option value="">-- Seleccionar Equipo 2 --</option>
                              {placeholderOptions.map(opt => <option key={`2-${opt}`} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer bg-white border-0 px-4 py-3">
              <button className="btn btn-light fw-bold px-4 rounded-pill border" onClick={onClose} disabled={isSaving}>Cancelar</button>
              <button className="btn text-white fw-bold px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" 
                style={{ backgroundColor: "#fd7e14" }} onClick={handleSave} disabled={isSaving || placeholderOptions.length === 0}>
                {isSaving ? "Guardando..." : <><Save size={18} /> Guardar Cuadro</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateBracketModal;