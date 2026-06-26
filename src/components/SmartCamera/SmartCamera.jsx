import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
// Ya NO importamos TensorFlow desde node_modules. 
// Ahora lo leemos directamente desde la CDN en el index.html

const SmartCamera = () => {
  // === ESTADOS DE LA UI ===
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true); // Estado para la carga de la IA
  const [isFestejoDetected, setIsFestejoDetected] = useState(false); // Feedback visual

  // === REFERENCIAS MUTABLES (Sin re-renderizados) ===
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); // Buffer circular de video
  const canvasRef = useRef(null); // Canvas para dibujar los puntos en vivo
  const detectorRef = useRef(null); // Instancia del detector de TensorFlow
  const detectionIntervalRef = useRef(null); // Referencia del bucle de la IA
  
  // === REFERENCIAS PARA LA LÓGICA DE DETECCIÓN ===
  const consecutiveFramesRef = useRef(0); // Contador de frames con brazos arriba
  const isProcessingVideoRef = useRef(false); // Candado para evitar envíos duplicados

  // === EFECTO: CARGAR MODELO DE IA AL INICIAR ===
  useEffect(() => {
    const initDetector = async () => {
      try {
        // Usamos las variables globales inyectadas por la CDN
        const tf = window.tf;
        const poseDetection = window.poseDetection;

        if (!tf || !poseDetection) {
          throw new Error("Las librerías de IA no se cargaron desde la CDN");
        }

        // Esperamos a que TensorFlow esté listo
        await tf.ready();
        
        // Configuramos MoveNet Lightning (el más óptimo para móviles)
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        
        // Creamos el detector y lo guardamos en la referencia
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet, 
          detectorConfig
        );

        // === PRECALENTAMIENTO (WARM-UP) ===
        const warmUpCanvas = document.createElement('canvas');
        warmUpCanvas.width = 160;
        warmUpCanvas.height = 160;
        await detectorRef.current.estimatePoses(warmUpCanvas);
        console.log("IA precalentada y lista para la acción");
        
        setIsLoadingModel(false);
      } catch (error) {
        console.error("Error al cargar el modelo de IA:", error);
        alert("No se pudo cargar el modelo de detección de poses. Revisa tu conexión a internet.");
      }
    };

    initDetector();

    return () => {
      stopCamera();
    };
  }, []);

  // === FUNCIONES DE CONTROL ===

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      startRecording(stream);
      setIsCameraActive(true);
      
      isProcessingVideoRef.current = false;
      consecutiveFramesRef.current = 0;

      startDetectionLoop();
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  };

  const stopCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    chunksRef.current = [];
    isProcessingVideoRef.current = false;
    consecutiveFramesRef.current = 0;
    setIsCameraActive(false);
  };

  const startRecording = (stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
        if (chunksRef.current.length > 12) {
          chunksRef.current.shift(); 
        }
      }
    };

    mediaRecorder.start(5000);
  };

  // === BUCLE DE PROCESAMIENTO E IA ===
  const startDetectionLoop = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (isProcessingVideoRef.current || !videoRef.current || !detectorRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      try {
        const poses = await detectorRef.current.estimatePoses(video);
        if (poses && poses.length > 0) {
          processPoseKeypoints(poses[0].keypoints, ctx); 
        } else {
          consecutiveFramesRef.current = 0;
        }
      } catch (err) {
        console.error("Error en la estimación de pose:", err);
      }
    }, 250);
  };

  // === LÓGICA MATEMÁTICA FIJA Y ROBUSTA ===
  const processPoseKeypoints = (keypoints, ctx) => {
    const MIN_SCORE = 0.2; 

    if (ctx) {
      keypoints.forEach(kp => {
        if (kp.score > MIN_SCORE) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI); 
          if (kp.name === 'nose') {
            ctx.fillStyle = '#0d6efd'; // Nariz Azul
          } else if (['left_wrist', 'right_wrist'].includes(kp.name)) {
            ctx.fillStyle = '#ffc107'; // Muñecas Amarillas
          } else {
            ctx.fillStyle = '#dc3545'; // Resto Rojo
          }
          ctx.fill();
        }
      });
    }

    const kpDict = keypoints.reduce((acc, kp) => {
      acc[kp.name] = kp;
      return acc;
    }, {});

    const nose = kpDict['nose'];
    const lWrist = kpDict['left_wrist'];
    const rWrist = kpDict['right_wrist'];

    // Verificamos únicamente la existencia de la NARIZ
    if (nose && nose.score > MIN_SCORE) {
      let isArmUp = false;

      // REGLA MATEMÁTICA FIJA: Las muñecas deben tener un valor Y MENOR que la nariz
      // (Estar físicamente más cerca del techo de la pantalla)
      if (lWrist && lWrist.score > MIN_SCORE && lWrist.y < nose.y) {
        isArmUp = true;
      }
      
      if (rWrist && rWrist.score > MIN_SCORE && rWrist.y < nose.y) {
        isArmUp = true;
      }

      if (isArmUp) {
        consecutiveFramesRef.current += 1;
        console.log(`Brazos arriba detectados: Frame ${consecutiveFramesRef.current}/4`);

        if (consecutiveFramesRef.current >= 4) {
          triggerVideoProcessing();
        }
      } else {
        consecutiveFramesRef.current = 0;
      }
    } else {
      consecutiveFramesRef.current = 0;
    }
  };

  const triggerVideoProcessing = async () => {
    isProcessingVideoRef.current = true; 
    consecutiveFramesRef.current = 0; 
    setIsFestejoDetected(true);
    
    console.log("🎉 ¡FESTEJO DETECTADO CORRECTAMENTE! 🎉");
    
    if (chunksRef.current.length === 0) {
      isProcessingVideoRef.current = false;
      setIsFestejoDetected(false);
      return;
    }

    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' }); 
    const formData = new FormData();
    formData.append('video', videoBlob, 'festejo-padel.webm');

    try {
      await axios.post('http://localhost:3000/api/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error("Error al enviar el video vía Axios:", error);
    } finally {
      setTimeout(() => {
        setIsFestejoDetected(false);
      }, 3000);

      setTimeout(() => {
        isProcessingVideoRef.current = false;
      }, 5000); 
    }
  };

  const toggleMasterSwitch = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // === RENDERIZADO (UI) ===
  return (
    <div style={styles.container}>
      <div style={styles.cameraWrapper}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <canvas ref={canvasRef} style={styles.debugCanvas} />
        
        {/* === GUÍAS DE ORIENTACIÓN PARA EL USUARIO === */}
        {isCameraActive && (
          <>
            <div style={styles.topGuide}>▲ TECHO / PARTE SUPERIOR ▲</div>
            <div style={styles.bottomGuide}>▼ PISO / PARTE INFERIOR ▼</div>
            
            <div style={styles.overlayContainer}>
              <div style={styles.sideArea}></div>
              <div style={styles.centerROI}>
                <p style={styles.roiText}>ZONA DE FESTEJO</p>
              </div>
              <div style={styles.sideArea}></div>
            </div>
          </>
        )}

        {/* CARTEL DE FESTEJO DETECTADO */}
        {isFestejoDetected && (
          <div style={styles.successOverlay}>
            <h2 style={styles.successText}>¡FESTEJO DETECTADO! 🎥</h2>
          </div>
        )}
      </div>

      <div style={styles.controls}>
        <button 
          onClick={toggleMasterSwitch} 
          disabled={isLoadingModel} 
          style={{
            ...styles.masterButton, 
            backgroundColor: isLoadingModel ? '#6c757d' : (isCameraActive ? '#dc3545' : '#28a745')
          }}
        >
          {isLoadingModel ? 'Cargando IA...' : (isCameraActive ? 'Detener' : 'Iniciar')}
        </button>
      </div>
    </div>
  );
};

