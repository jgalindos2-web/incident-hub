import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import IncidentListView from '../components/IncidentListView';

describe('IncidentListView Component', () => {
  const mockIncidents = [
    {
      id: 101,
      title: 'Falla de conexion switch sala 4',
      category: 'NETWORK',
      priority: 'CRITICA',
      status: 'EN_PROCESO',
      reporterName: 'Carlos Gomez',
      assignedTechnician: { id: 2, fullName: 'Sofia Herrera' },
      createdAt: new Date().toISOString(),
    },
  ];

  const mockUsers = [
    { id: 1, fullName: 'Carlos Gomez' },
    { id: 2, fullName: 'Sofia Herrera' },
  ];

  const defaultFilters = { status: '', priority: '', category: '', technicianId: '' };

  it('debe renderizar el título de la vista y el botón de nuevo incidente', () => {
    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={vi.fn()}
        onOpenCreateModal={vi.fn()}
        loading={false}
      />
    );

    expect(screen.getByText('Registro de Incidentes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo Incidente/i })).toBeInTheDocument();
  });

  it('debe mostrar la fila del incidente con su id, título y estado', () => {
    const onSelectMock = vi.fn();

    render(
      <IncidentListView
        incidents={mockIncidents}
        filters={defaultFilters}
        setFilters={vi.fn()}
        users={mockUsers}
        onSelectIncident={onSelectMock}
        loading={false}
      />
    );

    expect(screen.getByText('#101')).toBeInTheDocument();
    expect(screen.getByText('Falla de conexion switch sala 4')).toBeInTheDocument();
    expect(screen.getAllByText('CRITICA').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('EN_PROCESO').length).toBeGreaterThanOrEqual(1);

    // Simular click en la fila
    fireEvent.click(screen.getByText('Falla de conexion switch sala 4'));
    expect(onSelectMock).toHaveBeenCalledWith(mockIncidents[0]);
  });
});
