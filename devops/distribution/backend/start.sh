#!/bin/sh
# ============================================================
# IT Incident Hub - Backend REST API (Spring Boot 3)
# ============================================================
echo "============================================================"
echo "  IT Incident Hub - Backend REST API (Spring Boot 3)"
echo "============================================================"

JAR_FILE=$(ls *.jar 2>/dev/null | head -n 1)

if [ -z "$JAR_FILE" ]; then
    echo "[ERROR] No se encontro ningun archivo .jar en este directorio."
    exit 1
fi

echo "Iniciando $JAR_FILE..."
exec java -jar "$JAR_FILE" "$@"
