# Arquitectura del Sistema - IT Incident Hub

## 1. Visión General
**IT Incident Hub** es una plataforma web para la gestión integral del ciclo de vida de incidentes tecnológicos, diseñada bajo principios de arquitectura limpia, desacoplamiento y trazabilidad DevOps continua. Permite el registro de incidentes, asignación a personal técnico, transiciones de estado ITIL, auditoría mediante bitácora y monitoreo analítico en tiempo real.

---

## 2. Diagrama de Arquitectura de la Solución

```mermaid
graph TD
    subgraph Client["Cliente / Navegador"]
        UI["React 18 + Vite (SPA)"]
    end

    subgraph ReverseProxy["Capa de Red Local / Producción"]
        Nginx["Nginx Reverse Proxy (:80 / :3000)"]
    end

    subgraph BackendApp["Capa de Negocio (Spring Boot 3)"]
        Controller["REST Controllers (/api/v1)"]
        Service["Incident & User Service"]
        Repo["Spring Data JPA"]
        Actuator["Actuator Health (/health)"]
    end

    subgraph DataStore["Capa de Persistencia"]
        Postgres[("PostgreSQL 15 (:5432)")]
    end

    UI -->|Peticiones HTTP/REST| Nginx
    Nginx -->|Proxy inverso /api| Controller
    Controller --> Service
    Service --> Repo
    Repo -->|JDBC / Connection Pool| Postgres
```

---

## 3. Modelo de Dominio y Entidad-Relación

```mermaid
erDiagram
    APP_USERS ||--o{ INCIDENTS : "asigna / atiende"
    INCIDENTS ||--o{ INCIDENT_COMMENTS : "contiene bitácora"

    APP_USERS {
        int id PK
        string username UK
        string full_name
        string email UK
        string role
        timestamp created_at
    }

    INCIDENTS {
        int id PK
        string title
        text description
        string category
        string priority
        string status
        string reporter_name
        int assigned_technician_id FK
        text resolution_notes
        timestamp created_at
        timestamp updated_at
        timestamp resolved_at
        timestamp closed_at
    }

    INCIDENT_COMMENTS {
        int id PK
        int incident_id FK
        string author_name
        text message
        string action_type
        timestamp created_at
    }
```

---

## 4. Ciclo de Vida del Incidente (Máquina de Estados ITIL)

```mermaid
stateDiagram-v2
    [*] --> NUEVO : Reportado por usuario
    NUEVO --> ASIGNADO : Técnico asignado
    ASIGNADO --> EN_PROCESO : Diagnóstico iniciado
    EN_PROCESO --> RESUELTO : Solución aplicada + notas
    RESUELTO --> CERRADO : Validación y conformidad
    RESUELTO --> EN_PROCESO : Reapertura por rechazo
    CERRADO --> [*]
```

---

## 5. Decisiones de Diseño Técnico

| Componente | Elección Tecnológica | Justificación |
| :--- | :--- | :--- |
| **Backend** | Java 17 + Spring Boot 3.2.5 | Rendimiento de clase empresarial, soporte a largo plazo (LTS), ecosistema Spring Data y Bean Validation para robustez de contratos API. |
| **Frontend** | React 18 + Vite | Rendimiento óptimo en renderizado, tiempo de carga ultrarrápido en desarrollo con HMR nativo de ESModules. |
| **Estilos** | Vanilla CSS con Tokens HSL | Máximo control estético, sin dependencias pesadas, modo oscuro nativo con efectos de desenfoque (*glassmorphism*). |
| **Persistencia** | PostgreSQL 15 | Cumplimiento ACID estricto, soporte de índices relacionales y extensibilidad para auditoría transaccional. |
| **Contenedores**| Docker Multi-Stage | Empaquetado reproducible en dos etapas que reduce el tamaño final de la imagen y minimiza vectores de ataque en tiempo de ejecución. |
