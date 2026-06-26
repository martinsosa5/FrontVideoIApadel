import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
// 🔥 IMPORTAMOS EL SERVICIO PÚBLICO (Asegurate de que la ruta sea correcta)
import { getPublicTournamentsRequest } from '../../services/public.service'; 

// --- Funciones para formatear los textos ---
const formatearFechas = (start, end) => {
  if (!start || !end) return "Fecha a confirmar"; 
  const d1 = new Date(start); d1.setMinutes(d1.getMinutes() + d1.getTimezoneOffset());
  const d2 = new Date(end); d2.setMinutes(d2.getMinutes() + d2.getTimezoneOffset());
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  if (d1.getMonth() === d2.getMonth()) {
    return `Del ${d1.getDate()} al ${d2.getDate()} de ${meses[d1.getMonth()]}`;
  } else {
    return `Del ${d1.getDate()} de ${meses[d1.getMonth()]} al ${d2.getDate()} de ${meses[d2.getMonth()]}`;
  }
};

const formatearCategorias = (categories) => {
  if (!categories || categories.length === 0) return "Categorías a definir";
  
  // Combinamos el nombre de la categoría con su género
  const detalles = categories.map(c => `${c.name} ${c.gender}`);
  
  // Filtramos duplicados
  const unicos = [...new Set(detalles)]; 
  
  // Unimos todo con un separador claro
  return `Categorías: ${unicos.join(" - ")}`;
};

function HeroBanner() {
  // 🔥 ESTADOS LOCALES (Ya no usamos el contexto privado)
  const [tournaments, setTournaments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await getPublicTournamentsRequest();
        
        const data = res.data.tournaments ? res.data.tournaments : res.data;
        const torneosArray = Array.isArray(data) ? data : [];
  
        setTournaments(torneosArray);
      } catch (error) {
        console.error("❌ Error al cargar torneos públicos:", error);
      }
    };
    
    fetchTournaments();
  }, []);

  const torneosDestacados = tournaments;

  useEffect(() => {
    if (torneosDestacados.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % torneosDestacados.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [torneosDestacados.length]);

  const sponsors = [
    { id: 1, img: "./imagenes/sponsor/ritz.png" },
    { id: 2, img: "./imagenes/sponsor/farcmacia-santarita.png" },
    { id: 3, img: "./imagenes/sponsor/farmacia.png" },
    { id: 4, img: "./imagenes/sponsor/lucasfrontini.png" },
    { id: 5, img: "./imagenes/sponsor/pharmacenter.png" },
    { id: 6, img: "./imagenes/sponsor/providers.png" },
    { id: 7, img: "./imagenes/sponsor/regino.png" },
  ];
  const duplicatedSponsors = [...sponsors, ...sponsors];

  // =========================================================
  // VISTA 1: NO HAY TORNEOS DESTACADOS
  // =========================================================
  if (torneosDestacados.length === 0) {
    return (
      <div className="container-fluid px-0" style={{ backgroundColor: '#0f172a' }}>
        <div className="py-4 d-flex flex-column align-items-center overflow-hidden shadow-sm">
          <h4 className="fw-bold fs-5 text-white opacity-75 mb-4 text-center letter-spacing-1">SPONSORS OFICIALES</h4>
          <div className="sponsor-carousel-container d-flex flex-row align-items-center w-100 px-2 mt-2 mb-2">
            <div className="sponsor-track-x" style={{ gap: '2rem' }}>
              {duplicatedSponsors.map((sponsor, index) => (
                <img 
                  key={`h-empty-${index}`} 
                  src={sponsor.img} 
                  alt="Sponsor" 
                  className="p-1"
                  style={{ width: '180px', height: '90px', objectFit: 'contain', flexShrink: 0 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // VISTA 2: HAY TORNEOS DESTACADOS
  // =========================================================
  const torneoActual = torneosDestacados[currentIndex];

  return (
    <div className="container-fluid px-0">
      
      <style>
        {`
          .hero-custom-height {
            min-height: 85vh;
            transition: background-image 1s ease-in-out;
          }
          @media (min-width: 992px) {
            .hero-custom-height {
              min-height: 65vh;
            }
          }
        `}
      </style>

      <div 
        className="row g-0 position-relative hero-custom-height"
        style={{ 
          backgroundImage: `url(${torneoActual.posterImage || '/imagenes/placeholder.jpg'})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}
      >
        
        {/* COLUMNA 1: NOTICIA PRINCIPAL */}
        <div className="col-12 col-lg-10 position-relative d-flex flex-column justify-content-end px-4 py-5 p-lg-5">
          <div className="position-absolute top-0 start-0 w-100 h-100 news-overlay"></div>
          
          <div className="position-relative text-white z-1 mt-5 pt-4 pt-lg-0" key={torneoActual._id}>
            <span className="badge bg-light text-padel-orange rounded-0 mb-3 px-3 py-2 fs-6 fw-bold text-uppercase shadow d-inline-block hero-animate delay-1">
              {torneoActual.status}
            </span>
            
            <h1 className="display-3 fw-bold fst-italic text-uppercase text-shadow lh-1 mb-3 hero-animate delay-2">
              {torneoActual.name}
            </h1>

            <div className="bg-padel-dark-orange mb-3 hero-animate delay-3" style={{ height: '8px', width: '220px' }}></div>

            <p className="fs-1 fw-bold text-light text-shadow mb-1 hero-animate delay-4">
              {formatearFechas(torneoActual.startDate, torneoActual.endDate)}
            </p>
            
            <p className="fs-3 fw-medium text-white text-shadow mb-4 hero-animate delay-5">
              {formatearCategorias(torneoActual.categories)}
            </p>

            <Link 
              to={`/info-torneo/${torneoActual._id}`} 
              className="btn btn-padel-orange px-4 py-2 fs-5 fw-bold text-uppercase rounded-pill shadow-sm text-decoration-none d-inline-block hero-animate delay-6"
            >
              Más Información
            </Link>
          </div>
        </div>

        {/* COLUMNA 2: SPONSORS */}
        <div 
          className="col-12 col-lg-2 d-flex flex-column align-items-center py-2 py-lg-4 border-start border-white border-opacity-25 overflow-hidden"
          style={{
            backgroundColor: 'rgba(217, 90, 0, 0.79)', 
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)' 
          }}
        >
          <h4 className="fw-bold fs-6 text-white opacity-75 mt-2 mb-3 mb-lg-5 text-center">SPONSORS OFICIALES</h4>
          
          <div className="sponsor-carousel-container d-none d-lg-flex flex-column align-items-center flex-grow-1 w-100" style={{ maxHeight: '500px' }}>
            <div className="sponsor-track-y" style={{ gap: '1rem' }}>
              {duplicatedSponsors.map((sponsor, index) => (
                <img 
                  key={`v-${index}`} 
                  src={sponsor.img} 
                  alt="Sponsor" 
                  className="p-1"
                  style={{ width: '220px', height: '140px', objectFit: 'contain' }}
                />
              ))}
            </div>
          </div>

          <div className="sponsor-carousel-container d-flex d-lg-none flex-row align-items-center w-100 px-2 mt-1 mb-1">
            <div className="sponsor-track-x" style={{ gap: '1rem' }}>
              {duplicatedSponsors.map((sponsor, index) => (
                <img 
                  key={`h-${index}`} 
                  src={sponsor.img} 
                  alt="Sponsor" 
                  className="p-1"
                  style={{ width: '180px', height: '90px', objectFit: 'contain', flexShrink: 0 }}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default HeroBanner;