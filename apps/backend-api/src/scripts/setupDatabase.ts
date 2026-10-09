// apps/backend-api/src/scripts/setupDatabase.ts
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export async function setupDatabase(adminPassword?: string) {
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = parseInt(process.env.POSTGRES_PORT || '5432');
  const superuserPassword = adminPassword || process.env.POSTGRES_SUPERUSER_PASSWORD || 'postgres';

  console.log('🔄 Conectando como superusuario a postgres...');
  const rootClient = new Client({
    host,
    port,
    user: 'postgres',
    password: superuserPassword,
    database: 'postgres'
  });

  await rootClient.connect();

  console.log('👤 Creando/verificando rol rexjar_admin...');
  const roleCheck = await rootClient.query("SELECT 1 FROM pg_roles WHERE rolname = 'rexjar_admin'");
  if (roleCheck.rows.length === 0) {
    await rootClient.query("CREATE ROLE rexjar_admin WITH LOGIN PASSWORD 'rexjar_pass_2026' NOSUPERUSER NOBYPASSRLS;");
    console.log('  -> Rol rexjar_admin creado.');
  } else {
    await rootClient.query("ALTER ROLE rexjar_admin WITH LOGIN PASSWORD 'rexjar_pass_2026' NOSUPERUSER NOBYPASSRLS;");
    console.log('  -> Rol rexjar_admin actualizado a NOSUPERUSER NOBYPASSRLS.');
  }

  console.log('🗄️ Creando/verificando base de datos rexjar_db...');
  const dbCheck = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'rexjar_db'");
  if (dbCheck.rows.length === 0) {
    await rootClient.query("CREATE DATABASE rexjar_db OWNER rexjar_admin;");
    console.log('  -> Base de datos rexjar_db creada.');
  } else {
    console.log('  -> Base de datos rexjar_db ya existe.');
  }

  await rootClient.end();

  // Conectar ahora a rexjar_db con rexjar_admin
  console.log('📦 Aplicando DDL, esquemas y políticas RLS en rexjar_db...');
  const dbClient = new Client({
    host,
    port,
    user: 'rexjar_admin',
    password: 'rexjar_pass_2026',
    database: 'rexjar_db'
  });

  await dbClient.connect();

  // Extensiones (PostGIS si está disponible)
  try {
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('  -> Extensión postgis activada.');
  } catch (e: any) {
    console.log('  -> Nota: Extensión postgis no instalada en servidor local (se omite para H3/tablas relacionales).');
  }

  // Esquemas
  await dbClient.query('CREATE SCHEMA IF NOT EXISTS corp_expense;');
  await dbClient.query('CREATE SCHEMA IF NOT EXISTS mobility_intelligence;');

  // Tablas corp_expense
  await dbClient.query(`
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

  // Tablas mobility_intelligence
  await dbClient.query(`
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

  // Políticas RLS (Row Level Security)
  await dbClient.query(`
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

  console.log('✅ Esquemas y políticas RLS configurados con éxito.');
  await dbClient.end();
}

if (require.main === module) {
  const pwd = process.argv[2];
  setupDatabase(pwd)
    .then(() => {
      console.log('🎉 Inicialización completada.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error en setupDatabase:', err.message);
      process.exit(1);
    });
}
