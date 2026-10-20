/**
 * Seed data precargado para demostración y fallback del Frontend
 * Permite observar la aplicación con datos completos desde el primer segundo.
 */

export const INITIAL_USERS = [
  {
    id: 1,
    username: 'jgalindos2',
    fullName: 'Juan Carlos Galindo S.',
    email: 'jgalindos2@miumg.edu.gt',
    role: 'FULL_STACK_LEAD',
    roleLabel: 'Full Stack Tech Lead',
    avatar: '👨‍💻',
  },
  {
    id: 2,
    username: 'josecgalindos1',
    fullName: 'Jose C. Galindo S.',
    email: 'josecgalindos1@gmail.com',
    role: 'BACKEND_DEV',
    roleLabel: 'Backend Developer',
    avatar: '⚙️',
  },
  {
    id: 3,
    username: 'galindojosecarlos1',
    fullName: 'Jose Carlos Galindo',
    email: 'galindojosecarlos1@gmail.com',
    role: 'FRONTEND_DEV',
    roleLabel: 'Frontend Developer',
    avatar: '🎨',
  },
  {
    id: 4,
    username: 'cgomez',
    fullName: 'Carlos Gomez',
    email: 'carlos.gomez.devops@incidenthub.io',
    role: 'DEVOPS_LEAD',
    roleLabel: 'DevOps & SRE Lead',
    avatar: '🚀',
  },
  {
    id: 5,
    username: 'sherrera',
    fullName: 'Sofia Herrera',
    email: 'sofia.herrera.frontend@incidenthub.io',
    role: 'FRONTEND_DEV',
    roleLabel: 'Frontend Developer',
    avatar: '💻',
  },
  {
    id: 6,
    username: 'mruiz',
    fullName: 'Mateo Ruiz',
    email: 'mateo.ruiz.qa@incidenthub.io',
    role: 'QA_ENGINEER',
    roleLabel: 'QA Engineer',
    avatar: '🧪',
  },
];

