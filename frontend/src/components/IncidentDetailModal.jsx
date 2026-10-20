import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export default function IncidentDetailModal({
  incidentId,
  onClose,
  currentUser,
  users = [],
  onIncidentUpdated,
}) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionError, setActionError] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

  const fetchIncident = useCallback(async () => {
    try {
      setLoading(true);
      setActionError('');
      const data = await api.getIncidentById(incidentId);
      setIncident(data);
      if (data.assignedTechnician) {
        setSelectedTechId(data.assignedTechnician.id);
      }
    } catch (err) {
      console.error('Error al cargar incidente:', err);
      setActionError(err.message || 'Error al cargar los datos del incidente.');
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
    }
  }, [incidentId, fetchIncident]);

  const handleStatusChange = async (newStatus) => {
    try {
      setActionError('');
      await api.updateStatus(incident.id, {
        status: newStatus,
        authorName: currentUser.fullName,
        notes: newStatus === 'RESUELTO' ? resolutionNotes : `Cambio manual de estado a ${newStatus}`,
      });
      fetchIncident();
      onIncidentUpdated();
    } catch (err) {
      setActionError(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleAssignTechnician = async () => {
    if (!isAdmin) {
      alert('Solo el perfil de Administrador cuenta con permisos para asignar técnicos.');
      return;
    }
    if (!selectedTechId) return;
    try {
      setActionError('');
      await api.assignTechnician(incident.id, {
        technicianId: Number(selectedTechId),
        assignedByName: currentUser.fullName,
      });
      fetchIncident();
      onIncidentUpdated();
    } catch (err) {
      setActionError(`Error al asignar técnico: ${err.message}`);
    }
  };

  const handleDeleteIncident = async () => {
    if (!isAdmin) {
      alert('Acceso denegado: solo el Administrador puede eliminar incidentes.');
      return;
    }

    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el Incidente #${incident.id}? Esta operación es irreversible.`)) {
      return;
    }

    try {
      await api.deleteIncident(incident.id);
      onClose();
      onIncidentUpdated();
    } catch (err) {
      setActionError(`Error al eliminar incidente: ${err.message}`);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      setActionError('');
      await api.addComment(incident.id, {
        authorName: currentUser.fullName,
        message: commentText.trim(),
        actionType: 'COMMENT',
      });
      setCommentText('');
      fetchIncident();
    } catch (err) {
      setActionError(`Error al agregar nota: ${err.message}`);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading || !incident) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
          Cargando detalles del incidente #{incidentId}...
        </div>
      </div>
    );
  }

  const statuses = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header con botón de eliminación si es ADMIN */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="incident-id-badge">#{incident.id}</span>
              <span className={`badge badge-status-${incident.status}`}>{incident.status}</span>
              <span className={`badge badge-priority-${incident.priority}`}>{incident.priority}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{incident.category}</span>
            </div>
            <h2>{incident.title}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAdmin && (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handleDeleteIncident}
                id="btn-modal-delete-incident"
                title="Eliminar este incidente definitivamente (Solo ADMIN)"
              >
                🗑️ Eliminar
              </button>
            )}
            <button className="modal-close" onClick={onClose} id="modal-close-btn">
              &times;
            </button>
          </div>
        </div>

        {actionError && (
          <div className="login-error-alert" role="alert" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> <span>{actionError}</span>
          </div>
        )}

        {/* Incident Info */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {incident.description}
          </p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div><strong>Reportado por:</strong> {incident.reporterName}</div>
            <div><strong>Creado:</strong> {new Date(incident.createdAt).toLocaleString('es-ES')}</div>
            <div>
              <strong>Técnico Responsable:</strong>{' '}
              {incident.assignedTechnician ? (
                <span style={{ color: '#a5b4fc', fontWeight: 600 }}>
                  {incident.assignedTechnician.fullName}
                </span>
              ) : (
                <span style={{ color: 'var(--text-subtle)' }}>Sin Asignar</span>
              )}
            </div>
          </div>
        </div>

        {/* Operations Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#a5b4fc' }}>
            OPERACIÓN Y CONTROL DE ESTADO
          </h4>

          {/* Change Status Buttons (Permitido tanto a ADMIN como a TECHNICIAN asignado) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              TRANSICIÓN DE ESTADO (Flujo ITIL)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {statuses.map((st) => (
                <button
                  key={st}
                  disabled={incident.status === st}
                  onClick={() => handleStatusChange(st)}
                  className={`btn-secondary ${incident.status === st ? 'active' : ''}`}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                    opacity: incident.status === st ? 0.4 : 1,
                  }}
                  id={`status-btn-${st}`}
                >
                  {st}
                </button>
              ))}
            </div>

            {incident.status === 'EN_PROCESO' && (
              <div style={{ marginTop: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Notas de resolución técnica (opcional al resolver)..."
                  className="form-input"
                  style={{ width: '100%' }}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Asignación de Técnico: EXCLUSIVO PARA ADMIN */}
          {isAdmin ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                ASIGNACIÓN TÉCNICA (Exclusivo Administrador)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <select
                    className="form-select"
                    style={{ width: '100%' }}
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    id="assign-tech-select"
                  >
                    <option value="">-- Seleccionar Técnico Asignado --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.55rem 1rem' }}
                  onClick={handleAssignTechnician}
                  id="btn-confirm-assign"
                >
                  Guardar Asignación
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
              🔒 <em>La asignación o reasignación de técnicos es una función exclusiva del Administrador.</em>
            </div>
          )}
        </div>

        {/* Timeline & Comments Section (Permitido a ADMIN y TECHNICIAN) */}
        <div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Bitácora de Seguimiento</h3>

          <form onSubmit={handleAddComment} style={{ marginBottom: '1.5rem' }}>
            <textarea
              className="form-textarea"
              style={{ width: '100%', minHeight: '70px' }}
              placeholder={`Registrar avance o nota técnica como ${currentUser.fullName}...`}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              id="input-comment-text"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={submittingComment || !commentText.trim()}
                id="btn-submit-comment"
              >
                {submittingComment ? 'Publicando...' : 'Publicar en Bitácora'}
              </button>
            </div>
          </form>

          {/* Timeline List */}
          <div className="timeline">
            {(!incident.comments || incident.comments.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Sin registros en la bitácora aún.
              </p>
            ) : (
              incident.comments.map((c) => (
                <div key={c.id} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <span className="timeline-author">{c.authorName}</span>
                      <span className={`badge badge-action-${c.actionType}`}>{c.actionType}</span>
                      <span className="timeline-date">
                        {new Date(c.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <div className="timeline-message">{c.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
