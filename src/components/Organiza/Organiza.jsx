// src/components/Organiza/Organiza.jsx
import React, { useEffect, useRef, useState } from 'react';
import { BsInstagram } from 'react-icons/bs';

// Mini-componente animado con soporte para "delay" (Cascada)
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
      { threshold: 0.2 } 
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`${className || ''} reveal-base ${isVisible ? 'reveal-visible-up' : 'reveal-hidden-up'}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

function Organiza() {
  
  // Efecto para cargar el script de Elfsight en React
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    // Aplicamos tu clase de degradado naranja y un borde oscuro sutil
    <section className="bg-padel-gradient-cards py-5 border-top border-dark">
      <div className="container py-5">
        
        <div className="text-center mb-5">
          {/* Entra primero */}
          <ElementoAnimado delay="0s">
            <h3 className="h6 text-white-50 text-uppercase fw-bold mb-2 tracking-wide">
              Organización Oficial
            </h3>
          </ElementoAnimado>
          
          {/* Entra segundo */}
          <ElementoAnimado delay="0.2s">
            <h2 className="display-4 fw-bold text-white mb-3 text-shadow">
              Los Conejos
            </h2>
          </ElementoAnimado>
          
          {/* Entra tercero */}
          <ElementoAnimado delay="0.4s">
            <p className="fs-5 text-white-50 mx-auto" style={{ maxWidth: '650px' }}>
              Somos los creadores detrás de este gran evento en Monteros Vóley. Seguí nuestra cuenta oficial para no perderte sorteos, fotos exclusivas y las fechas de nuestros próximos torneos.
            </p>
          </ElementoAnimado>
        </div>

        {/* RECUADRO CON EL FEED DE INSTAGRAM */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            
            {/* Entra cuarto (la tarjeta blanca) */}
            <ElementoAnimado delay="0.6s">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden text-center bg-white p-3 p-md-4">
                
                <h4 className="h5 fw-bold mb-4 d-flex align-items-center justify-content-center gap-2 text-dark">
                  <BsInstagram className="text-padel-orange" /> Últimas publicaciones
                </h4>

                {/* El DIV de Elfsight (Widget de Instagram) */}
                <div className="mb-2">
                  <div className="elfsight-app-9269403f-929d-4e6d-bf1a-7e602e7dd3d9" data-elfsight-app-lazy></div>
                </div>

                {/* Eliminamos el botón extra de "Seguir", limpiando el diseño final */}

              </div>
            </ElementoAnimado>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Organiza;