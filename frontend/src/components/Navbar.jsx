import { NavLink } from 'react-router-dom';

export default function Navbar({ currentUser, onLogout }) {
  const isAdmin = currentUser?.role === 'ADMIN';

  return (
    <header className="navbar">
      <div className="brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>
        <span className="brand-text">IT Incident Hub</span>
        <span className="brand-badge">v1.0.0</span>
      </div>

      <nav className="nav-links">
        {/* Rutas exclusivas para ADMIN */}
        {isAdmin ? (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              id="nav-admin-dashboard-btn"
            >
              📊 Dashboard Global
            </NavLink>
            <NavLink
              to="/admin/incidents"
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              id="nav-admin-incidents-btn"
            >
              📋 Todos los Incidentes
            </NavLink>
          </>
        ) : (
          /* Rutas exclusivas para TECHNICIAN (Sin acceso a bandeja general) */
          <>
            <NavLink
              to="/tech/dashboard"
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              id="nav-tech-dashboard-btn"
            >
              📊 Mi Dashboard
            </NavLink>
            <NavLink
              to="/tech/incidents"
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              id="nav-tech-incidents-btn"
            >
              🛠️ Mis Asignaciones
            </NavLink>
          </>
        )}

        {/* Perfil del usuario activo con su rol */}
        {currentUser && (
          <div className="user-profile-badge" title={`Conectado como ${currentUser.email}`}>
            <span className="user-profile-avatar">
              {isAdmin ? '👑' : '👨‍💻'}
            </span>
            <div className="user-profile-info">
              <span className="user-profile-name">{currentUser.fullName}</span>
              <span className={`badge-role-tag role-${currentUser.role}`}>
                {currentUser.role}
              </span>
            </div>
          </div>
        )}

        {/* Botón de Logout seguro */}
        {onLogout && (
          <button
            type="button"
            className="btn-logout"
            onClick={onLogout}
            id="btn-nav-logout"
            title="Cerrar sesión y redirigir a Login"
          >
            <span>⎋</span> Cerrar Sesión
          </button>
        )}
      </nav>
    </header>
  );
}
