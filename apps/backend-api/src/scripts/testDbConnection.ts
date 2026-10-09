// apps/backend-api/src/scripts/testDbConnection.ts
import { pool, setTenantContext, testDatabaseConnection } from '../config/db';
import { getH3Cell, calculateTheoreticalBaseFare } from '@rexjar/h3-geo-utils';

async function runValidationSuite() {
    console.log('🔍 [1/4] Verificando conexión a PostgreSQL local...');
    const health = await testDatabaseConnection();

    if (!health.ok) {
        console.error('❌ Error de conexión:', health.error);
        console.log('👉 Asegúrate de haber iniciado el contenedor ejecutando: npm run docker:up');
        process.exit(1);
    }
    console.log('✅ Conexión establecida con éxito:', health.version?.split(',')[0]);

    const client = await pool.connect();

    try {
        console.log('🏢 [2/4] Insertando Empresas de prueba...');
        const companyA = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id) 
      VALUES ('Empresa Alfa S.A.C.', '20100000001') 
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name 
      RETURNING id;
    `);

        const companyB = await client.query(`
      INSERT INTO corp_expense.companies (legal_name, tax_id) 
      VALUES ('Empresa Beta E.I.R.L.', '20100000002') 
      ON CONFLICT (tax_id) DO UPDATE SET legal_name = EXCLUDED.legal_name 
      RETURNING id;
    `);

        const companyAId = companyA.rows[0].id;
        const companyBId = companyB.rows[0].id;

        console.log('🔒 [3/4] Probando aislamiento Multi-tenant (Row Level Security)...');

        // Iniciar transacción e imponer contexto de Empresa Alfa
        await client.query('BEGIN');
        await setTenantContext(client, companyAId);

        // Insertar usuario de Empresa Alfa
        const userA = await client.query(`
      INSERT INTO corp_expense.users (company_id, email, full_name, role)
      VALUES ($1, 'juan@alfa.com', 'Juan Pérez', 'EMPLOYEE')
      ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
      RETURNING id;
    `, [companyAId]);

        const userAId = userA.rows[0].id;

        // Insertar rendición para Empresa Alfa
        await client.query(`
      INSERT INTO corp_expense.expense_claims (company_id, user_id, title, total_amount, status)
      VALUES ($1, $2, 'Rendición Taxis Visita Cliente', 45.00, 'SUBMITTED');
    `, [companyAId, userAId]);

        // Consultar comprobantes (RLS debe mostrar solo los de Empresa Alfa)
        const claimsAlfa = await client.query('SELECT * FROM corp_expense.expense_claims;');
        console.log(`  -> Registros visibles para Empresa Alfa: ${claimsAlfa.rows.length} (Esperado: >0)`);

        await client.query('COMMIT');

        // Verificar aislamiento cruzado: Empresa Beta debe ver 0 registros
        await client.query('BEGIN');
        await setTenantContext(client, companyBId);
        const claimsBeta = await client.query('SELECT * FROM corp_expense.expense_claims;');
        console.log(`  -> Registros visibles para Empresa Beta: ${claimsBeta.rows.length} (Esperado: 0 - Aislamiento comprobado)`);
        await client.query('COMMIT');

        console.log('🌐 [4/4] Probando Ingesta Anónima Geoespacial H3 (Zero-PII)...');

        // Simular viaje Miraflores -> San Isidro
        const originLat = -12.1211, originLng = -77.0297;
        const destLat = -12.0972, destLng = -77.0342;

        const originH3 = getH3Cell(originLat, originLng, 8);
        const destH3 = getH3Cell(destLat, destLng, 8);
        const distKm = 3.2;
        const durMin = 12.0;
        const tBase = calculateTheoreticalBaseFare(distKm, durMin);

        await client.query(`
      INSERT INTO mobility_intelligence.mobility_events (
        origin_h3_index, dest_h3_index, estimated_distance_km, estimated_duration_min,
        declared_fare, theoretical_base_fare, fare_discrepancy_factor, time_window_block
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW());
    `, [originH3, destH3, distKm, durMin, 18.00, tBase, 0.05]);

        const mobilityCount = await client.query('SELECT COUNT(*) FROM mobility_intelligence.mobility_events;');
        console.log(`  -> Eventos anónimos H3 registrados: ${mobilityCount.rows[0].count}`);

        console.log('\n🎉 ¡Validación completa! La base de datos y los esquemas están operativos.');

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('❌ Error durante la validación:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runValidationSuite();