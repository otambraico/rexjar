// apps/backend-api/src/config/db.ts
import { Pool, PoolClient, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function getPoolConfig(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const isNeonOrSsl = databaseUrl.includes('neon.tech') || 
                        databaseUrl.includes('sslmode=require') || 
                        process.env.NODE_ENV === 'production';
    return {
      connectionString: databaseUrl,
      ssl: isNeonOrSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
    };
  }

  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'rexjar_admin',
    password: process.env.POSTGRES_PASSWORD || 'rexjar_pass_2026',
    database: process.env.POSTGRES_DB || 'rexjar_db',
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  };
}

export const pool = new Pool(getPoolConfig());

/**
 * Aplica el contexto de la empresa (company_id) a la conexión actual
 * para que PostgreSQL RLS filtre automáticamente las filas permitidas.
 */
export async function setTenantContext(client: PoolClient, companyId: string): Promise<void> {
  await client.query("SELECT set_config('app.current_company_id', $1, true)", [companyId]);
}

/**
 * Función de verificación de salud de la base de datos.
 */
export async function testDatabaseConnection(): Promise<{ ok: boolean; version?: string; error?: string }> {
  try {
    const result = await pool.query('SELECT version(), NOW() as current_time;');
    return { ok: true, version: result.rows[0].version };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}
