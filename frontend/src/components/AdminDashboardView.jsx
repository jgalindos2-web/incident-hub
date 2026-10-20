import { useNavigate } from 'react-router-dom';

export default function AdminDashboardView({ stats, onOpenIncidents }) {
  const navigate = useNavigate();
  const handleGoToIncidents = onOpenIncidents || (() => navigate('/admin/incidents'));

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Cargando métricas globales del sistema desde la base de datos...
      </div>
    );
  }

  const categoryEntries = Object.entries(stats.categoryDistribution || {});
  const techEntries = Object.entries(stats.technicianDistribution || {});
  const maxCategory = Math.max(...categoryEntries.map(([, v]) => v), 1);
  const maxTech = Math.max(...techEntries.map(([, v]) => v), 1);

  // Cálculo de ratio de resolución global
  const resolutionRate = stats.totalIncidents > 0
    ? Math.round((stats.closedIncidents / stats.totalIncidents) * 100)
    : 0;

  return (
    <div className="admin-dashboard-view">
      {/* Header específico de ADMIN */}
      <div className="view-header">
        <div className="view-title">
          <div className="role-tag-header admin-badge">👑 Vista de Administración Global</div>
          <h1>Centro de Comando Operativo TI</h1>
          <p>Supervisión consolidada de incidentes corporativos, distribución técnica y control de SLA</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleGoToIncidents} id="admin-view-all-incidents-btn">
            Gestionar Todos los Incidentes &rarr;
          </button>
        </div>
      </div>

      {/* KPI Cards Globales */}
      <div className="stats-grid admin-kpis">
        <div className="stat-card total">
          <div className="stat-header">
            <span>Total Global en BD</span>
            <span>🏢</span>
          </div>
          <div className="stat-value">{stats.totalIncidents}</div>
          <div className="stat-subtext">Histórico completo de tickets</div>
        </div>

        <div className="stat-card open">
          <div className="stat-header">
            <span>Tickets Activos en Cola</span>
            <span>⏳</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {stats.openIncidents}
          </div>
          <div className="stat-subtext">Nuevos, Asignados y En Proceso</div>
        </div>

        <div className="stat-card closed">
          <div className="stat-header">
            <span>Resueltos / Cerrados</span>
            <span>✅</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            {stats.closedIncidents}
          </div>
          <div className="stat-subtext">Tasa de resolución: {resolutionRate}%</div>
        </div>

        <div className="stat-card critical">
          <div className="stat-header">
            <span>Incidentes Críticos</span>
            <span>🚨</span>
          </div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {stats.criticalIncidents}
          </div>
          <div className="stat-subtext">Prioridad máxima que impacta negocio</div>
        </div>
      </div>

      {/* Charts Section: Workload & Categories */}
      <div className="charts-grid">
        {/* Distribución de Carga por Técnico */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Balance de Carga por Técnico Especialista</h3>
              <p className="chart-sub">Mapeo de asignaciones actuales para evitar cuellos de botella</p>
            </div>
            <span className="badge-pill">Supervisión</span>
          </div>
          {techEntries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
              Sin técnicos con tickets asignados actualmente en la base de datos.
            </p>
          ) : (
            techEntries.map(([tech, count]) => (
              <div key={tech} className="bar-row">
                <div className="bar-label">
                  <span style={{ fontWeight: 500 }}>👨‍💻 {tech}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {count} ticket{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxTech) * 100}%`,
                      background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                    }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Distribución por Categoría Corporativa */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Incidencias por Categoría de Infraestructura</h3>
              <p className="chart-sub">Volumen de fallas por dominio tecnológico</p>
            </div>
            <span className="badge-pill">Frecuencia</span>
          </div>
          {categoryEntries.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
              Sin categorías registradas en la base de datos.
            </p>
          ) : (
            categoryEntries.map(([cat, count]) => (
              <div key={cat} className="bar-row">
                <div className="bar-label">
                  <span style={{ fontWeight: 500 }}>📂 {cat}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(count / maxCategory) * 100}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
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
