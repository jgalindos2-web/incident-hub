import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IncidentListView from '../components/IncidentListView';

describe('IncidentListView Component - IT Incident Hub', () => {
  const mockIncidents = [
    {
      id: 101,
      title: 'Falla de conexion switch sala 4',
      category: 'NETWORK',
      priority: 'CRITICA',
      status: 'EN_PROCESO',
      reporterName: 'Carlos Gomez',
      assignedTechnician: { id: 2, fullName: 'Sofia Herrera' },
      createdAt: '2026-03-10T10:30:00Z',
    },
  ];

  const mockUsers = [
    { id: 1, fullName: 'Carlos Gomez', role: 'ADMIN' },
    { id: 2, fullName: 'Sofia Herrera', role: 'TECHNICIAN' },
  ];

  const adminUser = {
    id: 1,
    username: 'cgomez',
    fullName: 'Carlos Gomez',
    role: 'ADMIN',
  };

  const technicianUser = {
    id: 2,
    username: 'sherrera',
    fullName: 'Sofia Herrera',
    role: 'TECHNICIAN',
  };

  const defaultFilters = { status: '', priority: '', category: '', technicianId: '' };

  it('debe renderizar el título de la vista y el botón de nuevo incidente cuando el usuario es ADMIN', () => {
    const handleOpenCreateModal = vi.fn();

    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        onOpenCreateModal={handleOpenCreateModal}
        loading={false}
        currentUser={adminUser}
      />
    );

    expect(screen.getByText('Registro de Incidentes')).toBeInTheDocument();
    const createBtn = screen.getByRole('button', { name: /Nuevo Incidente/i });
    expect(createBtn).toBeInTheDocument();

    fireEvent.click(createBtn);
    expect(handleOpenCreateModal).toHaveBeenCalledTimes(1);
  });

  it('NO debe mostrar el botón de nuevo incidente para usuarios con rol TECHNICIAN', () => {
    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        onOpenCreateModal={vi.fn()}
        loading={false}
        currentUser={technicianUser}
      />
    );

    expect(screen.getByText('Registro de Incidentes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo Incidente/i })).not.toBeInTheDocument();
  });

  it('debe mostrar la fila del incidente con su id, título, categoría, prioridad y estado', () => {
    const onSelectMock = vi.fn();

    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={onSelectMock}
        loading={false}
        currentUser={adminUser}
      />
    );

    // Verificar ID con formato badge #101
    expect(screen.getByText('#101')).toBeInTheDocument();
    // Verificar título del incidente
    expect(screen.getByText('Falla de conexion switch sala 4')).toBeInTheDocument();
    // Verificar categoría, prioridad y estado
    expect(screen.getByText('NETWORK')).toBeInTheDocument();
    expect(screen.getByText('CRITICA')).toBeInTheDocument();
    expect(screen.getByText('EN_PROCESO')).toBeInTheDocument();
    // Verificar reportero y técnico asignado
    expect(screen.getByText('Carlos Gomez')).toBeInTheDocument();
    expect(screen.getByText('Sofia Herrera')).toBeInTheDocument();

    // Simular click en la fila del incidente
    const rowTitle = screen.getByText('Falla de conexion switch sala 4');
    fireEvent.click(rowTitle);
    expect(onSelectMock).toHaveBeenCalledWith(mockIncidents[0]);
  });

  it('debe mostrar el estado de carga mientras se obtienen los datos', () => {
    render(
      <IncidentListView
        incidents={[]}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        loading={true}
        currentUser={adminUser}
      />
    );

    expect(screen.getByText(/Cargando incidentes desde la base de datos/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no existen incidentes con los filtros seleccionados', () => {
    render(
      <IncidentListView
        incidents={[]}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        loading={false}
        currentUser={adminUser}
      />
    );

    expect(
      screen.getByText(/No se encontraron incidentes que coincidan con los filtros aplicados/i)
    ).toBeInTheDocument();
  });

  it('debe permitir restablecer filtros al hacer clic en Limpiar Filtros', () => {
    const setFiltersMock = vi.fn();

    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={{ status: 'EN_PROCESO', priority: 'CRITICA', category: 'NETWORK', technicianId: '2' }}
        setFilters={setFiltersMock}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        loading={false}
        currentUser={adminUser}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Limpiar Filtros/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);

    expect(setFiltersMock).toHaveBeenCalledWith({
      status: '',
      priority: '',
      category: '',
      technicianId: '',
    });
  });
});
