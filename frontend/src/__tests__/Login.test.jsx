import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginView from '../components/LoginView';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
  },
}));

describe('LoginView Component', () => {
  it('debe renderizar el título de la pantalla de login por credenciales y los campos de entrada', () => {
    render(<LoginView onLogin={vi.fn()} />);

    expect(screen.getByText('IT Incident Hub')).toBeInTheDocument();
    expect(
      screen.getByText('Acceso Corporativo Seguro — Autenticación en Base de Datos PostgreSQL')
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario o Correo Corporativo')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
  });

  it('debe enviar la petición HTTP de login al backend con las credenciales ingresadas', async () => {
    const handleLoginMock = vi.fn();
    const mockAuthResponse = {
      id: 1,
      username: 'cgomez',
      fullName: 'Carlos Gomez',
      email: 'carlos.gomez.devops@incidenthub.io',
      role: 'ADMIN',
      token: 'session-admin-123',
    };

    api.login.mockResolvedValueOnce(mockAuthResponse);

    render(<LoginView onLogin={handleLoginMock} />);

    const userInput = screen.getByLabelText('Usuario o Correo Corporativo');
    const passInput = screen.getByLabelText('Contraseña');
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(userInput, { target: { value: 'cgomez' } });
    fireEvent.change(passInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        usernameOrEmail: 'cgomez',
        password: 'admin123',
      });
      expect(handleLoginMock).toHaveBeenCalledWith(mockAuthResponse, true);
    });
  });

  it('debe mostrar mensaje de error si el backend rechaza las credenciales', async () => {
    api.login.mockRejectedValueOnce(new Error('Credenciales inválidas en PostgreSQL'));

    render(<LoginView onLogin={vi.fn()} />);

    const userInput = screen.getByLabelText('Usuario o Correo Corporativo');
    const passInput = screen.getByLabelText('Contraseña');
    const submitBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });

    fireEvent.change(userInput, { target: { value: 'usuario_invalido' } });
    fireEvent.change(passInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas en PostgreSQL/i)).toBeInTheDocument();
    });
  });
});
