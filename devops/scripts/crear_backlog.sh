#!/usr/bin/env bash
# ==============================================================================
# Script: crear_backlog.sh
# Descripción: Automatiza la creación del Backlog en GitLab mediante API REST
#              Crea 2 Epics, 4 Features, 8 User Stories y 16 Tasks
# Seguridad: Lee el token estrictamente desde la variable de entorno GITLAB_TOKEN
# ==============================================================================

set -euo pipefail

# Validación de variables de entorno obligatorias
if [ -z "${GITLAB_TOKEN:-}" ]; then
  echo "❌ ERROR: La variable de entorno GITLAB_TOKEN no está definida."
  echo "👉 Exporta tu Personal Access Token con: export GITLAB_TOKEN=\"tu_token_aqui\""
  exit 1
fi

if [ -z "${GITLAB_PROJECT_ID:-}" ]; then
  echo "❌ ERROR: La variable de entorno GITLAB_PROJECT_ID no está definida."
  echo "👉 Exporta el ID de tu proyecto con: export GITLAB_PROJECT_ID=\"12345678\""
  exit 1
fi

GITLAB_URL="${GITLAB_URL:-https://gitlab.com}"
API_URL="${GITLAB_URL}/api/v4/projects/${GITLAB_PROJECT_ID}"

echo "=========================================================="
echo "🚀 Iniciando creación de Backlog en GitLab Project: ${GITLAB_PROJECT_ID}"
echo "📍 Instancia GitLab: ${GITLAB_URL}"
echo "=========================================================="

# 1. Crear Labels/Etiquetas estructuradas
echo "🏷️ Creando etiquetas de taxonomía de trabajo..."

crear_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  curl --silent --request POST "${API_URL}/labels" \
    --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
    --header "Content-Type: application/json" \
    --data "{\"name\":\"${name}\",\"color\":\"${color}\",\"description\":\"${desc}\"}" > /dev/null || true
}

crear_label "tipo::epic" "#5843AD" "Nivel estratégico"
crear_label "tipo::feature" "#1F75CB" "Capacidad funcional"
crear_label "tipo::story" "#108548" "Historia de usuario de valor de negocio"
crear_label "tipo::task" "#8F4700" "Tarea técnica de implementación"
crear_label "prioridad::critica" "#D93F0B" "Prioridad máxima"
crear_label "prioridad::alta" "#E24329" "Prioridad alta"
crear_label "prioridad::media" "#F5A623" "Prioridad media"
crear_label "prioridad::baja" "#1AAA55" "Prioridad baja"
crear_label "estado::to-do" "#7F8C8D" "Por iniciar"
crear_label "estado::in-progress" "#3498DB" "En desarrollo"
crear_label "estado::done" "#2ECC71" "Completada"

# Función auxiliar para crear issues
crear_issue() {
  local title="$1"
  local description="$2"
  local labels="$3"
  local weight="$4"

  echo "  ➕ Creando: [${labels}] ${title}"
  curl --silent --request POST "${API_URL}/issues" \
    --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" \
    --header "Content-Type: application/json" \
    --data "{
      \"title\": \"${title}\",
      \"description\": \"${description}\",
      \"labels\": \"${labels}\",
      \"weight\": ${weight}
    }" | grep -o '"iid":[0-9]*' | head -1 || echo ""
}

# ------------------------------------------------------------------------------
# 2 EPICS (En GitLab Free los representamos como Issue con etiqueta tipo::epic)
# ------------------------------------------------------------------------------
echo "📦 Creando 2 Epics..."

crear_issue "EPIC 1: Gestión Integral del Ciclo de Vida de Incidentes" \
  "Epic para englobar el registro, consulta, transiciones de estado y resolución técnica de tickets.\nResponsable: Carlos Gómez (DevOps/Backend Lead)" \
  "tipo::epic,prioridad::alta,estado::in-progress" 13

crear_issue "EPIC 2: Operaciones de TI, Métricas y Trazabilidad DevOps" \
  "Epic que cubre la bitácora de auditoría, dashboards de métricas operativas y pipeline CI/CD con runner self-hosted.\nResponsable: Sofía Herrera (Frontend Lead)" \
  "tipo::epic,prioridad::alta,estado::in-progress" 13

# ------------------------------------------------------------------------------
# 4 FEATURES
# ------------------------------------------------------------------------------
echo "🔷 Creando 4 Features..."

