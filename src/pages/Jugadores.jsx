// src/pages/Jugadores.jsx
import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Users, User, Info } from 'lucide-react';
import { getPublicPlayersRequest, getPublicTeamsRequest } from '../services/public.service';

function Jugadores() {
  const [activeTab, setActiveTab] = useState('jugadores');
  
  // Estados de datos
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Estados de interfaz
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación compartida controlada por el servidor
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesPlayers, setTotalPagesPlayers] = useState(1);
  const [totalPagesTeams, setTotalPagesTeams] = useState(1);
  const itemsPerPage = 12;

  // ==========================================
  // CARGA DE JUGADORES (SERVER-SIDE)
  // ==========================================
  const fetchPlayers = async (page, searchStr) => {
    try {
      const res = await getPublicPlayersRequest(page, itemsPerPage, searchStr);
      setPlayers(res.data.players || []);
      setTotalPagesPlayers(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
    }
  };

  // ==========================================
  // CARGA DE EQUIPOS/PAREJAS (SERVER-SIDE)
  // ==========================================
  const fetchTeams = async (page, searchStr) => {
    try {
      const res = await getPublicTeamsRequest(page, itemsPerPage, searchStr);
      setTeams(res.data.teams || []);
      setTotalPagesTeams(res.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error al cargar equipos:", error);
    }
  };

  // ==========================================
  // EFECTO ÚNICO PARA BÚSQUEDA Y PAGINACIÓN
  // ==========================================
  useEffect(() => {
    setIsSearching(true);
    
    // Si no hay texto de búsqueda, no aplicamos el retraso de 500ms
    const delay = searchTerm ? 500 : 0;

    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'jugadores') {
        fetchPlayers(currentPage, searchTerm).finally(() => {
          setIsSearching(false);
          setIsLoading(false);
        });
      } else {
        fetchTeams(currentPage, searchTerm).finally(() => {
          setIsSearching(false);
          setIsLoading(false);
        });
      }
    }, delay);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, currentPage, activeTab]);

  // Handler de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Al escribir, siempre volvemos a la página 1
  };

  // Handler de cambio de pestaña
  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setIsLoading(true);
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Calcular edad
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

  // Variables calculadas para la UI
  const hasData = activeTab === 'jugadores' ? players.length > 0 : teams.length > 0;
  const currentTotalPages = activeTab === 'jugadores' ? totalPagesPlayers : totalPagesTeams;

  return (
    <div className="container py-5" style={{ minHeight: '80vh' }}>
      
      {/* Textos de Presentación */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-uppercase text-padel-orange mb-2">Jugadores</h1>
        <p className="text-muted fs-5">Conocé a todos los jugadores y parejas que forman parte de nuestro club</p>
      </div>

      {/* Pestañas */}
      <div className="d-flex justify-content-center mb-4">
        <div className="bg-light p-1 rounded-pill shadow-sm d-inline-flex border">
          <button 
            className={`btn rounded-pill px-4 fw-bold transition-all ${activeTab === 'jugadores' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
            onClick={() => handleTabChange('jugadores')}
          >
            <User size={18} className="me-2 mb-1" /> Jugadores
          </button>
          <button 
            className={`btn rounded-pill px-4 fw-bold transition-all ${activeTab === 'equipos' ? 'btn-dark text-white' : 'btn-light text-muted border-0'}`}
            onClick={() => handleTabChange('equipos')}
          >
            <Users size={18} className="me-2 mb-1" /> Parejas
          </button>
        </div>
      </div>

      {/* Buscador General */}
      <div className="row justify-content-center mb-5">
        <div className="col-12 col-md-6">
          <div className="position-relative shadow-sm rounded-pill">
            <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
              {isSearching ? <Loader2 size={20} className="animate-spin text-padel-orange" /> : <Search size={20} />}
            </span>
            <input 
              type="text" 
              className="form-control form-control-lg rounded-pill ps-5 border-light" 
              placeholder={`Buscar ${activeTab === 'jugadores' ? 'jugador por nombre o apellido...' : 'pareja...'}`}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ backgroundColor: '#f8f9fa' }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5 my-5">
          <Loader2 size={40} className="animate-spin mx-auto mb-3" style={{ color: '#fd7e14' }} />
          <p className="text-muted fw-medium">Cargando la lista de protagonistas...</p>
        </div>
      ) : !hasData && !isSearching ? (
        <div className="text-center py-5 bg-light rounded-4 border shadow-sm my-5">
          <Info size={50} className="text-muted mb-3 mx-auto opacity-50" />
          <h4 className="fw-bold text-dark mb-2">No se encontraron resultados</h4>
          <p className="text-muted mb-0 fs-5 px-3">
            No hay {activeTab === 'jugadores' ? 'jugadores' : 'equipos'} que coincidan con la búsqueda actual.
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3">
            
            {/* =========================================================
                RENDER DE JUGADORES
            ========================================================= */}
            {activeTab === 'jugadores' && players.map((player, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1; 
              const leftBorderColor = globalIndex % 2 !== 0 ? "#0f172a" : "#fd7e14";

              return (
                <div key={player._id} className="col-12 col-lg-6">
                  <div 
                    className="d-flex align-items-center p-2 bg-white shadow-sm transition-hover h-100" 
                    style={{ 
                      borderTop: '1px solid #eaedf1', borderRight: '1px solid #eaedf1', borderBottom: '1px solid #eaedf1',
                      borderLeft: `6px solid ${leftBorderColor}`, borderRadius: '10px' 
                    }}
                  >
                    <img 
                      src={player.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                      alt="Perfil" 
                      className="rounded-circle object-fit-cover shadow-sm ms-2 me-3"
                      style={{ width: "50px", height: "50px", flexShrink: 0, border: '1px solid #eaedf1' }}
                    />
                    
                    <div className="d-flex flex-column text-start overflow-hidden w-100">
                      <div className="text-truncate mb-1" style={{ fontSize: "0.95rem" }}>
                        <span className="fw-bold text-dark text-uppercase">{player.lastName}</span>{' '}
                        <span className="text-dark text-lowercase">{player.firstName}</span>
                      </div>
                      <span className="text-muted fw-medium" style={{ fontSize: "0.75rem" }}>
                        {player.category} <span className="mx-1 text-light-gray">|</span> {calculateAge(player.birthDate)} años <span className="mx-1 text-light-gray">|</span> Pos: {player.position}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* =========================================================
                RENDER DE EQUIPOS/PAREJAS
            ========================================================= */}
            {activeTab === 'equipos' && teams.map((team, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
              const leftBorderColor = globalIndex % 2 !== 0 ? "#0f172a" : "#fd7e14";
              const p1 = team.player1 || {};
              const p2 = team.player2 || {};
              
              return (
                <div key={team._id} className="col-12 col-lg-6">
                  <div 
                    className="d-flex align-items-center p-2 bg-white shadow-sm transition-hover h-100" 
                    style={{ 
                      borderTop: '1px solid #eaedf1', borderRight: '1px solid #eaedf1', borderBottom: '1px solid #eaedf1',
                      borderLeft: `6px solid ${leftBorderColor}`, borderRadius: '10px' 
                    }}
                  >
                    <div className="position-relative ms-2 me-3" style={{ width: "75px", height: "50px", flexShrink: 0 }}>
                      <img 
                        src={p1.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        className="rounded-circle position-absolute shadow-sm object-fit-cover" 
                        style={{ width: "45px", height: "45px", left: "0", top: "2.5px", zIndex: 2, border: '2px solid #fff' }} 
                        alt="Jugador 1"
                      />
                      <img 
                        src={p2.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        className="rounded-circle position-absolute shadow-sm object-fit-cover" 
                        style={{ width: "45px", height: "45px", left: "30px", top: "2.5px", zIndex: 1, border: '2px solid #fff' }} 
                        alt="Jugador 2"
                      />
                    </div>

                    <div className="d-flex flex-column text-start overflow-hidden w-100">
                      <div className="text-truncate" style={{ lineHeight: "1.2", fontSize: "0.9rem" }}>
                        <span className="fw-bold text-dark text-uppercase">{p1.lastName}</span>{' '}
                        <span className="text-dark text-lowercase">{p1.firstName}</span>
                      </div>
                      <div className="text-truncate mt-1" style={{ lineHeight: "1.2", fontSize: "0.9rem" }}>
                        <span className="fw-bold text-dark text-uppercase">{p2.lastName}</span>{' '}
                        <span className="text-dark text-lowercase">{p2.firstName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          {currentTotalPages > 1 && (
            <div className="d-flex justify-content-center mt-5">
              <div className="d-flex gap-2 align-items-center bg-white p-2 rounded-pill shadow-sm border">
                <button
                  className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: "36px", height: "36px" }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Algoritmo para mostrar solo 5 páginas y evitar desbordes */}
                {[...Array(currentTotalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum < currentPage - 2 || pageNum > currentPage + 2) return null;
                  
                  const isCurrent = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      className="btn btn-sm rounded-circle fw-bold transition-all"
                      style={{
                        width: "36px", height: "36px",
                        backgroundColor: isCurrent ? "#0f172a" : "transparent",
                        color: isCurrent ? "#ffffff" : "#6c757d",
                      }}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="btn btn-sm btn-light rounded-circle p-2 d-flex align-items-center justify-content-center"
                  style={{ width: "36px", height: "36px" }}
                  disabled={currentPage === currentTotalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      <style>{`
        .transition-hover { transition: transform 0.2s ease-in-out; }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important; }
        .text-padel-orange { color: #fd7e14; }
        .text-light-gray { color: #dee2e6; }
      `}</style>
    </div>
  );
}

export default Jugadores;