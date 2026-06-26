// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  BsInstagram, BsFacebook, BsTwitterX, BsYoutube,
  BsHouseDoorFill, BsPeopleFill, BsJournalText,
  BsPlayCircleFill, BsDiagram3Fill, BsTrophyFill
} from 'react-icons/bs';

function Navbar() {
  // Estado para manejar el menú hamburguesa (Móviles)
  const [isOpen, setIsOpen] = useState(false);

  // Funciones de control
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-padel-orange shadow-sm sticky-top">
      <div className="container">
        
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <img 
            src="/imagenes/logo-mvc.png" 
            alt="Logo MVC" 
            width="60" 
            height="60" 
            className="me-2 rounded-circle bg-white p-1" 
          />
          <span className="fw-bold h3 mb-0">Pádel</span>
        </Link>

        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarPrincipal" 
          aria-expanded={isOpen} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarPrincipal">
          
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            
            {/* INICIO */}
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/" onClick={closeMenu}>
                <BsHouseDoorFill className="mb-1" /> Inicio
              </NavLink>
            </li>
            
            <span className="text-white-50 mx-2 d-none d-lg-block">|</span>
            
            {/* PARTIDOS */}
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/partidos" onClick={closeMenu}>
                <BsPlayCircleFill className="mb-1" /> Partidos
              </NavLink>
            </li>

            <span className="text-white-50 mx-2 d-none d-lg-block">|</span>

            {/* GRUPOS */}
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/zonas" onClick={closeMenu}>
                <BsDiagram3Fill className="mb-1" /> Grupos
              </NavLink>
            </li>

            <span className="text-white-50 mx-2 d-none d-lg-block">|</span>

            {/* PLAYOFFS */}
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/playoffs" onClick={closeMenu}>
                <BsTrophyFill className="mb-1" /> Playoffs
              </NavLink>
            </li>
            
            <span className="text-white-50 mx-2 d-none d-lg-block">|</span>
            
            {/* JUGADORES */}
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/jugadores" onClick={closeMenu}>
                <BsPeopleFill className="mb-1" /> Jugadores
              </NavLink>
            </li>
            
            {/* REGLAMENTO (Comentado por ahora) */}
            {/* <span className="text-white-50 mx-2 d-none d-lg-block">|</span>
            <li className="nav-item">
              <NavLink className="nav-link fw-semibold text-uppercase d-flex align-items-center gap-1" to="/reglamento" onClick={closeMenu}>
                <BsJournalText className="mb-1" /> Reglamento
              </NavLink>
            </li> 
            */}
          </ul>

          {/* REDES SOCIALES */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0 ms-lg-4 pb-3 pb-lg-0 justify-content-center">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white opacity-75 custom-hover transition-all">
              <BsInstagram size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white opacity-75 custom-hover transition-all">
              <BsFacebook size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white opacity-75 custom-hover transition-all">
              <BsTwitterX size={20} /> 
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white opacity-75 custom-hover transition-all">
              <BsYoutube size={22} />
            </a>
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;