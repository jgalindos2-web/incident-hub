import { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboardView from './components/AdminDashboardView';
import TechnicianDashboardView from './components/TechnicianDashboardView';
import IncidentListView from './components/IncidentListView';
import IncidentDetailModal from './components/IncidentDetailModal';
import IncidentCreateModal from './components/IncidentCreateModal';
import LoginView from './components/LoginView';
import AuthGuard from './components/AuthGuard';
import { api } from './services/api';

export default function App() {
  // 1. Estado de autenticación y sesión persistente
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('incident_hub_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(localStorage.getItem('incident_hub_session'));
    } catch {
      return false;
    }
  });

  const [users, setUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filtros de búsqueda para incidentes
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    technicianId: '',
  });

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Manejador de Login exitoso
  const handleLogin = (authData, remember = true) => {
    const userObj = {
      id: authData.id,
      username: authData.username,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      token: authData.token,
    };

    setCurrentUser(userObj);
    setIsAuthenticated(true);

    if (remember) {
      try {
        localStorage.setItem('incident_hub_session', JSON.stringify(userObj));
      } catch {
        // ignore
      }
    }
    showToast(`Bienvenido/a, ${userObj.fullName} (${userObj.role})`);
  };

  // Manejador de Logout seguro
  const handleLogout = () => {
    try {
      localStorage.removeItem('incident_hub_session');
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIncidents([]);
    setStats(null);
    showToast('Sesión cerrada con éxito');
  };

  // Carga de datos reales desde el Backend HTTP y base de datos
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setErrorMessage('');

      // En el caso del técnico, los filtros se bloquean exclusivamente a sus asignaciones
      const currentFilters = currentUser.role === 'TECHNICIAN'
        ? { ...filters, technicianId: currentUser.id }
        : { ...filters };

      const statsPromise = currentUser.role === 'ADMIN'
        ? api.getDashboardStats()
        : api.getTechnicianDashboardStats(currentUser.id);

      const [incidentsData, statsData] = await Promise.all([
        api.getIncidents(currentFilters),
        statsPromise,
      ]);

      setIncidents(incidentsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error al sincronizar con el backend:', err);
      setErrorMessage(
        err.message || 'Error de comunicación con el backend REST. Verifique que el servicio esté activo.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser, filters]);

  // Eliminación de incidente (Exclusivo para ADMIN)
  const handleDeleteIncident = async (id) => {
    if (currentUser?.role !== 'ADMIN') {
      alert('Acceso denegado: solo el Administrador puede eliminar incidentes.');
      return;
    }

    if (!window.confirm(`¿Confirmas la eliminación permanente del Incidente #${id}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.deleteIncident(id);
      showToast(`Incidente #${id} eliminado permanentemente.`);
      loadData();
    } catch (err) {
      alert(`Error al eliminar incidente: ${err.message}`);
    }
  };

  // Carga del catálogo de usuarios para asignaciones
  useEffect(() => {
    if (isAuthenticated) {
      api.getUsers()
        .then((data) => setUsers(data || []))
        .catch((err) => console.warn('Error al cargar lista de usuarios:', err));
    }
  }, [isAuthenticated]);

  // Validación de vigencia de sesión al cargar
  useEffect(() => {
    if (currentUser?.id) {
      api.verifySession(currentUser.id)
        .catch(() => {
          console.warn('Sesión no encontrada en base de datos. Requiere nuevo login.');
          handleLogout();
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recarga reactiva de datos ante cambios de usuario o filtros
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadData();
    }
  }, [isAuthenticated, currentUser?.id, filters, loadData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Layout general para rutas protegidas
  const ProtectedLayout = () => (
    <div className="app-container">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      {errorMessage && (
        <div className="backend-error-banner" role="alert">
          <span>⚠️</span> <span>{errorMessage}</span>
          <button type="button" onClick={loadData} className="btn-retry">
            Reintentar
          </button>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      {/* Modal de Detalle y Operación de Incidente */}
      {selectedIncident && (
        <IncidentDetailModal
          incidentId={selectedIncident.id}
          onClose={() => setSelectedIncident(null)}
          currentUser={currentUser}
          users={users}
          onIncidentUpdated={() => {
            loadData();
            showToast('Incidente actualizado correctamente en PostgreSQL');
          }}
        />
      )}

      {/* Modal de Creación de Incidente (Solo ADMIN) */}
      {isCreateModalOpen && currentUser?.role === 'ADMIN' && (
        <IncidentCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          users={users}
          currentUser={currentUser}
          onIncidentCreated={() => {
            loadData();
            showToast('Nuevo incidente persistido en PostgreSQL');
          }}
        />
      )}

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Ruta Pública: Login */}
        <Route
          path="/login"
          element={
            isAuthenticated && currentUser ? (
              <Navigate
                to={currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/tech/dashboard'}
                replace
              />
            ) : (
              <>
                <LoginView onLogin={handleLogin} />
                {toastMessage && <div className="toast">{toastMessage}</div>}
              </>
            )
          }
        />

        {/* 2. Rutas Protegidas por Guardián de Autenticación */}
        <Route
          element={
            <AuthGuard isAuthenticated={isAuthenticated} currentUser={currentUser}>
              <ProtectedLayout />
            </AuthGuard>
          }
        >
          {/* Sub-rutas exclusivas para ADMIN */}
          <Route element={<AuthGuard isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={<AdminDashboardView stats={stats} />}
            />
            <Route
              path="/admin/incidents"
              element={
                <IncidentListView
                  title="Gestión Global de Incidentes"
                  subtitle="Supervisión completa, asignación técnica y auditoría general"
                  incidents={incidents}
                  filters={filters}
                  setFilters={setFilters}
                  users={users}
                  onSelectIncident={(item) => setSelectedIncident(item)}
                  onOpenCreateModal={() => setIsCreateModalOpen(true)}
                  onDeleteIncident={handleDeleteIncident}
                  loading={loading}
                  currentUser={currentUser}
                />
              }
            />
          </Route>

          {/* Sub-rutas exclusivas para TECHNICIAN */}
          <Route element={<AuthGuard isAuthenticated={isAuthenticated} currentUser={currentUser} allowedRoles={['TECHNICIAN']} />}>
            <Route
              path="/tech/dashboard"
              element={<TechnicianDashboardView currentUser={currentUser} stats={stats} />}
            />
            <Route
              path="/tech/incidents"
              element={
                <IncidentListView
                  title="Mis Asignaciones Directas"
                  subtitle={`Incidentes asignados a tu usuario (${currentUser?.fullName})`}
                  incidents={incidents}
                  filters={{ ...filters, technicianId: currentUser?.id }}
                  setFilters={setFilters}
                  users={users}
                  onSelectIncident={(item) => setSelectedIncident(item)}
                  onOpenCreateModal={null}
                  onDeleteIncident={null}
                  loading={loading}
                  currentUser={currentUser}
                />
              }
            />
          </Route>
        </Route>

        {/* 3. Redirección Raíz según sesión y rol */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                !isAuthenticated || !currentUser
                  ? '/login'
                  : currentUser.role === 'ADMIN'
                  ? '/admin/dashboard'
                  : '/tech/dashboard'
              }
              replace
            />
          }
        />

        {/* 4. Captura de 404 / Cualquier otra ruta */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                !isAuthenticated || !currentUser
                  ? '/login'
                  : currentUser.role === 'ADMIN'
                  ? '/admin/dashboard'
                  : '/tech/dashboard'
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
