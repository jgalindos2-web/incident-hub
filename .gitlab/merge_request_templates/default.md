## 📌 Descripción del Cambio
<!-- Explica qué problema resuelve este Merge Request o qué funcionalidad añade -->
**Closes #ID**

### Tipo de Cambio
- [ ] 🚀 Nueva funcionalidad (`feat`)
- [ ] 🐛 Corrección de error (`fix`)
- [ ] ♻️ Refactorización de código (`refactor`)
- [ ] 🛠️ Tarea técnica o DevOps (`chore` / `ci`)
- [ ] 📚 Documentación (`docs`)

---

## 🔍 Trazabilidad y Contexto
- **Issue Asociado:** Closes #
- **Responsable:**
- **Revisor Asignado:**

---

## 📋 Lista de Verificación (Checklist del Desarrollador)
- [ ] Los commits siguen la convención **Conventional Commits** y referencian el issue (`feat(backend): #ID ...`).
- [ ] El código pasa el linter localmente (`mvn checkstyle:check` en backend / `npm run lint` en frontend).
- [ ] Se incluyeron o actualizaron pruebas unitarias pertinentes.
- [ ] Las pruebas pasan al 100% en local (`mvn test` / `npm run test`).
- [ ] No se incluye ningún secreto, contraseña o token en el código ni en los commits.
- [ ] Los cambios han sido probados con el stack local en Docker Compose.

---

## 🧪 Evidencia de Validación
<!-- Adjunta capturas de pantalla, salida de consola o logs que certifiquen el correcto funcionamiento -->
### Pruebas Unitarias y Linter
```text
[Pegar aquí la salida de consola de mvn test / npm run test]
```

### Comprobación Visual / Funcional
<!-- [Adjuntar captura o GIF si aplica a UI o respuesta de curl si aplica a API] -->

---

## 🛡️ Aprobación y Fusión
- **Criterio de Aprobación:** Mínimo 1 aprobación del revisor técnico asignado.
- **Estrategia:** Squash commits al fusionar para mantener la historia limpia.
