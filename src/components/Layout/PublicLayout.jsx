// src/components/Layout/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        {/* Aquí adentro se van a renderizar el Home, Info, Zonas, etc. */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;