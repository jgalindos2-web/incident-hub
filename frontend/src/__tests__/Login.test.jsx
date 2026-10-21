import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginView from '../components/LoginView';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

describe('LoginView Component', () => {
  it('debe renderizar el título de la pantalla de login por credenciales y los campos de entrada', () => {
    render(<LoginView onLogin={vi.fn()} />);

    expect(screen.getByText('IT Incident Hub')).toBeInTheDocument();
    expect(
      screen.getByText('Acceso Corporativo Seguro — Autenticación en Base de Datos PostgreSQL')
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión →/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario o Correo Corporativo')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
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
    const submitBtn = screen.getByRole('button', { name: /^Iniciar Sesión →$/i });

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
    const submitBtn = screen.getByRole('button', { name: /^Iniciar Sesión →$/i });

    fireEvent.change(userInput, { target: { value: 'usuario_invalido' } });
    fireEvent.change(passInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Credenciales inválidas en PostgreSQL/i)).toBeInTheDocument();
    });
  });

  it('debe permitir cambiar a la pestaña de registro y registrar un usuario como TECHNICIAN o ADMIN', async () => {
    const handleLoginMock = vi.fn();
    const mockRegisterResponse = {
      id: 10,
      username: 'lmendoza',
      fullName: 'Laura Mendoza',
      email: 'laura@incidenthub.io',
      role: 'ADMIN',
      token: 'session-admin-456',
    };

    api.register.mockResolvedValueOnce(mockRegisterResponse);

    render(<LoginView onLogin={handleLoginMock} />);

    // Cambiar a la pestaña de registro
    const registerTabBtn = screen.getByRole('tab', { name: /Registrarse/i });
    fireEvent.click(registerTabBtn);

    // Validar campos de registro
    expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Corporativo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Laura Mendoza' } });
    fireEvent.change(screen.getByLabelText(/Nombre de Usuario/i), { target: { value: 'lmendoza' } });
    fireEvent.change(screen.getByLabelText(/Correo Corporativo/i), { target: { value: 'laura@incidenthub.io' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'segura123' } });

    // Seleccionar rol ADMIN
    const adminRoleBtn = screen.getByRole('button', { name: /Administrador/i });
    fireEvent.click(adminRoleBtn);

    const submitRegisterBtn = screen.getByRole('button', { name: /Registrar Usuario →/i });
    fireEvent.click(submitRegisterBtn);

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        fullName: 'Laura Mendoza',
        username: 'lmendoza',
        email: 'laura@incidenthub.io',
        password: 'segura123',
        role: 'ADMIN',
      });
    });
  });
});
