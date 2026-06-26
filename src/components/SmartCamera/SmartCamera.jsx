import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SmartCamera = () => {
  // === ESTADOS DE LA UI ===
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true); 
  const [isFestejoDetected, setIsFestejoDetected] = useState(false); 

  // === REFERENCIAS MUTABLES ===
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]); 
  const canvasRef = useRef(null); 
  const detectorRef = useRef(null); 
  const detectionIntervalRef = useRef(null); 
  
  // === REFERENCIAS PARA LA LÓGICA DE DETECCIÓN ===
  const consecutiveFramesRef = useRef(0); 
  const isProcessingVideoRef = useRef(false); 

  // === EFECTO: CARGAR MODELO DE IA AL INICIAR ===
  useEffect(() => {
    const initDetector = async () => {
      try {
        const tf = window.tf;
        const poseDetection = window.poseDetection;

        if (!tf || !poseDetection) throw new Error("IA no cargada");

        await tf.ready();
        
        const detectorConfig = {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true
        };
        
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet, 
          detectorConfig
        );

        // PRECALENTAMIENTO
        const warmUpCanvas = document.createElement('canvas');
        warmUpCanvas.width = 160;
        warmUpCanvas.height = 160;
        await detectorRef.current.estimatePoses(warmUpCanvas);
        console.log("IA lista");
        
        setIsLoadingModel(false);
      } catch (error) {
        console.error("Error IA:", error);
      }
    };

    initDetector();
    return () => stopCamera();
  }, []);

  // === FUNCIONES DE CONTROL ===
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false 
      });
      
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      startRecording(stream);
      setIsCameraActive(true);
      
      isProcessingVideoRef.current = false;
      consecutiveFramesRef.current = 0;

      startDetectionLoop();
    } catch (error) {
      console.error("Error cámara:", error);
    }
  };

  const stopCamera = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

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
        if (chunksRef.current.length > 12) chunksRef.current.shift(); 
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
        console.error("Error pose:", err);
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
          if (kp.name === 'nose') ctx.fillStyle = '#0d6efd'; 
          else if (['left_wrist', 'right_wrist'].includes(kp.name)) ctx.fillStyle = '#ffc107'; 
          else ctx.fillStyle = '#dc3545'; 
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
      
      // Evaluamos cada brazo por separado utilizando el eje X corregido
      const leftArmUp = lWrist && lWrist.score > MIN_SCORE && lWrist.x < nose.x;
      const rightArmUp = rWrist && rWrist.score > MIN_SCORE && rWrist.x < nose.x;

      // CAMBIO CLAVE: Usamos el operador "&&". 
      // Obliga a que AMBOS brazos estén arriba de la nariz al mismo tiempo.
      if (leftArmUp && rightArmUp) {
        consecutiveFramesRef.current += 1;
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
      console.error("Error Axios:", error);
    } finally {
      setTimeout(() => setIsFestejoDetected(false), 3000);
      setTimeout(() => { isProcessingVideoRef.current = false; }, 5000); 
    }
  };

  const toggleMasterSwitch = () => {
    if (isCameraActive) stopCamera();
    else startCamera();
  };

  return (
    <div style={styles.container}>
      <div style={styles.cameraWrapper}>
        <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
        <canvas ref={canvasRef} style={styles.debugCanvas} />
        
        {isCameraActive && (
          <>
            {/* GUÍA DE ORIENTACIÓN CORREGIDA CON -90DEG */}
            <div style={styles.roofGuide}>▲ TECHO ▲</div>
            
            <div style={styles.overlayContainer}>
              <div style={styles.sideArea}></div>
              <div style={styles.centerROI}>
                {/* TEXTO DE LA ZONA CORREGIDO */}
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
          {/* TEXTO DEL BOTÓN CORREGIDO CON -90DEG */}
          <span style={styles.rotatedText}>
            {isLoadingModel ? 'Cargando' : (isCameraActive ? 'Detener' : 'Iniciar')}
          </span>
        </button>
      </div>
    </div>
  );
};

// === ESTILOS CORREGIDOS (ROTACIÓN INVERTIDA A -90 GRADOS) ===
const styles = {
  container: { position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' },
  cameraWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  debugCanvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 2 },
  
  roofGuide: {
    position: 'absolute',
    left: '20px', 
    top: '50%',
    transform: 'translateY(-50%) rotate(-90deg)', // Cambiado a -90deg para voltear las letras hacia arriba
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff', padding: '8px 15px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', zIndex: 6
  },
  
  overlayContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: 5 },
  sideArea: { flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.2)', width: '100%' }, 
  centerROI: { flex: 3, width: '100%', borderTop: '2px dashed rgba(255, 255, 255, 0.5)', borderBottom: '2px dashed rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  roiText: {
    transform: 'rotate(-90deg)', // Cambiado a -90deg para que se lea al derecho
    color: 'rgba(255, 255, 255, 0.6)', fontWeight: 'bold', fontSize: '24px', letterSpacing: '4px', textShadow: '0px 0px 4px rgba(0,0,0,0.9)',
  },
  
  controls: {
    position: 'absolute',
    right: '30px', 
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto'
  },
  masterButton: {
    padding: '0', width: '100px', height: '100px', color: '#fff', border: '4px solid #fff', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  rotatedText: {
    transform: 'rotate(-90deg)', // Cambiado a -90deg para que las letras del botón apunten bien
    fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px'
  },
  
  successOverlay: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%) rotate(-90deg)', // Cartel verde corregido a -90deg
    backgroundColor: 'rgba(40, 167, 69, 0.95)', padding: '30px 50px', borderRadius: '20px', zIndex: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
  },
  successText: { color: '#fff', margin: 0, fontSize: '32px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }
};

export default SmartCamera;