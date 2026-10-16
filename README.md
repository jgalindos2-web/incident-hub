# IT Incident Hub - Plataforma Integral de Gestión de Incidentes de TI

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![GitLab CI/CD](https://img.shields.io/badge/GitLab%20CI%2FCD-Self--Hosted-FC6D26?logo=gitlab&logoColor=white)](https://gitlab.com)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Quality%20Gate-2088FF?logo=github-actions&logoColor=white)](https://github.com)

---

## 📌 1. Descripción del Proyecto
**IT Incident Hub** es un sistema corporativo para la administración, escalamiento y resolución de incidentes de infraestructura y software de TI (alineado a buenas prácticas de ITIL). Desarrollado como proyecto integrador de 3 semanas, implementa un ciclo DevOps de extremo a extremo sustituyendo herramientas privativas de Azure por una solución abierta e interoperable basada en **GitLab (Issues, Boards, CI/CD, Runner Self-Hosted, Environments)** complementada con **GitHub Actions**.

---

## 👥 2. Simulación de Equipo (3 Identidades de Desarrollo)
Dado que es un proyecto individual, se simula un equipo multidisciplinario de 3 ingenieros con roles y configuraciones de Git diferenciadas:

| Integrante Simulado | Rol Principal | Email en Git | Responsabilidades Clave |
| :--- | :--- | :--- | :--- |
| **Carlos Gómez** | Lead DevOps & Backend | `carlos.gomez.devops@incidenthub.io` | Pipeline `.gitlab-ci.yml`, Runner Self-Hosted, Docker Compose, Spring Boot Core, Seguridad y Releases. |
| **Sofía Herrera** | Frontend & UX Specialist | `sofia.herrera.frontend@incidenthub.io` | Aplicación React 18 SPA, UI Glassmorphism, Componentes del Dashboard, ESLint y Vitest. |
| **Mateo Ruiz** | QA & Reliability Engineer | `mateo.ruiz.qa@incidenthub.io` | Scripts de Backlog en GitLab, Suites JUnit 5/Mockito, Auditoría de Deuda Técnica y Gestión de Staging. |

### Comandos para Alternar Identidad Localmente:
Antes de realizar commits o abrir ramas, ejecuta el comando correspondiente en tu terminal:

```bash
# Cambiar a Carlos Gómez (DevOps / Backend)
git config user.name "Carlos Gomez"
git config user.email "carlos.gomez.devops@incidenthub.io"

# Cambiar a Sofía Herrera (Frontend)
git config user.name "Sofia Herrera"
git config user.email "sofia.herrera.frontend@incidenthub.io"

# Cambiar a Mateo Ruiz (QA / Reliability)
git config user.name "Mateo Ruiz"
git config user.email "mateo.ruiz.qa@incidenthub.io"
```

---

## 🏗️ 3. Estructura del Repositorio
```text
incident-hub/
├── backend/                  # API REST con Java 17 + Spring Boot 3 + Maven
│   ├── src/main/java/        # Código fuente (modelos, servicios, controladores)
│   ├── src/test/java/        # Pruebas unitarias con JUnit 5 y Mockito
│   ├── checkstyle.xml        # Reglas de estilo para el linter de Java
│   ├── pom.xml               # Dependencias Maven y plugins (Checkstyle + OWASP)
│   └── Dockerfile            # Imagen multi-stage optimizada
├── frontend/                 # Interfaz SPA con React 18 + Vite
│   ├── src/                  # Componentes (Dashboard, Incidentes, Timeline)
│   ├── src/__tests__/        # Pruebas de interfaz con Vitest
│   ├── .eslintrc.cjs         # Configuración del linter ESLint
│   ├── package.json          # Dependencias y scripts npm
│   ├── nginx.conf            # Proxy inverso y enrutamiento SPA
│   └── Dockerfile            # Imagen de producción en dos etapas
├── database/                 # Scripts SQL para PostgreSQL
│   ├── 01_init.sql           # DDL: creación de tablas, llaves e índices
│   └── 02_seed.sql           # DML: usuarios, técnicos e incidentes muestra
├── tests/                    # Colecciones de prueba e integración
│   ├── api-tests.http        # Peticiones HTTP ejecutables para todos los endpoints
│   └── README.md             # Guía de ejecución de pruebas
├── devops/                   # Automatizaciones y guías de infraestructura
│   ├── runner.md             # Instalación y registro del GitLab Runner Self-Hosted
│   └── scripts/
│       ├── crear_backlog.sh  # Script Bash para crear Backlog en GitLab vía API
│       ├── crear_backlog.ps1 # Script PowerShell para Windows
│       └── deploy_environment.sh # Despliegue automatizado por ambiente
├── docs/                     # Documentación técnica obligatoria
│   ├── arquitectura.md       # Diagramas de arquitectura y decisiones de diseño
│   ├── branching.md          # Flujo de ramas y planificación de 6 Merge Requests
│   ├── deuda-tecnica.md      # Identificación de 5 deudas y resolución de 2
│   ├── seguridad.md          # Matriz de secretos Masked/Protected en CI/CD
│   ├── dependencias.md       # Auditoría de paquetes y mitigación de CVEs
│   ├── estrategia-release.md # Ambientes dev -> staging -> prod y manual gates
│   └── pipeline-fallido.md   # Caso de estudio con pipeline fallido y corrección
├── .github/workflows/
│   └── ci.yml                # Workflow complementario para Pull Requests
├── .gitlab/
│   └── merge_request_templates/
│       └── default.md        # Plantilla formal de Merge Requests en GitLab
├── .gitlab-ci.yml            # Pipeline principal con los 7 stages obligatorios
├── .env.example              # Plantilla segura de variables de entorno
├── .gitignore                # Reglas estrictas de exclusión de secretos y temporales
├── docker-compose.yml        # Orquestación de Postgres, Backend y Frontend
├── CHANGELOG.md              # Versionado Semántico (v0.1.0 -> v0.2.0 -> v1.0.0)
└── README.md                 # Guía maestra del proyecto
```

---

## ⚡ 4. Requisitos y Ejecución Rápida

### Requisitos del Sistema:
- **Docker** y **Docker Compose** (Recomendado para levantar todo con un clic).
- O en su defecto para ejecución directa:
  - Java 17+ (JDK)
  - Maven 3.8+
  - Node.js 18+ o 20+
  - PostgreSQL 15+

### Opción A: Ejecución con Docker Compose (Recomendada)
1. Clona el repositorio y sitúate en la raíz del proyecto:
   ```bash
   cd incident-hub
   ```
2. Inicia todos los servicios (Base de Datos + Backend + Frontend):
   ```bash
   docker compose up -d --build
   ```
3. Accede a las aplicaciones en tu navegador:
   - **Frontend (Aplicación Web):** [http://localhost:3000](http://localhost:3000)
   - **Backend API REST:** [http://localhost:8080/api/v1/incidents](http://localhost:8080/api/v1/incidents)
   - **Actuator Healthcheck:** [http://localhost:8080/api/v1/actuator/health](http://localhost:8080/api/v1/actuator/health)
   - **PostgreSQL:** `localhost:5432` (Usuario: `incident_user`, BD: `incident_hub_db`, Pass: `incident_pass_secret`).

### Opción B: Ejecución Manual Local (Sin Docker)
1. **Base de Datos:**
   Crea una base de datos en PostgreSQL llamada `incident_hub_db` y ejecuta en orden:
   - `database/01_init.sql`
   - `database/02_seed.sql`
2. **Backend:**
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📅 5. Plan de Entregas por Semana (3 Repositorios / Entregables)

El proyecto integrador se divide en 3 entregas semanales consecutivas:

```text
semana1/ (Planificación + Arquitectura + Core)  --> Tag v0.1.0
semana2/ (CI/CD + Calidad + Seguridad)          --> Tag v0.2.0
semana3/ (Estabilización + Release Producción)  --> Tag v1.0.0
```

### Tabla de Asignación de Archivos por Semana:

| Semana | Alcance y Contenido de la Entrega | Archivos Correspondientes |
| :--- | :--- | :--- |
| **Semana 1** | Planificación, Backlog, Base de Datos, Backend REST y Frontend Base. | `database/*`, `backend/src/*`, `backend/pom.xml`, `backend/Dockerfile`, `frontend/src/*`, `frontend/package.json`, `frontend/Dockerfile`, `docker-compose.yml`, `devops/scripts/crear_backlog.*`, `.gitlab/merge_request_templates/*`, `docs/arquitectura.md`, `docs/branching.md`, `.env.example`, `.gitignore`. |
| **Semana 2** | Pipeline CI/CD, Pruebas Unitarias, Runner Self-Hosted, Seguridad y Deuda Técnica. | `.gitlab-ci.yml`, `.github/workflows/ci.yml`, `devops/runner.md`, `backend/checkstyle.xml`, `frontend/.eslintrc.cjs`, `backend/src/test/*`, `frontend/src/__tests__/*`, `tests/*`, `docs/seguridad.md`, `docs/deuda-tecnica.md`, `docs/dependencias.md`, `docs/pipeline-fallido.md`. |
| **Semana 3** | Estabilización, Versionado Semántico, Ambientes y Release v1.0.0. | `CHANGELOG.md`, `docs/estrategia-release.md`, `devops/scripts/deploy_environment.sh`, artefactos generados en `publish`, tags `v1.0.0` y documentación final en `README.md`. |

---

## 💻 6. Comandos Exactos para Subir a Cada Repositorio / Entrega

Si la universidad te solicita **3 repositorios separados de GitLab** (o 3 ramas/etiquetas):

### Para la Entrega de la Semana 1:
```bash
# 1. Crear e inicializar el repositorio local para la Semana 1
cd incident-hub
git init
git checkout -b main

# 2. Configurar identidad de Carlos Gómez
git config user.name "Carlos Gomez"
git config user.email "carlos.gomez.devops@incidenthub.io"

# 3. Agregar archivos de la Semana 1
git add database/ backend/ frontend/ docker-compose.yml devops/scripts/crear_backlog.* .gitlab/ docs/arquitectura.md docs/branching.md .env.example .gitignore README.md
git commit -m "feat: #1 entrega semana 1 - planificacion, arquitectura y desarrollo base"

# 4. Crear tag semántico
git tag -a v0.1.0 -m "Release v0.1.0: Entrega Semana 1"

# 5. Vincular y subir al repo de GitLab de la Semana 1
git remote add origin https://gitlab.com/TU_USUARIO/incident-hub-semana1.git
git push -u origin main
git push origin v0.1.0
```

### Para la Entrega de la Semana 2:
```bash
# 1. Configurar identidad de Mateo Ruiz (QA)
git config user.name "Mateo Ruiz"
git config user.email "mateo.ruiz.qa@incidenthub.io"

# 2. Agregar archivos de CI/CD, pruebas y seguridad
git add .gitlab-ci.yml .github/ devops/runner.md backend/checkstyle.xml frontend/.eslintrc.cjs backend/src/test/ frontend/src/__tests__/ tests/ docs/seguridad.md docs/deuda-tecnica.md docs/dependencias.md docs/pipeline-fallido.md
git commit -m "feat(ci): #18 entrega semana 2 - pipeline completo, runner self-hosted y calidad"

# 3. Crear tag semántico
git tag -a v0.2.0 -m "Release v0.2.0: Entrega Semana 2"

# 4. Vincular y subir al repo de GitLab de la Semana 2
git remote set-url origin https://gitlab.com/TU_USUARIO/incident-hub-semana2.git
git push -u origin main
git push origin v0.2.0
```

### Para la Entrega de la Semana 3:
```bash
# 1. Configurar identidad de Carlos Gómez (DevOps Lead)
git config user.name "Carlos Gomez"
git config user.email "carlos.gomez.devops@incidenthub.io"

# 2. Agregar estabilización, changelog y estrategia de release
git add CHANGELOG.md docs/estrategia-release.md devops/scripts/deploy_environment.sh README.md
git commit -m "feat(release): #25 entrega semana 3 - estabilizacion, ambientes y release v1.0.0"

# 3. Crear tag final de producción
git tag -a v1.0.0 -m "Release v1.0.0: Entrega Semana 3 Producción Final"

# 4. Vincular y subir al repo de GitLab de la Semana 3
git remote set-url origin https://gitlab.com/TU_USUARIO/incident-hub-semana3.git
git push -u origin main
git push origin v1.0.0
```

---

## 📋 7. Lista de Verificación Manual (Checklist en GitLab y GitHub)

Una vez subido el código, completa los siguientes pasos en las plataformas web:

### En GitLab:
- [ ] **Crear el Backlog:** Ejecuta en tu terminal `bash devops/scripts/crear_backlog.sh` (o `.\devops\scripts\crear_backlog.ps1`) con tus variables `GITLAB_TOKEN` y `GITLAB_PROJECT_ID` cargadas.
- [ ] **Verificar Issue Boards:** Ve a **Plan &rarr; Issue boards** y crea listas basadas en las etiquetas `estado::to-do`, `estado::in-progress` y `estado::done`.
- [ ] **Registrar Runner Self-Hosted:** Sigue las instrucciones de [devops/runner.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/devops/runner.md) y comprueba en **Settings &rarr; CI/CD &rarr; Runners** que tu runner aparezca en verde con las etiquetas `self-hosted` y `shell`.
- [ ] **Configurar Variables CI/CD:** Ve a **Settings &rarr; CI/CD &rarr; Variables** y crea `DB_PASSWORD` y `GITLAB_TOKEN` marcadas como **Masked** y **Protected**.
- [ ] **Proteger la rama `main`:** En **Settings &rarr; Repository &rarr; Protected branches**, asegura que `main` solo permita *Merge* a Developers y *Push* a **No one**.
- [ ] **Proteger los Tags:** En **Settings &rarr; Repository &rarr; Protected tags**, agrega la regla comodín `v*` solo para Maintainers.
- [ ] **Ejecutar Merge Requests:** Abre y aprueba los 6 MR planificados en [docs/branching.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/docs/branching.md) utilizando las diferentes identidades simuladas.
- [ ] **Publicar la Release v1.0.0:** En **Deploy &rarr; Releases**, crea la release a partir del tag `v1.0.0` adjuntando el texto de [CHANGELOG.md](file:///c:/Users/50254/Documents/Analisis2/ProyectoFinal/ProyectoFinalAnalisis/incident-hub/CHANGELOG.md).

### En GitHub (Workflow complementario):
- [ ] **Subir el repositorio a GitHub:** Configura un remote adicional `github` y haz `git push github main`.
- [ ] **Validar GitHub Actions:** Abre un Pull Request de prueba y comprueba en la pestaña **Actions** que el flujo `CI Quality & Security Pipeline` ejecute los linters (Checkstyle y ESLint), las pruebas unitarias y el análisis de dependencias exitosamente.
