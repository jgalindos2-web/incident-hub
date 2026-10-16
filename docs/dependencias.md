# Matriz de Análisis de Dependencias y Seguridad - IT Incident Hub

## 1. Inventario de Dependencias Principales

### Backend (Java 17 / Maven)
| Paquete / Dependencia | Versión Seleccionada | Justificación y Función |
| :--- | :---: | :--- |
| `spring-boot-starter-web` | `3.2.5` | Motor REST API, servidor embebido Tomcat 10, serialización Jackson. |
| `spring-boot-starter-data-jpa` | `3.2.5` | Abstracción ORM Hibernate 6 y repositorios de datos. |
| `spring-boot-starter-validation`| `3.2.5` | Hibernate Validator (JSR-380) para sanitización de DTOs. |
| `org.postgresql:postgresql` | `42.7.3` | Driver JDBC optimizado para PostgreSQL 15+. |
| `com.h2database:h2` | `2.2.224` | Motor de base de datos en memoria para pruebas unitarias. |
| `spring-boot-starter-actuator` | `3.2.5` | Telemetría, healthchecks para Kubernetes/Docker (`/health`). |
| `maven-checkstyle-plugin` | `3.3.1` | Linter estático para cumplimiento de estándares Java. |
| `dependency-check-maven` | `9.1.0` | Escáner OWASP de CVEs en dependencias del classpath. |

### Frontend (Node.js / React / Vite)
| Paquete | Versión Seleccionada | Justificación y Función |
| :--- | :---: | :--- |
| `react` / `react-dom` | `18.2.0` | Biblioteca de interfaz de usuario con concurrencia nativa. |
| `vite` | `5.2.0` | Bundler ESM ultra-rápido y servidor de desarrollo. |
| `vitest` | `1.4.0` | Framework de pruebas unitarias compatible con la API de Jest. |
| `@testing-library/react` | `14.2.1` | Utilerías para pruebas de componentes orientadas al usuario. |
| `eslint` | `8.57.0` | Analizador estático de código JavaScript / JSX. |

---

## 2. Matriz de Auditoría de Vulnerabilidades y Decisiones Técnicas

Durante la fase de análisis de seguridad (utilizando OWASP Dependency-Check en Backend y `npm audit` en Frontend), se evaluaron las dependencias contra la base de datos nacional de vulnerabilidades (NVD/CVE):

| Componente | CVE / Alerta Evaluada | Severidad (CVSS) | Estado / Decisión Técnica Adoptada |
| :--- | :--- | :---: | :--- |
| **Driver PostgreSQL** | CVE-2024-1597 (Inyección SQL en pgjdbc anterior a 42.7.2 con parámetros no preparados) | **CRÍTICA (9.8)** | **Mitigado / Actualizado:** Se forzó el uso de `postgresql-42.7.3`, donde la vulnerabilidad está completamente parchada. |
| **Spring Framework** | CVE-2023-34055 (Sobrecarga de DoS en URIs dinámicas de Actuator en Spring Boot 3.1.x) | **MEDIA (5.3)** | **Mitigado / Actualizado:** Se utiliza Spring Boot `3.2.5` (Spring Framework 6.1.6) que incorpora límites estrictos en el registro de métricas. |
| **Tomcat Embebido** | CVE-2024-24549 (Denegación de servicio por procesamiento de cabeceras HTTP/2) | **ALTA (7.5)** | **Mitigado:** Tomcat 10.1.20 incluido en Spring Boot 3.2.5 ya incluye la protección contra ataques de reseteo rápido de streams HTTP/2. |
| **Vite Dev Server** | CVE-2024-23331 (Posible path traversal en modo dev con rutas relativas hacia fuera de la raíz) | **MEDIA (6.5)** | **Aceptado / Aislado:** Aplica únicamente al servidor dev en modo local. En producción el frontend se compila a HTML estático servido por Nginx endurecido. Se utiliza Vite `5.2.0` que mitiga el traversal. |
| **H2 Database** | CVE-2022-45868 (Ejecución remota en consola web no autenticada de H2) | **MEDIA (6.5)** | **Aislado / Mitigado:** H2 está restringido al scope `<scope>test</scope>` en Maven; no se incluye en el artefacto JAR final de producción. |

---

## 3. Política de Mantenimiento Continuo
1. **Regla de Bloqueo en CI:** En `.gitlab-ci.yml`, el parámetro `-DfailBuildOnCVSS=8` aborta automáticamente el empaquetado si surge una nueva vulnerabilidad con severidad crítica no mitigada.
2. **Revisión de Parches:** Se ejecutan revisiones mensuales de dependencias con `mvn versions:display-dependency-updates` y `npm outdated`.
