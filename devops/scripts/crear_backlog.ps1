<#
.SYNOPSIS
    Script PowerShell para crear el Backlog en GitLab mediante API REST.
.DESCRIPTION
    Crea 2 Epics, 4 Features, 8 User Stories y 16 Tasks con responsable, prioridad y estimación.
    Lee el token de la variable de entorno $env:GITLAB_TOKEN.
#>

[CmdletBinding()]
param()

$token = $env:GITLAB_TOKEN
$projectId = $env:GITLAB_PROJECT_ID
$gitlabUrl = if ($env:GITLAB_URL) { $env:GITLAB_URL } else { "https://gitlab.com" }

if (-not $token) {
    Write-Error "ERROR: La variable de entorno GITLAB_TOKEN no está definida. Configúrala con: `$env:GITLAB_TOKEN = 'tu_token'"
    exit 1
}

if (-not $projectId) {
    Write-Error "ERROR: La variable de entorno GITLAB_PROJECT_ID no está definida. Configúrala con: `$env:GITLAB_PROJECT_ID = '12345678'"
    exit 1
}

$apiUrl = "$gitlabUrl/api/v4/projects/$projectId"
$headers = @{
    "PRIVATE-TOKEN" = $token
    "Content-Type"  = "application/json"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando creación de Backlog en GitLab Project: $projectId" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

function New-GitLabLabel {
    param($Name, $Color, $Desc)
    $body = @{ name = $Name; color = $Color; description = $Desc } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$apiUrl/labels" -Method Post -Headers $headers -Body $body | Out-Null
    } catch {}
}

function New-GitLabIssue {
    param($Title, $Description, $Labels, $Weight)
    Write-Host "  ➕ Creando: [$Labels] $Title" -ForegroundColor Yellow
    $body = @{
        title       = $Title
        description = $Description
        labels      = $Labels
        weight      = $Weight
    } | ConvertTo-Json
    try {
        $resp = Invoke-RestMethod -Uri "$apiUrl/issues" -Method Post -Headers $headers -Body $body
        return $resp.iid
    } catch {
        Write-Warning "Fallo al crear $Title : $_"
    }
}

# 1. Crear Labels
Write-Host "🏷️ Creando taxonomía de etiquetas..." -ForegroundColor Cyan
New-GitLabLabel -Name "tipo::epic" -Color "#5843AD" -Desc "Nivel estratégico"
New-GitLabLabel -Name "tipo::feature" -Color "#1F75CB" -Desc "Capacidad funcional"
New-GitLabLabel -Name "tipo::story" -Color "#108548" -Desc "Historia de usuario de valor de negocio"
New-GitLabLabel -Name "tipo::task" -Color "#8F4700" -Desc "Tarea técnica de desarrollo"
New-GitLabLabel -Name "prioridad::critica" -Color "#D93F0B" -Desc "Prioridad máxima"
New-GitLabLabel -Name "prioridad::alta" -Color "#E24329" -Desc "Prioridad alta"
New-GitLabLabel -Name "prioridad::media" -Color "#F5A623" -Desc "Prioridad media"
New-GitLabLabel -Name "prioridad::baja" -Color "#1AAA55" -Desc "Prioridad baja"
New-GitLabLabel -Name "estado::to-do" -Color "#7F8C8D" -Desc "Por iniciar"
New-GitLabLabel -Name "estado::in-progress" -Color "#3498DB" -Desc "En desarrollo"
New-GitLabLabel -Name "estado::done" -Color "#2ECC71" -Desc "Completada"

# 2. Epics
New-GitLabIssue -Title "EPIC 1: Gestión Integral del Ciclo de Vida de Incidentes" `
    -Description "Epic para englobar el registro, consulta, transiciones y resolución de tickets.`nResponsable: Carlos Gómez" `
    -Labels "tipo::epic,prioridad::alta,estado::in-progress" -Weight 13

New-GitLabIssue -Title "EPIC 2: Operaciones de TI, Métricas y Trazabilidad DevOps" `
    -Description "Epic para bitácora de auditoría, dashboards y pipeline CI/CD con runner self-hosted.`nResponsable: Sofía Herrera" `
    -Labels "tipo::epic,prioridad::alta,estado::in-progress" -Weight 13

# 3. Features
New-GitLabIssue -Title "FEAT 1: Módulo Core de Incidentes y Persistencia" `
    -Description "Esquema relacional en PostgreSQL y API REST Spring Boot.`nResponsable: Carlos Gómez" `
    -Labels "tipo::feature,prioridad::alta,estado::done" -Weight 8

New-GitLabIssue -Title "FEAT 2: Gestión de Asignaciones y Workflow de Estados" `
    -Description "Asignación de técnicos y flujo de estados ITIL.`nResponsable: Mateo Ruiz" `
    -Labels "tipo::feature,prioridad::alta,estado::in-progress" -Weight 8

New-GitLabIssue -Title "FEAT 3: Bitácora de Auditoría y Comentarios" `
    -Description "Eventos cronológicos y notas de resolución por incidente.`nResponsable: Sofía Herrera" `
    -Labels "tipo::feature,prioridad::media,estado::done" -Weight 5

