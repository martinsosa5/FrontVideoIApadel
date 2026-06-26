// src/components/PartidosPreview/PartidosPreview.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsPlayCircleFill, BsDiagram3Fill, BsTrophyFill } from 'react-icons/bs';

// Mini-componente que detecta el scroll
const ElementoAnimado = ({ children, className }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Una vez que aparece, frenamos el observador
        }
      },
      { threshold: 0.1 } // Se activa apenas asoma el 10% del elemento
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      // ACÁ ESTABA EL ERROR: Agregamos "reveal-base" obligatoriamente
      className={`${className || ''} reveal-base ${isVisible ? 'reveal-visible-side' : 'reveal-hidden-side'}`}
    >
      {children}
    </div>
  );
};

function PartidosPreview() {
  return (
    <section className="bg-white py-5 overflow-hidden">
      <div className="container py-4">
        
        {/* CABECERA */}
        <ElementoAnimado className="text-center mb-5">
          <h2 className="display-6 fw-bold text-uppercase mb-2 text-padel-orange">Torneo</h2>
          <p className="text-muted fs-5">Seguí el minuto a minuto de la competencia y no te pierdas ningún detalle.</p>
        </ElementoAnimado>

        {/* GRILLA DE TARJETAS */}
        <div className="row g-4 mb-5">
          
          {/* Tarjeta 1: Partidos */}
          <div className="col-12 col-md-4">
            <ElementoAnimado className="h-100">
              <Link to="/partidos" className="text-decoration-none d-block h-100">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center custom-hover bg-padel-gradient-cards card-hover-scale">
                  <div className="mb-4">
                    <BsPlayCircleFill size={50} className="text-white" />
                  </div>
                  <h3 className="h5 fw-bold text-uppercase text-white">Partidos</h3>
                  <p className="text-white-50 mb-0">
                    Consultá todos los cruces pendientes, los resultados finalizados y seguí el tanteador en vivo.
                  </p>
                </div>
              </Link>
            </ElementoAnimado>
          </div>

          {/* Tarjeta 2: Grupos */}
          <div className="col-12 col-md-4">
            <ElementoAnimado className="h-100">
              <Link to="/zonas" className="text-decoration-none d-block h-100">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center custom-hover bg-padel-gradient-cards card-hover-scale">
                  <div className="mb-4">
                    <BsDiagram3Fill size={50} className="text-white" />
                  </div>
                  <h3 className="h5 fw-bold text-uppercase text-white">Grupos</h3>
                  <p className="text-white-50 mb-0">
                    Revisá la conformación de cada zona, la tabla de posiciones actualizada y la programación del fixture.
                  </p>
                </div>
              </Link>
            </ElementoAnimado>
          </div>

          {/* Tarjeta 3: Playoffs */}
          <div className="col-12 col-md-4">
            <ElementoAnimado className="h-100">
              <Link to="/playoffs" className="text-decoration-none d-block h-100">
                <div className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center custom-hover bg-padel-gradient-cards card-hover-scale">
                  <div className="mb-4">
                    <BsTrophyFill size={50} className="text-white" />
                  </div>
                  <h3 className="h5 fw-bold text-uppercase text-white">Playoffs</h3>
                  <p className="text-white-50 mb-0">
                    Analizá los cruces de eliminación directa, desde octavos de final hasta el partido por el campeonato.
                  </p>
                </div>
              </Link>
            </ElementoAnimado>
          </div>

        </div>

      </div>
    </section>
  );
}

export default PartidosPreview;