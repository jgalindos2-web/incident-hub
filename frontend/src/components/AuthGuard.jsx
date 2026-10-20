import { Navigate, useLocation, Outlet } from 'react-router-dom';

/**
 * Guardián de Rutas y Navegación para React Router con control RBAC.
 *
 * 1. Intercepta cualquier intento de navegación sin sesión activa e impide el acceso
 *    a rutas protegidas, redirigiendo obligatoriamente a /login.
 * 2. Valida la autorización por rol (ADMIN vs TECHNICIAN). Si un técnico intenta
 *    ingresar por URL a una ruta de ADMIN (ej. /admin/incidents o /admin/dashboard),
 *    es bloqueado y redirigido a su propio panel autorizado (/tech/dashboard).
 */
export default function AuthGuard({ isAuthenticated, currentUser, allowedRoles, children }) {
  const location = useLocation();

  // 1. Guardián de autenticación: Bloqueo total si no hay sesión activa
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Guardián de autorización por rol (RBAC)
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const fallbackPath = currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/tech/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return children || <Outlet />;
}
