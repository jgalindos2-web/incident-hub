# Registro y Plan de Gestión de Deuda Técnica - IT Incident Hub

## 1. Identificación y Evaluación de Deuda Técnica
En el desarrollo de **IT Incident Hub** se han identificado de forma transparente **5 deudas técnicas reales** derivadas de la velocidad inicial de entrega durante el Sprint 1:

| ID | Deuda Técnica Identificada | Tipo de Deuda | Severidad | Impacto | Estado |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **DT-01** | Ausencia de validación estricta en transiciones de estados de incidentes | Arquitectura / Lógica | **Alta** | Posibilidad de saltar de `NUEVO` directamente a `CERRADO` o transicionar al mismo estado sin registrar motivo ni fechas. | **Resuelta** (Sprint 2) |
| **DT-02** | Acoplamiento de Entidades JPA en Controladores y ausencia de DTOs específicos de actualización | Código / Diseño | **Alta** | Exposición directa del modelo relacional a la capa HTTP, sobrecarga de datos en payloads REST y riesgo de inyecciones en campos de auditoría. | **Resuelta** (Sprint 2) |
| **DT-03** | Consultas N+1 potenciales al consultar comentarios en listados masivos | Rendimiento / BD | **Media** | El método `findWithFilters` podría ejecutar consultas secundarias por cada incidente si se mapean comentarios sin `JOIN FETCH`. | **Planificada** (Sprint 3) |
| **DT-04** | Falta de paginación en `GET /incidents` (retorno de colección completa) | Escalabilidad | **Media** | En entornos con más de 10,000 incidentes, la respuesta JSON saturará la memoria del cliente y el pool de conexiones JDBC. | **Planificada** (Sprint 3) |
| **DT-05** | Ausencia de autenticación y autorización robusta basada en JWT / Spring Security | Seguridad | **Alta** | Actualmente los técnicos y roles se simulan desde el cliente mediante cabeceras y parámetros en lugar de tokens firmados RSA/HMAC. | **Backlog Futuro** |

---

## 2. Plan de Resolución de Deudas Técnicas Trazables

Para cumplir con los estándares de calidad de software y DevOps, se planificó y ejecutó la resolución de **2 deudas técnicas prioritarias** utilizando el flujo reglamentario:
`Issue en Backlog` &rarr; `Rama dedicada` &rarr; `Commits convencionales` &rarr; `Merge Request`.

---

### Deuda 1 Resuelta: DT-01 - Validación Estricta de la Máquina de Estados
- **Issue en GitLab:** `#8` / `#18` (`tipo::task`, `prioridad::alta`)
- **Rama:** `fix/8-status-validation`
- **Autor:** Carlos Gómez (DevOps Lead)
- **Revisor:** Mateo Ruiz (QA Engineer)
- **Merge Request Asociado:** `MR!4` ("fix: validación estricta de estados y manejo de excepciones")
- **Acciones Implementadas:**
  1. En `IncidentServiceImpl.java`, se agregó validación que verifica si el nuevo estado es idéntico al actual, lanzando `BadRequestException`.
  2. Asignación automática de marcas de tiempo `resolvedAt` al pasar a `RESUELTO` y `closedAt` al pasar a `CERRADO`.
  3. Registro inmediato de una entrada en la bitácora `incident_comments` con el autor del cambio y notas técnicas.
  4. En `IncidentDetailModal.jsx`, deshabilitación condicional de botones para evitar clics redundantes.
- **Evidencia de Pruebas:**
  Se agregó el test unitario `shouldThrowBadRequestWhenStatusUnchanged` en `IncidentServiceTest.java`.

---

### Deuda 2 Resuelta: DT-02 - Desacoplamiento de Modelos con DTOs Dedicados
- **Issue en GitLab:** `#17` (`tipo::task`, `prioridad::alta`)
- **Rama:** `refactor/17-deuda-tecnica-dtos`
- **Autor:** Mateo Ruiz (QA & Backend Support)
- **Revisor:** Carlos Gómez (DevOps Lead)
- **Merge Request Asociado:** `MR!5` ("refactor: resolución de deuda técnica en DTOs y consultas SQL")
- **Acciones Implementadas:**
  1. Creación de `StatusUpdateRequestDTO.java` y `AssignTechnicianRequestDTO.java` con anotaciones `@NotNull` y `@NotBlank`.
  2. Modificación de `IncidentController.java` para reemplazar parámetros sueltos por objetos de transferencia fuertemente tipados.
  3. Sanitización de entradas eliminando espacios en blanco accidentales (`.trim()`).
- **Evidencia de Pruebas:**
  Ejecución limpia de `mvn checkstyle:check` y `mvn test` en el pipeline de GitLab CI.

---

## 3. Matriz de Seguimiento para Deudas Restantes (DT-03, DT-04, DT-05)

| Deuda | Solución Técnica Planificada | Hito Objetivo | Criterio de Aceptación |
| :--- | :--- | :--- | :--- |
| **DT-03** | Reemplazar consultas por `JOIN FETCH` o EntityGraphs en `IncidentRepository.java`. | Release v1.1.0 | 1 sola consulta SQL generada en logs de Hibernate. |
| **DT-04** | Incorporar `Pageable` y `Page<IncidentResponseDTO>` con `page` y `size`. | Release v1.1.0 | Respuesta estándar con metadatos `totalElements` y `totalPages`. |
| **DT-05** | Implementar Spring Security 6 con OAuth2 Resource Server y Keycloak/JWT. | Release v2.0.0 | Tokens Bearer validados y roles `ROLE_ADMIN` y `ROLE_TECH`. |
