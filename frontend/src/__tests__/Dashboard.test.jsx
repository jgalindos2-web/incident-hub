import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DashboardView from '../components/DashboardView';

describe('DashboardView Component', () => {
  const mockAdminStats = {
    totalIncidents: 12,
    openIncidents: 7,
    closedIncidents: 5,
    criticalIncidents: 2,
    categoryDistribution: {
      NETWORK: 5,
      SOFTWARE: 4,
      HARDWARE: 3,
    },
    technicianDistribution: {
      'Sofia Herrera': 4,
      'Carlos Gomez': 3,
    },
    statusDistribution: {
      NUEVO: 2,
      ASIGNADO: 3,
      EN_PROCESO: 2,
      RESUELTO: 3,
      CERRADO: 2,
    },
  };

  const mockTechStats = {
    totalIncidents: 6,
    openIncidents: 4,
    closedIncidents: 2,
    criticalIncidents: 1,
    categoryDistribution: {
      NETWORK: 3,
      SOFTWARE: 3,
    },
    technicianDistribution: {
      'Mis Asignaciones': 6,
    },
    statusDistribution: {
      ASIGNADO: 2,
      EN_PROCESO: 2,
      RESUELTO: 2,
    },
  };

  it('debe renderizar la vista de Centro de Comando cuando el rol es ADMIN', () => {
    const adminUser = { id: 1, role: 'ADMIN', fullName: 'Carlos Gomez', username: 'cgomez' };
    render(
      <MemoryRouter>
        <DashboardView
          currentUser={adminUser}
          stats={mockAdminStats}
          onOpenIncidents={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Centro de Comando Operativo TI')).toBeInTheDocument();
    expect(screen.getByText('👑 Vista de Administración Global')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // Total global
    expect(screen.getByText('7')).toBeInTheDocument(); // Abiertos
    expect(screen.getByText('Balance de Carga por Técnico Especialista')).toBeInTheDocument();
    expect(screen.getByText('Incidencias por Categoría de Infraestructura')).toBeInTheDocument();
  });

  it('debe renderizar el panel operativo personal cuando el rol es TECHNICIAN', () => {
    const techUser = { id: 2, role: 'TECHNICIAN', fullName: 'Sofia Herrera', username: 'sherrera' };
    render(
      <MemoryRouter>
        <DashboardView
          currentUser={techUser}
          stats={mockTechStats}
          onOpenIncidents={vi.fn()}
          onOpenMyIncidents={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Panel de Técnico: Sofia Herrera')).toBeInTheDocument();
    expect(screen.getByText('🛠️ Mi Bandeja de Trabajo Personal')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // Total mis tickets
    expect(screen.getByText('4')).toBeInTheDocument(); // Mis pendientes
    expect(screen.getByText('Estado de Mis Asignaciones')).toBeInTheDocument();
    expect(screen.getByText('Mis Incidentes por Especialidad')).toBeInTheDocument();
  });
});
