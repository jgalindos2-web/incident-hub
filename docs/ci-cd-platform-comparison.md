# Comparativa Técnica y Académica de Plataformas CI/CD: GitLab CI/CD vs. GitHub Actions

**Proyecto:** IT Incident Hub  
**Autor:** Equipo de Ingeniería DevSecOps  
**Fecha:** Octubre 2026  
**Rama de Análisis:** `feat/26-github-actions-release-validation`  
**Arquitectura:** GitLab CI/CD (Plataforma Primaria de Desarrollo y Despliegue) $\rightarrow$ Push Mirror $\rightarrow$ GitHub Actions (Plataforma Secundaria para Verificación Cruzada y Distribución de Releases).

---

## 1. Introducción y Metodología de Evaluación

Este documento presenta una evaluación objetiva entre **GitLab CI/CD** y **GitHub Actions** en el marco del proyecto *IT Incident Hub*.

### 1.1 Metodología y Entornos Evaluados
- **GitLab CI/CD (Plataforma Primaria):**  
  - Orquestador: GitLab.com (SaaS).
  - Ejecutor: GitLab Runner auto-hospedado (*self-hosted shell runner*) bajo Windows 11 (PowerShell 5.1/7.x, JDK 17 Eclipse Temurin, Apache Maven 3.9, Node.js 22 LTS).
  - Datos: **Mediciones reales obtenidas de pipelines ejecutados** en las tareas TASK-24 y TASK-25.
- **GitHub Actions (Plataforma Secundaria/Espejo):**  
  - Orquestador: GitHub.com.
  - Ejecutor: Máquinas virtuales efímeras en la nube (*GitHub-hosted runners* con `ubuntu-latest`, 2 vCPU, 7 GB RAM, SSD, Linux Kernel 6.x).
  - Datos: **Configuración técnica y sintáctica implementada y validada localmente**. Toda métrica dependiente de la ejecución en la nube de GitHub se marca explícitamente como **[PENDIENTE DE MEDICIÓN REMOTA EN GITHUB]** para mantener rigor científico y evitar conjeturas.

---

## 2. Matriz Comparativa Detallada

| Criterio de Evaluación | GitLab CI/CD (Medición Real en Entorno Local) | GitHub Actions (Configuración Implementada) | Análisis Comparativo y Conclusiones Técnicas |
| :--- | :--- | :--- | :--- |
| **Arquitectura de Pipeline** | Etapas secuenciales rígidas (`stages: [.pre, test, security, build_and_package, deploy, .post]`) con optimizaciones de grafo mediante directiva `needs`. | Grafo de trabajos orientados a eventos (`jobs`) con dependencias dirigidas explícitas (`needs: quality-gate-and-test`). | GitLab organiza naturalmente flujos empresariales por etapas; GitHub Actions ofrece mayor granularidad y portabilidad entre sistemas operativos. |
| **Infraestructura de Runners** | **Self-hosted (Local en Windows):** Depende de la estación de trabajo y del servicio local de runner. | **GitHub-hosted (Nube en Linux):** Entornos efímeros limpios aprovisionados bajo demanda por GitHub sin costo de administración local. | El runner auto-hospedado permite acceso directo a la máquina host, mientras que GitHub-hosted garantiza un entorno inmutable sin residuos de compilaciones previas. |
| **Tiempo de Inicio de Job (Startup)** | **Medido: < 2 segundos.** El runner local en modo demonio toma el trabajo inmediatamente. | **[PENDIENTE DE MEDICIÓN REMOTA EN GITHUB]** (Sujeto a la cola de asignación de VM de GitHub-hosted). | El runner auto-hospedado inicia de inmediato al no requerir el aprovisionamiento de una máquina virtual desde cero. |
| **Persistencia y Caché de Dependencias** | Persistencia local directa en disco: `~/.m2/repository` persistente de forma nativa; `frontend/node_modules/` cacheado en archivo. | Caché remota gestionada por GitHub Cache API (`actions/setup-java` con `cache: maven`, `actions/setup-node` con `cache: npm`). | La persistencia en disco del runner local reduce tiempos de red a 0 ms; en GitHub Actions las dependencias se transfieren por red en paquetes comprimidos. |
| **Duración de Pruebas de Backend** | **Medido: 16.2s – 21.2s** (22 pruebas unitarias e integración con Spring Boot + H2 + Checkstyle + Surefire). | **[PENDIENTE DE MEDICIÓN REMOTA EN GITHUB]** (Requiere ejecución efectiva en runner `ubuntu-latest` tras push). | El runner local aprovecha el disco SSD local; el tiempo en GitHub dependerá de la descarga inicial de artefactos de Maven. |
| **Duración de Pruebas de Frontend** | **Medido: 8.5s – 12.0s** (Suite de pruebas con Vitest y cobertura V8). | **[PENDIENTE DE MEDICIÓN REMOTA EN GITHUB]** (Requiere ejecución efectiva en runner `ubuntu-latest` tras push). | Ambas plataformas ejecutan la misma suite `npx vitest run --coverage`. |
| **Manejo de Fallos y Compuertas de Calidad** | Compuerta estricta: `allow_failure: false` en seguridad. Un fallo de prueba detiene las etapas posteriores. | Compuerta estricta: Job `quality-gate-and-test` obligatorio. No permite omitir pruebas ni usar `continue-on-error`. | Ambas plataformas garantizan detención determinista ante cualquier código de salida distinto de cero ($\ne 0$). |
| **Gestión de Permisos y Secretos** | Tokens de registro de runner; variables CI/CD protegidas (`Protected`) y enmascaradas (`Masked`). | `GITHUB_TOKEN` efímero con permisos mínimos declarativos (`contents: read` en CI; `contents: write` solo en Release). | GitHub Actions sobresale por su soporte nativo de OIDC y el principio de mínimo privilegio declarado en bloque dentro del YAML. |
| **Publicación de Releases y Distribución** | Se basa en artefactos temporales de job (`expire_in: 7 days`); publicación de releases mediante API opcional. | Publicación formal en GitHub Releases asociada al tag semántico verificado, con assets ZIP y `SHA256SUMS.txt`. | GitHub Actions es significativamente superior para distribución formal a usuarios finales y verificación criptográfica. |
| **Trazabilidad de Tags y Mirroring** | Fuente primaria de verdad. Los tags se crean aquí y se replican hacia GitHub vía push mirror. | Validador secundario: verifica que el tag exista, resuelve el commit SHA real (`^{commit}`) y valida que no haya mutado. | La combinación asegura que ningún artefacto se publique sobre un commit que no corresponda al tag verificado. |
| **Integración con Flujo de Revisión** | Integración directa con Merge Requests en GitLab. Control de fusión gobernado en GitLab. | Integración con Pull Requests en GitHub. **Limitación:** GitHub Actions no puede bloquear un merge realizado en GitLab por el mirroring. | GitLab ejerce la gobernanza de integración; GitHub Actions audita de forma independiente la integridad del espejo. |

