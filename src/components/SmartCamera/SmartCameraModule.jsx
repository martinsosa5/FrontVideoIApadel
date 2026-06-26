import React, { useState } from 'react';
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

// === COMPONENTE DE GALERÍA (PLACEHOLDER AISLADO) ===
const CameraGallery = ({ onBack }) => {
  return (
    <div style={styles.moduleMenuContainer}>
      <div style={styles.exitBar}>
        <button style={styles.exitButton} onClick={onBack}>⬅ Volver</button>
      </div>
      <div style={{...styles.content, color: '#fff'}}>
        <h2>🎬 Galería de Clips</h2>
        <p style={{ opacity: 0.7 }}>Próximamente... Aquí visualizarás tus grabaciones.</p>
      </div>
    </div>
  );
};

// === ENRUTADOR INTERNO DEL MÓDULO ===
// onExit es una prop que podés llamar para volver a tu app principal del torneo
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
  }
};