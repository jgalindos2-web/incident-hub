# IT Incident Hub - Plataforma Integral de Gestión de Incidentes de TI

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Render](https://img.shields.io/badge/Deploy-Render%20PaaS-46E3B7?logo=render&logoColor=black)](https://render.com)
[![GitLab CI/CD](https://img.shields.io/badge/GitLab%20CI%2FCD-Self--Hosted-FC6D26?logo=gitlab&logoColor=white)](https://gitlab.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Mirror%20Gate-2088FF?logo=github-actions&logoColor=white)](https://github.com)

---

## 📌 1. Descripción del Proyecto y Arquitectura DevOps

**IT Incident Hub** es una plataforma web para la gestión integral de incidentes de soporte tecnológico alineada a las mejores prácticas de **ITIL v4**. La solución permite el levantamiento, categorización, asignación técnica, control estricto de transiciones de estado, bitácora de resoluciones y analítica operacional en tiempo real.

### Flujo de Sincronización y CI/CD Real:
1. **Centro de Operaciones (GitLab):** Es el repositorio de trabajo principal donde se crean las ramas (`feature/*`, `fix/*`), se gestionan las tareas en los tableros y se abren los **Merge Requests**.
2. **Sincronización por Mirroring (GitHub):** GitLab sincroniza automáticamente cada commit y rama hacia un repositorio espejo en GitHub.
3. **Quality Gate Complementario (GitHub Actions):** Al recibir la sincronización del Mirror, GitHub Actions ejecuta el workflow [pr-validation.yml](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/.github/workflows/pr-validation.yml) evaluando linters (ESLint, Checkstyle), pruebas de backend y ejecutando la **detección anti-filtración de secretos o archivos `.env`**. El resultado se reporta de vuelta a GitLab mediante la **GitLab Commit Status API** (mostrando el Check Verde o X Roja en el Merge Request).
4. **CI/CD Principal (GitLab CI/CD):** Tras aprobarse las validaciones y realizar el Merge a `main`, el pipeline [.gitlab-ci.yml](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/.gitlab-ci.yml) se ejecuta en un **GitLab Runner Self-Hosted** (`self-hosted-runner`), corriendo pruebas de integración, auditoría de vulnerabilidades con `npm audit`, compilando el backend y frontend, y generando un artefacto `.zip` con **Semantic Versioning (`v1.0.0`)** y el hash del commit.
5. **Despliegue Continuo (Render PaaS):** El runner dispara el despliegue automático hacia Render mediante **Deploy Hooks** (solicitudes HTTP POST autenticadas).
6. **Seguridad Estricta de Secretos:** **PROHIBIDO subir archivos `.env` a Git**. Las credenciales se inyectan en tiempo de ejecución en GitLab CI/CD Variables, GitHub Secrets y en el Dashboard de Render.

---

## 👥 2. Integrantes del Equipo (Simulación de Roles)

| Integrante Simulado | Rol Técnico DevOps | Correo Electrónico | Responsabilidades Clave |
| :--- | :--- | :--- | :--- |
| **Carlos Gómez** | Lead DevOps & Backend Engineer | `carlos.gomez.devops@incidenthub.io` | Pipeline `.gitlab-ci.yml`, Runner Self-Hosted, Arquitectura Render, Spring Boot Core, Seguridad y Releases. |
| **Sofía Herrera** | Frontend & UX Specialist | `sofia.herrera.frontend@incidenthub.io` | Single Page Application (React 18 + Vite), Diseño Vanilla CSS Glassmorphism, ESLint y Vitest. |
| **Mateo Ruiz** | QA & Reliability Engineer | `mateo.ruiz.qa@incidenthub.io` | Gestión de Backlog en GitLab, Suites JUnit 5/Mockito, Auditoría de Deuda Técnica y Staging Gates. |

### Comandos para Alternar Identidad en Git Local:
```bash
# Carlos Gómez (DevOps / Backend)
git config user.name "Carlos Gomez"
git config user.email "carlos.gomez.devops@incidenthub.io"

# Sofía Herrera (Frontend)
git config user.name "Sofia Herrera"
git config user.email "sofia.herrera.frontend@incidenthub.io"

# Mateo Ruiz (QA / Reliability)
git config user.name "Mateo Ruiz"
git config user.email "mateo.ruiz.qa@incidenthub.io"
```

---

## 🏗️ 3. Estructura del Repositorio

```text
incident-hub/
├── .github/
│   └── workflows/
│       └── pr-validation.yml       # Quality Gate de GitHub Actions (Mirroring, Linters, Cero .env)
├── .gitlab/
│   └── merge_request_templates/    # Plantillas de revisión de código para Merge Requests
├── backend/                        # API REST Spring Boot 3 (Java 17 + Maven)
│   ├── src/main/java/              # Controladores, Servicios, DTOs y Repositorios
│   ├── src/test/java/              # Pruebas unitarias e integradas (JUnit 5 + Mockito)
│   ├── checkstyle.xml              # Linter estático Java
│   ├── pom.xml                     # Maven POM y dependencias
│   └── Dockerfile                  # Empaquetado Multi-Stage para Render
├── frontend/                       # Aplicación SPA React 18 + Vite
│   ├── src/                        # Componentes UI, Tablero Kanban, Servicios API
│   ├── .eslintrc.cjs               # Configuración de ESLint
│   ├── package.json                # Dependencias Node.js y scripts
│   ├── vite.config.js              # Configuración de Vite y Vitest
│   └── Dockerfile                  # Contenedor Nginx para producción
├── database/                       # Scripts SQL de inicialización
│   ├── 01_init.sql                 # Esquema de tablas, índices y restricciones
│   └── 02_seed.sql                 # Datos de prueba para desarrollo
├── devops/                         # Infraestructura como Código y Configuración DevOps
│   ├── docker/
│   │   └── docker-compose.yml      # Entorno de pruebas y desarrollo local
│   ├── render/
│   │   └── render.yaml             # Blueprint IaC para despliegue en Render PaaS
│   └── runner.md                   # Guía de instalación y registro de GitLab Runner
├── docs/                           # Documentación de Ingeniería y Arquitectura
│   ├── arquitectura.md             # Diagrama de secuencia y arquitectura Render PaaS (Mermaid)
│   ├── branching.md                # GitFlow adaptado, commits trazables y reglas de MR en GitLab
│   ├── deuda-tecnica.md            # Matriz de 5 deudas técnicas y 2 casos resueltos
│   ├── seguridad-dependencias.md   # Auditoría de CVEs y política de cero .env en Git
│   └── estrategia-release.md       # Ambientes en Render, SemVer (v1.0.0), rollback y checklist
├── .env.example                    # Plantilla de variables de entorno (sin credenciales)
├── .gitignore                      # Bloqueo estricto de secretos, .env y binarios
├── .gitlab-ci.yml                  # Pipeline principal de GitLab CI/CD (Self-Hosted Runner)
├── CHANGELOG.md                    # Historial de versiones y notas de entrega
└── README.md                       # Documentación principal del repositorio
```

---

## 🚀 4. Guía de Ejecución en Entorno Local

> [!IMPORTANT]
> **REGLA DE ORO DE SEGURIDAD:** Nunca comittees archivos `.env` a Git. Para desarrollo local, copia `.env.example` a `.env` en tu equipo y añade los valores locales correspondientes.

### Opción A: Ejecución con Docker Compose (Recomendada)
Para levantar PostgreSQL 15, el Backend Spring Boot y el Frontend React en contenedores:

```bash
# 1. Posicionarse en la carpeta devops/docker
cd devops/docker

# 2. Iniciar los servicios en segundo plano
docker compose up -d --build

# 3. Comprobar el estado y healthchecks
docker compose ps
```
- **Frontend Web:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080/api/v1/incidents`
- **Healthcheck Backend:** `http://localhost:8080/api/v1/actuator/health`
- **PostgreSQL:** `localhost:5432` (Usuario: `incident_user`, BD: `incident_hub_db`)

### Opción B: Ejecución Manual para Desarrollo Activo
```bash
# 1. Base de Datos PostgreSQL
docker run --name local-postgres -e POSTGRES_DB=incident_hub_db -e POSTGRES_USER=incident_user -e POSTGRES_PASSWORD=incident_pass -p 5432:5432 -d postgres:15-alpine

# 2. Backend Spring Boot (Java 17)
cd backend
mvn clean spring-boot:run -Dspring-boot.run.arguments="--DB_URL=jdbc:postgresql://localhost:5432/incident_hub_db --DB_USERNAME=incident_user --DB_PASSWORD=incident_pass"

# 3. Frontend React (Vite)
cd frontend
npm install
npm run dev
```

---

## ⚙️ 5. Configuración del Pipeline de CI/CD

```mermaid
graph TD
    subgraph GitLab["GitLab (Origen & CI/CD Principal)"]
        MR["Merge Request en GitLab"]
        Runner["GitLab Runner (Self-Hosted)<br/>Etiqueta: self-hosted-runner"]
        Stages["Stages:<br/>1. test (mvn test & npm test)<br/>2. security (npm audit)<br/>3. build_and_package (ZIP v1.0.0)<br/>4. deploy (Deploy Hook)"]
    end

    subgraph GitHub["GitHub (Repositorio Espejo)"]
        Mirror["Mirroring Automático"]
        Actions["GitHub Actions (pr-validation.yml)<br/>- Detección Anti-Filtración .env<br/>- ESLint & Checkstyle<br/>- Pruebas Rápidas Backend"]
        StatusReport["Notificación GitLab Commit Status API<br/>(Check Verde o X Roja en MR)"]
    end

    subgraph Render["Render PaaS (Despliegue)"]
        Hooks["Deploy Hooks (HTTP POST)"]
        Deploy["Web Service + Static Site + PostgreSQL"]
    end

    MR -->|Push Automático| Mirror
    Mirror --> Actions
    Actions --> StatusReport
    StatusReport -->|Actualiza Estado| MR
    MR -->|Merge a main| Runner
    Runner --> Stages
    Stages -->|HTTP POST| Hooks
    Hooks --> Deploy
```

### 1. Instalación y Registro del GitLab Runner Autohospedado
Para instalar y registrar el runner en Windows o Linux, consulta la guía detallada paso a paso en [devops/runner.md](devops/runner.md).
El runner debe registrarse con los tags requeridos por el pipeline (`self-hosted`, `shell` o `docker`).

### 2. Variables Secretas Requeridas en GitLab CI/CD
Configuradas en **Settings &rarr; CI/CD &rarr; Variables** con atributos `Masked` y `Protected`:
- `RENDER_DEPLOY_HOOK_BACKEND`: URL del Deploy Hook del Backend en Render.
- `RENDER_DEPLOY_HOOK_FRONTEND`: URL del Deploy Hook del Frontend en Render (opcional).

### 3. Secretos Requeridos en GitHub Actions
Configurados en **Repository Settings &rarr; Secrets and variables &rarr; Actions**:
- `GITLAB_TOKEN`: Personal Access Token de GitLab con permisos `api` (para reportar el estado al MR).
- `GITLAB_PROJECT_ID`: ID numérico del proyecto en GitLab.

---

## ☁️ 6. Configuración de Secretos y Servicios en Render

La infraestructura en Render se aprovisiona mediante el blueprint [devops/render/render.yaml](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/devops/render/render.yaml):

1. **Base de Datos (`incident-hub-db`):**
   - Servicio gestionado PostgreSQL 15. La URL de conexión se inyecta dinámicamente mediante `fromDatabase`.
2. **Backend Web Service (`incident-hub-backend`):**
   - Variables de entorno en Dashboard:
     - `SPRING_PROFILES_ACTIVE`: `prod`
     - `SERVER_PORT`: `8080`
     - `CORS_ALLOWED_ORIGINS`: Dominio del frontend en Render (ej. `https://incident-hub-frontend.onrender.com`).
   - Copiar la URL del **Deploy Hook** y guardarla en GitLab como `RENDER_DEPLOY_HOOK_BACKEND`.
3. **Frontend Static Site (`incident-hub-frontend`):**
   - Variable de entorno en Dashboard:
     - `VITE_API_URL`: URL del Backend en Render (ej. `https://incident-hub-backend.onrender.com/api/v1`).
   - Copiar el **Deploy Hook** y guardarlo en GitLab como `RENDER_DEPLOY_HOOK_FRONTEND`.

---

## 🧪 7. Comandos de Pruebas y Linters Locales

```bash
# Validar linter de Backend (Checkstyle)
cd backend && mvn checkstyle:check

# Ejecutar pruebas unitarias de Backend (JUnit 5 + Mockito)
cd backend && mvn test

# Validar linter de Frontend (ESLint)
cd frontend && npm run lint

# Ejecutar pruebas unitarias de Frontend (Vitest)
cd frontend && npm run test
```

---

## 📄 8. Documentación Detallada de Ingeniería

Consulta los documentos técnicos correspondientes en la carpeta `/docs`:
- [docs/arquitectura.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/arquitectura.md): Diagramas de secuencia Mermaid, topología en Render y ciclo ITIL.
- [docs/branching.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/branching.md): Convenciones GitFlow, commits trazables (`#ID` / `AB#ID`) y reglas de MR.
- [docs/deuda-tecnica.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/deuda-tecnica.md): Matriz de 5 deudas técnicas y resolución trazable de 2 deudas.
- [docs/seguridad-dependencias.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/seguridad-dependencias.md): Matriz de CVEs evaluados y política estricta de Cero Archivos `.env`.
- [docs/estrategia-release.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/estrategia-release.md): Topología de ambientes, empaquetado SemVer (`v1.0.0`), rollback y checklist de release.
