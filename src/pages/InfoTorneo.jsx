// src/pages/InfoTorneo.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { BsWhatsapp, BsCalendarEvent, BsGeoAlt, BsTrophy, BsCash, BsCardText, BsArrowLeft } from 'react-icons/bs';
// 🔥 1. IMPORTAMOS EL SERVICIO PÚBLICO
import { getPublicTournamentsRequest } from '../services/public.service';
import AfterParty from '../components/AfterParty/AfterParty';

// Mini-componente para animar al aparecer en pantalla (Cascada Vertical)
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
      className={`${className || ''} reveal-base ${isVisible ? 'reveal-visible-up' : 'reveal-hidden-up'}`}
      style={{ transitionDelay: delay }}
    >
      {children}
    </div>
  );
};

function InfoTorneo() {
  const { id } = useParams(); // Capturamos el ID de la URL
  
  // 🔥 2. ESTADOS LOCALES PARA LA VISTA PÚBLICA
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🔥 3. FETCH DE DATOS PÚBLICOS
  useEffect(() => {
    const fetchTournamentInfo = async () => {
      try {
        setIsLoading(true);
        const res = await getPublicTournamentsRequest();
        
        // Adaptamos la data según cómo viene del backend
        const data = res.data.tournaments ? res.data.tournaments : res.data;
        const allTournaments = Array.isArray(data) ? data : [];
        
        // Buscamos el torneo que coincide con el ID de la URL
        const foundTournament = allTournaments.find(t => t._id === id);

        if (foundTournament) {
          setTournament(foundTournament);
        } else {
          setError(true); // Si no lo encuentra, marcamos error
        }
      } catch (err) {
        console.error("Error al cargar la información del torneo:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournamentInfo();
  }, [id]);

  // Manejo de estados de carga y errores
  if (isLoading) {
    return (
      <div className="container py-5 mt-5 text-center">
        <div className="spinner-border text-padel-orange" role="status"></div>
        <p className="mt-3">Cargando información del torneo...</p>
      </div>
    );
  }

  // Si hay un error o el torneo no existe, lo mandamos al home
  if (error || !tournament) {
    return <Navigate to="/" replace />; 
  }

  // Formateador de Fechas (Ej: "12/06/2023")
  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    // Ajuste de zona horaria básico para evitar desfases de días
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Mensaje dinámico para WhatsApp
  const wpMessage = encodeURIComponent(`¡Hola! Quería consultar por información e inscripciones para el "${tournament.name}".`);

  // Extraemos y validamos los contactos
  const contactos = tournament.contacts?.filter(c => c.name && c.phone) || [];

  return (
    <div className="container py-5 mt-4 overflow-hidden">
      
      {/* Botón Volver */}
      <ElementoAnimado delay="0s" className="mb-4">
        <Link to="/" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 rounded-pill px-3">
          <BsArrowLeft /> Volver a Inicio
        </Link>
      </ElementoAnimado>

      {/* Título Dinámico */}
      <ElementoAnimado delay="0.1s" className="text-center mb-5">
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
          {tournament.categories.map((cat, idx) => (
            <span key={idx} className="badge bg-padel-orange px-3 py-2 fs-6">
              {cat.name} - {cat.gender}
            </span>
          ))}
        </div>
        <h1 className="display-5 fw-bold text-uppercase">{tournament.name}</h1>
        <p className="lead text-muted">{tournament.description || "Toda la información que necesitas para asegurar tu lugar en la cancha."}</p>
      </ElementoAnimado>

      <div className="row g-5 align-items-stretch">
        
        {/* COLUMNA IZQUIERDA: Flyer */}
        <div className="col-12 col-lg-5 text-center d-flex align-items-center justify-content-center">
          <ElementoAnimado delay="0.2s">
            {/* Prioriza el Flyer vertical. Si no hay, usa la Portada horizontal */}
            <img 
              src={tournament.flyerImage || tournament.posterImage || "/imagenes/placeholder.jpg"} 
              alt={`Flyer Oficial ${tournament.name}`} 
              className="img-fluid rounded-4 shadow-lg"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
          </ElementoAnimado>
        </div>
 
        {/* COLUMNA DERECHA: Información Dinámica */}
        <div className="col-12 col-lg-7">
          <ElementoAnimado delay="0.4s" className="h-100">
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border-0 h-100 d-flex flex-column justify-content-center">
              <h3 className="h4 fw-bold mb-4 text-padel-orange border-bottom pb-2">Detalles del Evento</h3>
              
              <ul className="list-unstyled fs-5 mb-5">
                {/* Fechas */}
                <li className="mb-3 d-flex align-items-start">
                  <BsCalendarEvent className="text-padel-orange me-3 mt-1 fs-4 flex-shrink-0" />
                  <div>
                    <strong>Fecha:</strong> Del {formatearFecha(tournament.startDate)} al {formatearFecha(tournament.endDate)}
                  </div>
                </li>
                
                {/* Club */}
                <li className="mb-3 d-flex align-items-start">
                  <BsGeoAlt className="text-padel-orange me-3 mt-1 fs-4 flex-shrink-0" />
                  <div>
                    <strong>Lugar:</strong> {tournament.club}
                  </div>
                </li>
                
                {/* Premios Opcionales */}
                {tournament.prizes && (
                  <li className="mb-3 d-flex align-items-start">
                    <BsTrophy className="text-padel-orange me-3 mt-1 fs-4 flex-shrink-0" />
                    <div>
                      <strong>Premios:</strong> {tournament.prizes}
                    </div>
                  </li>
                )}

                {/* Modalidad Opcional */}
                {tournament.modality && (
                  <li className="mb-3 d-flex align-items-start">
                    <BsCardText className="text-padel-orange me-3 mt-1 fs-4 flex-shrink-0" />
                    <div>
                      <strong>Modalidad:</strong> {tournament.modality}
                    </div>
                  </li>
                )}

                {/* Precio Opcional */}
                {tournament.price > 0 && (
                  <li className="mb-3 d-flex align-items-start">
                    <BsCash className="text-padel-orange me-3 mt-1 fs-4 flex-shrink-0" />
                    <div>
                      <strong>Inscripción:</strong> ${tournament.price.toLocaleString('es-AR')} por pareja
                    </div>
                  </li>
                )}
              </ul>

              {/* Sección de Contactos Dinámica */}
              {contactos.length > 0 && (
                <>
                  <h3 className="h5 fw-bold mb-3 text-dark">Inscripciones y Consultas</h3>
                  <p className="text-muted mb-4 small">Hace clic en cualquiera de nuestros organizadores para enviarle un WhatsApp directo.</p>
                  
                  <div className="row g-3">
                    {contactos.map((contacto, index) => {
                      // Limpiamos el número por si el admin le puso espacios o guiones
                      const numeroLimpio = contacto.phone.replace(/\D/g, '');
                      return (
                        <div className="col-12 col-md-6" key={index}>
                          <a 
                            href={`https://wa.me/${numeroLimpio}?text=${wpMessage}`}
                            target="_blank" 
                            rel="noreferrer"
                            className="btn w-100 d-flex align-items-center justify-content-center gap-2 py-2 fw-bold text-white rounded-3 shadow-sm custom-hover transition-all"
                            style={{ backgroundColor: '#25D366' }}
                          >
                            <BsWhatsapp size={20} />
                            {contacto.name}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

            </div>
          </ElementoAnimado>
        </div>
      </div>
    </div>
  );
}

export default InfoTorneo;