// === ESTILOS ACTUALIZADOS ===
const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  cameraWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  debugCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', 
    pointerEvents: 'none',
    zIndex: 2
  },
  topGuide: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: '4px 15px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    zIndex: 6
  },
  bottomGuide: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: '4px 15px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    zIndex: 6
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column', 
    pointerEvents: 'none', 
    zIndex: 5
  },
  sideArea: {
    flex: 1, 
    backgroundColor: 'rgba(255, 0, 0, 0.2)', 
    width: '100%' 
  },
  centerROI: {
    flex: 3, 
    width: '100%',
    borderTop: '2px dashed rgba(255, 255, 255, 0.5)', 
    borderBottom: '2px dashed rgba(255, 255, 255, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center' 
  },
  roiText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
    fontSize: '14px',
    letterSpacing: '2px',
    textShadow: '0px 0px 4px rgba(0,0,0,0.9)', 
  },
  controls: {
    position: 'absolute',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'auto' 
  },
  masterButton: {
    padding: '20px',
    width: '100px',
    height: '100px',
    color: '#fff',
    border: '3px solid #fff', 
    borderRadius: '50%', 
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  successOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(40, 167, 69, 0.9)', 
    padding: '20px 40px',
    borderRadius: '15px',
    zIndex: 20,
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
  },
  successText: {
    color: '#fff',
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: '1px'
  }
};

export default SmartCamera;