---

## 3. Dinámica del Repositorio Espejo (Mirroring) y Artefactos

### 3.1 Hallazgos Arquitectónicos
1. **El protocolo Git no sincroniza artefactos:**  
   El mirroring push de GitLab a GitHub transfiere únicamente commits, ramas y tags. Los binarios empaquetados (`.jar`, `.zip`) generados por GitLab CI/CD se almacenan en la infraestructura de GitLab y **no están disponibles de forma nativa en GitHub**.
2. **Estrategia de Generación Autónoma:**  
   Para evitar acoplamientos frágiles (como tokens de API de GitLab almacenados en GitHub), el workflow `.github/workflows/release.yml` compila y empaqueta los artefactos de forma reproducible directamente en el runner `ubuntu-latest` a partir del commit exacto referenciado por el tag.
3. **Selección Unívoca del JAR:**  
   Se implementó una rutina de búsqueda que excluye `.jar.original` y bibliotecas auxiliares, garantizando que el paquete backend contenga de forma inequívoca el JAR ejecutable de Spring Boot (`incident-hub-backend-1.0.0.jar`).
4. **Verificación Criptográfica (SHA-256):**  
   Los checksums se calculan sobre los archivos finales empaquetados e inspeccionados, y se incorporan al archivo `SHA256SUMS.txt` y al cuerpo del Release (`RELEASE_NOTES.md`) antes de invocar la acción de publicación.

---

## 4. Limitaciones Documentadas

1. **Auditoría Dinámica NVD/OWASP:**  
   Tanto en GitLab CI/CD como en GitHub Actions, la consulta dinámica al catálogo NIST NVD está condicionada a la presencia de `NVD_API_KEY`. En su ausencia, el análisis se reporta como **PENDIENTE**, apoyándose en las comprobaciones de versiones mínimas de Nivel 1 y Nivel 2.
2. **Limitaciones de Bloqueo Cruzado:**  
   GitHub Actions no puede evitar que un desarrollador fusione ramas en GitLab. La política de calidad se apoya en que GitLab CI/CD valide las ramas feature antes del merge, y GitHub Actions verifique la rama `main` y los tags replicados.
3. **Métricas Pendientes en GitHub Actions:**  
   Los tiempos de inicialización de runner, compilación en Linux y transferencia de caché de GitHub Actions quedan catalogados como pendientes de medición empírica hasta que el equipo autorice el primer push a GitHub.

---

## 5. Conclusiones y Buenas Prácticas

1. **Complementariedad Operativa:** Mantener GitLab CI/CD como plataforma primaria de desarrollo y despliegue a producción (Render), utilizando GitHub Actions como plataforma de distribución y verificación cruzada multiplataforma (Windows local vs. Linux nube).
2. **Inmutabilidad de Entregables:** Al verificar que el tag no haya mutado entre la compuerta de calidad y el empaquetado, y calcular los hashes SHA-256 in situ, se garantiza la integridad de la cadena de suministro de software (*Software Supply Chain Security*).
