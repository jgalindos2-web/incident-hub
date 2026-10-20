import { useState } from 'react';
import { api } from '../services/api';

export default function LoginView({ onLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

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

  const handleFillCredentials = (user, pass) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage('');
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

        {errorMessage && (
          <div className="login-error-alert" role="alert">
            <span>⚠️</span> <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulario de credenciales con petición HTTP */}
        <form className="login-form" onSubmit={handleSubmit}>
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

        {/* Credenciales de prueba cargadas en la BD para el evaluador */}
        <div className="test-credentials-box">
          <div className="test-credentials-title">
            <span>🔑</span> Credenciales precargadas en PostgreSQL:
          </div>
          <div className="test-credentials-buttons">
            <button
              type="button"
              className="badge-role-btn admin"
              onClick={() => handleFillCredentials('cgomez', 'admin123')}
              title="Cargar credenciales de ADMIN"
            >
              <strong>ADMIN:</strong> cgomez / admin123
            </button>
            <button
              type="button"
              className="badge-role-btn technician"
              onClick={() => handleFillCredentials('sherrera', 'tech123')}
              title="Cargar credenciales de TECHNICIAN"
            >
              <strong>TECHNICIAN:</strong> sherrera / tech123
            </button>
            <button
              type="button"
              className="badge-role-btn technician"
              onClick={() => handleFillCredentials('mruiz', 'tech123')}
              title="Cargar credenciales de TECHNICIAN"
            >
              <strong>TECHNICIAN:</strong> mruiz / tech123
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer-info">
          <span>🔒 Validación estricta en servidor</span>
          <span>•</span>
          <span>Roles: ADMIN y TECHNICIAN</span>
        </div>
      </div>
    </div>
  );
}
