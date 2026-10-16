# Historial de Cambios (Changelog) - IT Incident Hub

Todas las versiones notables de este proyecto se documentan en este archivo siguiendo la especificación de [Semantic Versioning (SemVer 2.0.0)](https://semver.org/lang/es/) y el estándar de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [1.0.0] - 2026-10-28 (Semana 3 - Release de Producción)
### Añadido
- **Publicación de Artefactos:** Generación automática de archivo ejecutable JAR (`incident-hub-backend-1.0.0.jar`) y distribución comprimida de frontend SPA (`frontend-dist.tar.gz`) con verificación SHA256 en stage `publish`.
- **Estrategia de Release Multientorno:** Soporte de ambientes en GitLab CI/CD (`development`, `staging`, `production`) con aprobación manual para producción.
- **GitLab Release:** Vinculación oficial de tag protegido `v1.0.0` con release notes y enlace a binarios descargables.
- **Healthchecks en Producción:** Endpoint `/actuator/health` validando el estado del pool de conexiones PostgreSQL.

### Cambiado
- Perfil de compilación estabilizado con banderas de optimización en contenedores Docker Alpine (`-XX:+UseContainerSupport`).
- Finalización de diseño visual con contraste mejorado para estándares de accesibilidad WCAG AA.

---

## [0.2.0] - 2026-10-21 (Semana 2 - CI/CD, Calidad y Seguridad)
### Añadido
- **Pipeline Principal GitLab CI/CD:** Implementación de etapas completas (`checkout`, `install/restore`, `build`, `test`, `security`, `package`, `publish`).
- **Runner Self-Hosted:** Configuración y registro del daemon local con ejecutor `shell` y etiquetas `self-hosted, shell`.
- **Quality Gates Automáticos:** Integración de Checkstyle para Java y ESLint para React con fallo estricto ante advertencias.
- **Auditoría de Seguridad:** Escáner de vulnerabilidades OWASP Dependency-Check en backend y `npm audit` en frontend.
- **Workflow Complementario:** Integración de GitHub Actions en `.github/workflows/ci.yml` para validación cruzada en Pull Requests.
- **Suite de Pruebas Unitarias:** JUnit 5 + Mockito para capa de servicio y Vitest para componentes de interfaz.

### Corregido
- **Resolución de Deuda Técnica DT-01:** Validación estricta en transiciones de estado para evitar llamadas redundantes y actualización correcta de `resolvedAt` y `closedAt` (MR!4).
- **Resolución de Deuda Técnica DT-02:** Eliminación de acoplamiento de modelos JPA mediante `StatusUpdateRequestDTO` y `AssignTechnicianRequestDTO` (MR!5).
- **Simulación de Calidad:** Documentación del caso de fallo y recuperación controlada de pipeline en `docs/pipeline-fallido.md`.

---

## [0.1.0] - 2026-10-14 (Semana 1 - Fundamentos y Arquitectura)
### Añadido
- **Backlog Automatizado:** Script en Bash y PowerShell (`crear_backlog.sh` / `.ps1`) para inicializar 2 Epics, 4 Features, 8 User Stories y 16 Tasks en GitLab vía API REST.
- **Base de Datos:** Scripts DDL y datos semilla iniciales en PostgreSQL (`database/01_init.sql` y `database/02_seed.sql`).
- **Backend Spring Boot 3:** Estructura modular con modelos relacionales (`Incident`, `User`, `Comment`), repositorios JPA y controladores REST.
- **Frontend React 18 + Vite:** SPA responsiva con tema dark glassmorphism, tabla interactiva, filtros dinámicos y modal de detalle.
- **Plantilla de Merge Request:** Estandarización de revisiones de código en `.gitlab/merge_request_templates/default.md`.
- **Orquestación Local:** Configuración de `docker-compose.yml` para levantar PostgreSQL, Backend y Frontend con un solo comando.
- **Documentación Base:** Arquitectura inicial (`docs/arquitectura.md`) y modelo de ramas (`docs/branching.md`).
