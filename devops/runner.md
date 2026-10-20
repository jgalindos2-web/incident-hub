# Guía Operativa: Instalación y Registro de GitLab Runner Self-Hosted

Este documento detalla el procedimiento paso a paso para configurar, registrar y ejecutar un **GitLab Runner Self-Hosted** utilizando el ejecutor **Shell** para la ejecución de los pipelines del proyecto **IT Incident Hub**.

---

## 1. Requisitos Previos en la Máquina Anfitriona
Antes de registrar el runner, la máquina debe tener instaladas las siguientes herramientas en el `PATH` del sistema:
- **Git** (`git --version` >= 2.30)
- **Java JDK 17** (`java -version` Eclipse Temurin o OpenJDK 17)
- **Apache Maven 3.8+** (`mvn -version`)
- **Node.js 18+ o 20+** y **npm** (`node -v`, `npm -v`)
- **Docker y Docker Compose** (opcional para ejecución de contenedores)

---

## 2. Instalación del Binario de GitLab Runner

### Opción A: En Windows (PowerShell como Administrador)
```powershell
# 1. Crear directorio dedicado
New-Item -ItemType Directory -Path "C:\GitLab-Runner" -Force
Set-Location "C:\GitLab-Runner"

# 2. Descargar el binario oficial x64
Invoke-WebRequest -Uri "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe" -OutFile "gitlab-runner.exe"

# 3. Comprobar versión instalada
.\gitlab-runner.exe --version
```

### Opción B: En Linux / Ubuntu / Debian
```bash
# 1. Descargar binario
sudo curl -L --output /usr/local/bin/gitlab-runner "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64"

# 2. Asignar permisos de ejecución
sudo chmod +x /usr/local/bin/gitlab-runner

# 3. Crear usuario dedicado
sudo useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
```

---

## 3. Obtención del Token de Registro en GitLab
1. En tu proyecto de GitLab, ve a: **Settings** &rarr; **CI/CD** &rarr; **Runners**.
2. En la sección **Project runners**, haz clic en el botón **New project runner**.
3. En **Platform**, selecciona **Linux** o **Windows**.
4. En **Tags**, introduce estrictamente: `self-hosted, shell` (marca la casilla si deseas ejecutar jobs sin tags también).
5. Haz clic en **Create runner**.
6. GitLab generará un comando con el token de autenticación (ejemplo: `glrt-xxxxxxxxxxxxxxxxxxxx`).

---

## 4. Registro del Runner con Ejecutor Shell

### En Windows:
```powershell
.\gitlab-runner.exe register `
  --non-interactive `
  --url "https://gitlab.com" `
  --token "glrt-TU_TOKEN_GENERADO_AQUI" `
  --executor "shell" `
  --description "runner-local-windows-incident-hub" `
  --tag-list "self-hosted,shell" `
  --shell "powershell"
```

### En Linux:
```bash
sudo gitlab-runner register \
  --non-interactive \
  --url "https://gitlab.com" \
  --token "glrt-TU_TOKEN_GENERADO_AQUI" \
  --executor "shell" \
  --description "runner-local-linux-incident-hub" \
  --tag-list "self-hosted,shell"
```

---

## 5. Instalación como Servicio del Sistema y Arranque

### En Windows (PowerShell como Administrador):
```powershell
# Instalar el servicio de Windows
.\gitlab-runner.exe install

# Iniciar el servicio
.\gitlab-runner.exe start

# Comprobar estado del servicio
Get-Service gitlab-runner
```

### En Linux:
```bash
# Instalar y activar daemon systemd
sudo gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
sudo gitlab-runner start

# Verificar status del servicio
sudo gitlab-runner status
```

---

## 6. Verificación en GitLab
1. Regresa a **Settings &rarr; CI/CD &rarr; Runners** en la interfaz web de GitLab.
2. Comprueba que el runner aparece listado con un punto verde (**Online**) y las etiquetas `self-hosted` y `shell`.
3. Cualquier pipeline que tenga en `.gitlab-ci.yml` los tags:
   ```yaml
   tags:
     - self-hosted
     - shell
   ```
   se encolará y ejecutará inmediatamente en esta máquina.

---

## 7. Comandos de Diagnóstico y Mantenimiento

```bash
# Ver estado del runner
gitlab-runner status

# Probar ejecución manual en primer plano (debugging interactivo)
gitlab-runner run

# Reiniciar servicio
gitlab-runner restart

# Detener servicio
gitlab-runner stop

# Desregistrar un runner
gitlab-runner unregister --name "runner-local-windows-incident-hub"
```
