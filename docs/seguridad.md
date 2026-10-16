# Gestión de Seguridad y Secretos - IT Incident Hub

## 1. Política de Cero Secretos en Repositorio (Zero Secrets in Git)
Por directriz de seguridad de ingeniería DevOps, **ninguna credencial, contraseña, token de acceso o certificado privado debe ser enviado a los repositorios Git**. Esto aplica a:
- Archivos `.env` reales.
- Cadenas de conexión hardcodeadas en `application.properties` o código fuente.
- Tokens de acceso de GitLab o GitHub en scripts (`crear_backlog.sh`, etc.).
- Capturas de pantalla o logs subidos como evidencia en Merge Requests.

### Mecanismos de Prevención Activos:
1. **`.gitignore` estricto:** Bloquea de forma predeterminada cualquier archivo `.env`, `.pem`, `.key`, `target/` y `node_modules/`.
2. **Plantilla segura `.env.example`:** Contiene solo variables de referencia con valores ficticios o placeholders para desarrolladores nuevos.
3. **Pre-commit hooks con Gitleaks (Recomendado):** Escaneo local antes de permitir el commit.

---

## 2. Configuración de Variables en GitLab CI/CD (Masked + Protected)

Las credenciales reales de ejecución se inyectan en tiempo de ejecución a través del gestor de variables de GitLab en:
**Project Settings &rarr; CI/CD &rarr; Variables &rarr; Add Variable**.

### Matriz de Variables de Entorno del Proyecto:

| Nombre de la Variable | Tipo | Protected | Masked | Descripción y Alcance |
| :--- | :--- | :---: | :---: | :--- |
| `DB_PASSWORD` | Variable | Sí | Sí | Contraseña del usuario de PostgreSQL en ambientes remotos. |
| `DB_USERNAME` | Variable | Sí | No | Usuario de la base de datos (por ejemplo, `incident_prod_user`). |
| `DB_URL` | Variable | Sí | No | Cadena JDBC de producción (`jdbc:postgresql://db.prod:5432/incident_hub_prod`). |
| `GITLAB_TOKEN` | Variable | Sí | Sí | Personal Access Token con permisos `api` para el script de backlog y GitLab Releases. |
| `GITLAB_PROJECT_ID` | Variable | No | No | ID numérico del proyecto en GitLab (visibilidad pública en settings). |
| `PROD_SERVER_KEY` | File | Sí | Sí | Clave SSH privada para acceso a servidores de despliegue en producción. |

### Criterios de Configuración:
- **Masked (Enmascarada):** Oculta el valor en los registros de salida de la consola del pipeline (evita fugas en caso de `echo` involuntario). Requiere que el valor cumpla el formato de enmascaramiento de GitLab (mínimo 8 caracteres, sin espacios ni caracteres especiales prohibidos).
- **Protected (Protegida):** La variable **únicamente se expone a pipelines que corren sobre ramas protegidas** (como `main`) o **tags protegidos** (como `v*`). Esto impide que desarrolladores en ramas de prueba extraigan secretos de producción.

---

## 3. Ambientes y Protección de Ramas en GitLab

Para garantizar que un job con secretos no sea manipulado:
1. **Protected Branches:**
   - Ir a **Settings &rarr; Repository &rarr; Protected branches**.
   - Proteger `main`:
     - *Allowed to merge*: Developers + Maintainers.
     - *Allowed to push and force push*: **No one** (commits directos prohibidos).
2. **Protected Tags:**
   - Ir a **Settings &rarr; Repository &rarr; Protected tags**.
   - Agregar wildcard `v*` (versiones como `v1.0.0`):
     - *Allowed to create*: Maintainers.
3. **GitLab Environments:**
   - Configurados en `.gitlab-ci.yml` para `development`, `staging` y `production`.
   - `production` requiere autorización manual de un Maintainer.
