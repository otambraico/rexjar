import { Router, Request, Response } from 'express';
import { pool, setTenantContext } from '../config/db';
import { calculateAnomalyScore, calculateTheoreticalBaseFare, getH3Cell } from '@rexjar/h3-geo-utils';
import { dispatchZeroPiiMobilityEvent } from '../services/anonymizerService';

export const claimsRouter = Router();

// GET /api/v1/claims - Listado para la mesa de auditoría B2B
claimsRouter.get('/', async (req: Request, res: Response) => {
  const companyId = (req.headers['x-company-id'] as string) || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTenantContext(client, companyId);
    
    const result = await client.query(`
      SELECT 
        c.id, c.title, c.total_amount, c.currency, c.status, c.created_at,
        u.full_name as employee_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'category', i.category,
              'amount', i.amount,
              'ocr_confidence', i.ocr_confidence,
              'traffic_light_status', i.traffic_light_status,
              'anomaly_score', i.anomaly_score,
              'anomaly_classification', i.anomaly_classification,
              'origin_address', i.origin_address,
              'destination_address', i.destination_address
            )
          ) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) as items
      FROM corp_expense.expense_claims c
      JOIN corp_expense.users u ON c.user_id = u.id
      LEFT JOIN corp_expense.expense_items i ON i.claim_id = c.id
      GROUP BY c.id, u.full_name
      ORDER BY c.created_at DESC;
    `);

    await client.query('COMMIT');
    res.json({ success: true, claims: result.rows });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// POST /api/v1/claims - Registrar nueva rendición desde la PWA Móvil
claimsRouter.post('/', async (req: Request, res: Response) => {
  const companyId = (req.headers['x-company-id'] as string) || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const { title, totalAmount, category, extras, originLat, originLng, destLat, destLng, distanceKm, durationMin } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTenantContext(client, companyId);

    // Obtener un usuario por defecto
    const userResult = await client.query(`SELECT id FROM corp_expense.users WHERE company_id = $1 LIMIT 1`, [companyId]);
    if (userResult.rows.length === 0) {
      throw new Error('No se encontró usuario para este tenant');
    }
    const userId = userResult.rows[0].id;

    // Insertar claim
    const claimResult = await client.query(`
      INSERT INTO corp_expense.expense_claims (company_id, user_id, title, total_amount, status)
      VALUES ($1, $2, $3, $4, 'SUBMITTED')
      RETURNING id, title, total_amount, status, created_at;
    `, [companyId, userId, title || 'Rendición de Movilidad', totalAmount]);

    const claimId = claimResult.rows[0].id;

    // Calcular score de anomalía H3 si es taxi
    const dist = distanceKm || 5.2;
    const dur = durationMin || 14.5;
    const tBase = calculateTheoreticalBaseFare(dist, dur);
    const anomaly = calculateAnomalyScore(totalAmount, tBase);

    // Insertar ítem de gasto
    await client.query(`
      INSERT INTO corp_expense.expense_items (
        company_id, claim_id, category, amount, ocr_confidence, traffic_light_status,
        anomaly_score, anomaly_classification, origin_address, destination_address
      ) VALUES ($1, $2, $3, $4, 0.94, 'GREEN', $5, $6, 'Av. Javier Prado Este', 'Av. Larco');
    `, [companyId, claimId, category || 'TAXI', totalAmount, anomaly.scorePercent, anomaly.classification]);

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      claim: claimResult.rows[0],
      anomaly
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});

// PATCH /api/v1/claims/:id/status - Aprobación / Rechazo con 1 clic (Dispara Zero-PII)
claimsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const companyId = (req.headers['x-company-id'] as string) || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, error: 'Estado no válido' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setTenantContext(client, companyId);

    await client.query(
      `UPDATE corp_expense.expense_claims SET status = $1 WHERE id = $2`,
      [status, id]
    );

    // Ingesta Zero-PII en caso de Aprobación
    if (status === 'APPROVED') {
      const items = await client.query(
        `SELECT * FROM corp_expense.expense_items WHERE claim_id = $1 AND category = 'TAXI'`,
        [id]
      );
      for (const item of items.rows) {
        await dispatchZeroPiiMobilityEvent(pool, {
          originLat: -12.1211,
          originLng: -77.0297,
          destLat: -12.0972,
          destLng: -77.0342,
          distanceKm: 5.2,
          durationMin: 14.5,
          declaredFare: parseFloat(item.amount),
          timestamp: new Date()
        });
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Rendición ${status} con éxito y sincronizada a Zero-PII` });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
});
