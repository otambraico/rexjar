// apps/backend-api/src/scripts/migrateAuthUsers.ts
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export async function migrateAuthUsers() {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = parseInt(process.env.POSTGRES_PORT || '5432');
  const user = process.env.POSTGRES_USER || 'rexjar_admin';
  const password = process.env.POSTGRES_PASSWORD || 'rexjar_pass_2026';
  const database = process.env.POSTGRES_DB || 'rexjar_db';

  console.log('🔄 Conectando a PostgreSQL para migrar esquema corp_expense.users...');
  const client = new Client({ host, port, user, password, database });
  await client.connect();

  try {
    // 1. Agregar columnas necesarias para autenticación
    console.log('📦 Actualizando columnas en corp_expense.users...');
    await client.query(`
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE';
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS magic_token VARCHAR(255);
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS magic_token_expires_at TIMESTAMP WITH TIME ZONE;
      ALTER TABLE corp_expense.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
    `);

    // 2. Hashear contraseñas para los usuarios demo
    console.log('🔑 Generando hashes criptográficos de contraseñas con bcrypt...');
    const salt = await bcrypt.genSalt(10);
    const auditorPassHash = await bcrypt.hash('Admin123!', salt);
    const employeePassHash = await bcrypt.hash('User123!', salt);

    // 3. Crear empresa demo si no existe
    const compResult = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id)
      VALUES ('ACME Corp Perú S.A.C.', '20100123456')
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name
      RETURNING id, legal_name, tax_id;
    `);
    const companyId = compResult.rows[0].id;
    console.log(`🏢 Empresa configurada: ${compResult.rows[0].legal_name} (${companyId})`);

    // 4. Crear o actualizar usuario Auditor B2B
    await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'auditor@acme.pe', 'Elena Rostworowski (Auditor B2B)', 'AUDITOR', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          company_id = EXCLUDED.company_id,
          status = EXCLUDED.status;
    `, [companyId, auditorPassHash]);
    console.log('  -> Usuario Auditor B2B listo: auditor@acme.pe (Pass: Admin123!)');

    // 5. Crear o actualizar usuario Colaborador Móvil
    await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'carlos@acme.pe', 'Carlos Mendoza (Ventas Terreno)', 'EMPLOYEE', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          company_id = EXCLUDED.company_id,
          status = EXCLUDED.status;
    `, [companyId, employeePassHash]);
    console.log('  -> Usuario Colaborador Móvil listo: carlos@acme.pe (Pass: User123!)');

    // 6. Configurar Empresa Beta para aislamiento multi-tenant
    const compBetaResult = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id)
      VALUES ('Logística Beta del Perú S.A.', '20500987654')
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name
      RETURNING id, legal_name, tax_id;
    `);
    const companyBetaId = compBetaResult.rows[0].id;

    await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'maria@beta.pe', 'María Quispe (Operaciones Beta)', 'EMPLOYEE', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          company_id = EXCLUDED.company_id,
          status = EXCLUDED.status;
    `, [companyBetaId, employeePassHash]);
    console.log('  -> Usuario Inquilino Beta listo: maria@beta.pe (Pass: User123!)');

    console.log('✅ Migración de usuarios y contraseñas completada con éxito.');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  migrateAuthUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error en migración:', err);
      process.exit(1);
    });
}
