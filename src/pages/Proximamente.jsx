// src/pages/Proximamente.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BsClockHistory } from 'react-icons/bs';

function Proximamente() {
  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div className="text-center bg-white p-5 rounded-4 shadow-sm border-0" style={{ maxWidth: '600px' }}>
        
        {/* Icono de espera gigante */}
        <BsClockHistory size={80} className="text-padel-orange mb-4 opacity-75" />
        
        <h1 className="display-5 fw-bold text-uppercase mb-3">Próximamente</h1>
        
        <div className="bg-padel-orange mx-auto mb-4" style={{ height: '4px', width: '60px' }}></div>
        
        <p className="fs-5 text-muted mb-5">
          La información de esta sección estará disponible una vez que cierren las inscripciones y se realice el sorteo oficial del torneo. ¡Preparate para seguir toda la acción!
        </p>
        
        <Link to="/" className="btn btn-outline-dark rounded-pill px-5 py-2 fw-bold text-uppercase">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default Proximamente;