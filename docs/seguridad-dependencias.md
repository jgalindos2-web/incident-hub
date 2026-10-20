# Auditoría de Seguridad de Dependencias y Gestión de Secretos - IT Incident Hub

## 1. Política de Gestión de Dependencias y Manejo de Hallazgos en CI/CD

En el marco de la estrategia DevSecOps de **IT Incident Hub**, el pipeline automatizado ejecuta una evaluación continua de dependencias en las etapas tempranas de entrega:

### Directrices de Auditoría en el Pipeline:
1. **Auditoría Continua No Bloqueante (`allow_failure: true`):**
   - El job `security:audit_dependencies` en GitLab CI/CD ejecuta `npm audit --audit-level=high` sobre el código del frontend y componentes asociados.
   - Para evitar interrupciones no deseadas en el ciclo de entrega causadas por advertencias en dependencias exclusivas de desarrollo (`devDependencies` como herramientas de compilación o linters locales), el job incorpora `allow_failure: true` y control de excepciones (`|| true`).
   - Todos los hallazgos son volcados en los registros de ejecución del pipeline para su clasificación y seguimiento en el backlog técnico.
2. **Criterios de Bloqueo para Producción:**
   - Si una vulnerabilidad con puntaje **CVSS &ge; 8.0 (Alta o Crítica)** afecta una dependencia directa empaquetada en el binario final de producción (por ejemplo, el driver JDBC o el motor web Tomcat), el equipo tiene prohibido autorizar el Merge a la rama `main` hasta que se aplique el parche correspondiente en `pom.xml` o `package.json`.

---

## 2. Matriz de Auditoría y Mitigación de Vulnerabilidades (CVEs)

A continuación se registra el estado oficial de las dependencias evaluadas contra la base de datos nacional de vulnerabilidades (NVD / CVE):

| Componente | Paquete / Dependencia | Identificador CVE | Severidad CVSS | Naturaleza de la Vulnerabilidad | Decisión Técnica & Acción de Mitigación |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Backend** | `org.postgresql:postgresql` | **CVE-2024-1597** | **CRÍTICA (9.8)** | Inyección SQL en pgjdbc anterior a `42.7.2` bajo modo de parámetros no preparados. | **Mitigado:** Se fijó explícitamente la versión `postgresql 42.7.3` en `pom.xml`, donde la vulnerabilidad está completamente corregida. |
| **Backend** | `org.springframework:spring-web` | **CVE-2023-34055** | **MEDIA (5.3)** | Potencial denegación de servicio por agotamiento de memoria ante etiquetas dinámicas excesivas en Actuator. | **Mitigado:** Se implementa Spring Boot `3.2.5` (Spring Framework 6.1.6) con límites estrictos de cardinalidad en métricas. |
| **Backend** | `org.apache.tomcat.embed:tomcat-embed-core` | **CVE-2024-24549** | **ALTA (7.5)** | Denegación de servicio por procesamiento de streams HTTP/2 malformados. | **Mitigado:** Tomcat `10.1.20` incluido en Spring Boot 3.2.5 contiene el parche contra el ataque de reseteo rápido HTTP/2. |
| **Backend** | `com.h2database:h2` | **CVE-2022-45868** | **MEDIA (6.5)** | Ejecución de comandos remotos si la consola web de H2 se expone públicamente. | **Aislado:** Dependencia restringida al scope `<scope>test</scope>`. No se distribuye en el JAR final de producción en Render. |
| **Frontend** | `vite` | **CVE-2024-23331** | **MEDIA (6.5)** | Path traversal potencial en modo servidor dev local con URLs de doble codificación. | **Aislado:** Corregido en Vite `5.2.0`. En producción, el frontend se compila a un bundle estático servido por CDN / Nginx sin servidor Node activo. |
| **Frontend** | `npm audit devDependencies` | **Varios (Menores)** | **BAJA / MEDIA** | Alertas en subárboles de herramientas de desarrollo (linters, parsers de AST). | **Aceptado / Monitoreado:** Evaluado mediante `security:audit_dependencies` con tolerancia controlada para no detener la compilación de producción. |

---

## 3. Política Estricta de Cero Secretos en Repositorio (Zero Secrets in Git)

> [!CAUTION]
> **QUEDA TERMINANTEMENTE PROHIBIDO SUBIR ARCHIVOS `.env`, `.env.local` O CREDENCIALES AL REPOSITORIO GIT.**

### Mecanismos de Prevención Activos:
1. **Reglas de `.gitignore`:** Bloquea `.env`, `.env.local`, `.env.*`, archivos de certificados (`*.key`, `*.pem`, `*.pfx`) y carpetas de build.
2. **Plantilla de Referencia (`.env.example`):** Documenta las variables requeridas por el sistema utilizando placeholders ficticios para los desarrolladores.
3. **Escáner Preventivo en GitHub Actions (`pr-validation.yml`):**
   - El job `mirror-quality-gate` inspecciona el árbol de archivos en cada push. Si encuentra algún archivo con prefijo `.env` (distinto de `.env.example`), aborta la ejecución con código de salida 1 y notifica el estado fallido a la API de GitLab.

---

## 4. Gestión de Secretos por Plataforma

Las credenciales reales requeridas en tiempo de ejecución se administran a través de los almacenes seguros correspondientes:

| Variable / Secreto | Almacén y Mecanismo | Configuración de Seguridad |
| :--- | :--- | :--- |
| `RENDER_DEPLOY_HOOK_BACKEND` | GitLab CI/CD Variables | `Masked` (Oculta en logs de consola), `Protected` (Solo ramas protegidas). |
| `RENDER_DEPLOY_HOOK_FRONTEND` | GitLab CI/CD Variables | `Masked`, `Protected`. |
| `GITLAB_TOKEN` | GitHub Secrets | Secreto de repositorio para interactuar con la Commit Status API. |
| `GITLAB_PROJECT_ID` | GitHub Secrets | Identificador numérico del proyecto en GitLab. |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Render Dashboard | Inyectadas automáticamente mediante la base de datos gestionada `incident-hub-db`. |
| `CORS_ALLOWED_ORIGINS` | Render Dashboard | Variable de entorno en el Web Service de Backend con la URL del Frontend. |
