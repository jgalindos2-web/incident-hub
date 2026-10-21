#!/usr/bin/env bash
# ==============================================================================
# Script de Instalación y Registro de GitLab Runner Autohospedado (Self-Hosted)
# Proyecto: IT Incident Hub
# Tag Requerido: self-hosted-runner
# ==============================================================================
set -euo pipefail

# Colores para salida interactiva
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}====================================================================${NC}"
echo -e "${BLUE}   INSTALADOR Y REGISTRADOR DE GITLAB RUNNER (SELF-HOSTED)         ${NC}"
echo -e "${BLUE}   Proyecto: IT Incident Hub                                        ${NC}"
echo -e "${BLUE}====================================================================${NC}"

# 1. Comprobación de Privilegios de Superusuario (root / sudo)
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}ERROR: Este script debe ser ejecutado con privilegios de root (sudo).${NC}"
  echo -e "Ejecución sugerida: sudo bash $0"
  exit 1
fi

# 2. Variables de Configuración (pueden ser provistas vía variables de entorno)
GITLAB_URL="${GITLAB_URL:-https://gitlab.com}"
RUNNER_TAGS="self-hosted-runner,docker,linux"
RUNNER_DESCRIPTION="Self-Hosted Runner - IT Incident Hub (${HOSTNAME:-local})"
DEFAULT_DOCKER_IMAGE="docker:24.0.5-dind"

# Solicitar el Token de Registro de GitLab si no viene en el entorno
if [ -z "${REGISTRATION_TOKEN:-}" ]; then
  echo -e "${YELLOW}Por favor ingrese el Token de Registro de GitLab Runner:${NC}"
  echo -e "(Obtenible en: GitLab Project -> Settings -> CI/CD -> Runners -> New project runner)"
  read -r -s -p "Token: " REGISTRATION_TOKEN
  echo ""
fi

if [ -z "$REGISTRATION_TOKEN" ]; then
  echo -e "${RED}ERROR: El token de registro no puede estar vacío.${NC}"
  exit 1
fi

# 3. Instalación de Dependencias Previas (Docker y Curl)
echo -e "\n${BLUE}[1/5] Verificando dependencias del sistema...${NC}"
if ! command -v curl &> /dev/null; then
  echo -e "${YELLOW}Instalando curl...${NC}"
  apt-get update -y && apt-get install -y curl
fi

if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Docker no detectado. Instalando Docker Engine...${NC}"
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  rm -f get-docker.sh
  systemctl enable --now docker
  echo -e "${GREEN}✔ Docker instalado y servicio iniciado.${NC}"
else
  echo -e "${GREEN}✔ Docker ya se encuentra instalado.${NC}"
fi

# 4. Descarga e Instalación del Binario Oficial de GitLab Runner
echo -e "\n${BLUE}[2/5] Descargando e instalando GitLab Runner oficial...${NC}"
if ! command -v gitlab-runner &> /dev/null; then
  ARCH=$(dpkg --print-architecture 2>/dev/null || echo "amd64")
  curl -L --output /usr/local/bin/gitlab-runner "https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-${ARCH}"
  chmod +x /usr/local/bin/gitlab-runner

  # Crear usuario de sistema para gitlab-runner si no existe
  if ! id -u gitlab-runner &>/dev/null; then
    useradd --comment 'GitLab Runner' --create-home gitlab-runner --shell /bin/bash
    usermod -aG docker gitlab-runner
  fi

  gitlab-runner install --user=gitlab-runner --working-directory=/home/gitlab-runner
  echo -e "${GREEN}✔ Binario de GitLab Runner instalado como servicio.${NC}"
else
  echo -e "${GREEN}✔ GitLab Runner ya está instalado en el sistema.${NC}"
fi

# 5. Registro No-Interactivo del Runner en el Proyecto de GitLab
echo -e "\n${BLUE}[3/5] Registrando el Runner con el Tag '${RUNNER_TAGS}'...${NC}"

# Comando de registro con executor docker y soporte para docker socket
gitlab-runner register \
  --non-interactive \
  --url "$GITLAB_URL" \
  --token "$REGISTRATION_TOKEN" \
  --executor "docker" \
  --docker-image "$DEFAULT_DOCKER_IMAGE" \
  --description "$RUNNER_DESCRIPTION" \
  --tag-list "$RUNNER_TAGS" \
  --run-untagged="false" \
  --locked="false" \
  --docker-privileged="true" \
  --docker-volumes "/var/run/docker.sock:/var/run/docker.sock" \
  --docker-volumes "/cache"

echo -e "${GREEN}✔ Runner registrado exitosamente en ${GITLAB_URL}${NC}"

# 6. Inicio y Habilitación del Servicio
echo -e "\n${BLUE}[4/5] Iniciando y asegurando el servicio gitlab-runner...${NC}"
gitlab-runner start || true
systemctl restart gitlab-runner

# 7. Verificación del Estado
echo -e "\n${BLUE}[5/5] Verificando conectividad del Runner...${NC}"
gitlab-runner status
gitlab-runner list

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}🎉 GITLAB RUNNER CONFIGURADO Y ACTIVO CON ÉXITO                    ${NC}"
echo -e "${GREEN}   Etiqueta asignada: self-hosted-runner                           ${NC}"
echo -e "${GREEN}   Executor: docker (Privilegiado con socket montado)              ${NC}"
echo -e "${GREEN}====================================================================${NC}"
