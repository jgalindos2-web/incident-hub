# Bitácora de Incidente DevOps: Fallo Controlado en Pipeline CI/CD

## 1. Contexto del Escenario
Durante el Sprint 2 (Semana 2), se realizó una demostración controlada de aseguramiento de calidad (*Quality Gate*) para verificar que el pipeline de GitLab CI/CD detenga automáticamente cualquier cambio defectuoso antes de que llegue a ambientes superiores.

- **Pipeline ID:** `#10452`
- **Rama:** `feature/8-status-validation`
- **Autor del commit defectuoso:** `Carlos Gómez` (DevOps Lead)
- **Revisor / QA:** `Mateo Ruiz`

---

## 2. Fase 1: Inyección del Error y Pipeline Fallido

Se introdujo deliberadamente un fallo en el método de actualización de estados de incidentes, alterando la condición booleana para que permitiera actualizar al mismo estado sin lanzar la excepción esperada, rompiendo la prueba unitaria:

```bash
git commit -m "feat(backend): #8 permitir actualizacion directa sin comprobar estado previo"
git push origin feature/8-status-validation
```

### Comportamiento del Pipeline en GitLab CI:
El pipeline arrancó en el runner self-hosted, pasó los stages de `checkout`, `install/restore`, `build`, pero **falló en el stage `test`**:

```text
Status: FAILED ❌
Failed Job: test_backend_unit (Stage: test)
Execution Time: 48s
Runner: runner-local-windows-incident-hub (#3)
```

### Log de Error Extraído de la Consola de GitLab:
```text
[INFO] Running com.incidenthub.service.IncidentServiceTest
[ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.812 s <<< FAILURE! -- in com.incidenthub.service.IncidentServiceTest
[ERROR] com.incidenthub.service.IncidentServiceTest.shouldThrowBadRequestWhenStatusUnchanged -- Time elapsed: 0.024 s <<< FAILURE!
org.opentest4j.AssertionFailedError: Expected com.incidenthub.exception.BadRequestException to be thrown, but nothing was thrown.
	at org.junit.jupiter.api.AssertionUtils.fail(AssertionUtils.java:38)
	at org.junit.jupiter.api.AssertThrows.assertThrows(AssertThrows.java:53)
	at org.junit.jupiter.api.Assertions.assertThrows(Assertions.java:3082)
	at com.incidenthub.service.IncidentServiceTest.shouldThrowBadRequestWhenStatusUnchanged(IncidentServiceTest.java:95)
[INFO] Results:
[INFO] Failures: 1, Errors: 0, Skipped: 0
[ERROR] There are test failures.
[ERROR] Please refer to /target/surefire-reports for the individual test results.
ERROR: Job failed: exit code 1
```

---

## 3. Fase 2: Diagnóstico y Causa Raíz
1. **Identificación:** El stage `test_backend_unit` devolvió código de salida `1`.
2. **Causa Raíz:** El método `updateStatus` en `IncidentServiceImpl.java` había eliminado la verificación:
   ```java
   if (oldStatus == newStatus) {
       throw new BadRequestException("El incidente ya se encuentra en estado: " + newStatus);
   }
   ```
3. **Impacto:** Si no existiera el pipeline, un incidente podría recibir múltiples transiciones duplicadas generando registros basura en la bitácora de auditoría.

---

## 4. Fase 3: Corrección Siguiendo el Flujo DevOps
Siguiendo la política de desarrollo del proyecto:
1. Se abrió el Issue en GitLab: `#19` con etiqueta `tipo::task` y `prioridad::critica`: *"Corregir regresión en validación de estados y restaurar suite de pruebas"*.
2. Se creó la rama de corrección:
   ```bash
   git checkout -b fix/19-restore-status-validation
   ```
3. Se restauró la validación en `backend/src/main/java/com/incidenthub/service/IncidentServiceImpl.java`:
   ```java
   if (oldStatus == newStatus) {
       throw new BadRequestException("El incidente ya se encuentra en estado: " + newStatus);
   }
   ```
4. Se ejecutaron las pruebas locales:
   ```bash
   mvn test
   # [INFO] Tests run: 7, Failures: 0, Errors: 0, Skipped: 0 - BUILD SUCCESS
   ```
5. Se confirmó el commit con trazabilidad:
   ```bash
   git commit -m "fix(backend): #19 restaurar validacion estricta de transicion de estados en IncidentServiceImpl"
   git push -u origin fix/19-restore-status-validation
   ```

---

## 5. Fase 4: Ejecución Exitosa del Pipeline

Se abrió el Merge Request `MR!4` hacia `main`. El webhook de GitLab disparó el pipeline `#10453`:

```text
Pipeline #10453: PASSED ✅
Stages:
  1. checkout: checkout_job ..................... PASSED (12s)
  2. install/restore: restore_backend_deps ...... PASSED (18s)
  3. install/restore: restore_frontend_deps ..... PASSED (14s)
  4. build: build_backend ....................... PASSED (25s)
  5. build: build_frontend ...................... PASSED (19s)
  6. test: test_backend_unit .................... PASSED (22s) ✅ [JUnit 5: 7/7 OK]
  7. test: test_frontend_unit ................... PASSED (15s) ✅ [Vitest: 4/4 OK]
  8. security: security_owasp_backend ........... PASSED (35s)
  9. security: security_audit_frontend .......... PASSED (11s)
  10. package: package_application .............. PASSED (20s)
  11. publish: publish_artifacts ................ PASSED (8s)  📦 [JAR + TAR.GZ + SHA256]
```

**Resultado Final:**
El Merge Request fue aprobado por el revisor `Mateo Ruiz`, fusionado en `main`, y el pipeline desplegó automáticamente en el ambiente `development`.
