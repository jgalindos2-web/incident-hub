/**
 * Script de Verificación de Seguridad en Bundle de Producción (DevSecOps)
 * Analiza los artefactos generados en frontend/dist en busca de posibles secretos,
 * credenciales privadas, tokens de despliegue o variables de entorno de servidor.
 *
 * Cumplimiento:
 * - Compatible con Windows PowerShell, Linux y macOS.
 * - NO imprime secretos reales en la salida / logs de CI.
 * - Falla con código de salida 1 si detecta alguna coincidencia sospechosa.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

// Reglas de detección de secretos basadas en entropía y patrones conocidos
const SECRET_RULES = [
  {
    name: 'Private Key Header',
    pattern: /-----BEGIN\s+[A-Z0-9_-]*\s*PRIVATE KEY-----/i,
    description: 'Certificado o clave privada RSA/EC/OPENSSH'
  },
  {
    name: 'GitLab Personal Access Token',
    pattern: /glpat-[0-9a-zA-Z_-]{20,}/,
    description: 'Token de acceso personal de GitLab'
  },
  {
    name: 'GitHub Personal Access Token',
    pattern: /gh[pousr]_[0-9a-zA-Z]{36,}/,
    description: 'Token de acceso personal de GitHub'
  },
  {
    name: 'AWS Access Key ID',
    pattern: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/,
    description: 'Identificador de clave de acceso AWS'
  },
  {
    name: 'Render Deploy Hook URL',
    pattern: /https:\/\/api\.render\.com\/deploy\/srv-[a-zA-Z0-9]+/i,
    description: 'Webhook privado de despliegue automático en Render'
  },
  {
    name: 'Database URI with Credentials',
    pattern: /(?:postgres(?:ql)?|mysql|mongodb):\/\/[^:\s'"]+:[^@\s'"]+@[a-zA-Z0-9.-]+/i,
    description: 'Cadena de conexión a base de datos con credenciales incrustadas'
  },
  {
    name: 'JDBC PostgreSQL with Embedded Password',
    pattern: /jdbc:postgresql:\/\/[^?\s'"]+.*password=[^&\s'"]+/i,
    description: 'Cadena JDBC de PostgreSQL con parámetro de contraseña'
  },
  {
    name: 'Hardcoded Server Environment Variable Reference',
    pattern: /\b(?:RENDER_DEPLOY_HOOK(?:_BACKEND|_FRONTEND)?|DB_PASSWORD|POSTGRES_PASSWORD)\b/,
    description: 'Referencia a nombres de secretos de servidor que no deben exponerse al cliente'
  }
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) {
    return arrayOfFiles;
  }
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

function runAudit() {
  console.log('================================================================');
  console.log('🔍 DevSecOps: Inspección de Seguridad en Bundle Frontend (dist)');
  console.log('================================================================');

  if (!fs.existsSync(DIST_DIR)) {
    console.error(`[ERROR] El directorio dist no existe en: ${DIST_DIR}`);
    console.error('Por favor ejecute primero: npm run build');
    process.exit(1);
  }

  const files = getAllFiles(DIST_DIR);
  if (files.length === 0) {
    console.error('[ERROR] No se encontraron archivos para inspeccionar en frontend/dist');
    process.exit(1);
  }

  let totalBytes = 0;
  const violations = [];

  for (const filePath of files) {
    const relativePath = path.relative(DIST_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    totalBytes += content.length;

    for (const rule of SECRET_RULES) {
      if (rule.pattern.test(content)) {
        violations.push({
          file: relativePath,
          rule: rule.name,
          description: rule.description
        });
      }
    }
  }

  console.log(`Archivos analizados : ${files.length}`);
  console.log(`Tamaño total        : ${(totalBytes / 1024).toFixed(2)} KB`);
  console.log(`Reglas evaluadas    : ${SECRET_RULES.length}`);

  if (violations.length > 0) {
    console.error('\n❌ [ALERTA DE SEGURIDAD] Se detectaron posibles secretos en el bundle:');
    for (const v of violations) {
      console.error(`  - Archivo: dist/${v.file} | Regla: ${v.rule} (${v.description})`);
    }
    console.error('\nNOTA DE SEGURIDAD: Los valores sensibles no han sido mostrados en el log.');
    console.error('El pipeline se detendrá para prevenir fugas de credenciales en producción.\n');
    process.exit(1);
  }

  console.log('\n✅ [OK] Verificación exitosa: No se detectaron secretos ni credenciales en dist/.');
  console.log('================================================================\n');
  process.exit(0);
}

runAudit();