New-GitLabIssue -Title "FEAT 4: Dashboard Ejecutivo y Métricas en Tiempo Real" `
    -Description "Cálculo de KPIs y distribución por categoría/técnico.`nResponsable: Sofía Herrera" `
    -Labels "tipo::feature,prioridad::media,estado::in-progress" -Weight 8

# 4. User Stories
New-GitLabIssue -Title "US 1: Registro de Incidentes por Usuarios del Sistema" -Description "Como usuario deseo reportar incidentes con categoría y prioridad.`nAsignado: Carlos Gómez" -Labels "tipo::story,prioridad::alta,estado::done" -Weight 5
New-GitLabIssue -Title "US 2: Consulta y Filtros Avanzados de Tickets" -Description "Como operador deseo filtrar la lista por estado, prioridad, etc.`nAsignado: Sofía Herrera" -Labels "tipo::story,prioridad::alta,estado::done" -Weight 5
New-GitLabIssue -Title "US 3: Asignación Dinámica de Técnicos" -Description "Como coordinador deseo asignar técnicos a incidentes.`nAsignado: Mateo Ruiz" -Labels "tipo::story,prioridad::alta,estado::in-progress" -Weight 3
New-GitLabIssue -Title "US 4: Transición de Estados ITIL con Validación" -Description "Como técnico deseo transicionar estados válidos.`nAsignado: Carlos Gómez" -Labels "tipo::story,prioridad::alta,estado::in-progress" -Weight 5
New-GitLabIssue -Title "US 5: Registro Cronológico de Bitácora" -Description "Como técnico deseo agregar notas de seguimiento.`nAsignado: Mateo Ruiz" -Labels "tipo::story,prioridad::media,estado::done" -Weight 3
New-GitLabIssue -Title "US 6: Visualización de Historial de Cambios" -Description "Como auditor deseo ver la línea de tiempo de auditoría.`nAsignado: Sofía Herrera" -Labels "tipo::story,prioridad::media,estado::done" -Weight 3
New-GitLabIssue -Title "US 7: Panel de KPIs y Contadores Críticos" -Description "Como gerente deseo ver métricas de tickets abiertos/críticos.`nAsignado: Sofía Herrera" -Labels "tipo::story,prioridad::alta,estado::in-progress" -Weight 5
New-GitLabIssue -Title "US 8: Distribución de Carga Técnica y Categorías" -Description "Como supervisor deseo gráficos de barras de asignaciones.`nAsignado: Mateo Ruiz" -Labels "tipo::story,prioridad::media,estado::in-progress" -Weight 5

# 5. Tasks
New-GitLabIssue -Title "TASK 1: Diseñar scripts DDL de PostgreSQL (database/01_init.sql)" -Description "Tablas app_users, incidents, incident_comments.`nAsignado: Carlos Gómez" -Labels "tipo::task,prioridad::alta,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 2: Implementar modelo JPA Incident y DTO de creación" -Description "Entities, DTOs y validación Bean Validation.`nAsignado: Carlos Gómez" -Labels "tipo::task,prioridad::alta,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 3: Crear componente IncidentCreateModal en React" -Description "Modal con validación en frontend.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::alta,estado::done" -Weight 3
New-GitLabIssue -Title "TASK 4: Implementar consulta con query dinámico en IncidentRepository" -Description "Filtros en JPA repository.`nAsignado: Carlos Gómez" -Labels "tipo::task,prioridad::alta,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 5: Construir barra de filtros responsiva en frontend" -Description "Filtros combinados y botón reset.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::alta,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 6: Crear endpoint PATCH /incidents/{id}/assign" -Description "Lógica de asignación y log de auditoría.`nAsignado: Mateo Ruiz" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 7: Implementar selector de asignación en IncidentDetailModal" -Description "Selector de técnicos en UI.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 8: Validar máquina de estados en IncidentServiceImpl" -Description "Transiciones y marcas de fecha.`nAsignado: Carlos Gómez" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 9: Crear botones de acción de estado en interfaz de usuario" -Description "Botones de transición con control de estados.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 10: Implementar entidad Comment y endpoint POST /incidents/{id}/comments" -Description "Persistencia de notas y bitácora.`nAsignado: Mateo Ruiz" -Labels "tipo::task,prioridad::media,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 11: Diseñar formulario de comentario rápido en la vista de detalle" -Description "Envío de comentarios por el operador activo.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::media,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 12: Diseñar componente visual Timeline con badges" -Description "Línea de tiempo de eventos.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::media,estado::done" -Weight 2
New-GitLabIssue -Title "TASK 13: Implementar endpoint GET /dashboard/stats con agregaciones SQL" -Description "Cálculo de métricas consolidadas.`nAsignado: Carlos Gómez" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 14: Construir tarjetas KPI con gradientes en DashboardView" -Description "Cards glassmorphic en React.`nAsignado: Sofía Herrera" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 15: Implementar barras de distribución por categoría y técnico" -Description "Gráficos de barras porcentuales.`nAsignado: Mateo Ruiz" -Labels "tipo::task,prioridad::media,estado::in-progress" -Weight 2
New-GitLabIssue -Title "TASK 16: Escribir pruebas unitarias e integración en JUnit 5 y Vitest" -Description "Suites de pruebas completas.`nAsignado: Mateo Ruiz" -Labels "tipo::task,prioridad::alta,estado::in-progress" -Weight 3

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "✅ ¡Backlog creado con éxito en GitLab vía PowerShell!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
