# Registro y Plan de Gestión de Deuda Técnica - IT Incident Hub

## 1. Identificación y Evaluación de Deuda Técnica (Matriz de 5 Deudas Reales)

En el proceso de auditoría y análisis arquitectónico de **IT Incident Hub**, el equipo de ingeniería DevOps y Desarrollo identificó de forma transparente **5 deudas técnicas reales** surgidas durante el desarrollo inicial:

| ID | Deuda Técnica Identificada | Categoría | Severidad | Impacto en el Sistema | Estado Actual |
| :---: | :--- | :--- | :---: | :--- | :---: |
| **DT-01** | **Ausencia de validación estricta en transiciones de estados de incidentes** | Lógica de Negocio / ITIL | **Alta** | Posibilidad de transicionar a estados inconsistentes (ej. saltar de `NUEVO` directamente a `CERRADO`) o reenviar el mismo estado sin registrar marcas de tiempo ni auditoría técnica. | **Resuelta** (Sprint 2 / MR!4) |
| **DT-02** | **Acoplamiento de Entidades JPA en Controladores y ausencia de DTOs tipados** | Arquitectura / Seguridad | **Alta** | Exposición directa del modelo relacional en la API REST, sobrecarga de datos en payloads HTTP, ausencia de sanitización y riesgo de inyecciones en campos de auditoría. | **Resuelta** (Sprint 2 / MR!5) |
| **DT-03** | **Falta de indexación en columnas de filtrado frecuente y riesgo de consultas N+1** | Base de Datos / Rendimiento | **Media** | Consultas `SELECT` sobre tablas con filtros por `status`, `priority` y `created_at` ejecutan Table Scans completos. La relación con comentarios podría generar consultas N+1 en listados masivos. | **Planificada** (Sprint 3) |
| **DT-04** | **Falta de paginación y ordenamiento en endpoint de listado (`GET /incidents`)** | Escalabilidad / API | **Media** | El endpoint retorna la totalidad de registros en memoria. A partir de 5,000 incidentes provocará latencias elevadas, saturación de la memoria JVM y degradación en el cliente web. | **Planificada** (Sprint 3) |
| **DT-05** | **Logs no estructurados y falta de Correlation ID para trazabilidad distribuida** | Observabilidad / DevOps | **Media** | Registros de logs en formato plano de texto estándar sin formato JSON estructurado, dificultando la ingestión y correlación de trazas de errores entre frontend y backend en Render. | **Backlog Futuro** |

---

## 2. Solución Trazable de Deudas Técnicas Prioritarias

Para cumplir con la rúbrica de trazabilidad DevOps, se ejecutó la remediación de **2 deudas técnicas críticas** siguiendo el flujo reglamentario:
`Issue en Backlog` &rarr; `Rama dedicada` &rarr; `Commits convencionales con ID` &rarr; `Code Review` &rarr; `Validación de CI` &rarr; `Merge Request`.

---

### Caso 1 Resuelto: DT-01 - Validación Estricta de la Máquina de Estados ITIL
- **Identificador de Tarea:** GitLab Issue `#8` / Azure Boards `AB#18` (`tipo::bug`, `prioridad::alta`)
- **Rama Git:** `fix/18-status-validation`
- **Ingeniero Responsable:** Carlos Gómez (DevOps & Backend Lead)
- **Revisor / QA:** Mateo Ruiz (QA Engineer)
- **Merge Request Asociado:** `MR!4` (*"fix(service): AB#18 validación estricta de estados y manejo de excepciones"*)
- **Detalle de la Solución Implementada:**
  1. En `IncidentServiceImpl.java`, se implementó una máquina de estados estricta que valida que el nuevo estado sea válido según el flujo ITIL (`NUEVO` &rarr; `ASIGNADO` &rarr; `EN_PROCESO` &rarr; `RESUELTO` &rarr; `CERRADO`).
  2. Se añadió detección de redundancia: si el estado recibido es idéntico al actual, se lanza un `BadRequestException` descriptivo.
  3. Automatización de marcas de tiempo: cuando el estado cambia a `RESUELTO`, se fija automáticamente `resolvedAt = LocalDateTime.now()`; si cambia a `CERRADO`, se fija `closedAt = LocalDateTime.now()`.
  4. Registro obligatorio de una entrada en la bitácora `incident_comments` con el autor y descripción del cambio.
- **Evidencia y Pruebas Automatizadas:**
  - Se crearon pruebas unitarias en `IncidentServiceTest.java`: `shouldThrowBadRequestWhenStatusUnchanged()` y `shouldTransitionStatusAndSetTimestamps()`.
  - El pipeline de GitLab CI ejecutó `mvn test` con 100% de éxito en el job `backend:test`.

---

### Caso 2 Resuelto: DT-02 - Desacoplamiento de Entidades con DTOs Dedicados y Validación JSR-380
- **Identificador de Tarea:** GitLab Issue `#17` / Azure Boards `AB#17` (`tipo::refactor`, `prioridad::alta`)
- **Rama Git:** `refactor/17-deuda-tecnica-dtos`
- **Ingeniero Responsable:** Mateo Ruiz (QA & Backend Support)
- **Revisor:** Carlos Gómez (DevOps Lead)
- **Merge Request Asociado:** `MR!5` (*"refactor(api): AB#17 implementar DTOs de actualización y sanitización Bean Validation"*)
- **Detalle de la Solución Implementada:**
  1. Creación de clases DTO específicas: `IncidentCreateRequestDTO.java`, `StatusUpdateRequestDTO.java` y `AssignTechnicianRequestDTO.java`.
  2. Incorporación de anotaciones de validación `@NotBlank`, `@Size(max = 255)`, `@NotNull` para evitar inyecciones de datos en blanco o cargas maliciosas.
  3. Modificación de `IncidentController.java` para recibir exclusivamente DTOs con anotación `@Valid`, retornando `IncidentResponseDTO` para no filtrar campos internos de la base de datos.
  4. Sanitización automática de campos de texto mediante `.trim()` para eliminar espacios invisibles y caracteres de escape.
- **Evidencia y Pruebas Automatizadas:**
  - Ejecución de Checkstyle (`mvn checkstyle:check`) aprobada con 0 advertencias.
  - Validación de respuesta HTTP `400 Bad Request` ante payloads con campos vacíos probada en tests de integración con MockMvc.

---

## 3. Plan de Mitigación para Deudas Técnicas Restantes

| ID | Deuda Técnica | Solución Técnica Planificada | Hito / Versión | Criterio de Aceptación |
| :---: | :--- | :--- | :---: | :--- |
| **DT-03** | Falta de Índices y Consultas N+1 | Agregar índices en `01_init.sql` sobre `(status, priority)` y aplicar `JOIN FETCH` / `@EntityGraph` en `IncidentRepository.java`. | Release `v1.1.0` | Plan de ejecución SQL `EXPLAIN ANALYZE` muestra Index Scan en lugar de Seq Scan. |
| **DT-04** | Paginación en Listado | Implementar `org.springframework.data.domain.Pageable` en `IncidentController.java` devolviendo `Page<IncidentResponseDTO>`. | Release `v1.1.0` | Endpoint responde en `< 150ms` para colecciones de 50,000 registros con metadatos `page`, `size` y `totalPages`. |
| **DT-05** | Logs Estructurados & Correlation ID | Configurar Logback con encoder Logstash JSON y filtro `MDC` para propagar cabecera `X-Correlation-ID`. | Release `v2.0.0` | Cada línea de log emitida en Render contiene `traceId`, `timestamp_utc`, `service` y `level`. |
