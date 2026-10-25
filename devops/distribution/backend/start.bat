@echo off
setlocal enabledelayedexpansion
title IT Incident Hub - Backend API
echo ============================================================
echo   IT Incident Hub - Backend REST API (Spring Boot 3)
echo ============================================================
echo Requisitos: Java 17 LTS o superior instalado.
echo.

set "JAR_FILE="
for %%f in (*.jar) do (
    set "JAR_FILE=%%f"
    goto :found
)

:found
if "%JAR_FILE%"=="" (
    echo [ERROR] No se encontro ningun archivo .jar en este directorio.
    pause
    exit /b 1
)

echo Iniciando %JAR_FILE%...
java -jar "%JAR_FILE%"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] La aplicacion finalizo con codigo de error %ERRORLEVEL%.
)
pause
