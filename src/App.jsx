// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// --- LAYOUTS (Las Cajas) ---
import PublicLayout from './components/Layout/PublicLayout.jsx';

// --- PÁGINAS CAJA 1: PÚBLICAS ---
import Home from './pages/Home.jsx';
import InfoTorneo from './pages/InfoTorneo.jsx';
import Proximamente from './pages/Proximamente.jsx';
import ZonasPublic from './pages/ZonasPublic.jsx';

// --- PÁGINAS CAJA 2: LIMPIAS (Auth) ---
import AdminRegister from './pages/AdminRegister.jsx';
import StaffLogin from './pages/StaffLogin.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// --- PÁGINAS CAJA 3: ADMINISTRATIVAS ---
import Staff from './pages/Staff.jsx';
import AdminLayout from './components/AdminLayout/AdminLayout.jsx';
import Profile from './pages/Profile.jsx';
import PlayersAdmin from './pages/PlayersAdmin.jsx';
import TeamsAdmin from './pages/TeamsAdmin.jsx';
import TournamentsAdmin from './pages/TournamentsAdmin.jsx';
import GroupAdmin from './pages/GroupAdmin';
import MatchesAdmin from './pages/MatchesAdmin.jsx';
import PlayoffsAdmin from './pages/PlayoffsAdmin.jsx';
import Jugadores from './pages/Jugadores.jsx';
import PartidosPublic from './pages/PartidosPublic.jsx';
import PlayoffsPublic from './pages/PlayoffsPublic.jsx';


function App() {
  const { isAuthenticated, loading } = useAuth();

  // Guardián de seguridad para la Caja 3
  const ProtectedRoute = ({ children }) => {
    if (loading) return <div className="text-center p-5">Verificando sesión...</div>;
    if (!isAuthenticated) return <Navigate to="/admin/staff/login" replace />;
    return children;
  };

  return (
    <Routes>
      
      {/* =========================================
          CAJA 1: RUTAS PÚBLICAS 
          (Llevan el Navbar arriba y el Footer abajo)
      ============================================= */}
      <Route >
        <Route path="/" element={<Home />} />
        
        {/* 🔥 CAMBIO ACÁ: Modificamos a ruta dinámica usando el parámetro :id */}
        <Route path="/info-torneo/:id" element={<InfoTorneo />} />
        
        <Route path="/partidos" element={<PartidosPublic />} />
        {/* <Route path="/partidos/zonas" element={<ZonasPublic />} /> */}
        <Route path="/zonas" element={<ZonasPublic />} />
        <Route path="/playoffs" element={<PlayoffsPublic />} />
        {/* Ruta pública donde la gente verá a los jugadores (sin permisos) */}
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/reglamento" element={<Proximamente />} />
      </Route>

      {/* =========================================
          CAJA 2: RUTAS LIMPIAS (Auth)
          (Sin Navbar ni Footer general. Estas páginas
          ya tienen su propio diseñito y su AuthFooter)
      ============================================= */}
      <Route path="/@admin-register" element={<AdminRegister />} />
      <Route path="/admin/staff/login" element={<StaffLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =========================================
          CAJA 3: RUTAS PRIVADAS (Staff)
          (Llevan el Sidebar a la izquierda y están bloqueadas)
      ============================================= */}
      <Route 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        
        <Route path="/admin/staff" element={<Staff />} />
        <Route path="/admin/staff/profile" element={<Profile />} />
        <Route path="/admin/jugadores" element={<PlayersAdmin />} />
        <Route path="/admin/teams" element={<TeamsAdmin />} />
        <Route path="/admin/torneos" element={<TournamentsAdmin/>} />
        <Route path="/admin/grupos" element={<GroupAdmin />} /> 
        <Route path="/admin/partidos" element={<MatchesAdmin />} /> 
        <Route path="/admin/playoffs" element={<PlayoffsAdmin />} /> 

      </Route>

      {/* --- FALLBACK (Ruta salvavidas) --- */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}

export default App;