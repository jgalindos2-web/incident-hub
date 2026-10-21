# Arquitectura del Sistema y Flujo DevOps Integral - IT Incident Hub

## 1. Visión General de la Solución

**IT Incident Hub** es una plataforma web corporativa diseñada para la gestión integral del ciclo de vida de incidentes de soporte tecnológico, siguiendo las directrices de **ITIL v4**. Su arquitectura técnica y operacional se fundamenta en un ecosistema DevOps desacoplado que integra **GitLab** como repositorio principal, sincronización por **Mirroring hacia GitHub** para validaciones complementarias, ejecución de pipelines en un **GitLab Runner Self-Hosted** y despliegue continuo hacia la nube en **Render PaaS** mediante **Deploy Hooks** seguros.

---

## 2. Diagrama de Flujo DevOps y Sincronización Real

El siguiente diagrama detalla la interacción paso a paso entre el desarrollador, GitLab (repositorio origen), GitHub (repositorio espejo), el runner autohospedado y Render:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Desarrollador
    participant GL as GitLab (Repositorio Principal)
    participant GH as GitHub (Repositorio Espejo)
    participant GHA as GitHub Actions (Quality Gate)
    participant Runner as GitLab Runner (Self-Hosted)
    participant Render as Render PaaS (Producción)

    %% Fase 1: Desarrollo y Merge Request
    Note over Dev,GL: 1. Creación de Rama & Trabajo en GitLab
    Dev->>GL: Push de commits (feat: #12, fix: #18)
    Dev->>GL: Apertura de Merge Request (MR) en GitLab

    %% Fase 2: Mirroring y Validaciones en GitHub
    Note over GL,GH: 2. Sincronización Automática por Mirroring
    GL->>GH: Push / Mirror automático de ramas y commits
    GH->>GHA: Disparo de workflow complementario (pr-validation.yml)
    
    Note over GHA: Validaciones de GitHub Actions:
    GHA->>GHA: 🔒 1. Detección Anti-Filtración de .env y Secretos
    GHA->>GHA: 🔍 2. Linter Frontend (ESLint)
    GHA->>GHA: ☕ 3. Linter Backend (Checkstyle) & Tests Rápidos
    
    %% Fase 3: Notificación de Estado a GitLab
    Note over GHA,GL: 3. Comunicación de Estado vía GitLab Commit Status API
    alt Validaciones Exitosas
        GHA->>GL: POST /projects/:id/statuses/:sha (state=success)
        Note right of GL: ✔ Aparece Check Verde en el MR de GitLab
    else Fallo en Linters, Tests o Secretos
        GHA->>GL: POST /projects/:id/statuses/:sha (state=failed)
        Note right of GL: ❌ Aparece X Roja en el MR de GitLab (Bloqueo)
    end

    %% Fase 4: Merge y Pipeline Principal en GitLab Runner
    Note over Dev,GL: 4. Aprobación y Fusión en GitLab
    Dev->>GL: Merge a la rama 'main' en GitLab
    GL->>Runner: Disparo de Pipeline CI/CD (.gitlab-ci.yml) [tag: self-hosted-runner]
    
    Note over Runner: Ejecución en Runner Self-Hosted:
    Runner->>Runner: Stage 'test': mvn test & npm test
    Runner->>Runner: Stage 'security': npm audit
    Runner->>Runner: Stage 'build_and_package': Compila JAR + Dist Vite & genera .zip SemVer

    %% Fase 5: Despliegue en Render
    Note over Runner,Render: 5. Despliegue Automatizado a Render
    Runner->>Render: Stage 'deploy': HTTP POST a Deploy Hook de Backend
    Runner->>Render: HTTP POST a Deploy Hook de Frontend
    Render-->>Render: Reconstrucción e inicio seguro de servicios
    Render-->>Runner: Respuesta HTTP 200 OK (Despliegue Confirmado)
```

---

## 3. Diagrama de Infraestructura en la Nube (Render PaaS)

```mermaid
graph TD
    subgraph Clients["Clientes & Usuarios"]
        Browser["Navegador Web (HTTPS)"]
    end

    subgraph RenderPlatform["Plataforma Render PaaS (Oregon)"]
        subgraph Edge["Capa de Red & Terminación SSL"]
            CDN["Render Global CDN / DDoS Shield"]
        end

        subgraph Services["Servicios de Aplicación"]
            Frontend["Frontend SPA (React 18 + Vite)<br/>Servicio: incident-hub-frontend<br/>Runtime: Static Site"]
            Backend["Backend REST API (Spring Boot 3 / Java 17)<br/>Servicio: incident-hub-backend<br/>Runtime: Docker Container (:8080)"]
            Actuator["Healthcheck Endpoint (/api/v1/actuator/health)"]
            Backend --> Actuator
        end

        subgraph Data["Persistencia Gestionada"]
            Database[("PostgreSQL 15 Gestionado<br/>Servicio: incident-hub-db<br/>Conexión Interna con SSL")]
        end
    end

    Browser -->|HTTPS / TLS 1.3| CDN
    CDN --> Frontend
    Frontend -->|Peticiones REST / JSON| Backend
    Backend -->|JDBC Interno + SSL| Database
```

---

## 4. Descripción de Roles y Componentes del Stack

| Capa / Componente | Plataforma / Tecnología | Rol y Responsabilidad Operacional |
| :--- | :--- | :--- |
| **Repositorio Origen** | GitLab (Cloud / Self-Hosted) | Gestión de Issues, Tableros Kanban, ramas, Merge Requests, revisiones de código y pipeline CI/CD principal. |
| **Repositorio Espejo** | GitHub (Mirroring) | Repositorio réplica sincronizado por GitLab. Alberga GitHub Actions para análisis de calidad complementario sin impactar los runners principales. |
| **Runner de CI/CD** | GitLab Runner (Self-Hosted) | Servidor local/dedicado con tag `self-hosted-runner` y executor `docker`. Compila binarios pesados de Java y empaqueta artefactos de versión. |
| **Backend REST API** | Java 17, Spring Boot 3.2.5, Maven | Arquitectura desacoplada en capas (Controller, Service, Repository, DTO), Bean Validation (JSR-380) y telemetría con Spring Boot Actuator. |
| **Frontend SPA** | React 18, Vite 5, Vanilla CSS | Single Page Application moderna con diseño responsivo, tablero interactivo y gestión de estados de incidentes. |
| **Base de Datos** | PostgreSQL 15 (Render Managed) | Almacén relacional con cumplimiento ACID, aislamiento en red privada interna y copias de seguridad continuas. |
| **CD / Despliegue** | Render Deploy Hooks | Endpoint HTTP POST seguro que dispara el despliegue automático de nuevos contenedores sin necesidad de exponer credenciales SSH. |

---

## 5. Modelo de Dominio y Entidad-Relación

```mermaid
erDiagram
    APP_USERS ||--o{ INCIDENTS : "asigna / atiende"
    INCIDENTS ||--o{ INCIDENT_COMMENTS : "contiene bitacora"

    APP_USERS {
        int id PK
        string username UK
        string full_name
        string email UK
        string role "ADMIN | TECH | USER"
        timestamp created_at
    }

    INCIDENTS {
        int id PK
        string title
        text description
        string category "HARDWARE | SOFTWARE | NETWORK | ACCESS"
        string priority "BAJA | MEDIA | ALTA | CRITICA"
        string status "NUEVO | ASIGNADO | EN_PROCESO | RESUELTO | CERRADO"
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
        string action_type "COMMENT | STATUS_CHANGE | ASSIGNMENT"
        timestamp created_at
    }
```

---

## 6. Ciclo de Vida ITIL del Incidente (Máquina de Estados)

```mermaid
stateDiagram-v2
    [*] --> NUEVO : Registro de Incidente
    NUEVO --> ASIGNADO : Técnico Asignado
    ASIGNADO --> EN_PROCESO : Inicio de Diagnóstico
    EN_PROCESO --> RESUELTO : Solución Aplicada + Notas Técnicas
    RESUELTO --> CERRADO : Aprobación de Conformidad
    RESUELTO --> EN_PROCESO : Reapertura por Disconformidad
    CERRADO --> [*]
```
