import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
// Ya NO importamos TensorFlow desde node_modules. 
// Ahora lo leemos directamente desde la CDN en el index.html

const SmartCamera = () => {
  // === ESTADOS DE LA UI ===
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true); // Estado para la carga de la IA
  const [isFestejoDetected, setIsFestejoDetected] = useState(false); // NUEVO: Feedback visual

  // === REFERENCIAS MUTABLES (Sin re-renderizados) ===
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); // Buffer circular de video
  const canvasRef = useRef(null); // Canvas ahora se usará para dibujar los puntos en vivo
  const detectorRef = useRef(null); // Instancia del detector de TensorFlow
  const detectionIntervalRef = useRef(null); // Referencia del bucle de la IA
  
  // === NUEVAS REFERENCIAS PARA LA LÓGICA DE DETECCIÓN ===
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
        // Creamos un canvas invisible chiquito
        const warmUpCanvas = document.createElement('canvas');
        warmUpCanvas.width = 160;
        warmUpCanvas.height = 160;
        // Obligamos a la IA a procesarlo para que compile los shaders de WebGL sin congelar el celular después
        await detectorRef.current.estimatePoses(warmUpCanvas);
        console.log("IA precalentada y lista para la acción");
        // =========================================
        
        setIsLoadingModel(false);
      } catch (error) {
        console.error("Error al cargar el modelo de IA:", error);
        alert("No se pudo cargar el modelo de detección de poses. Revisa tu conexión a internet.");
      }
    };

    initDetector();

    // Limpieza al desmontar el componente
    return () => {
      stopCamera();
    };
  }, []);

  // === FUNCIONES DE CONTROL ===

  const startCamera = async () => {
    try {
      // Solicitamos acceso a la cámara trasera (ideal para trípode)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Asumo que no necesitamos audio para detectar festejos
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      startRecording(stream);
      setIsCameraActive(true);
      
      // Reiniciamos variables de lógica antes de iniciar
      isProcessingVideoRef.current = false;
      consecutiveFramesRef.current = 0;

      // Iniciamos el bucle de la IA una vez que la cámara esté encendida
      startDetectionLoop();
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara. Revisa los permisos.");
    }
  };

  const stopCamera = () => {
    // Detenemos el bucle de la IA
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Detenemos el MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Apagamos las pistas de la cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Limpiamos el buffer y variables
    chunksRef.current = [];
    isProcessingVideoRef.current = false;
    consecutiveFramesRef.current = 0;
    setIsCameraActive(false);
  };

  const startRecording = (stream) => {
    // Configuramos el MediaRecorder
    // Nota: iOS/Safari puede requerir configuraciones de mimeType específicas, 
    // pero por defecto usará el formato compatible del sistema.
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        // Añadimos el nuevo chunk (5 segundos)
        chunksRef.current.push(event.data);
        
        // Mantenemos solo los últimos 12 chunks (60 segundos)
        if (chunksRef.current.length > 12) {
          chunksRef.current.shift(); 
        }
      }
    };

    // Iniciamos la grabación emitiendo chunks cada 5000ms (5 segundos)
    mediaRecorder.start(5000);
  };

  // === BUCLE DE PROCESAMIENTO E IA (Optimizado a ~4 FPS) ===
  const startDetectionLoop = () => {
    // 250ms de intervalo = 4 ejecuciones por segundo (ideal para batería de celular)
    detectionIntervalRef.current = setInterval(async () => {
      // Si estamos procesando un video o falta algo, cortamos ejecución
      if (isProcessingVideoRef.current || !videoRef.current || !detectorRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Validamos que el video tenga dimensiones reales antes de procesar
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // === PREPARAMOS CANVAS PARA DIBUJAR PUNTOS EN VIVO ===
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      // Limpiamos el canvas en cada frame para que los puntos no dejen "rastro"
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ====================================================

      try {
        // PASAMOS EL VIDEO ENTERO A LA IA: Evita problemas de recortes y escalas
        const poses = await detectorRef.current.estimatePoses(video);
        
        if (poses && poses.length > 0) {
          processPoseKeypoints(poses[0].keypoints, ctx); // Pasamos el 'ctx' para poder dibujar
        } else {
          // Si no detecta ninguna persona, reiniciamos el contador por seguridad
          consecutiveFramesRef.current = 0;
        }
      } catch (err) {
        console.error("Error en la estimación de pose:", err);
      }
    }, 250);
  };

  // === LÓGICA MATEMÁTICA DEL TRIGGER (OPTIMIZADA) ===
  const processPoseKeypoints = (keypoints, ctx) => {
    
    // Bajamos la confianza a 20% para extremidades que se mueven rápido
    const MIN_SCORE = 0.2; 

    // === DIBUJAMOS LOS PUNTOS DE RASTREO VISUAL ===
    if (ctx) {
      keypoints.forEach(kp => {
        if (kp.score > MIN_SCORE) {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI); 
          
          // Nariz en AZUL, Muñecas en AMARILLO, resto en ROJO
          if (kp.name === 'nose') {
            ctx.fillStyle = '#0d6efd'; // Azul
          } else if (['left_wrist', 'right_wrist'].includes(kp.name)) {
            ctx.fillStyle = '#ffc107'; // Amarillo
          } else {
            ctx.fillStyle = '#dc3545'; // Rojo
          }
          
          ctx.fill();
        }
      });
    }

    // Convertimos el array en un objeto fácil de leer por nombre
    const kpDict = keypoints.reduce((acc, kp) => {
      acc[kp.name] = kp;
      return acc;
    }, {});

    // NUEVA ANCLA: Usamos la nariz en lugar de los hombros
    const nose = kpDict['nose'];
    const lWrist = kpDict['left_wrist'];
    const rWrist = kpDict['right_wrist'];

    // Verificamos que la IA esté viendo la NARIZ (es nuestro punto de referencia fuerte)
    if (nose && nose.score > MIN_SCORE) {
      
      let isArmUp = false;

      // Verificamos si la muñeca izquierda está por encima de la nariz (Y menor significa más arriba en la pantalla)
      if (lWrist && lWrist.score > MIN_SCORE && lWrist.y < nose.y) {
        isArmUp = true;
      }
      
      // Verificamos si la muñeca derecha está por encima de la nariz
      if (rWrist && rWrist.score > MIN_SCORE && rWrist.y < nose.y) {
        isArmUp = true;
      }

      // Si AL MENOS UN BRAZO está arriba de la cara
      if (isArmUp) {
        consecutiveFramesRef.current += 1;
        console.log(`Brazos arriba detectados: Frame ${consecutiveFramesRef.current}/4`);

        // 4 frames seguidos = 1 segundo de festejo
        if (consecutiveFramesRef.current >= 4) {
          triggerVideoProcessing();
        }
      } else {
        // Si bajó los brazos, reiniciamos
        consecutiveFramesRef.current = 0;
      }
    } else {
      // Si no detecta la cara, reiniciamos
      consecutiveFramesRef.current = 0;
    }
  };

  // Función que se ejecuta cuando se cumple el objetivo
  const triggerVideoProcessing = async () => {
    isProcessingVideoRef.current = true; // Ponemos el candado
    consecutiveFramesRef.current = 0; // Reiniciamos el contador
    
    // === ENCENDEMOS EL AVISO VISUAL ===
    setIsFestejoDetected(true);
    
    console.log("🎉 ¡FESTEJO DETECTADO CORRECTAMENTE! 🎉");
    
    // 1. Verificamos que haya video en el buffer
    if (chunksRef.current.length === 0) {
      console.warn("No hay fragmentos de video en el buffer todavía.");
      isProcessingVideoRef.current = false;
      setIsFestejoDetected(false);
      return;
    }

    // Calculamos los segundos reales que tenemos grabados (cada chunk es de 5s)
    const segundosGrabados = chunksRef.current.length * 5;
    console.log(`Bloqueando cámara temporalmente y preparando video de ${segundosGrabados}s...`);

    // 2. Unimos los fragmentos en un único archivo (Blob)
    const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' }); 
    
    // 3. Preparamos el FormData para el envío
    const formData = new FormData();
    formData.append('video', videoBlob, 'festejo-padel.webm');

    try {
      console.log("Enviando video al servidor Node.js...");
      
      // Reemplaza esta URL por la ruta real de tu backend
      const response = await axios.post('http://localhost:3000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("¡Video enviado con éxito a Cloudinary!", response.data);
      
      // Limpiamos el buffer para empezar a grabar el siguiente punto desde cero
      chunksRef.current = [];
    } catch (error) {
      console.error("Error al enviar el video vía Axios:", error);
    } finally {
      // Ocultamos el cartel visual después de 3 segundos
      setTimeout(() => {
        setIsFestejoDetected(false);
      }, 3000);

      // 4. Cooldown: Esperamos 5 segundos antes de volver a detectar festejos
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

  // === RENDERIZADO (UI) ===
  return (
    <div style={styles.container}>
      {/* Contenedor principal de la cámara */}
      <div style={styles.cameraWrapper}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          style={styles.video}
        />
        
        {/* === CANVAS DE DEPURACIÓN VISIBLE === */}
        {/* Superpuesto al video para ver los puntos en tiempo real */}
        <canvas ref={canvasRef} style={styles.debugCanvas} />
        
        {/* Guía Visual (ROI - Región de Interés) superpuesta con zonas rojas (Franjas horizontales) */}
        {isCameraActive && (
          <div style={styles.overlayContainer}>
            {/* 20% Superior - Rojo Transparente */}
            <div style={styles.sideArea}></div>
            
            {/* 60% Central - Zona de Detección más amplia */}
            <div style={styles.centerROI}>
              <p style={styles.roiText}>ZONA DE FESTEJO</p>
            </div>
            
            {/* 20% Inferior - Rojo Transparente */}
            <div style={styles.sideArea}></div>
          </div>
        )}

        {/* === CARTEL DE FESTEJO DETECTADO === */}
        {isFestejoDetected && (
          <div style={styles.successOverlay}>
            <h2 style={styles.successText}>¡FESTEJO DETECTADO! 🎥</h2>
          </div>
        )}
      </div>

      {/* Panel de Controles Flotante (Lado derecho en horizontal) */}
      <div style={styles.controls}>
        <button 
          onClick={toggleMasterSwitch} 
          disabled={isLoadingModel} // Deshabilitado hasta que la IA esté lista
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
    overflow: 'hidden' // Evita scroll innecesario
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
    objectFit: 'cover', // Asegura que el video llene toda la pantalla sin distorsionarse
  },
  debugCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover', // CLAVE: para que los puntos coincidan con la escala del video
    pointerEvents: 'none', // Para que los clics pasen a través del canvas
    zIndex: 2
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column', // ← Esto apila las áreas verticalmente en modo horizontal
    pointerEvents: 'none', // Para que no interfiera con toques en la pantalla
    zIndex: 5
  },
  sideArea: {
    flex: 1, // Ocupa 1 parte (20% aprox)
    backgroundColor: 'rgba(255, 0, 0, 0.3)', // Rojo semi-transparente
    width: '100%' 
  },
  centerROI: {
    flex: 3, // Ocupa 3 partes (60% aprox, mucho más grande ahora)
    width: '100%',
    borderTop: '3px dashed rgba(255, 255, 255, 0.7)', 
    borderBottom: '3px dashed rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center' 
  },
  roiText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 'bold',
    fontSize: '16px',
    letterSpacing: '2px',
    textShadow: '0px 0px 6px rgba(0,0,0,0.9)', 
    textAlign: 'center'
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
    backgroundColor: 'rgba(40, 167, 69, 0.9)', // Verde éxito
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