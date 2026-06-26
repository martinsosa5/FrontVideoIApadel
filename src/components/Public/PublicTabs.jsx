import React from 'react';
import { NavLink } from 'react-router-dom';
import { PlayCircle, GitMerge, Trophy } from "lucide-react";
import { BsPlayCircleFill, BsDiagram3Fill, BsTrophyFill } from 'react-icons/bs';

const PublicTabs = () => {
  return (
    <div className="bg-white shadow-sm sticky-top" style={{ top: "60px", zIndex: 1020 }}>
      <div className="container">
        <ul className="nav nav-underline nav-fill d-flex flex-nowrap text-nowrap overflow-auto py-2" style={{ gap: "0.5rem" }}>
          <li className="nav-item flex-sm-fill">
            <NavLink to="/partidos/en-vivo" className={({ isActive }) => `nav-link fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 px-3 py-2 ${isActive ? 'bg-padel-orange text-white' : 'text-muted'}`} style={({ isActive }) => isActive ? { backgroundColor: "#fd7e14" } : {}}>
              <BsPlayCircleFill size={16} /> <span className="d-none d-sm-inline">En Vivo</span><span className="d-inline d-sm-none">Vivo</span>
            </NavLink>
          </li>
          <li className="nav-item flex-sm-fill">
            <NavLink to="/partidos/zonas" className={({ isActive }) => `nav-link fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 px-3 py-2 ${isActive ? 'bg-padel-orange text-white' : 'text-muted'}`} style={({ isActive }) => isActive ? { backgroundColor: "#fd7e14" } : {}}>
              <BsDiagram3Fill size={16} /> Zonas
            </NavLink>
          </li>
          <li className="nav-item flex-sm-fill">
            <NavLink to="/partidos/cuadro" className={({ isActive }) => `nav-link fw-bold rounded-pill d-flex align-items-center justify-content-center gap-2 px-3 py-2 ${isActive ? 'bg-padel-orange text-white' : 'text-muted'}`} style={({ isActive }) => isActive ? { backgroundColor: "#fd7e14" } : {}}>
              <BsTrophyFill size={16} /> Cuadro
            </NavLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PublicTabs;