// src/components/Staff/StaffTable.jsx
import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { useStaff } from "../../context/StaffContext";

const StaffTable = ({ staffList, searchTerm }) => {
  const [staffToDelete, setStaffToDelete] = useState(null);
  const { deleteStaffMember, errors: contextErrors } = useStaff();

  const filteredStaff = staffList.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.dni.includes(searchTerm)
  );

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      await deleteStaffMember(staffToDelete._id);
      setStaffToDelete(null);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn">
      
      {contextErrors && contextErrors.length > 0 && (
        <div className="alert text-center p-3 mb-4 shadow-sm rounded-3 bg-danger bg-opacity-10 text-danger border-0">
          {contextErrors.map((err, index) => <div key={index} className="fw-bold small">{err}</div>)}
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase">Miembro Staff</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase">DNI</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase">Rol</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase text-center">Estado</th>
                <th className="py-3 px-4 text-secondary fw-semibold small text-uppercase text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((emp) => (
                <tr key={emp._id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <img 
                        src={emp.profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        alt="avatar" 
                        className="rounded-circle border"
                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                      />
                      <div>
                        <p className="mb-0 fw-bold text-dark">{emp.firstName} {emp.lastName}</p>
                        <p className="mb-0 small text-muted">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 fw-medium text-secondary">{emp.dni}</td>
                  
                  <td className="px-4 py-3">
                    <span className={`badge ${emp.role === 'ADMIN' ? 'text-white' : 'bg-light text-dark border'} rounded-pill px-3 py-2 small`} style={emp.role === 'ADMIN' ? { backgroundColor: "#0f172a" } : {}}>
                      {emp.role}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`badge rounded-pill ${emp.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                      {emp.isActive ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-end">
                    <button 
                      onClick={() => setStaffToDelete(emp)} 
                      className="btn btn-light btn-sm text-danger rounded-circle p-2" 
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredStaff.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No se encontró personal.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ELIMINAR */}
      {staffToDelete && (
        <>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
          <div className="modal fade show d-block" style={{ zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered animate__animated animate__zoomIn animate__faster">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <AlertTriangle size={22} /> Confirmar Eliminación
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setStaffToDelete(null)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <p className="fs-6">¿Eliminar a <strong>{staffToDelete.firstName}</strong> del staff?</p>
                </div>
                <div className="modal-footer bg-light border-0 justify-content-center gap-3 pb-4">
                  <button className="btn btn-secondary rounded-pill px-4" onClick={() => setStaffToDelete(null)}>Cancelar</button>
                  <button className="btn btn-danger rounded-pill px-4" onClick={handleConfirmDelete}>Sí, Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffTable;