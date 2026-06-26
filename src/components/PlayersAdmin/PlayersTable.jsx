// src/components/PlayersAdmin/PlayersTable.jsx
import React, { useState, useEffect } from "react";
import { usePlayers } from "../../context/PlayerContext";
import { Edit, Loader2, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

const PlayersTable = ({ searchTerm, onOpenEdit }) => {
  const { players, pagination, loadPlayers, isLoading: isGlobalLoading } = usePlayers();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // 🔥 NUEVO ESTADO LOCAL: Frena el parpadeo visual ocultando los datos viejos
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  // 1. Si escriben en el buscador, volvemos a la página 1 y activamos la carga local
  useEffect(() => {
    setCurrentPage(1);
    setIsLocalLoading(true);
  }, [searchTerm]);

  // 2. Al cambiar de página, disparamos la carga local inmediatamente
  useEffect(() => {
    setIsLocalLoading(true);
  }, [currentPage]);

  // 3. Efecto ÚNICO para disparar la carga paginada desde el servidor (con Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadPlayers(currentPage, itemsPerPage, searchTerm).finally(() => {
        setIsLocalLoading(false); // Apagamos el spinner local cuando el back responde
      });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, currentPage]);

  // Calculadora automática de edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return "-";
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // 🔥 Evaluamos ambos estados de carga simultáneamente
  const showSpinner = isGlobalLoading || isLocalLoading;

  if (showSpinner) {
    return (
      <div className="text-center py-5">
        <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: "#fd7e14" }} />
        <p className="text-muted fw-medium">Cargando la lista de jugadores...</p>
      </div>
    );
  }

  // Ya no filtramos manualmente, usamos directamente lo que mandó el Backend
  if (players.length === 0) {
    return (
      <div className="text-center py-5 border rounded-3 bg-light">
        <p className="text-muted mb-0 fw-medium">No se encontraron jugadores que coincidan con la búsqueda.</p>
      </div>
    );
  }

  // Extraemos los datos de paginación que nos mandó el Backend
  const totalPages = pagination?.totalPages || 1;
  const totalPlayers = pagination?.totalPlayers || 0;
  
  // 🔥 FIX: Como el backend ya manda SOLO los 5 correctos, indexOfFirstItem solo se usa visualmente
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
              <th className="text-secondary small fw-bold text-uppercase pb-2 ps-2">Jugador</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2">DNI y Edad</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2">Categoría</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2 text-center">Estado</th>
              <th className="text-secondary small fw-bold text-uppercase pb-2 text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* 🔥 Acá mapeamos directamente 'players' en vez de 'currentItems' porque el Back ya lo cortó */}
            {players.map((player, index) => {
              const globalIndex = indexOfFirstItem + index;
              const leftBorderColor = globalIndex % 2 === 0 ? "#0f172a" : "#fd7e14";

              return (
                <tr key={player._id} style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  
                  <td className="ps-3 py-3" style={{ 
                    ...rowStyle, 
                    borderLeft: `5px solid ${leftBorderColor}`, 
                    borderTopLeftRadius: "12px", 
                    borderBottomLeftRadius: "12px" 
                  }}>
                    <span className="fw-bold text-muted ps-2">#{globalIndex + 1}</span>
                  </td>
                  
                  <td className="ps-2 py-3" style={rowStyle}>
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={player.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt="Perfil" 
                        className="rounded-circle object-fit-cover border shadow-sm"
                        style={{ width: "45px", height: "45px" }}
                      />
                      <div className="d-flex flex-column text-start overflow-hidden" style={{ lineHeight: "1.2" }}>
                        <div className="text-truncate">
                          <span className="fw-bold text-dark text-uppercase">{player.lastName}</span> <span className="text-dark">{player.firstName}</span>
                        </div>
                        <span className="text-muted mt-1" style={{ fontSize: "0.80rem" }}>
                          {player.email || "Sin email registrado"}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="fw-medium text-secondary py-3" style={rowStyle}>
                    <div className="d-flex flex-column">
                      <span>{player.dni}</span>
                      <span className="badge bg-light text-muted border mt-1 w-auto shadow-sm" style={{ fontSize: "0.75rem", alignSelf: "flex-start" }}>
                        {calculateAge(player.birthDate)} años
                      </span>
                    </div>
                  </td>
                  
                  <td className="py-3" style={rowStyle}>
                    <span className="badge bg-light text-dark border">
                      {player.category}
                    </span>
                    <span className="d-block text-muted small mt-1" style={{ fontSize: "0.75rem" }}>
                      Lado: {player.position}
                    </span>
                  </td>
                  
                  <td className="text-center py-3" style={rowStyle}>
                    {player.isActive ? (
                      <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-3 py-2">
                        <ShieldCheck size={14} className="me-1" /> Activo
                      </span>
                    ) : (
                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill px-3 py-2">
                        <ShieldAlert size={14} className="me-1" /> Inactivo
                      </span>
                    )}
                  </td>
                  
                  <td className="text-end pe-3 py-3" style={{ 
                    ...rowStyle, 
                    borderRight: "1px solid #eaedf1", 
                    borderTopRightRadius: "12px", 
                    borderBottomRightRadius: "12px" 
                  }}>
                    <button 
                      className="btn btn-sm btn-light border fw-bold text-secondary shadow-sm transition-all"
                      onClick={() => onOpenEdit(player)}
                    >
                      <Edit size={16} className="me-1" /> Editar
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
            Mostrando <span className="text-dark fw-bold">{indexOfFirstItem + 1}</span> al{" "}
            <span className="text-dark fw-bold">
              {Math.min(indexOfFirstItem + itemsPerPage, totalPlayers)}
            </span>{" "}
            de <span className="text-dark fw-bold">{totalPlayers}</span> jugadores.
          </span>

        </div>
      )}
    </div>
  );
};

export default PlayersTable;