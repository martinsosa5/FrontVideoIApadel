// src/components/StaffModal/StaffModal.jsx
import { Briefcase } from "lucide-react";
import CreateStaffForm from "./CreateStaffForm";

const StaffModal = ({ onClose }) => {
  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            {/* Cabecera Naranja */}
            <div className="modal-header text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                <Briefcase size={22} /> Nuevo Staff
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body p-4 bg-light">
               <CreateStaffForm onClose={onClose} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffModal;