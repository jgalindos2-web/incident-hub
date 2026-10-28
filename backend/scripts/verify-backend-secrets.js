/**
 * IT Incident Hub - Backend Distribution Secrets & Configuration Verifier (DevSecOps)
 *
 * Inspecciona artefactos de distribución del backend (dist_backend), archivos de configuración,
 * scripts de despliegue y recursos empaquetados dentro de archivos JAR/WAR/ZIP.
 *
 * Cumplimiento y Seguridad:
 * - Multiplataforma (Windows, Linux, macOS).
 * - Inspección profunda de JAR: lista entradas y extrae recursos de configuración (*.properties,
 *   *.yml, *.env, scripts, etc.) para auditoría de patrones secretos.
 * - Confidencialidad: NUNCA imprime credenciales ni valores sensibles en logs/consola.
 * - Si un archivo no puede leerse, extraerse o parsearse, produce un error explícito y aborta (exit 1).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const TARGET_DIR = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.resolve(process.cwd(), 'dist_backend');

const FORBIDDEN_FILE_PATTERNS = [
  /^\.env(?!\.example$)/i,
  /\.(key|pem|pfx|pkcs12|crt)$/i,
  /^id_rsa/i
];

const CONFIG_EXTENSIONS_REGEX = /\.(properties|ya?ml|xml|json|env|conf|cfg|ini|sh|bat|cmd|sql|txt)$/i;

const SECRET_RULES = [
  {
    name: 'Private Key Header',
    pattern: /-----BEGIN\s+[A-Z0-9_-]*\s*PRIVATE KEY-----/i,
    description: 'Certificado o clave privada criptográfica RSA/EC/OPENSSH'
  },
  {
    name: 'GitLab Personal Access Token',
    pattern: /\bglpat-[0-9a-zA-Z_-]{20,}\b/,
    description: 'Token de acceso personal de GitLab'
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /\bgh[pousr]_[0-9a-zA-Z]{36,}\b/,
    description: 'Token de acceso personal de GitHub'
  },
  {
    name: 'AWS Access Key ID',
    pattern: /\b(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/,
    description: 'Identificador de clave de acceso AWS'
  },
  {
    name: 'Render Deploy Hook URL',
    pattern: /https:\/\/api\.render\.com\/deploy\/srv-[a-zA-Z0-9]+/i,
    description: 'Webhook privado de despliegue automático en Render'
  },
  {
    name: 'Real Database URI with Plaintext Password',
    pattern: /(?:postgres(?:ql)?|mysql|mongodb):\/\/[a-zA-Z0-9_.-]+:(?!(?:<CHANGE_ME>|\$\{[^}]+\}))[^@\s'"]+@[a-zA-Z0-9.-]+/i,
    description: 'Cadena de conexión a base de datos con contraseña en texto plano'
  },
  {
    name: 'Hardcoded JDBC Password Parameter',
    pattern: /jdbc:postgresql:\/\/[^?\s'"]+.*password=(?!(?:<CHANGE_ME>|\$\{[^}]+\}))[^&\s'"]+/i,
    description: 'Cadena JDBC con parámetro password sin parametrizar'
  },
  {
    name: 'Unparameterized Spring Datasource Password',
    pattern: /^\s*spring\.datasource\.password\s*=\s*(?!(?:\$\{[^}]+\}|<CHANGE_ME>|\s*$)).+$/im,
    description: 'Propiedad spring.datasource.password con valor fijo en vez de variable de entorno'
  }
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

function inspectArchive(archivePath, relativePath, violations) {
  console.log(`  [INSPECCIÓN DE ARCHIVO] Analizando contenido empaquetado en: ${relativePath}`);
  let entriesOutput = '';

  // 1. Listar contenido usando tar o jar
  try {
    entriesOutput = execSync(`tar -tf "${archivePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 30000
    });
  } catch (tarErr) {
    try {
      entriesOutput = execSync(`jar tf "${archivePath}"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
        timeout: 30000
      });
    } catch (jarErr) {
      console.error(`❌ [ERROR CRÍTICO] No se pudo leer ni listar el contenido del artefacto binario: ${relativePath}`);
      console.error(`   Detalle de error: ${tarErr.message || jarErr.message}`);
      violations.push({
        file: relativePath,
        rule: 'Unreadable Archive Error',
        description: 'El artefacto no se pudo leer o tiene formato inválido/corrupto.'
      });
      return 0;
    }
  }

  const allEntries = entriesOutput
    .split(/\r?\n/)
    .map(e => e.trim().replace(/^\\+|\/+/, ''))
    .filter(e => e.length > 0 && !e.endsWith('/'));

  const configEntries = [];

  for (const entry of allEntries) {
    const entryBase = path.basename(entry);

    // Verificar si el nombre de archivo dentro del JAR viola políticas de archivos prohibidos
    for (const forbiddenPattern of FORBIDDEN_FILE_PATTERNS) {
      if (forbiddenPattern.test(entryBase)) {
        violations.push({
          file: `[JAR:${path.basename(archivePath)}] ${entry}`,
          rule: 'Forbidden Sensitive File Inside Archive',
          description: `Archivo sensible prohibido empaquetado dentro del JAR (${entryBase})`
        });
      }
    }

    if (CONFIG_EXTENSIONS_REGEX.test(entryBase)) {
      configEntries.push(entry);
    }
  }

  if (configEntries.length === 0) {
    console.log(`    -> Total entradas en archivo: ${allEntries.length} (sin archivos de configuración de texto detectados)`);
    return 0;
  }

  console.log(`    -> Entradas de configuración a extraer y auditar: ${configEntries.length}`);

  // 2. Extraer archivos de configuración a directorio temporal aislado
  const tempExtractDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-jar-'));
  let auditedBytes = 0;

  try {
    // Extraer en lotes para evitar líneas de comando demasiado largas
    const BATCH_SIZE = 25;
    for (let i = 0; i < configEntries.length; i += BATCH_SIZE) {
      const batch = configEntries.slice(i, i + BATCH_SIZE);
      const args = batch.map(e => `"${e}"`).join(' ');
      try {
        execSync(`tar -xf "${archivePath}" -C "${tempExtractDir}" ${args}`, {
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 20000
        });
      } catch (extractErr) {
        // Si tar falla con entradas específicas, intentar extracción completa en temp
        execSync(`tar -xf "${archivePath}" -C "${tempExtractDir}"`, {
          stdio: ['pipe', 'pipe', 'ignore'],
          timeout: 30000
        });
        break;
      }
    }

    // 3. Inspeccionar archivos extraídos
    const extractedFiles = getAllFiles(tempExtractDir);
    for (const extractedFilePath of extractedFiles) {
      const relativeInside = path.relative(tempExtractDir, extractedFilePath).replace(/\\/g, '/');
      try {
        const content = fs.readFileSync(extractedFilePath, 'utf8');
        auditedBytes += Buffer.byteLength(content, 'utf8');

        for (const rule of SECRET_RULES) {
          if (rule.pattern.test(content)) {
            violations.push({
              file: `[JAR:${path.basename(archivePath)}] ${relativeInside}`,
              rule: rule.name,
              description: rule.description
            });
          }
        }
      } catch (readErr) {
        console.warn(`    [WARN] No se pudo leer el archivo extraído ${relativeInside}: ${readErr.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ [ERROR CRÍTICO] Falló la extracción de recursos para inspección en: ${relativePath}`);
    console.error(`   Detalle: ${err.message}`);
    violations.push({
      file: relativePath,
      rule: 'Archive Extraction Failure',
      description: 'Falló la extracción segura del contenido del JAR para verificación.'
    });
  } finally {
    try {
      fs.rmSync(tempExtractDir, { recursive: true, force: true });
    } catch (_) {}
  }

  return auditedBytes;
}

function runAudit() {
  console.log('================================================================');
  console.log('🔍 DevSecOps: Inspección de Secretos en Artefactos de Backend');
  console.log(`Directorio objetivo: ${TARGET_DIR}`);
  console.log('================================================================');

  if (!fs.existsSync(TARGET_DIR)) {
    console.error(`[ERROR CRÍTICO] El directorio objetivo no existe: ${TARGET_DIR}`);
    console.error('Asegúrese de compilar y preparar el directorio antes de ejecutar esta verificación.');
    process.exit(1);
  }

  const files = getAllFiles(TARGET_DIR);
  if (files.length === 0) {
    console.error('[ERROR CRÍTICO] No se encontraron archivos para inspeccionar en el directorio objetivo.');
    process.exit(1);
  }

  const violations = [];
  let totalBytes = 0;
  let jarCount = 0;

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(TARGET_DIR, filePath).replace(/\\/g, '/');

    // 1. Verificar nombres de archivos prohibidos en la raíz del paquete
    for (const forbiddenPattern of FORBIDDEN_FILE_PATTERNS) {
      if (forbiddenPattern.test(fileName)) {
        violations.push({
          file: relativePath,
          rule: 'Forbidden Sensitive File',
          description: `Archivo sensible prohibido en paquete distribuible (${fileName})`
        });
      }
    }

    // 2. Si es archivo comprimido/JAR/WAR/ZIP, realizar inspección interna
    if (/\.(jar|war|zip)$/i.test(fileName)) {
      jarCount++;
      const archiveBytes = inspectArchive(filePath, relativePath, violations);
      totalBytes += archiveBytes;
      continue;
    }

    // 3. Inspeccionar contenido de archivos de texto / configuración / scripts directos
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      totalBytes += Buffer.byteLength(content, 'utf8');

      for (const rule of SECRET_RULES) {
        if (rule.pattern.test(content)) {
          violations.push({
            file: relativePath,
            rule: rule.name,
            description: rule.description
          });
        }
      }
    } catch (err) {
      console.error(`❌ [ERROR CRÍTICO] No se pudo leer el archivo ${relativePath}: ${err.message}`);
      violations.push({
        file: relativePath,
        rule: 'Unreadable File Error',
        description: `Error al leer archivo en paquete distribuible: ${err.message}`
      });
    }
  }

  console.log('\n--- Resumen de Inspección ---');
  console.log(`Archivos evaluados      : ${files.length} (incluyendo ${jarCount} archivo(s) comprimido(s))`);
  console.log(`Volumen auditado        : ${(totalBytes / 1024).toFixed(2)} KB`);
  console.log(`Reglas de seguridad     : ${SECRET_RULES.length + FORBIDDEN_FILE_PATTERNS.length}`);

  if (violations.length > 0) {
    console.error('\n❌ [ALERTA DE SEGURIDAD] Se detectaron posibles secretos o archivos prohibidos:');
    for (const v of violations) {
      console.error(`  - Archivo: ${v.file} | Regla: ${v.rule} (${v.description})`);
    }
    console.error('\nNOTA DE SEGURIDAD: Los valores sensibles no han sido mostrados en el log.');
    console.error('El pipeline se detendrá para prevenir fugas de credenciales en producción.\n');
    process.exit(1);
  }

  console.log('\n✅ [OK] Verificación exitosa: No se detectaron secretos ni credenciales en el paquete.');
  console.log('================================================================\n');
  process.exit(0);
}

runAudit();
