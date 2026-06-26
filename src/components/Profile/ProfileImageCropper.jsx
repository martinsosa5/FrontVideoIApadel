import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Camera, X, Check, Loader2 } from "lucide-react"; 
import getCroppedImg from "../../helpers/cropImage";
import heic2any from "heic2any"; 

const ProfileImageCropper = ({ currentImage, onImageCropped }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const [isConverting, setIsConverting] = useState(false);

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      let file = e.target.files[0];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        try {
          setIsConverting(true); 
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8 
          });

          file = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        } catch (error) {
          console.error("Error al convertir la imagen de iPhone:", error);
          alert("Hubo un problema al procesar la foto del iPhone. Intentá con otra.");
          setIsConverting(false);
          return;
        } finally {
          setIsConverting(false);
        }
      }

      let imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl); 
    }
    e.target.value = null; 
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);
      onImageCropped(croppedImageBlob, croppedImageUrl);
      setImageSrc(null);
    } catch (e) {
      console.error("Error al recortar la imagen", e);
    }
  };

  const closeModal = () => {
    setImageSrc(null);
  };

  return (
    <>
      <div className="position-relative d-inline-block" style={{ marginTop: "-50px" }}>
        {isConverting && (
          <div className="position-absolute top-0 start-0 w-100 h-100 rounded-circle bg-white bg-opacity-75 d-flex justify-content-center align-items-center" style={{ zIndex: 10 }}>
            {/* Spinner Naranja */}
            <Loader2 size={30} style={{ color: "#fd7e14" }} className="animate__animated animate__rotateIn animate__infinite" />
          </div>
        )}

        <img 
          src={currentImage} 
          alt="Perfil" 
          className="rounded-circle border border-4 border-white bg-white object-fit-cover shadow-sm"
          style={{ width: "120px", height: "120px" }}
        />
        
        <label 
          htmlFor="upload-photo" 
          className={`position-absolute bottom-0 end-0 text-white rounded-circle p-2 shadow ${isConverting ? 'opacity-50' : 'cursor-pointer'}`}
          style={{ backgroundColor: "#fd7e14", cursor: isConverting ? "wait" : "pointer", transition: "transform 0.2s" }} // Fondo Naranja
          onMouseOver={(e) => !isConverting && (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => !isConverting && (e.currentTarget.style.transform = "scale(1)")}
        >
          <Camera size={18} />
        </label>
        <input 
          type="file" 
          id="upload-photo" 
          className="d-none" 
          accept="image/*, .heic, .heif" 
          onChange={onFileChange}
          disabled={isConverting}
        />
      </div>

      {imageSrc && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Encuadrar Foto</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>

              <div className="modal-body position-relative" style={{ height: "300px" }}>
                <div className="position-absolute top-0 start-0 w-100 h-100 rounded-3 overflow-hidden">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} 
                    cropShape="round" 
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              </div>
              
              <div className="px-4 pb-2">
                <label className="small text-muted fw-bold">Acercar / Alejar</label>
                <input 
                  type="range" 
                  className="form-range" 
                  min={1} max={3} step={0.1} 
                  value={zoom} 
                  onChange={(e) => setZoom(e.target.value)} 
                />
              </div>

              <div className="modal-footer border-0 pt-0 d-flex justify-content-between">
                <button type="button" className="btn btn-light fw-bold px-4" onClick={closeModal}>
                  <X size={18} className="me-1" /> Cancelar
                </button>
                <button type="button" className="btn fw-bold px-4 text-white" style={{ backgroundColor: "#fd7e14" }} onClick={handleCropSave}>
                  <Check size={18} className="me-1" /> Confirmar Foto
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}

export default ProfileImageCropper;