crear_issue "FEAT 1: Módulo Core de Incidentes y Persistencia" \
  "Permite modelar el esquema relacional en PostgreSQL y la API REST Spring Boot para incidentes.\nResponsable: Carlos Gómez" \
  "tipo::feature,prioridad::alta,estado::done" 8

crear_issue "FEAT 2: Gestión de Asignaciones y Workflow de Estados" \
  "Permite la asignación de técnicos responsables y transición controlada de estados (NUEVO a CERRADO).\nResponsable: Mateo Ruiz" \
  "tipo::feature,prioridad::alta,estado::in-progress" 8

crear_issue "FEAT 3: Bitácora de Auditoría y Comentarios" \
  "Almacena cronológicamente los eventos, cambios de estado y notas técnicas por incidente.\nResponsable: Sofía Herrera" \
  "tipo::feature,prioridad::media,estado::done" 5

crear_issue "FEAT 4: Dashboard Ejecutivo y Métricas en Tiempo Real" \
  "Calcula KPIs globales (abiertos, críticos, cerrados) y distribución por categoría/técnico.\nResponsable: Sofía Herrera" \
  "tipo::feature,prioridad::media,estado::in-progress" 8

# ------------------------------------------------------------------------------
# 8 USER STORIES
# ------------------------------------------------------------------------------
echo "📖 Creando 8 User Stories..."

crear_issue "US 1: Registro de Incidentes por Usuarios del Sistema" \
  "Como usuario deseo reportar incidentes con título, descripción, categoría y prioridad para solicitar atención técnica.\nEstimación: 5 pts | Asignado: Carlos Gómez" \
  "tipo::story,prioridad::alta,estado::done" 5

crear_issue "US 2: Consulta y Filtros Avanzados de Tickets" \
  "Como operador deseo filtrar la lista por estado, prioridad, categoría y técnico para ubicar tickets rápidamente.\nEstimación: 5 pts | Asignado: Sofía Herrera" \
  "tipo::story,prioridad::alta,estado::done" 5

crear_issue "US 3: Asignación Dinámica de Técnicos" \
  "Como coordinador deseo asignar un técnico a un incidente para que tome responsabilidad de su solución.\nEstimación: 3 pts | Asignado: Mateo Ruiz" \
  "tipo::story,prioridad::alta,estado::in-progress" 3

crear_issue "US 4: Transición de Estados ITIL con Validación" \
  "Como técnico deseo cambiar el estado de NUEVO a EN_PROCESO, RESUELTO o CERRADO dejando constancia.\nEstimación: 5 pts | Asignado: Carlos Gómez" \
  "tipo::story,prioridad::alta,estado::in-progress" 5

crear_issue "US 5: Registro Cronológico de Bitácora" \
  "Como técnico deseo escribir comentarios técnicos y seguimiento en un incidente específico.\nEstimación: 3 pts | Asignado: Mateo Ruiz" \
  "tipo::story,prioridad::media,estado::done" 3

crear_issue "US 6: Visualización de Historial de Cambios" \
  "Como auditor deseo visualizar todas las acciones pasadas en la línea de tiempo del ticket.\nEstimación: 3 pts | Asignado: Sofía Herrera" \
  "tipo::story,prioridad::media,estado::done" 3

crear_issue "US 7: Panel de KPIs y Contadores Críticos" \
  "Como gerente de TI deseo ver tarjetas con totales de incidentes abiertos, cerrados y críticos.\nEstimación: 5 pts | Asignado: Sofía Herrera" \
  "tipo::story,prioridad::alta,estado::in-progress" 5

crear_issue "US 8: Distribución de Carga Técnica y Categorías" \
  "Como supervisor deseo ver gráficos de barras con distribución por categoría y por técnico.\nEstimación: 5 pts | Asignado: Mateo Ruiz" \
  "tipo::story,prioridad::media,estado::in-progress" 5

# ------------------------------------------------------------------------------
# 16 TASKS TÉCNICAS
# ------------------------------------------------------------------------------
echo "⚙️ Creando 16 Tasks Técnicas..."

crear_issue "TASK 1: Diseñar scripts DDL de PostgreSQL (database/01_init.sql)" \
  "Crear tablas app_users, incidents, incident_comments e índices.\nEstimación: 4h | Asignado: Carlos Gómez | Padre: US 1" \
  "tipo::task,prioridad::alta,estado::done" 2

