import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Prop onBack añadida para volver al menú interno del módulo
const SmartCamera = ({ onBack }) => {
  // === ESTADOS DE LA UI ===
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true); // Estado para la carga de la IA
  const [isFestejoDetected, setIsFestejoDetected] = useState(false); // Feedback visual

  // === REFERENCIAS MUTABLES (Sin re-renderizados) ===
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); // Buffer circular de video
  const canvasRef = useRef(null); // Canvas ahora se usará para dibujar los puntos en vivo
  const detectorRef = useRef(null); // Instancia del detector de TensorFlow
  const detectionIntervalRef = useRef(null); // Referencia del bucle de la IA
  
  // === REFERENCIAS PARA LA LÓGICA DE DETECCIÓN ===
  const consecutiveFramesRef = useRef(0); // Contador de frames con brazos arriba
  const isProcessingVideoRef = useRef(false); // Candado para evitar envíos duplicados

  // === EFECTO: CARGAR MODELO DE IA AL INICIAR ===
  useEffect(() => {
    const initDetector = async () => {
      try {
        const tf = window.tf;
        const poseDetection = window.poseDetection;

        if (!tf || !poseDetection) {
          throw new Error("Las librerías de IA no se cargaron desde la CDN");
        }

        await tf.ready();
        
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet, 
          detectorConfig
        );

        // PRECALENTAMIENTO (WARM-UP)
        const warmUpCanvas = document.createElement('canvas');
        warmUpCanvas.width = 160;
        warmUpCanvas.height = 160;
        await detectorRef.current.estimatePoses(warmUpCanvas);
        console.log("IA precalentada y lista para la acción");
        
        // Finaliza carga y muestra UI de cámara
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

  // === LÓGICA MATEMÁTICA OBLIGATORIA DE 2 BRAZOS ===
  const processPoseKeypoints = (keypoints, ctx) => {
    const MIN_SCORE = 0.2; 

    if (ctx) {
      keypoints.forEach(kp => {
        if (kp.score > MIN_SCORE) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI); 
          if (kp.name === 'nose') {
            ctx.fillStyle = '#0d6efd'; 
          } else if (['left_wrist', 'right_wrist'].includes(kp.name)) {
            ctx.fillStyle = '#ffc107'; 
          } else {
            ctx.fillStyle = '#dc3545'; 
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

    if (nose && nose.score > MIN_SCORE) {
      const leftArmUp = lWrist && lWrist.score > MIN_SCORE && lWrist.x < nose.x;
      const rightArmUp = rWrist && rWrist.score > MIN_SCORE && rWrist.x < nose.x;

      if (leftArmUp && rightArmUp) {
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

 // Función que se ejecuta cuando se cumple el objetivo
  const triggerVideoProcessing = async () => {
    isProcessingVideoRef.current = true; 
    consecutiveFramesRef.current = 0; 
    
    setIsFestejoDetected(true);
    console.log("🎉 ¡FESTEJO DETECTADO CORRECTAMENTE! 🎉");
    
    if (chunksRef.current.length === 0) {
      console.warn("No hay fragmentos de video en el buffer todavía.");
      isProcessingVideoRef.current = false;
      setIsFestejoDetected(false);
      return;
    }

    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' }); 
    
    // === ESTO ES LO NUEVO: MANDAMOS DIRECTO A CLOUDINARY DESDE EL FRONT ===
    const formData = new FormData();
    formData.append('file', videoBlob); // El video
    formData.append('upload_preset', 'padel_videos'); // El permiso público que creaste en el Paso 1
    formData.append('resource_type', 'video');

    try {
      console.log("Subiendo video directo a Cloudinary...");
      
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dzo2wt8ir/video/upload', 
        formData
      );
      
      console.log("¡Video subido con éxito! 🚀");
      console.log("URL Pública del video para mirar:", response.data.secure_url);
      
      // === EL FIX: REINICIO DEL GRABADOR ===
      // 1. Frenamos el grabador para cortar el video viejo
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // 2. Vaciamos la memoria
      chunksRef.current = []; 
      
      // 3. Lo volvemos a arrancar inmediatamente para generar los encabezados del video nuevo
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start(5000);
      }
      // =====================================

    } catch (error) {
      console.error("Error al enviar el video a Cloudinary:", error);
    } finally {
      setTimeout(() => {
        setIsFestejoDetected(false);
      }, 3000);

      setTimeout(() => {
        isProcessingVideoRef.current = false;
        console.log("Sistema listo para detectar un nuevo festejo.");
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

  // === RENDERIZADO ===
  return (
    <div style={styles.container}>
      
      {/* 1. Pantalla de Carga (Logo sin sombra y spinner) */}
      {isLoadingModel && (
        <div style={styles.loadingOverlay}>
          <img src="../../../imagenes/logo.png" alt="NexaPadel" style={styles.mainLogo} />
          
          <div style={styles.loaderWrapper}>
            <div id="smartcamera-loader" style={styles.professionalLoader}></div>
          </div>
          
          <h2 style={styles.loadingTitle}>Cargando NexaIA</h2>
          <p style={styles.loadingSubtext}>Preparando Modelo de Detección Profesional...</p>
        </div>
      )}

      {/* 2. Pantalla Completa de la Cámara (Diseño Original + Botón Volver) */}
      {!isLoadingModel && (
        <div style={styles.cameraWrapper}>
          
          {/* Botón Volver añadido encima de la cámara */}
          <button onClick={() => { stopCamera(); onBack(); }} style={styles.backButton}>
            ⬅ Volver
          </button>

          <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
          <canvas ref={canvasRef} style={styles.debugCanvas} />
          
          {isCameraActive && (
            <>
              <div style={styles.roofGuide}>▲ TECHO ▲</div>
              
              <div style={styles.overlayContainer}>
                <div style={styles.sideArea}></div>
                <div style={styles.centerROI}>
                  <p style={styles.roiText}>ZONA DE FESTEJO</p>
                </div>
                <div style={styles.sideArea}></div>
              </div>
            </>
          )}

          {isFestejoDetected && (
            <div style={styles.successOverlay}>
              <h2 style={styles.successText}>¡FESTEJO DETECTADO! 🎥</h2>
            </div>
          )}

          {/* Panel de Controles Flotante (Círculo Original) */}
          <div style={styles.controls}>
            <button 
              onClick={toggleMasterSwitch} 
              disabled={isLoadingModel} 
              style={{
                ...styles.masterButton, 
                backgroundColor: isLoadingModel ? '#6c757d' : (isCameraActive ? '#dc3545' : '#28a745')
              }}
            >
              <span style={styles.rotatedText}>
                {isLoadingModel ? 'Cargando' : (isCameraActive ? 'Detener' : 'Iniciar')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Estilo del Spinner */}
      <style>
        {`
          @keyframes professionalRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          #smartcamera-loader {
            animation: professionalRotate 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

// === ESTILOS ===
const styles = {
  // Contenedor principal de la página
  container: { position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' },
  
  // Estilos de la Pantalla de Carga
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: '#001132', zIndex: 1000, // Azul oscuro
    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '30px', color: '#fff'
  },
  mainLogo: { width: '80%', maxWidth: '300px' }, // Sin sombras
  loaderWrapper: { position: 'relative', width: '80px', height: '80px' },
  professionalLoader: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    borderRadius: '50%',
    border: '6px solid rgba(10, 89, 253, 0.1)',
    borderTop: '6px solid #0a59fd'
  },
  loadingTitle: { fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px', margin: 0 },
  loadingSubtext: { fontSize: '16px', opacity: 0.7, margin: 0 },

  // Estilos de la Cámara (Pantalla completa original)
  cameraWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111' },
  
  // Botón Volver nuevo
  backButton: {
    position: 'absolute', top: '20px', left: '20px', zIndex: 15,
    background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.5)', color: '#fff',
    padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold'
  },

  video: { width: '100%', height: '100%', objectFit: 'cover' },
  debugCanvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 2 },
  
  roofGuide: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', padding: '8px 15px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', zIndex: 6 },
  overlayContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: 5 },
  sideArea: { flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.2)', width: '100%' }, 
  centerROI: { flex: 3, width: '100%', borderTop: '2px dashed rgba(255, 255, 255, 0.5)', borderBottom: '2px dashed rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  roiText: { transform: 'rotate(-90deg)', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 'bold', fontSize: '24px', letterSpacing: '4px', textShadow: '0px 0px 4px rgba(0,0,0,0.9)' },
  
  // Controles Originales (Botón redondo)
  controls: { position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto' },
  masterButton: { padding: '0', width: '100px', height: '100px', color: '#fff', border: '4px solid #fff', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  rotatedText: { transform: 'rotate(-90deg)', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' },
  
  successOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)', backgroundColor: 'rgba(40, 167, 69, 0.95)', padding: '30px 50px', borderRadius: '20px', zIndex: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
  successText: { color: '#fff', margin: 0, fontSize: '32px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }
};

export default SmartCamera;