export const INITIAL_INCIDENTS = [
  {
    id: 101,
    title: 'Falla en router perimetral y switches troncales piso 3',
    description: 'Pérdida intermitente de paquetes y caída de conexión cableada y WiFi en el departamento de Operaciones y Finanzas.',
    category: 'NETWORK',
    priority: 'CRITICA',
    status: 'EN_PROCESO',
    reporterName: 'Beatriz Mendoza',
    assignedTechnician: {
      id: 1,
      fullName: 'Juan Carlos Galindo S.',
      email: 'jgalindos2@miumg.edu.gt',
      role: 'FULL_STACK_LEAD',
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    comments: [
      {
        id: 1,
        authorName: 'Beatriz Mendoza',
        message: 'Incidente crítico reportado por corte en enlace troncal del piso 3.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 2,
        authorName: 'Juan Carlos Galindo S.',
        message: 'Asignado al incidente. Analizando logs en switch Cisco Nexus y monitoreo SNMP.',
        actionType: 'ASSIGNMENT',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 3,
        authorName: 'Juan Carlos Galindo S.',
        message: 'Detectado fallo en módulo SFP de fibra óptica. Procediendo con el reemplazo en caliente.',
        actionType: 'STATUS_CHANGE',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 102,
    title: 'Error 502 Bad Gateway intermitente en cluster Kubernetes',
    description: 'El ingress controller de Kubernetes arroja 502 en peticiones al microservicio de facturación durante picos de carga.',
    category: 'SOFTWARE',
    priority: 'ALTA',
    status: 'ASIGNADO',
    reporterName: 'Carlos Gomez',
    assignedTechnician: {
      id: 2,
      fullName: 'Jose C. Galindo S.',
      email: 'josecgalindos1@gmail.com',
      role: 'BACKEND_DEV',
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    comments: [
      {
        id: 4,
        authorName: 'Carlos Gomez',
        message: 'Alerta disparada desde Prometheus: HTTP 502 rate > 5% en ingress-nginx.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: 5,
        authorName: 'Jose C. Galindo S.',
        message: 'Tomando ticket para revisar pool de conexiones HikariCP y ajustar límites de CPU/Memoria en pods.',
        actionType: 'ASSIGNMENT',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    id: 103,
    title: 'Pantalla blanca tras actualización en módulo de Incidentes',
    description: 'En navegadores Safari antiguos se produce un error en el renderizado de gráficos por incompatibilidad de sintaxis.',
    category: 'SOFTWARE',
    priority: 'MEDIA',
    status: 'EN_PROCESO',
    reporterName: 'Mateo Ruiz',
    assignedTechnician: {
      id: 3,
      fullName: 'Jose Carlos Galindo',
      email: 'galindojosecarlos1@gmail.com',
      role: 'FRONTEND_DEV',
    },
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    comments: [
      {
        id: 6,
        authorName: 'Mateo Ruiz',
        message: 'Reporte de QA: TypeError detectado en consola al abrir modal de detalle.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 7,
        authorName: 'Jose Carlos Galindo',
        message: 'Revisando babel plugins y polyfills en la compilación Vite para retrocompatibilidad.',
        actionType: 'STATUS_CHANGE',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: 104,
    title: 'Acceso VPN denegado a contratistas externos por certificados',
    description: 'Los certificados SSL intermedios en el concentrador VPN expiraron, impidiendo la autenticación RADIUS.',
    category: 'SECURITY',
    priority: 'CRITICA',
    status: 'NUEVO',
    reporterName: 'Fernando Diaz',
    assignedTechnician: null,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    comments: [
      {
        id: 8,
        authorName: 'Fernando Diaz',
        message: 'Bloqueo reportado por 15 desarrolladores remotos de proveedor externo.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ],
  },
  {
    id: 105,
    title: 'Monitor parpadea y teclado derramó líquido de limpieza',
    description: 'El puesto de trabajo #18 en la sala de operaciones requiere reemplazo preventivo de periféricos dañados.',
    category: 'HARDWARE',
    priority: 'BAJA',
    status: 'RESUELTO',
    reporterName: 'Beatriz Mendoza',
    assignedTechnician: {
      id: 4,
      fullName: 'Carlos Gomez',
      email: 'carlos.gomez.devops@incidenthub.io',
      role: 'DEVOPS_LEAD',
    },
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    resolutionNotes: 'Se entregó monitor HDMI nuevo de 24 pulgadas y teclado mecánico ergonómico desde bodega.',
    comments: [
      {
        id: 9,
        authorName: 'Beatriz Mendoza',
        message: 'Falla física de periféricos.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 10,
        authorName: 'Carlos Gomez',
        message: 'Hardware reemplazado y verificado con el usuario final.',
        actionType: 'STATUS_CHANGE',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
  },
  {
    id: 106,
    title: 'Renovación de licencias de IDE y herramientas DevOps',
    description: 'Las licencias de JetBrains y Docker Desktop para el escuadrón de desarrollo vencen esta semana.',
    category: 'SOFTWARE',
    priority: 'MEDIA',
    status: 'CERRADO',
    reporterName: 'Juan Carlos Galindo S.',
    assignedTechnician: {
      id: 6,
      fullName: 'Mateo Ruiz',
      email: 'mateo.ruiz.qa@incidenthub.io',
      role: 'QA_ENGINEER',
    },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    resolutionNotes: 'Renovación corporativa completada por el área de compras y activada vía LDAP.',
    comments: [
      {
        id: 11,
        authorName: 'Juan Carlos Galindo S.',
        message: 'Solicitud enviada a compras con aprobación de gerencia de TI.',
        actionType: 'CREATION',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 12,
        authorName: 'Mateo Ruiz',
        message: 'Claves distribuidas y validadas con los 6 desarrolladores del equipo.',
        actionType: 'STATUS_CHANGE',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
    ],
  },
];

export function computeMockStats(incidentsList = INITIAL_INCIDENTS) {
  const total = incidentsList.length;
  const open = incidentsList.filter(
    (i) => i.status === 'NUEVO' || i.status === 'ASIGNADO' || i.status === 'EN_PROCESO'
  ).length;
  const closed = incidentsList.filter(
    (i) => i.status === 'RESUELTO' || i.status === 'CERRADO'
  ).length;
  const critical = incidentsList.filter((i) => i.priority === 'CRITICA').length;

  const categoryDistribution = {};
  const technicianDistribution = {};

  incidentsList.forEach((inc) => {
    categoryDistribution[inc.category] = (categoryDistribution[inc.category] || 0) + 1;
    if (inc.assignedTechnician?.fullName) {
      const tech = inc.assignedTechnician.fullName;
      technicianDistribution[tech] = (technicianDistribution[tech] || 0) + 1;
    }
  });

  return {
    totalIncidents: total,
    openIncidents: open,
    closedIncidents: closed,
    criticalIncidents: critical,
    categoryDistribution,
    technicianDistribution,
  };
}
