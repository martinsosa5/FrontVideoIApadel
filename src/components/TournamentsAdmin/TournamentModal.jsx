// src/components/TournamentsAdmin/TournamentModal.jsx
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trophy, X, Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { createTournamentSchema } from "../../schemas/tournament.schema";
import { useTournaments } from "../../context/TournamentContext";

const CATEGORY_NAMES = ["1ra", "2da", "3ra", "4ta", "5ta", "6ta", "7ma", "8va", "Principiantes", "Suma 13"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const TournamentModal = ({ tournament, onClose }) => {
  const { createNewTournament, editTournamentInfo } = useTournaments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!tournament;

  // Estados Portada (Horizontal)
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(tournament?.posterImage || null);
  
  // Estados Flyer (Vertical)
  const [flyerFile, setFlyerFile] = useState(null);
  const [flyerPreview, setFlyerPreview] = useState(tournament?.flyerImage || null);

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createTournamentSchema),
    defaultValues: isEditing ? {
      name: tournament.name,
      club: tournament.club,
      startDate: new Date(tournament.startDate).toISOString().split('T')[0],
      endDate: new Date(tournament.endDate).toISOString().split('T')[0],
      status: tournament.status,
      showInHome: tournament.showInHome,
      description: tournament.description || "",
      prizes: tournament.prizes || "",
      modality: tournament.modality || "",
      price: tournament.price || 0,
      contacts: tournament.contacts?.length > 0 ? tournament.contacts : [{ name: "", phone: "" }],
      categories: tournament.categories.map(c => ({ name: c.name, gender: c.gender }))
    } : {
      categories: [{ name: "7ma", gender: "Masculino" }], 
      contacts: [{ name: "", phone: "" }],
      status: "Inscripciones Abiertas",
      showInHome: true,
      price: 0
    }
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control, name: "categories"
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control, name: "contacts"
  });

  // 🔥 VALIDACIÓN DE PESO EN EL FRONTEND
  const handleImageChange = (e, setFile, setPreview) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error("La imagen es demasiado pesada. El límite es de 5MB.", { 
          style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } 
        });
        e.target.value = null;
        return;
      }

      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
    e.target.value = null; 
  };

  const onSubmit = async (data) => {
    if (!isEditing && !posterFile && !posterPreview) {
      toast.error("La imagen de portada principal es obligatoria.", { style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("club", data.club);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("status", data.status);
    formData.append("showInHome", data.showInHome);
    
    if(data.description) formData.append("description", data.description);
    if(data.prizes) formData.append("prizes", data.prizes);
    if(data.modality) formData.append("modality", data.modality);
    if(data.price) formData.append("price", data.price);

    formData.append("categories", JSON.stringify(data.categories));
    
    // Filtramos profes vacíos por si el admin agregó una fila extra y la dejó en blanco
    const validContacts = data.contacts.filter(c => c.name?.trim() !== "" && c.phone?.trim() !== "");
    formData.append("contacts", JSON.stringify(validContacts));

    if (posterFile) formData.append("posterImage", posterFile);
    if (flyerFile) formData.append("flyerImage", flyerFile);

    let result;
    if (isEditing) {
      result = await editTournamentInfo(tournament._id, formData);
    } else {
      result = await createNewTournament(formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message, { style: { background: "#dcfce7", color: "#166534", fontWeight: "bold" } });
      onClose();
    } else {
      toast.error(result.message, { style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" } });
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        {/* Cambié a modal-xl para que entren las dos columnas cómodas */}
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Trophy size={22} /> {isEditing ? "Editar Torneo" : "Nuevo Torneo"}
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isSubmitting}></button>
            </div>

            <div className="modal-body p-0 bg-light" style={{ maxHeight: "80vh", overflowY: "auto" }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="row g-0">
                  
                  {/* --- COLUMNA IZQUIERDA: DATOS BÁSICOS --- */}
                  <div className="col-lg-6 p-4 border-end">
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Información General</h6>
                    <div className="row mb-3">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label fw-semibold text-secondary small">Nombre del Torneo *</label>
                        <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register("name")} placeholder="Ej: Copa Invierno" />
                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Club / Sede *</label>
                        <input type="text" className={`form-control ${errors.club ? 'is-invalid' : ''}`} {...register("club")} placeholder="Ej: Padel Center" />
                        {errors.club && <div className="invalid-feedback">{errors.club.message}</div>}
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label fw-semibold text-secondary small">Fecha de Inicio *</label>
                        <input type="date" className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} {...register("startDate")} />
                        {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Fecha de Fin *</label>
                        <input type="date" className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} {...register("endDate")} />
                        {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">Categorías a Disputar</h6>
                    {categoryFields.map((item, index) => (
                      <div key={item.id} className="row g-2 mb-2 align-items-end p-2 bg-white border rounded-3 shadow-sm">
                        <div className="col-5">
                          <label className="form-label small text-secondary fw-bold">Nivel</label>
                          <select className="form-select form-select-sm" {...register(`categories.${index}.name`)} disabled={isEditing}>
                            {CATEGORY_NAMES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                        </div>
                        <div className="col-5">
                          <label className="form-label small text-secondary fw-bold">Rama</label>
                          <select className="form-select form-select-sm" {...register(`categories.${index}.gender`)} disabled={isEditing}>
                            <option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Mixto">Mixto</option>
                          </select>
                        </div>
                        <div className="col-2 text-end">
                          <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => removeCategory(index)} disabled={isEditing || categoryFields.length === 1}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!isEditing && (
                      <button type="button" className="btn btn-sm btn-light border fw-bold text-secondary d-flex align-items-center gap-1 mt-2" onClick={() => appendCategory({ name: "7ma", gender: "Femenino" })}>
                        <Plus size={16} /> Agregar Categoría
                      </button>
                    )}
                    
                    <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 mt-4">Portada Principal (Horizontal)</h6>
                    <div className="d-flex flex-column align-items-center justify-content-center border rounded-3 p-3 bg-white shadow-sm position-relative" style={{ borderStyle: 'dashed !important', borderColor: '#cbd5e1' }}>
                      {posterPreview ? (
                        <div className="position-relative w-100 text-center">
                          <img src={posterPreview} alt="Preview" className="img-fluid rounded-3 shadow-sm border" style={{ maxHeight: '150px', objectFit: 'cover', width: '100%' }} />
                          <button type="button" className="btn btn-dark btn-sm position-absolute top-0 end-0 m-1 fw-bold opacity-75 hover-opacity-100" onClick={() => { setPosterFile(null); setPosterPreview(null); }}>X</button>
                        </div>
                      ) : (
                        <div className="text-center cursor-pointer p-2" onClick={() => document.getElementById('poster-upload').click()}>
                          <UploadCloud size={30} style={{ color: "#fd7e14" }} className="mb-2" />
                          <p className="mb-0 fw-bold text-dark small">Subir Portada (Máx 5MB)</p>
                        </div>
                      )}
                      <input type="file" id="poster-upload" className="d-none" accept="image/*, .heic, .heif" onChange={(e) => handleImageChange(e, setPosterFile, setPosterPreview)} />
                    </div>
                  </div>

                  {/* --- COLUMNA DERECHA: INFO LANDING (OPCIONAL) --- */}
                  <div className="col-lg-6 p-4 bg-white">
                    <div className="d-flex align-items-center justify-content-between border-bottom pb-2 mb-3">
                      <h6 className="fw-bold text-dark m-0">Detalles para "Más Información"</h6>
                      <span className="badge bg-secondary opacity-75">Opcional</span>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold text-secondary small">Descripción corta</label>
                      <textarea className="form-control" rows="2" {...register("description")} placeholder="Unite al torneo más grande de la región..."></textarea>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Premios</label>
                        <input type="text" className="form-control" {...register("prizes")} placeholder="Ej: $800.000 a repartir" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold text-secondary small">Precio Inscripción ($)</label>
                        <input type="number" className="form-control" {...register("price")} placeholder="Ej: 35000" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold text-secondary small">Modalidad</label>
                      <input type="text" className="form-control" {...register("modality")} placeholder="Ej: 2 Set Ganados y Súper Tie-Break" />
                    </div>

                    <h6 className="fw-bold text-secondary small border-bottom pb-1 mb-2">Profes / Contactos (Para WhatsApp)</h6>
                    {contactFields.map((item, index) => (
                      <div key={item.id} className="row g-2 mb-2">
                        <div className="col-5">
                          <input type="text" className="form-control form-control-sm" placeholder="Nombre (Ej: Mauro)" {...register(`contacts.${index}.name`)} />
                        </div>
                        <div className="col-5">
                          <input type="text" className="form-control form-control-sm" placeholder="N° sin el + (Ej: 549381...)" {...register(`contacts.${index}.phone`)} />
                        </div>
                        <div className="col-2 text-end">
                          <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => removeContact(index)}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-light border fw-bold text-secondary d-flex align-items-center gap-1 mb-4" onClick={() => appendContact({ name: "", phone: "" })}>
                      <Plus size={16} /> Añadir Contacto
                    </button>

                    <h6 className="fw-bold text-secondary small border-bottom pb-1 mb-2">Flyer Vertical Secundario</h6>
                    <div className="d-flex flex-column align-items-center justify-content-center border rounded-3 p-3 bg-light shadow-sm position-relative" style={{ borderStyle: 'dashed !important' }}>
                      {flyerPreview ? (
                        <div className="position-relative text-center">
                          <img src={flyerPreview} alt="Preview" className="img-fluid rounded-3 shadow-sm border" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                          <button type="button" className="btn btn-dark btn-sm position-absolute top-0 end-0 m-1 p-1 opacity-75 hover-opacity-100" onClick={() => { setFlyerFile(null); setFlyerPreview(null); }}><X size={14}/></button>
                        </div>
                      ) : (
                        <div className="text-center cursor-pointer p-2" onClick={() => document.getElementById('flyer-upload').click()}>
                          <UploadCloud size={24} className="text-muted mb-1" />
                          <p className="mb-0 fw-medium text-secondary small">Subir Flyer (Máx 5MB)</p>
                        </div>
                      )}
                      <input type="file" id="flyer-upload" className="d-none" accept="image/*, .heic, .heif" onChange={(e) => handleImageChange(e, setFlyerFile, setFlyerPreview)} />
                    </div>

                  </div>
                </div>

                {/* --- FOOTER DEL MODAL --- */}
                <div className="p-3 border-top bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  
                  {/* Visibilidad Home */}
                  <div className="form-check form-switch ps-md-5">
                    <input className="form-check-input cursor-pointer" type="checkbox" id="showInHome" style={{ transform: 'scale(1.3)' }} {...register("showInHome")} />
                    <label className="form-check-label fw-bold text-dark cursor-pointer ms-2" htmlFor="showInHome">
                      Destacar en pantalla principal (Home)
                    </label>
                  </div>

                  {/* Estado y Guardar */}
                  <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-3">
                    <select className="form-select form-select-sm fw-bold border-secondary" style={{ width: 'auto' }} {...register("status")}>
                        <option value="Inscripciones Abiertas">Inscripciones Abiertas</option>
                        <option value="Inscripciones Cerradas">Inscripciones Cerradas</option>
                        <option value="En Curso">En Curso</option>
                        <option value="Finalizado">Finalizado</option>
                    </select>
                    
                    <div className="d-flex gap-2 justify-content-end">
                      <button type="button" className="btn btn-light border fw-bold text-secondary" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                      <button type="submit" className="btn fw-bold text-white px-4 shadow-sm" style={{ backgroundColor: "#0f172a" }} disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 size={18} className="animate-spin me-2" /> Guardando...</> : "Guardar Torneo"}
                      </button>
                    </div>
                  </div>

                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TournamentModal;