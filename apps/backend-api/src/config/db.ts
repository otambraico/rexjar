// apps/backend-api/src/config/db.ts
import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'rexjar_admin',
    password: process.env.POSTGRES_PASSWORD || 'rexjar_pass_2026',
    database: process.env.POSTGRES_DB || 'rexjar_db',
    max: 10,
    idleTimeoutMillis: 30000,
});

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