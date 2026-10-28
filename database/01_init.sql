-- ========================================================
-- IT Incident Hub - Database Initialization Script
-- PostgreSQL 15+ compatible
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users (simulated system users / technicians)
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL DEFAULT '',
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(30) NOT NULL DEFAULT 'TECHNICIAN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: incidents
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- HARDWARE, SOFTWARE, NETWORK, ACCESS, SECURITY, OTHER
    priority VARCHAR(20) NOT NULL, -- BAJA, MEDIA, ALTA, CRITICA
    status VARCHAR(30) NOT NULL DEFAULT 'NUEVO', -- NUEVO, ASIGNADO, EN_PROCESO, RESUELTO, CERRADO
    reporter_name VARCHAR(100) NOT NULL,
    assigned_technician_id INTEGER REFERENCES app_users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Table: incident_comments (audit log & history)
CREATE TABLE IF NOT EXISTS incident_comments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL DEFAULT 'COMMENT', -- COMMENT, STATUS_CHANGE, ASSIGNMENT, CREATION
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying and filtering
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_tech ON incidents(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_comments_incident_id ON incident_comments(incident_id);
