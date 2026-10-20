import { useState } from 'react';
import { api } from '../services/api';

export default function IncidentCreateModal({ onClose, users, currentUser, onIncidentCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'HARDWARE',
    priority: 'MEDIA',
    reporterName: currentUser ? currentUser.fullName : 'Usuario Solicitante',
    assignedTechnicianId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        assignedTechnicianId: formData.assignedTechnicianId ? Number(formData.assignedTechnicianId) : null,
      };
      await api.createIncident(payload);
      onIncidentCreated();
      onClose();
    } catch (err) {
      alert(`Error al crear incidente: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Incidente de TI</h2>
          <button className="modal-close" onClick={onClose} id="create-modal-close-btn">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="create-title">Título del Incidente *</label>
            <input
              id="create-title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Ej: Falla en VPN corporativa o Pantalla rota"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="create-description">Descripción Detallada *</label>
            <textarea
              id="create-description"
              name="description"
              className="form-textarea"
              style={{ minHeight: '90px' }}
              placeholder="Describa el comportamiento, equipo afectado y mensajes de error..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="create-category">Categoría *</label>
              <select
                id="create-category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="HARDWARE">HARDWARE</option>
                <option value="SOFTWARE">SOFTWARE</option>
                <option value="NETWORK">NETWORK</option>
                <option value="ACCESS">ACCESS</option>
                <option value="SECURITY">SECURITY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="create-priority">Prioridad *</label>
              <select
                id="create-priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="BAJA">BAJA</option>
                <option value="MEDIA">MEDIA</option>
                <option value="ALTA">ALTA</option>
                <option value="CRITICA">CRITICA</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="create-reporter">Usuario Reportante *</label>
              <input
                id="create-reporter"
                name="reporterName"
                type="text"
                className="form-input"
                value={formData.reporterName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="create-assignee">Asignar Técnico Inicial (Opcional)</label>
              <select
                id="create-assignee"
                name="assignedTechnicianId"
                className="form-select"
                value={formData.assignedTechnicianId}
                onChange={handleChange}
              >
                <option value="">-- Sin asignar (Estado NUEVO) --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              id="btn-submit-incident"
            >
              {submitting ? 'Guardando...' : 'Registrar Incidente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
