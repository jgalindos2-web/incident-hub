/**
 * IT Incident Hub - Security Scripts Test Suite
 *
 * Verifica de forma reproducible el comportamiento de los scripts DevSecOps:
 * 1. Una dependencia inferior al mínimo produce fallo.
 * 2. Una dependencia transitiva que no puede verificarse produce fallo.
 * 3. Un error de Maven no se convierte en aprobación.
 * 4. Un archivo de configuración con un secreto de prueba es detectado sin imprimir su valor.
 * 5. Un recurso de configuración sensible dentro de un JAR es detectado.
 * 6. Un artefacto que no puede inspeccionarse produce un resultado fallido.
 * 7. El escaneo limpio permite continuar con el empaquetado.
 *
 * Cumplimiento: Utiliza exclusivamente valores ficticios/simulados para pruebas.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawnSync } = require('child_process');

const AUDIT_SCRIPT = path.resolve(__dirname, 'audit-backend-dependencies.js');
const SECRETS_SCRIPT = path.resolve(__dirname, 'verify-backend-secrets.js');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  console.log(`\n▶ [PRUEBA] ${name}`);
  try {
    fn();
    console.log(`  ✔ APROBADA: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✖ FALLIDA: ${name}`);
    console.error(`    Detalle: ${err.message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// Test 1: Dependencia inferior al mínimo produce fallo
// -----------------------------------------------------------------------------
runTest('Una dependencia inferior al mínimo produce fallo', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-audit-min-'));
  const dummyPom = path.join(tempDir, 'pom.xml');

  try {
    // POM con versión obsoleta de Spring Boot (3.2.5 < 3.2.12)
    const vulnerablePomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
    </parent>
    <groupId>com.incidenthub</groupId>
    <artifactId>test-backend</artifactId>
    <version>1.0.0</version>
</project>`;
    fs.writeFileSync(dummyPom, vulnerablePomContent, 'utf8');

    const result = spawnSync('node', [AUDIT_SCRIPT], {
      env: { ...process.env, AUDIT_POM_PATH: dummyPom },
      encoding: 'utf8'
    });

    if (result.status === 0) {
      throw new Error(`Se esperaba código de salida 1 por versión obsoleta, pero retornó 0.`);
    }

    const output = (result.stdout || '') + (result.stderr || '');
    if (!output.includes('Spring Boot Parent') || !output.includes('ALERTA DE SEGURIDAD')) {
      throw new Error(`La salida no reportó la violación esperada de versión mínima. Salida: ${output}`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// Test 2: Dependencia transitiva que no puede verificarse produce fallo
// -----------------------------------------------------------------------------
runTest('Una dependencia transitiva que no puede verificarse produce fallo', () => {
  const dummyMavenCmd = 'node -e "console.log(\'[INFO] Total dependencies: 0\');"';

  const result = spawnSync('node', [AUDIT_SCRIPT], {
    env: { ...process.env, AUDIT_MAVEN_CMD: dummyMavenCmd },
    encoding: 'utf8'
  });

  if (result.status === 0) {
    throw new Error('Se esperaba fallo al no encontrar dependencias transitivas obligatorias, pero retornó 0.');
  }

  const output = (result.stdout || '') + (result.stderr || '');
  if (!output.includes('INDETERMINADA / NO ENCONTRADA') && !output.includes('ALERTA DE SEGURIDAD')) {
    throw new Error(`La salida no indicó que la dependencia transitiva era indeterminada/ausente. Salida: ${output}`);
  }
});

// -----------------------------------------------------------------------------
// Test 3: Error de Maven no se convierte en aprobación
// -----------------------------------------------------------------------------
runTest('Un error de Maven no se convierte en aprobación', () => {
  const failingMavenCmd = 'node -e "console.error(\'Error fatal: conexion rechazada al repositorio Maven\'); process.exit(1);"';

  const result = spawnSync('node', [AUDIT_SCRIPT], {
    env: { ...process.env, AUDIT_MAVEN_CMD: failingMavenCmd },
    encoding: 'utf8'
  });

  if (result.status === 0) {
    throw new Error('El script retornó 0 a pesar de que Maven falló con código 1.');
  }

  const output = (result.stdout || '') + (result.stderr || '');
  if (!output.includes('AUDITORÍA INCOMPLETA') || !output.includes('ERROR CRÍTICO')) {
    throw new Error(`La salida no reportó estado de auditoría incompleta. Salida: ${output}`);
  }
});

// -----------------------------------------------------------------------------
// Test 4: Archivo de configuración con secreto ficticio es detectado sin exponerlo
// -----------------------------------------------------------------------------
runTest('Un archivo de configuración con un secreto de prueba es detectado sin imprimir su valor', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-secret-plain-'));
  const FAKE_SENSITIVE_SECRET = 'FictitiousSecretToken_1234567890_XYZ';

  try {
    const configFile = path.join(tempDir, 'application.properties');
    fs.writeFileSync(configFile, `spring.datasource.password=${FAKE_SENSITIVE_SECRET}\n`, 'utf8');

    const result = spawnSync('node', [SECRETS_SCRIPT, tempDir], {
      encoding: 'utf8'
    });

    if (result.status === 0) {
      throw new Error('Se esperaba detección de contraseña en texto plano, pero retornó código 0.');
    }

    const output = (result.stdout || '') + (result.stderr || '');

    // Verificar que la regla fue detectada
    if (!output.includes('Unparameterized Spring Datasource Password')) {
      throw new Error(`No se reportó la regla esperada. Salida: ${output}`);
    }

    // Verificar CRÍTICO: el valor sensible NUNCA debe aparecer en los logs
    if (output.includes(FAKE_SENSITIVE_SECRET)) {
      throw new Error(`FALLO DE SEGURIDAD: El valor sensible de prueba (${FAKE_SENSITIVE_SECRET}) fue expuesto en la salida de consola.`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// Test 5: Recurso de configuración sensible dentro de un JAR es detectado
// -----------------------------------------------------------------------------
runTest('Un recurso de configuración sensible dentro de un JAR es detectado', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-secret-jar-'));
  const tempJarContentDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-jar-content-'));
  const FAKE_SENSITIVE_DATABASE_PASS = 'SuperSecretFakePassword_987654321';

  try {
    const fakeProps = path.join(tempJarContentDir, 'application.properties');
    fs.writeFileSync(fakeProps, `postgres://dbadmin:${FAKE_SENSITIVE_DATABASE_PASS}@db.internal:5432/incident_hub\n`, 'utf8');

    const dummyJarPath = path.join(tempDir, 'application-packaged.jar');
    execSync(`tar -cf "${dummyJarPath}" -C "${tempJarContentDir}" application.properties`, {
      stdio: ['pipe', 'pipe', 'ignore']
    });

    const result = spawnSync('node', [SECRETS_SCRIPT, tempDir], {
      encoding: 'utf8'
    });

    if (result.status === 0) {
      throw new Error('El escáner no detectó la credencial dentro del JAR.');
    }

    const output = (result.stdout || '') + (result.stderr || '');

    if (!output.includes('Real Database URI with Plaintext Password') || !output.includes('[JAR:application-packaged.jar]')) {
      throw new Error(`No se reportó la regla o ubicación dentro del JAR. Salida: ${output}`);
    }

    // Verificar que el secreto no se imprime en los logs
    if (output.includes(FAKE_SENSITIVE_DATABASE_PASS)) {
      throw new Error(`FALLO DE SEGURIDAD: La credencial dentro del JAR (${FAKE_SENSITIVE_DATABASE_PASS}) fue expuesta en los logs.`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(tempJarContentDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// Test 6: Artefacto no inspeccionable produce fallo
// -----------------------------------------------------------------------------
runTest('Un artefacto que no puede inspeccionarse produce un resultado fallido', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-corrupt-jar-'));
  const corruptJar = path.join(tempDir, 'corrupt-archive.jar');

  try {
    fs.writeFileSync(corruptJar, Buffer.from('ESTE_NO_ES_UN_ARCHIVO_ZIP_O_JAR_VALIDO_0123456789'), 'utf8');

    const result = spawnSync('node', [SECRETS_SCRIPT, tempDir], {
      encoding: 'utf8'
    });

    if (result.status === 0) {
      throw new Error('Se esperaba fallo al procesar un archivo JAR corrupto, pero retornó código 0.');
    }

    const output = (result.stdout || '') + (result.stderr || '');
    if (!output.includes('Unreadable Archive Error') && !output.includes('ERROR CRÍTICO')) {
      throw new Error(`No se reportó el error de archivo ilegible/corrupto. Salida: ${output}`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

// -----------------------------------------------------------------------------
// Test 7: Escaneo limpio permite continuar con el empaquetado
// -----------------------------------------------------------------------------
runTest('El escaneo limpio permite continuar con el empaquetado', () => {
  const cleanDir = path.resolve(__dirname, '..', '..', 'devops', 'distribution', 'backend');

  const result = spawnSync('node', [SECRETS_SCRIPT, cleanDir], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    const output = (result.stdout || '') + (result.stderr || '');
    throw new Error(`El directorio limpio falló la verificación con código ${result.status}. Salida: ${output}`);
  }

  const output = (result.stdout || '') + (result.stderr || '');
  if (!output.includes('Verificación exitosa: No se detectaron secretos ni credenciales en el paquete.')) {
    throw new Error(`No se obtuvo el mensaje de verificación exitosa. Salida: ${output}`);
  }
});

// -----------------------------------------------------------------------------
// Resumen general
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('📊 RESUMEN DE PRUEBAS DE SCRIPTS DE SEGURIDAD');
console.log('================================================================');
console.log(`  Total de pruebas ejecutadas : ${testsPassed + testsFailed}`);
console.log(`  Pruebas aprobadas           : ${testsPassed}`);
console.log(`  Pruebas fallidas            : ${testsFailed}`);
console.log('================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
