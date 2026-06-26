// src/pages/Staff.jsx
import { useState, useEffect } from "react";
// Ojo con estas importaciones, ya las preparo para el próximo paso
import { useStaff } from "../context/StaffContext";
import { useAuth } from "../context/AuthContext"; 
import { ShieldAlert, Info, Search, Mail, Phone, MapPin, IdCard, UserPlus } from "lucide-react"; 
import toast from 'react-hot-toast';
import StaffModal from "../components/StaffModal/StaffModal"; 

const Staff = () => {
  const { staffList, loadStaff, updateStaffPermissions } = useStaff();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, type: "", employee: null, value: null, title: "", message: "" 
  });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, employee: null });

  useEffect(() => {
    loadStaff();
  }, []);

  const visibleStaff = staffList.filter(emp => {
    const isEmployeeRole = emp.role === 'ADMIN' || emp.role === 'STAFF';
    const matchesSearch = emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.dni?.includes(searchTerm) ||
                          emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isEmployeeRole && matchesSearch;
  });

  const handleStatusToggle = (emp) => {
    const currentUserId = user?.id || user?._id;
    if (emp._id === currentUserId) {
      toast.error("Por seguridad, no podés desactivar tu propia cuenta.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: "STATUS",
      employee: emp,
      value: !emp.isActive,
      title: emp.isActive ? "Desactivar Staff" : "Activar Staff",
      message: emp.isActive 
        ? `¿Estás seguro? ${emp.firstName} no podrá ingresar al sistema hasta que sea reactivado.`
        : `El miembro del staff volverá a tener acceso total a sus funciones operativas.`
    });
  };

  const handleRoleChange = (emp, newRole) => {
    const currentUserId = user?.id || user?._id;
    if (emp._id === currentUserId) {
      toast.error("Por seguridad, no podés cambiar tu propio rol.");
      return;
    }

    if (emp.role === newRole) return;
    
    let message = "";
    if (newRole === 'ADMIN') {
      message = `¡CUIDADO! Al convertir a ${emp.firstName} en Administrador, tendrá acceso total al torneo y podrá modificar a otros miembros del staff.`;
    } else if (newRole === 'STAFF') {
      message = `El usuario perderá sus permisos de administrador y pasará a tener funciones limitadas de Staff.`;
    }

    setConfirmModal({
      isOpen: true,
      type: "ROLE",
      employee: emp,
      value: newRole,
      title: "Cambiar Nivel de Acceso",
      message
    });
  };

  const executeUpdate = async () => {
    let data = {};
    if (confirmModal.type === "STATUS") data = { isActive: confirmModal.value };
    if (confirmModal.type === "ROLE") data = { role: confirmModal.value };

    const res = await updateStaffPermissions(confirmModal.employee._id, data);
    if (res.success) {
      toast.success("Cambios aplicados correctamente");
    }
    setConfirmModal({ isOpen: false, type: "", employee: null, value: null, title: "", message: "" });
  };

  return (
    <div className="animate__animated animate__fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestión del Staff</h2>
          <p className="text-secondary mb-0">Controlá los niveles de acceso de tu equipo.</p>
        </div>
        <button 
          className="btn d-flex align-items-center gap-2 fw-bold px-4 py-2 shadow-sm text-white"
          style={{ backgroundColor: "#0f172a", border: "none" }}
          onClick={() => setIsModalOpen(true)}
        >
          <UserPlus size={20} />
          Nuevo Staff
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0"><Search size={18} className="text-muted" /></span>
            <input 
              type="text" 
              className="form-control bg-light border-start-0" 
              placeholder="Buscar por nombre, DNI o Correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase">Miembro</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase">Rango / Rol</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase text-center">Estado</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleStaff.map((emp) => (
                <tr key={emp._id}>
                  
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle overflow-hidden shadow-sm d-flex justify-content-center align-items-center flex-shrink-0 border" 
                           style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9' }}>
                        {emp.profileImage ? (
                          <img src={emp.profileImage} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="fw-bold fs-6" style={{ color: "#fd7e14" }}>
                            {emp.firstName?.charAt(0).toUpperCase()}{emp.lastName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="fw-bold text-dark mb-0">{emp.firstName} {emp.lastName}</div>
                        <div className="text-muted small mt-0 d-flex align-items-center gap-1">
                          <IdCard size={12} /> {emp.dni}
                        </div>
                        <div className="text-muted small mt-0 d-flex align-items-center gap-1">
                          <Mail size={12} /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <select 
                      className={`form-select form-select-sm fw-bold border-0 shadow-sm rounded-pill px-3 cursor-pointer `}
                     
                      value={emp.role}
                      onChange={(e) => handleRoleChange(emp, e.target.value)}
                    >
                      <option value="ADMIN" className="bg-white text-dark">Administrador</option>
                      <option value="STAFF" className="bg-white text-dark">Staff</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="form-check form-switch d-inline-flex align-items-center mb-0">
                      <input 
                        className="form-check-input cursor-pointer m-0" 
                        type="checkbox" 
                        checked={emp.isActive} 
                        onChange={() => handleStatusToggle(emp)}
                      />
                      <span className={`badge rounded-pill ms-2 ${emp.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                        {emp.isActive ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-end">
                    <button 
                      onClick={() => setDetailsModal({ isOpen: true, employee: emp })}
                      className="btn btn-outline-dark btn-sm fw-bold px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1 shadow-sm"
                    >
                      <Info size={16} /> Detalles
                    </button>
                  </td>

                </tr>
              ))}
              {visibleStaff.length === 0 && (
                <tr><td colSpan="4" className="text-center py-5 text-muted">No se encontró personal.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && <StaffModal onClose={() => setIsModalOpen(false)} />}

      {confirmModal.isOpen && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered animate__animated animate__zoomIn animate__faster">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-warning border-0">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <ShieldAlert size={22} /> {confirmModal.title}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></button>
                </div>
                <div className="modal-body p-4 text-center bg-light">
                  <p className="fs-6 text-secondary mb-0 fw-medium">{confirmModal.message}</p>
                </div>
                <div className="modal-footer border-0 bg-light justify-content-center gap-3 p-4 pt-0">
                  <button className="btn btn-outline-dark fw-bold px-4 rounded-pill" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancelar</button>
                  <button className="btn btn-warning text-dark fw-bold px-4 rounded-pill shadow-sm" onClick={executeUpdate}>Sí, confirmar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {detailsModal.isOpen && detailsModal.employee && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered animate__animated animate__zoomIn animate__faster">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                
                <div className="position-relative text-center p-4 text-white" style={{ backgroundColor: "#fd7e14", borderBottom: "4px solid #0f172a" }}>
                  <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3" onClick={() => setDetailsModal({ isOpen: false, employee: null })}></button>
                  
                  <div className="rounded-circle overflow-hidden shadow mx-auto mb-3 border border-3 border-white" 
                       style={{ width: '100px', height: '100px', backgroundColor: '#f1f5f9' }}>
                    {detailsModal.employee.profileImage ? (
                      <img src={detailsModal.employee.profileImage} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className="w-100 h-100 d-flex justify-content-center align-items-center bg-light" style={{ color: "#fd7e14" }}>
                        <span className="fw-bold fs-2">
                          {detailsModal.employee.firstName?.charAt(0).toUpperCase()}{detailsModal.employee.lastName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="fw-bold mb-0 text-white">{detailsModal.employee.firstName} {detailsModal.employee.lastName}</h4>
                  <span className="badge bg-white text-dark text-uppercase mt-2 shadow-sm">{detailsModal.employee.role}</span>
                </div>

                <div className="modal-body p-4 bg-light">
                  <div className="row g-4">
                    <div className="col-12">
                      <h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">Información Personal</h6>
                      <div className="d-flex flex-column gap-2 text-dark">
                        <div className="d-flex align-items-center gap-2">
                          <IdCard size={18} className="text-muted" /> 
                          <span className="fw-medium">DNI: {detailsModal.employee.dni}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Mail size={18} className="text-muted" /> 
                          <span className="fw-medium">{detailsModal.employee.email}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <Phone size={18} className="text-muted" /> 
                          <span className="fw-medium">{detailsModal.employee.personalInfo?.phone || 'Sin número registrado'}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <MapPin size={18} className="text-muted" /> 
                          <span className="fw-medium">{detailsModal.employee.personalInfo?.address || 'Sin dirección registrada'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 bg-light p-3 d-flex justify-content-center">
                  <button className="btn btn-dark fw-bold px-5 rounded-pill shadow-sm" onClick={() => setDetailsModal({ isOpen: false, employee: null })}>Cerrar Tarjeta</button>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Staff;