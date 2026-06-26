import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Mini-componente para animar al hacer scroll (Versión Vertical con Delay)
const ElementoAnimado = ({ children, className, delay = "0s" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      // Usamos reveal-base para heredar la transición fluida y alternamos el movimiento vertical
      className={`${className || ''} reveal-base ${isVisible ? 'reveal-visible-up' : 'reveal-hidden-up'}`}
      style={{ transitionDelay: delay }} // Retraso dinámico para el efecto cascada
    >
      {children}
    </div>
  );
};

function JugadoresPreview() {
  // Imagen de fondo proporcionada
  const bgImage = "https://img.magnific.com/fotos-premium/banner-jugador-tenis-padel-plantilla-padel-tenis-fondo-negro-anuncios-espacio-copia_881647-711.jpg";

  return (
    <section 
      className="position-relative text-white py-5 d-flex align-items-center justify-content-center border-top border-dark"
      style={{ minHeight: '50vh', overflow: 'hidden' }}
    >
      {/* Fondo con imagen desenfocada */}
      <div 
        className="position-absolute w-100 h-100 top-0 start-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(6px)', 
          transform: 'scale(1.1)', 
          zIndex: 0
        }}
      ></div>

      {/* Capa oscura (Overlay) */}
      <div 
        className="position-absolute w-100 h-100 top-0 start-0 bg-black bg-opacity-50" 
        style={{ zIndex: 1 }}
      ></div>

      {/* Contenido principal centrado */}
      <div className="container position-relative text-center z-2 py-5">
        
        {/* Entra primero */}
        <ElementoAnimado delay="0s">
          <h2 className="display-4 fw-bold text-uppercase text-padel-orange mb-3 text-shadow">
            Nuestros Jugadores
          </h2>
        </ElementoAnimado>
        
        {/* Entra segundo */}
        <ElementoAnimado delay="0.2s">
          <p className="fs-3 fw-bold text-light text-shadow mb-3">
            Conocé a todos los protagonistas del club.
          </p>
        </ElementoAnimado>
        
        {/* Entra tercero */}
        <ElementoAnimado delay="0.4s">
          <p className="text-white-75 fs-5 mb-5 mx-auto" style={{ maxWidth: '650px' }}>
            Explorá el directorio completo con todos los jugadores y parejas que forman parte de nuestra comunidad. Buscá perfiles, analizá a tus futuros rivales o compañeros, y preparate para disfrutar del mejor nivel en la cancha.
          </p>
        </ElementoAnimado>

        {/* Entra último */}
        <ElementoAnimado delay="0.6s">
          <Link 
            to="/jugadores" 
            className="btn btn-padel-orange btn-lg rounded-pill px-5 py-3 fw-bold text-uppercase shadow-sm text-decoration-none d-inline-block custom-hover"
          >
            Ver Directorio
          </Link>
        </ElementoAnimado>
        
      </div>
    </section>
  );
}

export default JugadoresPreview;