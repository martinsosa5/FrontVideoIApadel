import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SmartCamera = ({ onBack }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(true);
  const [isFestejoDetected, setIsFestejoDetected] = useState(false);

  // === NUEVOS ESTADOS PARA LOS LENTES (0.5x, 1x) ===
  const [videoDevices, setVideoDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  
  // Referencia para el bucle que reinicia el video cada 60 segundos
  const recorderIntervalRef = useRef(null); 
  
  const consecutiveFramesRef = useRef(0);
  const isProcessingVideoRef = useRef(false);

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

  // === startCamera ACTUALIZADO PARA ACEPTAR EL LENTE ESPECÍFICO ===
  const startCamera = async (specificDeviceId = null) => {
    try {
      const videoConstraints = specificDeviceId
        ? { deviceId: { exact: specificDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } };

      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      // Leemos cuántos lentes físicos tiene el celular
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoInputs);

      // Guardamos en memoria el lente que estamos usando actualmente
      const activeTrack = stream.getVideoTracks()[0];
      const currentDevice = videoInputs.find(d => d.label === activeTrack.label);
      if (currentDevice) {
        setActiveDeviceId(currentDevice.deviceId);
      } else if (specificDeviceId) {
        setActiveDeviceId(specificDeviceId);
      }

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
    if (recorderIntervalRef.current) clearInterval(recorderIntervalRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;

    chunksRef.current = [];
    isProcessingVideoRef.current = false;
    consecutiveFramesRef.current = 0;
    setIsCameraActive(false);
  };

  // === MAGIA NUEVA: GRABADOR INTELIGENTE Y SIN CORTES CORRUPTOS ===
  const startRecording = (stream) => {
    if (recorderIntervalRef.current) clearInterval(recorderIntervalRef.current);

    const startFresh = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      chunksRef.current = []; 
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start(); 
    };

    startFresh();

    recorderIntervalRef.current = setInterval(() => {
      if (!isProcessingVideoRef.current) {
        startFresh();
      }
    }, 60000); 
  };

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
      const leftArmUp = lWrist && lWrist.score > MIN_SCORE && lWrist.x < nose.x;
      const rightArmUp = rWrist && rWrist.score > MIN_SCORE && rWrist.x < nose.x;

      if (leftArmUp && rightArmUp) {
        consecutiveFramesRef.current += 1;
        if (consecutiveFramesRef.current >= 4) triggerVideoProcessing();
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
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setTimeout(async () => {
      if (chunksRef.current.length === 0) {
        isProcessingVideoRef.current = false;
        setIsFestejoDetected(false);
        startRecording(streamRef.current); 
        return;
      }

      const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' }); 
      const formData = new FormData();
      formData.append('file', videoBlob);
      formData.append('upload_preset', 'padel_videos');
      formData.append('resource_type', 'video');
      formData.append('tags', 'festejos_padel'); 

      try {
        console.log("Subiendo video de forma segura...");
        await axios.post('https://api.cloudinary.com/v1_1/dzo2wt8ir/video/upload', formData);
        console.log("¡Video subido y etiquetado con éxito!");
      } catch (error) {
        console.error("Error Axios:", error);
      } finally {
        setIsFestejoDetected(false);
        startRecording(streamRef.current); 
        setTimeout(() => { isProcessingVideoRef.current = false; }, 3000); 
      }
    }, 500);
  };

  const toggleMasterSwitch = () => {
    if (isCameraActive) stopCamera();
    else startCamera(activeDeviceId); // Arranca con el último lente elegido
  };

  // === NUEVA FUNCIÓN: CAMBIAR DE LENTE ===
  const switchLens = async () => {
    if (videoDevices.length <= 1) {
      alert("No se detectaron lentes extra. Asegurate de darle a 'Iniciar' primero para dar permisos.");
      return;
    }
    
    // Buscamos el lente actual y pasamos al siguiente en la lista
    const currentIndex = videoDevices.findIndex(d => d.deviceId === activeDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDeviceId = videoDevices[nextIndex].deviceId;

    setActiveDeviceId(nextDeviceId);

    // Si estaba grabando, reiniciamos rápido con el nuevo lente
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => startCamera(nextDeviceId), 500); 
    } else {
      startCamera(nextDeviceId);
    }
  };

  return (
    <div style={styles.container}>
      {isLoadingModel && (
        <div style={styles.loadingOverlay}>
          <img src="../../../imagenes/logo.png" alt="NexaPadel" style={styles.mainLogo} />
          <div style={styles.loaderWrapper}>
            <div id="smartcamera-loader" style={styles.professionalLoader}></div>
          </div>
          <h2 style={styles.loadingTitle}>Cargando NexaIA</h2>
          <p style={styles.loadingSubtext}>Preparando Modelo de Detección ...</p>
        </div>
      )}

      {!isLoadingModel && (
        <div style={styles.cameraWrapper}>
          <button onClick={() => { stopCamera(); onBack(); }} style={styles.backButton}>⬅ Volver</button>
          <video ref={videoRef} autoPlay playsInline muted style={styles.video} />
          <canvas ref={canvasRef} style={styles.debugCanvas} />
          
          {isCameraActive && (
            <>
              <div style={styles.roofGuide}>▲ TECHO ▲</div>
              <div style={styles.overlayContainer}>
                <div style={styles.sideArea}></div>
                <div style={styles.centerROI}><p style={styles.roiText}>ZONA DE FESTEJO</p></div>
                <div style={styles.sideArea}></div>
              </div>
            </>
          )}

          {isFestejoDetected && (
            <div style={styles.successOverlay}>
              <h2 style={styles.successText}>¡FESTEJO DETECTADO!</h2>
            </div>
          )}

          {/* === BOTONES ACTUALIZADOS === */}
          <div style={styles.controlsWrapper}>
            <button onClick={switchLens} style={styles.lensButton}>
              <span style={styles.rotatedText}>🔄 Lente</span>
            </button>

            <button onClick={toggleMasterSwitch} disabled={isLoadingModel} 
              style={{...styles.masterButton, backgroundColor: isLoadingModel ? '#6c757d' : (isCameraActive ? '#dc3545' : '#28a745')}}>
              <span style={styles.rotatedText}>{isLoadingModel ? 'Cargando' : (isCameraActive ? 'Detener' : 'Iniciar')}</span>
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes professionalRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          #smartcamera-loader { animation: professionalRotate 1s linear infinite; }
        `}
      </style>
    </div>
  );
};

// === ESTILOS ACTUALIZADOS ===
const styles = {
  container: { position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#001132', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '30px', color: '#fff' },
  mainLogo: { width: '80%', maxWidth: '300px' },
  loaderWrapper: { position: 'relative', width: '80px', height: '80px' },
  professionalLoader: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', border: '6px solid rgba(10, 89, 253, 0.1)', borderTop: '6px solid #0a59fd' },
  loadingTitle: { fontSize: '28px', fontWeight: 'bold', letterSpacing: '1px', margin: 0 },
  loadingSubtext: { fontSize: '16px', opacity: 0.7, margin: 0 },
  cameraWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#111' },
  backButton: { position: 'absolute', top: '20px', left: '20px', zIndex: 15, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255, 255, 255, 0.5)', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  debugCanvas: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', zIndex: 2 },
  roofGuide: { position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', padding: '8px 15px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', letterSpacing: '2px', zIndex: 6 },
  overlayContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', pointerEvents: 'none', zIndex: 5 },
  sideArea: { flex: 1, backgroundColor: 'rgba(255, 0, 0, 0.2)', width: '100%' }, 
  centerROI: { flex: 3, width: '100%', borderTop: '2px dashed rgba(255, 255, 255, 0.5)', borderBottom: '2px dashed rgba(255, 255, 255, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  roiText: { transform: 'rotate(-90deg)', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 'bold', fontSize: '24px', letterSpacing: '4px', textShadow: '0px 0px 4px rgba(0,0,0,0.9)' },
  
  // Wrapper y botones
  controlsWrapper: { position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', pointerEvents: 'auto' },
  lensButton: { padding: '0', width: '70px', height: '70px', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', color: '#fff', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  masterButton: { padding: '0', width: '100px', height: '100px', color: '#fff', border: '4px solid #fff', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  rotatedText: { transform: 'rotate(-90deg)', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' },
  successOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)', backgroundColor: 'rgba(40, 167, 69, 0.95)', padding: '30px 50px', borderRadius: '20px', zIndex: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' },
  successText: { color: '#fff', margin: 0, fontSize: '32px', fontWeight: 'bold', textAlign: 'center', letterSpacing: '2px' }
};

export default SmartCamera;