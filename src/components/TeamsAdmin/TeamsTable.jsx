// src/components/TeamsAdmin/TeamsTable.jsx
import React, { useState, useEffect } from "react";
import { useTeams } from "../../context/TeamContext";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

const TeamsTable = ({ searchTerm }) => {
  const { teams, pagination, loadTeams, isLoading: isGlobalLoading } = useTeams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // 🔥 NUEVO ESTADO CRÍTICO: Evita el desfasaje visual limpiando la UI antes del fetch
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  // 1. Si escriben en el buscador, volvemos a la página 1 e indicamos carga inmediata
  useEffect(() => {
    setCurrentPage(1);
    setIsLocalLoading(true);
  }, [searchTerm]);

  // 2. Al cambiar de página, disparamos la carga local inmediatamente para ocultar datos viejos
  useEffect(() => {
    setIsLocalLoading(true);
  }, [currentPage]);

  // 3. Efecto ÚNICO para disparar la carga paginada desde el servidor con Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadTeams(currentPage, itemsPerPage, searchTerm).finally(() => {
        setIsLocalLoading(false);
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage]);

  // 🔥 Unificamos los estados de carga. Si el contexto está procesando o nuestro local está esperando, va el spinner.
  const showSpinner = isGlobalLoading || isLocalLoading;

  if (showSpinner) {
    return (
      <div className="text-center py-5">
        <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: "#fd7e14" }} />
        <p className="text-muted fw-medium">Cargando lista de parejas...</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-5 border rounded-3 bg-light">
        <p className="text-muted mb-0 fw-medium">No se encontraron equipos que coincidan con la búsqueda.</p>
      </div>
    );
  }

  // Extraemos los datos de paginación reales del backend
  const totalPages = pagination?.totalPages || 1;
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;

  const rowStyle = {
    backgroundColor: "#ffffff",
    borderTop: "1px solid #eaedf1",
    borderBottom: "1px solid #eaedf1",
  };

  return (
    <div className="px-1">
      <div className="table-responsive">
        <table className="w-100 align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
          <thead>
            <tr>
              <th className="text-secondary small fw-bold text-uppercase pb-2 ps-4">#</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2 ps-2">Equipo / Integrantes</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2 text-center">DNI Jugador 1</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2 text-center">DNI Jugador 2</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => {
              const globalIndex = indexOfFirstItem + index;
              const leftBorderColor = globalIndex % 2 === 0 ? "#0f172a" : "#fd7e14";
              const imgDefault = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

              return (
                <tr key={team._id} style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  
                  {/* Número de fila */}
                  <td className="ps-3 py-3" style={{ 
                    ...rowStyle, 
                    borderLeft: `5px solid ${leftBorderColor}`, 
                    borderTopLeftRadius: "12px", 
                    borderBottomLeftRadius: "12px" 
                  }}>
                    <span className="fw-bold text-muted ps-2">#{globalIndex + 1}</span>
                  </td>
                  
                  {/* Detalles del Equipo */}
                  <td className="ps-2 py-3" style={{ ...rowStyle, borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <img 
                          src={team.player1?.profileImage || imgDefault} 
                          alt="P1" 
                          className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
                          style={{ width: "42px", height: "42px", marginRight: "-14px", zIndex: 2 }}
                        />
                        <img 
                          src={team.player2?.profileImage || imgDefault} 
                          alt="P2" 
                          className="rounded-circle object-fit-cover border border-2 border-white shadow-sm"
                          style={{ width: "42px", height: "42px", zIndex: 1 }}
                        />
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
                  </td>

                  {/* DNI Jugadores */}
                  <td className="fw-semibold text-secondary text-center py-3" style={rowStyle}>
                    {team.player1?.dni || "-"}
                  </td>
                  <td className="fw-semibold text-secondary text-center py-3" style={rowStyle}>
                    {team.player2?.dni || "-"}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación Centrada */}
      {totalPages > 1 && (
        <div className="d-flex flex-column align-items-center justify-content-center mt-4 px-2 gap-2">
          <div className="d-flex gap-1 align-items-center">
            <button
              className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (pageNum < currentPage - 2 || pageNum > currentPage + 2) return null;

              const isCurrent = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  className="btn btn-sm rounded-3 fw-bold shadow-sm transition-all"
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: isCurrent ? "#0f172a" : "#ffffff", 
                    color: isCurrent ? "#ffffff" : "#475569",
                    border: isCurrent ? "none" : "1px solid #cbd5e1",
                    transform: isCurrent ? "scale(1.05)" : "scale(1)" 
                  }}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-muted small fw-medium mt-1 text-center">
            Página <span className="text-dark fw-bold">{currentPage}</span> de{" "}
            <span className="text-dark fw-bold">{totalPages}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default TeamsTable;