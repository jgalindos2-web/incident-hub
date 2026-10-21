import { useState } from 'react';
import { api } from '../services/api';

export default function LoginView({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // Estados de Login
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Estados de Registro
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('TECHNICIAN'); // 'TECHNICIAN' | 'ADMIN'
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Estados globales de retroalimentación
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameOrEmail.trim()) {
      setErrorMessage('Por favor ingrese su usuario o correo corporativo.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Por favor ingrese su contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      // Petición HTTP real al Backend para validar contra PostgreSQL
      const authData = await api.login({
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      onLogin(authData, rememberMe);
    } catch (err) {
      setErrorMessage(
        err.data?.message || err.message || 'Error al autenticar credenciales en la base de datos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Por favor ingrese su nombre completo.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMessage('Por favor ingrese un nombre de usuario.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Por favor ingrese su correo corporativo.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      // Petición HTTP real de registro al Backend
      const authData = await api.register({
        username: regUsername.trim(),
        password: regPassword.trim(),
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        role: regRole,
      });

      setSuccessMessage(
        `¡Usuario '${authData.username}' (${authData.role}) registrado exitosamente en PostgreSQL!`
      );

      // Iniciar sesión automáticamente con el token de sesión retornado por el backend
      setTimeout(() => {
        onLogin(authData, true);
      }, 700);
    } catch (err) {
      setErrorMessage(
        err.data?.message || err.message || 'Error al registrar el usuario en la base de datos.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card-container">
        {/* Header / Brand */}
        <div className="login-header">
          <div className="login-logo-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
            </svg>
          </div>
          <h1 className="login-title">IT Incident Hub</h1>
          <p className="login-subtitle">
            Acceso Corporativo Seguro — Autenticación en Base de Datos PostgreSQL
          </p>
          <div className="login-badge-tag">Autenticación REST v1.0.0</div>
        </div>

        {/* Pestañas de Login y Registro con soporte de accesibilidad */}
        <div className="login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`login-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
            id="tab-btn-login"
          >
            🔑 Iniciar Sesión
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`login-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
            id="tab-btn-register"
          >
            👤 Registrarse
          </button>
        </div>

        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <span>⚠️</span> <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="login-success-alert" role="alert">
            <span>✅</span> <span>{successMessage}</span>
          </div>
        )}

        {/* =========================================================================
            PESTAÑA 1: INICIAR SESIÓN
            ========================================================================= */}
        {activeTab === 'login' && (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="login-username">Usuario o Correo Corporativo</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="login-username"
                  type="text"
                  placeholder="ej. cgomez o sherrera"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>Recordar sesión</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-login-submit"
              id="btn-submit-login"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>⏳ Verificando en PostgreSQL...</span>
              ) : (
                <span>Iniciar Sesión &rarr;</span>
              )}
            </button>
          </form>
        )}

        {/* =========================================================================
            PESTAÑA 2: REGISTRO DE USUARIOS (ADMIN O TECHNICIAN)
            ========================================================================= */}
        {activeTab === 'register' && (
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="register-fullname">Nombre Completo</label>
              <div className="input-with-icon">
                <span className="input-icon">📛</span>
                <input
                  id="register-fullname"
                  type="text"
                  placeholder="ej. Laura Mendoza"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-username">Nombre de Usuario</label>
              <div className="input-with-icon">
                <span className="input-icon">👤</span>
                <input
                  id="register-username"
                  type="text"
                  placeholder="ej. lmendoza"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  autoComplete="username"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Correo Corporativo</label>
              <div className="input-with-icon">
                <span className="input-icon">✉️</span>
                <input
                  id="register-email"
                  type="email"
                  placeholder="ej. laura.mendoza@incidenthub.io"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Contraseña (Mínimo 6 caracteres)</label>
              <div className="input-with-icon">
                <span className="input-icon">🔒</span>
                <input
                  id="register-password"
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  title={showRegPassword ? 'Ocultar' : 'Mostrar'}
                  tabIndex={-1}
                >
                  {showRegPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Rol Asignado en el Sistema</label>
              <div className="role-selector-group">
                <button
                  type="button"
                  className={`role-option-btn ${regRole === 'TECHNICIAN' ? 'selected' : ''}`}
                  onClick={() => setRegRole('TECHNICIAN')}
                  id="btn-role-technician"
                >
                  <span>🛠️ Técnico IT</span>
                  <small>TECHNICIAN: Soporte y resolución</small>
                </button>
                <button
                  type="button"
                  className={`role-option-btn ${regRole === 'ADMIN' ? 'selected' : ''}`}
                  onClick={() => setRegRole('ADMIN')}
                  id="btn-role-admin"
                >
                  <span>👑 Administrador</span>
                  <small>ADMIN: Gestión total y asignación</small>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login-submit"
              id="btn-submit-register"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>⏳ Registrando en PostgreSQL...</span>
              ) : (
                <span>Registrar Usuario &rarr;</span>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="login-footer-info">
          <span>🔒 Validación estricta en servidor</span>
          <span>•</span>
          <span>Roles soportados: ADMIN y TECHNICIAN</span>
        </div>
      </div>
    </div>
  );
}
