import { useNavigate } from 'react-router-dom';

export default function TechnicianDashboardView({
  currentUser,
  stats,
  onOpenMyIncidents,
}) {
  const navigate = useNavigate();
  const handleGoToMyIncidents = onOpenMyIncidents || (() => navigate('/tech/incidents'));

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Cargando tus métricas personales desde la base de datos...
      </div>
    );
  }

  const statusEntries = Object.entries(stats.statusDistribution || {});
  const categoryEntries = Object.entries(stats.categoryDistribution || {});
  const maxStatus = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);

  // Tasa de resolución personal
  const myResolutionRate = stats.totalIncidents > 0
    ? Math.round((stats.closedIncidents / stats.totalIncidents) * 100)
    : 0;

  return (
    <div className="technician-dashboard-view">
      {/* Header específico de TECHNICIAN */}
      <div className="view-header">
        <div className="view-title">
          <div className="role-tag-header technician-badge">🛠️ Mi Bandeja de Trabajo Personal</div>
          <h1>Panel de Técnico: {currentUser?.fullName}</h1>
          <p>Gestión directa de incidentes asignados a tu usuario, progreso técnico y prioridades</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleGoToMyIncidents} id="tech-view-my-tasks-btn">
            Ver Mis Incidentes Asignados ({stats.openIncidents} pendientes) &rarr;
          </button>
        </div>
      </div>

      {/* KPI Cards Personales del Técnico */}
      <div className="stats-grid tech-kpis">
        <div className="stat-card total">
          <div className="stat-header">
            <span>Mis Tickets Asignados</span>
            <span>📋</span>
          </div>
          <div className="stat-value">{stats.totalIncidents}</div>
          <div className="stat-subtext">Asignados a {currentUser?.username}</div>
        </div>

        <div className="stat-card open">
          <div className="stat-header">
            <span>Mis Tareas Pendientes</span>
            <span>⚡</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {stats.openIncidents}
          </div>
          <div className="stat-subtext">En estado ASIGNADO o EN_PROCESO</div>
        </div>

        <div className="stat-card closed">
          <div className="stat-header">
            <span>Mis Casos Resueltos</span>
            <span>🎯</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {stats.closedIncidents}
          </div>
          <div className="stat-subtext">Tu tasa de resolución: {myResolutionRate}%</div>
        </div>

        <div className="stat-card critical">
          <div className="stat-header">
            <span>Mis Casos Críticos</span>
            <span>🚨</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {stats.criticalIncidents}
          </div>
          <div className="stat-subtext">Incidentes urgentes en tu cola</div>
        </div>
      </div>

      {/* Charts Section: Personal Task Status & Categories */}
      <div className="charts-grid">
        {/* Estado de mis tareas */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Estado de Mis Asignaciones</h3>
              <p className="chart-sub">Progreso en el flujo ITIL de tus incidentes</p>
            </div>
            <span className="badge-pill">Flujo de Trabajo</span>
          </div>
          {statusEntries.length === 0 || stats.totalIncidents === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
              No tienes incidentes asignados en este momento. Puedes consultar la bandeja general.
            </p>
          ) : (
            statusEntries.map(([st, count]) => (
              <div key={st} className="bar-row">
                <div className="bar-label">
                  <span className={`badge badge-status-${st}`}>{st}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxStatus) * 100}%`,
                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Categorías que atiende este técnico */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Mis Incidentes por Especialidad</h3>
              <p className="chart-sub">Categorías asignadas a tu perfil</p>
            </div>
            <span className="badge-pill">Especialidad</span>
          </div>
          {categoryEntries.length === 0 || stats.totalIncidents === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
              Sin datos de categoría asignados.
            </p>
          ) : (
            categoryEntries.map(([cat, count]) => (
              <div key={cat} className="bar-row">
                <div className="bar-label">
                  <span style={{ fontWeight: 500 }}>📂 {cat}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxCategory) * 100}%`,
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
