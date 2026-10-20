export default function IncidentListView({
  incidents,
  filters,
  setFilters,
  users,
  onSelectIncident,
  onOpenCreateModal,
  onDeleteIncident,
  loading,
  currentUser,
  title = 'Registro de Incidentes',
  subtitle = 'Consulta, clasificación y gestión del ciclo de vida de tickets',
}) {
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      technicianId: isAdmin ? '' : (currentUser?.id || ''),
    });
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {/* Solo el Administrador puede registrar o crear nuevos incidentes */}
        {isAdmin && onOpenCreateModal && (
          <button
            className="btn-primary"
            onClick={onOpenCreateModal}
            id="btn-create-incident"
          >
            <span>＋</span> Nuevo Incidente
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="filter-status">Estado</label>
          <select
            id="filter-status"
            className="filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="NUEVO">NUEVO</option>
            <option value="ASIGNADO">ASIGNADO</option>
            <option value="EN_PROCESO">EN_PROCESO</option>
            <option value="RESUELTO">RESUELTO</option>
            <option value="CERRADO">CERRADO</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-priority">Prioridad</label>
          <select
            id="filter-priority"
            className="filter-select"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">Todas las Prioridades</option>
            <option value="BAJA">BAJA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="ALTA">ALTA</option>
            <option value="CRITICA">CRITICA</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-category">Categoría</label>
          <select
            id="filter-category"
            className="filter-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">Todas las Categorías</option>
            <option value="HARDWARE">HARDWARE</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="NETWORK">NETWORK</option>
            <option value="ACCESS">ACCESS</option>
            <option value="SECURITY">SECURITY</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        {/* Filtro por técnico: Exclusivo para ADMIN, el técnico solo ve lo suyo */}
        {isAdmin && (
          <div className="filter-group">
            <label htmlFor="filter-technician">Técnico Asignado</label>
            <select
              id="filter-technician"
              className="filter-select"
              value={filters.technicianId}
              onChange={(e) => handleFilterChange('technicianId', e.target.value)}
            >
              <option value="">Todos los Técnicos</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="btn-secondary"
          style={{ alignSelf: 'flex-end', height: '38px' }}
          onClick={resetFilters}
          id="btn-clear-filters"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Incident Table */}
      <div className="incident-table-wrapper">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando incidentes desde la base de datos...
          </div>
        ) : incidents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No se encontraron incidentes que coincidan con los filtros aplicados.
          </div>
        ) : (
          <table className="incident-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Reportado Por</th>
                <th>Técnico Asignado</th>
                <th>Fecha Creación</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {incidents.map((item) => (
                <tr
                  key={item.id}
                  className="incident-row"
                  onClick={() => onSelectIncident(item)}
                  id={`incident-row-${item.id}`}
                >
                  <td>
                    <span className="incident-id-badge">#{item.id}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-priority-${item.priority}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.reporterName}</td>
                  <td>
                    {item.assignedTechnician ? (
                      <span style={{ color: '#a5b4fc', fontWeight: 500 }}>
                        {item.assignedTechnician.fullName}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-subtle)' }}>Sin asignar</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(item.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  {isAdmin && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn-danger-icon"
                        title="Eliminar Incidente (Solo ADMIN)"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onDeleteIncident) {
                            onDeleteIncident(item.id);
                          }
                        }}
                        id={`btn-delete-incident-${item.id}`}
                      >
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
