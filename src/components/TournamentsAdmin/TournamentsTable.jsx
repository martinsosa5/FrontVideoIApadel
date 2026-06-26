// src/components/TournamentsAdmin/TournamentsTable.jsx
import React, { useState } from "react";
import { useTournaments } from "../../context/TournamentContext";
import { Loader2, ChevronLeft, ChevronRight, Pencil, Users, Star, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TournamentsTable = ({ searchTerm, sortOrder, onManageInscriptions, onEditTournament }) => {
  const { tournaments, isLoading } = useTournaments();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: "#fd7e14" }} />
        <p className="text-muted fw-medium">Cargando torneos...</p>
      </div>
    );
  }

  let filtered = tournaments.filter((t) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  filtered = filtered.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  if (filtered.length === 0) {
    return (
      <div className="text-center py-5 border rounded-3 bg-light">
        <p className="text-muted mb-0 fw-medium">No se encontraron torneos.</p>
      </div>
    );
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Inscripciones Abiertas': return <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">Inscripciones Abiertas</span>;
      case 'En Curso': return <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 rounded-pill">En Curso</span>;
      case 'Finalizado': return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill">Finalizado</span>;
      default: return <span className="badge bg-dark">{status}</span>;
    }
  };

  return (
    <div className="px-1">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3 text-secondary small fw-bold text-uppercase">Torneo / Sede</th>
              <th className="py-3 text-secondary small fw-bold text-uppercase">Fechas</th>
              <th className="py-3 text-secondary small fw-bold text-uppercase text-center">Estado</th>
              <th className="py-3 text-secondary small fw-bold text-uppercase text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((tournament) => (
              <tr key={tournament._id}>
                
                <td className="py-3">
                  <div className="d-flex align-items-center gap-3">
                    {/* 🔥 NUEVO: Miniatura de la portada del torneo */}
                    <div className="flex-shrink-0">
                      <img 
                        src={tournament.posterImage || `https://ui-avatars.com/api/?name=${tournament.name}&background=f8fafc&color=0f172a&rounded=true&bold=true`}
                        alt={tournament.name}
                        className="rounded-3 shadow-sm object-fit-cover border"
                        style={{ width: "48px", height: "48px" }}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tournament.name}&background=f8fafc&color=0f172a&rounded=true&bold=true` }}
                      />
                    </div>
                    
                    {/* Nombre y Sede */}
                    <div>
                      <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                        {tournament.name}
                        {tournament.showInHome && <Star size={14} fill="#f59e0b" color="#f59e0b" title="Destacado en Novedades" />}
                      </div>
                      <div className="text-muted small">{tournament.club}</div>
                    </div>
                  </div>
                </td>
                
                <td className="py-3">
                  <div className="fw-medium text-dark small">
                    Del {format(new Date(tournament.startDate), "dd MMM yyyy", { locale: es })}
                  </div>
                  <div className="text-muted small">
                    al {format(new Date(tournament.endDate), "dd MMM yyyy", { locale: es })}
                  </div>
                </td>

                <td className="py-3 text-center">
                  {getStatusBadge(tournament.status)}
                </td>

                <td className="py-3 text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      onClick={() => onEditTournament(tournament)}
                      className="btn btn-sm btn-light border text-secondary fw-bold d-flex align-items-center gap-1 shadow-sm transition-all hover-dark"
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    
                    <button 
                      onClick={() => onManageInscriptions(tournament)}
                      className="btn btn-sm fw-bold d-flex align-items-center gap-1 shadow-sm text-white"
                      style={{ backgroundColor: "#0f172a" }}
                    >
                      <Users size={14} /> Inscripciones
                    </button>
                  </div>
                </td>
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="d-flex flex-column align-items-center justify-content-center mt-4 px-2 gap-2">
          <div className="d-flex gap-1 align-items-center">
            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
              <ChevronLeft size={16} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i + 1} className="btn btn-sm rounded-3 fw-bold shadow-sm"
                style={{ width: "36px", height: "36px", backgroundColor: currentPage === i + 1 ? "#0f172a" : "#ffffff", color: currentPage === i + 1 ? "#ffffff" : "#475569", border: currentPage === i + 1 ? "none" : "1px solid #cbd5e1" }}
                onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button className="btn btn-sm btn-light border rounded-3 p-2 shadow-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsTable;