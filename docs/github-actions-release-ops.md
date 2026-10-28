# Manual Operativo: Workflows de GitHub Actions y Publicación de Releases

**Proyecto:** IT Incident Hub  
**Fecha:** Octubre 2026  
**Rama:** `feat/26-github-actions-release-validation`  
**Referencia de Workflows:** `.github/workflows/ci-tests.yml`, `.github/workflows/release.yml`

---

## 1. Visión General de los Workflows

El repositorio incorpora dos flujos de trabajo independientes en GitHub Actions que complementan el pipeline principal de GitLab CI/CD:

```
                  [ GitLab CI/CD (Primario) ]
                    ├── Pruebas Backend & Frontend
                    ├── Auditoría DevSecOps & Cero Secretos
                    ├── Despliegue en Render PaaS
                    └── Push Mirror (Git Branches & Tags)
                                   │
                                   ▼
                [ GitHub Actions (Secundario/Espejo) ]
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
[.github/workflows/ci-tests.yml]           [.github/workflows/release.yml]
  - Pushes a 'main'                         - Disparado por tag 'v*'
  - Pull Requests a 'main'                  - Disparado por 'workflow_dispatch'
  - Ejecución Manual                        - Compuerta estricta: 22 tests + auditoría
  - 22 tests Java 17 + Vitest React         - Empaquetado + Cero Secretos
  - Reportes Surefire y Cobertura           - Checksums SHA-256 + Assets adjuntos
```

---
34: 
35: ## 2. Estrategia de Versionado y Reglas de Tags
36: 
37: Para garantizar compatibilidad con los filtros de GitHub Actions y robustez en la validación, el workflow utiliza el glob nativo `tags: ['v*']` y valida estrictamente el formato SemVer mediante shell antes de proceder:
38: 
39: ### 2.1 Formato de Tags Permitidos
40: El workflow de Release valida el tag mediante la siguiente expresión regular SemVer:
41: `^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$`

- **Versiones Oficiales Estables:**  
  Ejemplos: `v1.0.0`, `v1.0.1`, `v1.1.0`, `v2.0.0`.  
  *Comportamiento:* Se publican como versión oficial (`prerelease: false`) y se marcan como la versión más reciente (`make_latest: true`).
- **Versiones de Pre-Lanzamiento / Release Candidates:**  
  Ejemplos: `v0.0.0-rc.1`, `v1.0.1-rc.1`, `v1.1.0-beta.1`.  
  *Comportamiento:* Se publican con la marca `prerelease: true` y no modifican el puntero `latest`.
- **Protección contra Sobrescritura:**  
  El workflow comprueba mediante `gh release view <tag>` si el Release ya existe. Si ya fue publicado, **aborta inmediatamente con código de error 1**, impidiendo la sobrescritura accidental de binarios.

---

## 3. Procedimiento Operativo: Publicación Paso a Paso

Dado que GitLab es la fuente primaria y sincroniza mediante *push mirror* hacia GitHub, el flujo recomendado es:

### Paso 1: Creación del Tag en el Repositorio Primario (GitLab)
```bash
# Asegurarse de estar en la rama main actualizada
git checkout main
git pull origin main

# Crear tag anotado con versión semántica
git tag -a v1.0.1 -m "Release v1.0.1: Parches de seguridad y endurecimiento de autenticación"

# Enviar tag a GitLab (el mirroring lo replicará automáticamente a GitHub)
git push origin v1.0.1
```

### Paso 2: Ejecución Automática en GitHub Actions
1. GitLab sincroniza el tag `v1.0.1` hacia GitHub.
2. GitHub detecta el evento `push: tags: ['v*']`, valida el formato SemVer mediante shell y dispara `.github/workflows/release.yml`.
3. **Fase 1 (Quality Gate):** Clona el código en el tag exacto y ejecuta:
   - 22 pruebas unitarias y de integración de Backend (Java 17).
   - Auditoría de dependencias (`audit-backend-dependencies.js`).
   - Pruebas de scripts DevSecOps (`test-security-scripts.js`).
   - Pruebas de Frontend con cobertura (`npx vitest run --coverage`).
   - Verificación de bundle de Frontend (`verify-bundle-secrets.js`).
4. **Fase 2 (Package & Publish):** Solo si la Fase 1 concluye con éxito:
   - Compila y empaqueta el backend (`incident-hub-backend-v1.0.1-<sha>.zip`).
   - Compila y empaqueta el frontend (`incident-hub-frontend-v1.0.1-<sha>.zip`).
   - Audita que ningún archivo empaquetado contenga secretos (`verify-backend-secrets.js`).
   - Genera el archivo criptográfico `SHA256SUMS.txt`.
   - Crea el Release en GitHub con los tres archivos adjuntos.

---

## 4. Disparo Manual Seguro mediante `workflow_dispatch`

En caso de requerir re-ejecutar una publicación para un tag preexistente o realizar una prueba controlada sin empujar un nuevo tag desde GitLab, se puede utilizar la interfaz web de GitHub o GitHub CLI (`gh`):

```bash
# Ejecución mediante GitHub CLI
gh workflow run release.yml \
  -f tag_name="v0.0.0-rc.1" \
  -f is_prerelease=true
```

> [!IMPORTANT]
> La ejecución manual **no permite omitir la compuerta de calidad**. El job `quality-gate-and-test` se ejecutará obligatoriamente sobre el tag indicado antes de permitir la publicación.

---

## 5. Verificación de Integridad de los Artefactos Publicados

Todo usuario o administrador que descargue los artefactos desde la sección de Releases de GitHub puede validar su autenticidad y comprobar que no sufrieron alteraciones en tránsito mediante `SHA256SUMS.txt`:

```bash
# Descargar los archivos del release y el archivo de checksums en el mismo directorio:
# - incident-hub-backend-v1.0.1-<sha>.zip
# - incident-hub-frontend-v1.0.1-<sha>.zip
# - SHA256SUMS.txt

# Verificar la integridad criptográfica en Linux / macOS:
sha256sum -c SHA256SUMS.txt

# Verificar en Windows (PowerShell):
Get-FileHash -Algorithm SHA256 incident-hub-backend-*.zip
Get-FileHash -Algorithm SHA256 incident-hub-frontend-*.zip
```

---

## 6. Procedimiento Alternativo: Descarga de Artefactos desde GitLab

Si en algún escenario se requiere enlazar o correlacionar los artefactos generados en el runner local de GitLab con un Release de GitHub, los artefactos pueden recuperarse mediante la API de GitLab:

```bash
# Obtener el último archivo ZIP del job de backend en GitLab CI/CD:
curl --header "PRIVATE-TOKEN: <GITLAB_READ_API_TOKEN>" \
     --output gitlab-backend-dist.zip \
     "https://gitlab.com/api/v4/projects/<PROJECT_ID>/jobs/artifacts/main/download?job=build_and_package:backend"
```
*Nota: Este procedimiento requiere un token con permisos de lectura `read_api` configurado como secreto (`GITLAB_API_TOKEN`) en el repositorio.*
