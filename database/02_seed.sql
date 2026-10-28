-- ========================================================
-- IT Incident Hub - Seed Data
-- ========================================================

-- Insert mock technicians / system users
-- Nota: Contraseñas almacenadas con hash seguro BCrypt (Equivalentes en texto claro: admin123 para ADMIN, tech123 para TECHNICIAN)
INSERT INTO app_users (username, password, full_name, email, role) VALUES
('cgomez', '$2a$10$sPeffxHz7RqSeT6y5iGJvuVlBIkBK9yR0I4nSsKNwwSZGH1k/zN82', 'Carlos Gomez', 'carlos.gomez.devops@incidenthub.io', 'ADMIN'),
('admin', '$2a$10$sPeffxHz7RqSeT6y5iGJvuVlBIkBK9yR0I4nSsKNwwSZGH1k/zN82', 'Administrador General', 'admin@incidenthub.io', 'ADMIN'),
('sherrera', '$2a$10$yuZfg/LMNrQff/bB5JAzE.UFk6rVQ6DHJqQ3tFGrsbiEUkK1QmXRe', 'Sofia Herrera', 'sofia.herrera.frontend@incidenthub.io', 'TECHNICIAN'),
('mruiz', '$2a$10$yuZfg/LMNrQff/bB5JAzE.UFk6rVQ6DHJqQ3tFGrsbiEUkK1QmXRe', 'Mateo Ruiz', 'mateo.ruiz.qa@incidenthub.io', 'TECHNICIAN'),
('arodriguez', '$2a$10$yuZfg/LMNrQff/bB5JAzE.UFk6rVQ6DHJqQ3tFGrsbiEUkK1QmXRe', 'Alejandro Rodriguez', 'alejandro.r@incidenthub.io', 'TECHNICIAN')
ON CONFLICT (username) DO NOTHING;


-- Insert initial sample incidents
INSERT INTO incidents (title, description, category, priority, status, reporter_name, assigned_technician_id, created_at)
VALUES
('Falla en router principal piso 3', 'Los usuarios de contabilidad no tienen conexión cableada ni WiFi desde las 8:30 AM.', 'NETWORK', 'CRITICA', 'EN_PROCESO', 'Laura Mendoza', 2, CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('Licencia de IDE expirada para equipo QA', 'Se requiere renovación urgente de licencias de desarrollo para 5 puestos.', 'SOFTWARE', 'MEDIA', 'ASIGNADO', 'Mateo Ruiz', 3, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Servidor de staging no responde a healthchecks', 'El contenedor backend en staging lanza error 502 Bad Gateway intermitente.', 'SOFTWARE', 'ALTA', 'NUEVO', 'Carlos Gomez', NULL, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('Teclado y monitor dañados en puesto 14', 'Pantalla parpadea y teclado derramó líquido de limpieza.', 'HARDWARE', 'BAJA', 'RESUELTO', 'Beatriz Peña', 4, CURRENT_TIMESTAMP - INTERVAL '2 days'),
('Acceso VPN denegado a contratistas externos', 'Certificados SSL expirados en el concentrador VPN corporativo.', 'SECURITY', 'CRITICA', 'CERRADO', 'Fernando Diaz', 1, CURRENT_TIMESTAMP - INTERVAL '4 days');

-- Insert initial audit and comment logs
INSERT INTO incident_comments (incident_id, author_name, message, action_type, created_at)
VALUES
(1, 'Laura Mendoza', 'Incidente reportado por pérdida total de conexión en el piso 3.', 'CREATION', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
(1, 'Sofia Herrera', 'Asignado a Sofia Herrera. Procediendo a reiniciar switches perimetrales.', 'ASSIGNMENT', CURRENT_TIMESTAMP - INTERVAL '2 hours 30 minutes'),
(1, 'Sofia Herrera', 'Switch principal responde a ICMP pero interfaz de fibra presenta CRC errors. Reemplazando cable patchcord.', 'STATUS_CHANGE', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
(4, 'Beatriz Peña', 'Incidente reportado.', 'CREATION', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 'Alejandro Rodriguez', 'Monitor y periféricos reemplazados por repuestos de inventario bodega B.', 'STATUS_CHANGE', CURRENT_TIMESTAMP - INTERVAL '1 day 22 hours'),
(5, 'Fernando Diaz', 'Alerta crítica por bloqueo de contratistas.', 'CREATION', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(5, 'Carlos Gomez', 'Renovado el wildcard certificate y reiniciado el daemon OpenVPN.', 'STATUS_CHANGE', CURRENT_TIMESTAMP - INTERVAL '3 days 20 hours'),
(5, 'Carlos Gomez', 'Validado acceso por parte de 3 contratistas. Caso cerrado.', 'STATUS_CHANGE', CURRENT_TIMESTAMP - INTERVAL '3 days 18 hours');
