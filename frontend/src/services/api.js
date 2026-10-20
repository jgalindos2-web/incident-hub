/**
 * REST API Client para IT Incident Hub.
 * Todas las operaciones se realizan mediante peticiones HTTP reales al Backend
 * y garantizan persistencia real en la base de datos PostgreSQL.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

function getSessionHeaders() {
  try {
    const saved = localStorage.getItem('incident_hub_session');
    if (saved) {
      const user = JSON.parse(saved);
      return {
        'X-User-Role': user.role || '',
        'X-User-Id': user.id ? String(user.id) : '',
        'Authorization': user.token ? `Bearer ${user.token}` : '',
      };
    }
  } catch {
    // ignore
  }
  return {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getSessionHeaders(),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `Error HTTP ${response.status}: ${response.statusText}` };
    }
    const err = new Error(errorData.message || 'Error en la petición al servidor');
    err.status = response.status;
    err.data = errorData;
    throw err;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Autenticación con credenciales reales contra la base de datos
  login: async ({ usernameOrEmail, password }) => {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    });
  },

  // Verificación de sesión en base de datos
  verifySession: async (userId) => {
    return await request(`/auth/verify/${userId}`);
  },

  // Catálogo de usuarios y técnicos
  getUsers: async () => {
    return await request('/users');
  },

  getUserById: async (id) => {
    return await request(`/users/${id}`);
  },

  // Incidentes con filtros
  getIncidents: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);
    if (filters.technicianId) params.append('technicianId', filters.technicianId);

    const qs = params.toString();
    return await request(`/incidents${qs ? `?${qs}` : ''}`);
  },

  getIncidentById: async (id) => {
    return await request(`/incidents/${id}`);
  },

  createIncident: async (incidentData) => {
    return await request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  updateStatus: async (id, { status, authorName, notes }) => {
    return await request(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, authorName, notes }),
    });
  },

  assignTechnician: async (id, { technicianId, assignedByName }) => {
    return await request(`/incidents/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianId, assignedByName }),
    });
  },

  // Eliminación de incidentes (Exclusivo ADMIN)
  deleteIncident: async (id) => {
    return await request(`/incidents/${id}`, {
      method: 'DELETE',
    });
  },

  // Bitácora y comentarios
  addComment: async (id, { authorName, message, actionType = 'COMMENT' }) => {
    return await request(`/incidents/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ authorName, message, actionType }),
    });
  },

  getComments: async (id) => {
    return await request(`/incidents/${id}/comments`);
  },

  // Dashboard Global (Para ADMIN)
  getDashboardStats: async () => {
    return await request('/dashboard/stats');
  },

  // Dashboard Personal (Para TECHNICIAN)
  getTechnicianDashboardStats: async (technicianId) => {
    return await request(`/dashboard/stats/technician/${technicianId}`);
  },
};