crear_issue "TASK 2: Implementar modelo JPA Incident y DTO de creación" \
  "Crear clases Entity, Enums y validación con Bean Validation en Spring Boot.\nEstimación: 4h | Asignado: Carlos Gómez | Padre: US 1" \
  "tipo::task,prioridad::alta,estado::done" 2

crear_issue "TASK 3: Crear componente IncidentCreateModal en React" \
  "Formulario con validación de campos obligatorios y envío vía REST.\nEstimación: 6h | Asignado: Sofía Herrera | Padre: US 1" \
  "tipo::task,prioridad::alta,estado::done" 3

crear_issue "TASK 4: Implementar consulta con query dinámico en IncidentRepository" \
  "Query JPQL con filtros condicionales para status, priority, category y technician.\nEstimación: 4h | Asignado: Carlos Gómez | Padre: US 2" \
  "tipo::task,prioridad::alta,estado::done" 2

crear_issue "TASK 5: Construir barra de filtros responsiva en frontend" \
  "Selectores combinados y botón de limpiar filtros con actualización reactiva.\nEstimación: 4h | Asignado: Sofía Herrera | Padre: US 2" \
  "tipo::task,prioridad::alta,estado::done" 2

crear_issue "TASK 6: Crear endpoint PATCH /incidents/{id}/assign" \
  "Lógica de asignación de técnico y generación automática de log de auditoría.\nEstimación: 3h | Asignado: Mateo Ruiz | Padre: US 3" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 7: Implementar selector de asignación en IncidentDetailModal" \
  "Dropdown con lista de técnicos recuperados de /users.\nEstimación: 3h | Asignado: Sofía Herrera | Padre: US 3" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 8: Validar máquina de estados en IncidentServiceImpl" \
  "Verificar estados permitidos y marcar resolvedAt / closedAt adecuadamente.\nEstimación: 4h | Asignado: Carlos Gómez | Padre: US 4" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 9: Crear botones de acción de estado en interfaz de usuario" \
  "Botones para NUEVO, ASIGNADO, EN_PROCESO, RESUELTO y CERRADO con deshabilitado inteligente.\nEstimación: 4h | Asignado: Sofía Herrera | Padre: US 4" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 10: Implementar entidad Comment y endpoint POST /incidents/{id}/comments" \
  "Persistencia de comentarios con autor y tipo de acción en base de datos.\nEstimación: 3h | Asignado: Mateo Ruiz | Padre: US 5" \
  "tipo::task,prioridad::media,estado::done" 2

crear_issue "TASK 11: Diseñar formulario de comentario rápido en la vista de detalle" \
  "Caja de texto que envía comentario usando el usuario activo simulado.\nEstimación: 3h | Asignado: Sofía Herrera | Padre: US 5" \
  "tipo::task,prioridad::media,estado::done" 2

crear_issue "TASK 12: Diseñar componente visual Timeline con badges" \
  "Línea de tiempo vertical con badges de tipo de evento y marcas de tiempo.\nEstimación: 4h | Asignado: Sofía Herrera | Padre: US 6" \
  "tipo::task,prioridad::media,estado::done" 2

crear_issue "TASK 13: Implementar endpoint GET /dashboard/stats con agregaciones SQL" \
  "Cálculo consolidado de abiertos, cerrados, críticos y agrupaciones GROUP BY.\nEstimación: 4h | Asignado: Carlos Gómez | Padre: US 7" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 14: Construir tarjetas KPI con gradientes en DashboardView" \
  "Cards de Total, Abiertos, Cerrados y Críticos con estilos glassmorphism.\nEstimación: 3h | Asignado: Sofía Herrera | Padre: US 7" \
  "tipo::task,prioridad::alta,estado::in-progress" 2

crear_issue "TASK 15: Implementar barras de distribución por categoría y técnico" \
  "Barras animadas basadas en porcentajes relativos del total de tickets.\nEstimación: 4h | Asignado: Mateo Ruiz | Padre: US 8" \
  "tipo::task,prioridad::media,estado::in-progress" 2

crear_issue "TASK 16: Escribir pruebas unitarias e integración en JUnit 5 y Vitest" \
  "Pruebas de IncidentServiceTest, IncidentControllerTest y componentes React.\nEstimación: 6h | Asignado: Mateo Ruiz | Padre: US 8" \
  "tipo::task,prioridad::alta,estado::in-progress" 3

echo "=========================================================="
echo "✅ ¡Backlog creado con éxito en GitLab!"
echo "   2 Epics, 4 Features, 8 User Stories y 16 Tasks registradas."
echo "=========================================================="
