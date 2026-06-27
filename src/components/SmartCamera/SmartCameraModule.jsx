import React, { useState, useEffect } from 'react';
import SmartCamera from './SmartCamera'; // Tu componente de cámara calibrado

// === COMPONENTE AISLADO PARA EL MENÚ DEL MÓDULO ===
const CameraHomeMenu = ({ onNavigate, onExitModule }) => {
  return (
    <div style={styles.moduleMenuContainer}>
      
      <div style={styles.content}>
        {/* Logo de NexaPadel centered */}
        <img src="../../../imagenes/logo.png" alt="NexaPadel Logo" style={styles.homeLogo} />
        
        <div style={styles.buttonContainer}>
          <button style={styles.glassButton} onClick={() => onNavigate('camera')}>
            <span style={styles.icon}>📷</span> Iniciar NexaIA
          </button>
          
          <button style={styles.glassButton} onClick={() => onNavigate('gallery')}>
            <span style={styles.icon}>🎬</span> Mis Clips de Festejo
          </button>
        </div>
      </div>

      <div style={styles.footer}>
        <p>Solución NexaPadel © 2026 - Módulo Inteligencia Artificial</p>
      </div>
    </div>
  );
};

// === COMPONENTE DE GALERÍA DE CLIPS (CONVERSIÓN A MP4) ===
const CameraGallery = ({ onBack }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [myVideos, setMyVideos] = useState([]); 
  const [downloadingId, setDownloadingId] = useState(null); 

  useEffect(() => {
    const fetchCloudinaryVideos = async () => {
      try {
        const response = await fetch('https://res.cloudinary.com/dzo2wt8ir/video/list/festejos_padel.json');
        
        if (!response.ok) {
          throw new Error('No se encontró la lista o no hay videos aún');
        }

        const data = await response.json();
        
        const videoList = data.resources.map((res) => {
          // El ID real de tu logo que me pasaste
          const logoId = 'logo-np_ghtjtq'; 
          
          // Configuración de la marca de agua:
          // w_120: ancho de 120 píxeles para que quede estético
          // g_south_east: abajo a la derecha
          // x_20, y_20: separación de los bordes del video
          // o_60: opacidad al 60% para que sea sutil y no tape el juego
          const watermarkConfig = `l_${logoId},w_140,g_south_east,x_20,y_20,o_100`;

          return {
            id: res.public_id,
            // Inyectamos la marca de agua en la URL antes del formato .mp4
            url: `https://res.cloudinary.com/dzo2wt8ir/video/upload/${watermarkConfig}/v${res.version}/${res.public_id}.mp4`,
            date: 'Clip NexaPadel', // <-- TEXTO ACTUALIZADO
            duration: 'NexaIA'
          };
        });

        setMyVideos(videoList);
      } catch (error) {
        console.warn("Aún no hay videos públicos o falta destildar 'Resource list' en Cloudinary:", error);
        setMyVideos([]);
      }
    };

    fetchCloudinaryVideos();
  }, []);

  // Función mágica para forzar la descarga en Safari / Móviles
  const handleDownload = async (e, video) => {
    e.preventDefault();
    if (downloadingId === video.id) return; 
    
    setDownloadingId(video.id); 

    try {
      const response = await fetch(video.url);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // 🔥 CAMBIO CLAVE: Modificamos la extensión del archivo descargado a .mp4
      link.download = `Festejo_NexaPadel_${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al forzar la descarga:", error);
      alert("Hubo un error al descargar el clip. Intenta nuevamente.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={styles.moduleMenuContainer}>
      <div style={styles.exitBar}>
        <button style={styles.exitButton} onClick={onBack}>⬅ Volver al Menú</button>
      </div>

      <div style={styles.galleryContent}>
        <h2 style={styles.galleryTitle}>🎬 Mis Clips de Festejo</h2>
        <p style={styles.gallerySubtitle}>Tus mejores momentos grabados por NexaIA (Formato MP4)</p>

        {myVideos.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '40px', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🤷‍♂️</span>
            <p>Aún no grabaste ningún festejo.</p>
            <p>¡Ve a la cámara, levanta los brazos y tu video aparecerá aquí!</p>
          </div>
        ) : (
          <div style={styles.videoGrid}>
            {myVideos.map((video, index) => (
              <div key={video.id} style={styles.videoCard}>
                
                <div style={styles.thumbnailContainer} onClick={() => setSelectedVideo(video)}>
                  {/* El reproductor de la miniatura también lee el MP4 transformado */}
                  <video src={video.url} style={styles.thumbnailVideo} />
                  <div style={styles.playIconOverlay}>▶</div>
                  <span style={styles.durationBadge}>{video.duration || 'Clip'}</span>
                </div>

                <div style={styles.videoInfo}>
                  <h4 style={styles.videoName}>Festejo #{myVideos.length - index}</h4>
                  <p style={styles.videoDate}>{video.date}</p>
                </div>

                <button 
                  onClick={(e) => handleDownload(e, video)}
                  style={{...styles.downloadButton, opacity: downloadingId === video.id ? 0.5 : 1}}
                  disabled={downloadingId === video.id}
                >
                  {downloadingId === video.id ? '⏳ Convirtiendo y Descargando...' : '⬇ Descargar MP4'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVideo && (
        <div style={styles.modalOverlay}>
          <button style={styles.closeModalButton} onClick={() => setSelectedVideo(null)}>❌ Cerrar</button>
          <div style={styles.modalVideoContainer}>
            <video src={selectedVideo.url} controls autoPlay style={styles.modalVideo} />
            <h3 style={styles.modalVideoTitle}>Reproduciendo: Festejo</h3>
            <p style={styles.modalVideoDate}>{selectedVideo.date}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// === ENRUTADOR INTERNO DEL MÓDULO ===
export default function SmartCameraModule({ onExit }) {
  const [currentInternalView, setCurrentInternalView] = useState('home');

  if (currentInternalView === 'camera') {
    return <SmartCamera onBack={() => setCurrentInternalView('home')} />;
  }
  
  if (currentInternalView === 'gallery') {
    return <CameraGallery onBack={() => setCurrentInternalView('home')} />;
  }
  
  return <CameraHomeMenu onNavigate={setCurrentInternalView} onExitModule={onExit} />;
}

// === ESTILOS AISLADOS (USANDO COLORES OFICIALES) ===
const styles = {
  moduleMenuContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#001132', // Azul oscuro oficial
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  homeLogo: {
    width: '80%',
    maxWidth: '400px',
    marginBottom: '60px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '300px'
  },
  glassButton: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    padding: '18px 20px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
  icon: {
    fontSize: '24px'
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  exitBar: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'flex-start'
  },
  exitButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  // === ESTILOS DE LA GALERÍA ===
  galleryContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px 40px 20px',
    width: '100%',
    boxSizing: 'border-box',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  galleryTitle: {
    color: '#fff',
    fontSize: '32px',
    margin: '0 0 10px 0',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
  },
  gallerySubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '16px',
    marginBottom: '40px',
    textAlign: 'center'
  },
  videoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    width: '100%'
  },
  videoCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(10, 89, 253, 0.3)', // Borde celeste sutil
    borderRadius: '20px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    transition: 'transform 0.2s',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: '160px',
    backgroundColor: '#000',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  thumbnailVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.7
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(10, 89, 253, 0.8)', // Celeste NexaPadel
    color: '#fff',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '20px',
    paddingLeft: '4px',
    boxSizing: 'border-box',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
  },
  durationBadge: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 'bold'
  },
  videoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  videoName: {
    color: '#fff',
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold'
  },
  videoDate: {
    color: 'rgba(255, 255, 255, 0.5)',
    margin: 0,
    fontSize: '14px'
  },
  downloadButton: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  
  // === ESTILOS DEL REPRODUCTOR PANTALLA COMPLETA ===
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 17, 50, 0.95)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  closeModalButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    zIndex: 10000
  },
  modalVideoContainer: {
    width: '90%',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  modalVideo: {
    width: '100%',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
    border: '2px solid #0a59fd'
  },
  modalVideoTitle: {
    color: '#fff',
    margin: '10px 0 0 0',
    fontSize: '24px'
  },
  modalVideoDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    margin: 0,
    fontSize: '16px'
  },
};