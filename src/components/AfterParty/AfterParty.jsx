// src/components/AfterParty/AfterParty.jsx
import React, { useEffect, useRef, useState } from 'react';

// Mini-componente para la animación en cascada
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

function AfterParty() {
  // Enlace al video de DJ local
  const bgVideo = "./videos/video-dj.mp4"; 

  return (
    // Eliminamos style={{ minHeight: '80vh' }} para que la altura se adapte al contenido
    <section className="position-relative d-flex align-items-center justify-content-center overflow-hidden border-top border-dark">
      
      {/* VIDEO DE FONDO */}
      <video 
        src={bgVideo}
        autoPlay 
        loop 
        muted 
        playsInline
        className="position-absolute w-100 h-100 object-fit-cover top-0 start-0"
        style={{ 
          zIndex: 0, 
          // Ajustamos el filtro: menos desenfoque y más brillo para que el video destaque
          filter: 'blur(3px) brightness(0.8)', 
          pointerEvents: 'none' 
        }}
      ></video>

      {/* CAPA OSCURA (Overlay) - Redujimos la opacidad a 50 para que se vea más el fondo */}
      <div 
        className="position-absolute w-100 h-100 top-0 start-0 bg-black bg-opacity-50" 
        style={{ zIndex: 1 }}
      ></div>

      {/* CONTENIDO DE LA SECCIÓN */}
      <div className="container position-relative z-2 text-center text-white py-5 my-4">
        
        <ElementoAnimado delay="0s">
          <h2 className="display-4 fw-bold fst-italic text-uppercase mb-4 text-shadow text-padel-orange">
            After Extendido
          </h2>
        </ElementoAnimado>
        
        <ElementoAnimado delay="0.2s">
          {/* Texto actualizado, más grande (fs-3) y cambiamos mb-5 por mb-0 para no dejar espacio extra abajo */}
          <p className="fs-3 fw-medium text-white mb-0 mx-auto text-shadow" style={{ maxWidth: '850px' }}>
            Un evento pensado para disfrutar dentro y fuera de la cancha. Excelente ambiente, <strong className="text-padel-orange">DJ EN VIVO, SORTEOS Y PREMIOS</strong> para coronar el torneo de la mejor manera.
          </p>
        </ElementoAnimado>

      </div>
    </section>
  );
}

export default AfterParty;