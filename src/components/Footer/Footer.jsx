// src/components/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BsWhatsapp } from 'react-icons/bs';

function Footer() {
  // Mensaje predeterminado para tu WhatsApp de negocios
  const wpBusinessMessage = encodeURIComponent("¡Hola! Vi el software del torneo de Pádel y me interesa conocer más sobre sus servicios.");

  return (
    <footer className="bg-white text-secondary pt-5 mt-auto">
      {/* CONTENIDO PRINCIPAL CON FONDO BLANCO */}
      <div className="container pb-4">
        {/* Agregué justify-content-center para asegurar que la columna quede en el medio */}
        <div className="row justify-content-center text-center align-items-center g-4">
          
          {/* COLUMNA: FIRMA DEL DESARROLLADOR (PRONEXACODE) */}
          <div className="col-12 d-flex flex-column align-items-center text-center">
            <a 
              href={`https://wa.me/5493863447601?text=${wpBusinessMessage}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-decoration-none text-secondary custom-hover transition-all d-flex flex-column align-items-center gap-1"
              title="Contactar por WhatsApp"
            >
              
              {/* Espacio reservado para tu logo */}
              <div className="mb-2 d-flex justify-content-center">
                <img 
                  src="/imagenes/ProNexaCode.png" 
                  alt="Logo" 
                  style={{ maxHeight: '110px', objectFit: 'contain' }} 
                />
              </div>

              {/* Le puse un tono azul primario al icono del código para hacer juego con tu logo */}
              <span className="small mb-0 fw-medium">
                SaaS & Digital Solutions
              </span>

              <span className="d-flex align-items-center justify-content-center gap-2 small mb-0 fw-medium mt-1">
                <BsWhatsapp size={20} className="text-success" /> +54 9 3863 447601
              </span>
            </a>
          </div>

        </div>
      </div>

      {/* COPYRIGHT - FONDO GRIS OSCURO Y LETRAS BLANCAS */}
      <div className="bg-dark text-white py-3 mt-2">
        <div className="container text-center small">
          &copy; 2026 Torneo de Pádel MVC. <br className="d-md-none" /> Todos los derechos reservados.
          <span className="d-block mt-1 fw-bold">Powered by ProNexaCodes</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;