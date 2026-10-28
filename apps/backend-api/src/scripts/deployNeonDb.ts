// apps/backend-api/src/scripts/deployNeonDb.ts
import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

export async function deployNeonDb(overrideUrl?: string) {
  const databaseUrl = overrideUrl || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Falta la variable DATABASE_URL. Pásala como argumento: npx ts-node src/scripts/deployNeonDb.ts "postgresql://..."'
    );
  }

  console.log('🚀 Iniciando despliegue de esquemas, RLS y datos en Neon.tech...');
  console.log(`🔗 Conectando a: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    // 1. Extensiones
    console.log('🧩 Habilitando extensiones PostGIS y Pgcrypto...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
      console.log('  -> Extensión postgis activada.');
    } catch (e: any) {
      console.log('  -> PostGIS omitido o no disponible:', e.message);
    }
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // 2. Esquemas
    console.log('📦 Creando esquemas de dominio...');
    await client.query('CREATE SCHEMA IF NOT EXISTS corp_expense;');
    await client.query('CREATE SCHEMA IF NOT EXISTS mobility_intelligence;');

    // 3. Tablas corp_expense
    console.log('📋 Creando tablas en corp_expense...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS corp_expense.companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        legal_name VARCHAR(255) NOT NULL,
        tax_id VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS corp_expense.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'EMPLOYEE',
        password_hash VARCHAR(255),
        status VARCHAR(20) DEFAULT 'ACTIVE',
        avatar_url TEXT,
        magic_token VARCHAR(255),
        magic_token_expires_at TIMESTAMP WITH TIME ZONE,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS corp_expense.expense_claims (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES corp_expense.users(id) ON DELETE RESTRICT,
        title VARCHAR(255) NOT NULL,
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'PEN',
        status VARCHAR(50) DEFAULT 'DRAFT',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS corp_expense.expense_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES corp_expense.companies(id) ON DELETE CASCADE,
        claim_id UUID NOT NULL REFERENCES corp_expense.expense_claims(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        ocr_confidence NUMERIC(3, 2),
        traffic_light_status VARCHAR(20) DEFAULT 'GREEN',
        image_url TEXT,
        origin_address TEXT,
        destination_address TEXT,
        anomaly_score NUMERIC(5, 2),
        anomaly_classification VARCHAR(20) DEFAULT 'NORMAL',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Tablas mobility_intelligence
    console.log('📍 Creando tablas en mobility_intelligence...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS mobility_intelligence.mobility_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        origin_h3_index VARCHAR(15) NOT NULL,
        dest_h3_index VARCHAR(15) NOT NULL,
        estimated_distance_km NUMERIC(8, 2) NOT NULL,
        estimated_duration_min NUMERIC(8, 2) NOT NULL,
        declared_fare NUMERIC(10, 2) NOT NULL,
        theoretical_base_fare NUMERIC(10, 2) NOT NULL,
        fare_discrepancy_factor NUMERIC(5, 2),
        time_window_block TIMESTAMP WITH TIME ZONE NOT NULL,
        vehicle_type VARCHAR(30) DEFAULT 'STANDARD_TAXI',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_h3_origin ON mobility_intelligence.mobility_events (origin_h3_index);
      CREATE INDEX IF NOT EXISTS idx_h3_dest ON mobility_intelligence.mobility_events (dest_h3_index);
      CREATE INDEX IF NOT EXISTS idx_h3_pair ON mobility_intelligence.mobility_events (origin_h3_index, dest_h3_index);
      CREATE INDEX IF NOT EXISTS idx_time_block ON mobility_intelligence.mobility_events (time_window_block);
    `);

    // 5. Políticas Row-Level Security (RLS)
    console.log('🛡️ Configurando políticas Row-Level Security (RLS)...');
    await client.query(`
      ALTER TABLE corp_expense.expense_claims ENABLE ROW LEVEL SECURITY;
      ALTER TABLE corp_expense.expense_claims FORCE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS tenant_claims_isolation ON corp_expense.expense_claims;
      CREATE POLICY tenant_claims_isolation ON corp_expense.expense_claims
        FOR ALL
        USING (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid);

      ALTER TABLE corp_expense.expense_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE corp_expense.expense_items FORCE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS tenant_items_isolation ON corp_expense.expense_items;
      CREATE POLICY tenant_items_isolation ON corp_expense.expense_items
        FOR ALL
        USING (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid)
        WITH CHECK (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid);
    `);

    // 6. Hashes y Usuarios Semilla
    console.log('🔑 Creando empresas y cuentas corporativas demo...');
    const salt = await bcrypt.genSalt(10);
    const auditorHash = await bcrypt.hash('Admin123!', salt);
    const employeeHash = await bcrypt.hash('User123!', salt);

    // Inquilino A: ACME Corp Perú
    const acmeRes = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id)
      VALUES ('ACME Corp Perú S.A.C.', '20100123456')
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name
      RETURNING id;
    `);
    const acmeId = acmeRes.rows[0].id;

    // Auditor ACME
    await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'auditor@acme.pe', 'Elena Rostworowski (Auditor B2B)', 'AUDITOR', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
    `, [acmeId, auditorHash]);

    // Colaborador ACME
    const carlosRes = await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'carlos@acme.pe', 'Carlos Mendoza (Ventas Terreno)', 'EMPLOYEE', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
      RETURNING id;
    `, [acmeId, employeeHash]);
    const carlosId = carlosRes.rows[0].id;

    // Inquilino B: Logística Beta
    const betaRes = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id)
      VALUES ('Logística Beta del Perú S.A.', '20500987654')
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name
      RETURNING id;
    `);
    const betaId = betaRes.rows[0].id;

    await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role, password_hash, status)
      VALUES ($1, 'maria@beta.pe', 'María Quispe (Operaciones Beta)', 'EMPLOYEE', $2, 'ACTIVE')
      ON CONFLICT (email) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
    `, [betaId, employeeHash]);

    // 7. Reclamos semilla con bypass temporal de RLS para el seed
    console.log('🧾 Insertando comprobantes de prueba en ACME Corp...');
    const claimRes = await client.query(`
      INSERT INTO corp_expense.expense_claims (company_id, user_id, title, total_amount, currency, status, submitted_at)
      VALUES ($1, $2, 'Rendición Reunión Comercial Miraflores', 35.00, 'PEN', 'SUBMITTED', NOW())
      RETURNING id;
    `, [acmeId, carlosId]);
    const claimId = claimRes.rows[0].id;

    await client.query(`
      INSERT INTO corp_expense.expense_items (
        company_id, claim_id, category, amount, ocr_confidence, 
        traffic_light_status, origin_address, destination_address, 
        anomaly_score, anomaly_classification
      )
      VALUES ($1, $2, 'TAXI', 35.00, 0.94, 'AMBER', 'Av. Larco 101, Miraflores', 'Av. Rivera Navarrete 500, San Isidro', 1.35, 'WARNING');
    `, [acmeId, claimId]);

    console.log('✨ Base de datos en Neon.tech desplegada y lista para producción.');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  const argUrl = process.argv[2];
  deployNeonDb(argUrl)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error en deployNeonDb:', err);
      process.exit(1);
    });
}
