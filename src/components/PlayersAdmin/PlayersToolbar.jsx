import { Search, Plus } from "lucide-react";

const PlayersToolbar = ({ searchTerm, setSearchTerm, onOpenNew }) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      
      {/* Buscador */}
      <div className="input-group shadow-sm" style={{ maxWidth: "450px" }}>
        <span className="input-group-text bg-white border-end-0 text-muted">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          className="form-control bg-white border-start-0" 
          placeholder="Buscar por DNI, nombre, apellido o email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Botón Nuevo Jugador */}
      <button 
        className="btn fw-bold d-flex align-items-center gap-2 text-white shadow-sm px-4"
        style={{ backgroundColor: "#0f172a", border: "none" }}
        onClick={onOpenNew}
      >
        <Plus size={18} /> Nuevo Jugador
      </button>

    </div>
  );
};

export default PlayersToolbar;