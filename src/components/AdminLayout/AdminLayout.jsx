import { useState } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Contact, 
  Trophy,
  Flag,
  Layers,
  Medal,
  LogOut, 
  Menu,
  X,
  Settings,
  PlayCircle // 🔥 Agregamos el ícono para Partidos
} from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import "./AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada correctamente", {
      position: "top-center",
      style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" }
    });
    // Corregido a la ruta actual del login
    navigate("/admin/staff/login");
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) => 
    `nav-link d-flex align-items-center gap-3 p-2 rounded transition-all fw-semibold ${
      isActive ? "active-link shadow-sm text-dark bg-white bg-opacity-25" : "text-white hover-sidebar"
    }`;

  return (
    <div className="d-flex flex-column flex-md-row" style={{ minHeight: "100vh" }}>
      
      {/* --- HEADER MÓVIL --- */}
      <div 
        className="d-md-none text-white p-3 d-flex justify-content-between align-items-center sticky-top shadow-sm z-3"
        style={{ backgroundColor: "#fd7e14" }} /* Fondo Naranja */
      >
        <img src="/imagenes/logo-mvc.png" alt="Torneo Padel" style={{ height: "45px", objectFit: "contain" }} className="drop-shadow" />
        <button className="btn btn-link text-white p-0 border-0" onClick={() => setIsMobileOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* --- FONDO OSCURO PARA CELULAR --- */}
      {isMobileOpen && (
        <div 
          className="d-md-none position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 z-2"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* --- SIDEBAR IZQUIERDO --- */}
      <aside 
        className={`d-flex flex-column p-3 sidebar-container ${isMobileOpen ? 'open' : ''}`} 
        style={{ 
          width: "260px", 
          height: "100vh",
          backgroundColor: "#fd7e14", /* Fondo Naranja dominante */
          borderRight: "4px solid #0f172a", /* Borde Azul Oscuro */
          color: "white"
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 px-2 py-3 border-bottom border-white border-opacity-25">
          <img src="/imagenes/logo-mvc.png" alt="Torneo Padel" style={{ height: "60px", objectFit: "contain" }} className="drop-shadow" />
          <button className="btn btn-link text-white p-0 border-0 d-md-none" onClick={closeMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <nav className="nav flex-column flex-grow-1 gap-2 overflow-auto" style={{ scrollbarWidth: 'none' }}>
          <p className="small text-uppercase fw-bold px-2 mb-1" style={{ fontSize: '0.75rem', color: "#0f172a" }}>Menu Principal</p>

          <NavLink to="/admin/torneos" onClick={closeMobileMenu} className={navLinkClass}>
            <Trophy size={20} /> Torneos
          </NavLink>

          <NavLink to="/admin/jugadores" onClick={closeMobileMenu} className={navLinkClass}>
            <Users size={20} /> Jugadores
          </NavLink>

          <NavLink to="/admin/teams" onClick={closeMobileMenu} className={navLinkClass}>
            <Flag size={20} /> Equipos
          </NavLink>

          <NavLink to="/admin/grupos" onClick={closeMobileMenu} className={navLinkClass}>
            <Layers size={20} /> Zonas / Grupos
          </NavLink>

          {/* 🔥 NUEVO ENLACE A PARTIDOS (MESA DE CONTROL) */}
          <NavLink to="/admin/partidos" onClick={closeMobileMenu} className={navLinkClass}>
            <PlayCircle size={20} /> Partidos
          </NavLink>

          <NavLink to="/admin/playoffs" onClick={closeMobileMenu} className={navLinkClass}>
            <Medal size={20} /> Playoffs
          </NavLink>

          <hr className="border-white border-opacity-50 my-2" />

          {/* Área exclusiva de administración de empleados */}
          {user?.role === "ADMIN" && (
            <>
              <p className="small text-uppercase fw-bold px-2 mb-1 mt-2" style={{ fontSize: '0.75rem', color: "#0f172a" }}>Administración</p>
              <NavLink to="/admin/staff" onClick={closeMobileMenu} className={navLinkClass}>
                <Contact size={20} /> Gestión de Staff
              </NavLink>
            </>
          )}

        </nav>

        {/* --- FOOTER DEL SIDEBAR (Perfil y Logout) --- */}
        <div className="mt-auto pt-3 border-top border-white border-opacity-25">
          <div className="d-flex align-items-center justify-content-between px-2 mb-3">
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <img 
                src={user?.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt="Profile" 
                className="rounded-circle border border-white bg-white flex-shrink-0 shadow-sm"
                style={{ width: "55px", height: "55px", objectFit: "cover" }}
              />
              <div className="overflow-hidden">
                <p className="mb-0 small fw-bold text-truncate text-white">{user?.firstName} {user?.lastName}</p>
                <span className="badge mt-1 text-white" style={{ fontSize: '0.65rem', backgroundColor: "#0f172a" }}>
                  {user?.role}
                </span>
              </div>
            </div>
            
              
            <Link to="/admin/staff/profile" onClick={closeMobileMenu} className="text-white d-flex align-items-center justify-content-center flex-shrink-0 p-1 rounded-circle hover-sidebar" title="Mi Perfil">
              <Settings size={22} /> 
            </Link>
          </div>
          
          <button 
            onClick={handleLogout}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 shadow py-2 fw-bold text-white rounded-3"
            style={{ backgroundColor: "#0f172a", border: "none" }} /* Botón Azul Oscuro */
          >
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* --- ÁREA PRINCIPAL DONDE CARGAN LAS PÁGINAS --- */}
      <main className="flex-grow-1 overflow-auto bg-light" style={{ height: "100vh" }}>
        <div className="container-fluid p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;