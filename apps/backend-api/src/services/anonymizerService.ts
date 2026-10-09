// apps/backend-api/src/services/anonymizerService.ts
import { getH3Cell, calculateTheoreticalBaseFare } from '@rexjar/h3-geo-utils';
import { Pool } from 'pg';

export async function dispatchZeroPiiMobilityEvent(
    dbPool: Pool,
    eventData: {
        originLat: number; originLng: number;
        destLat: number; destLng: number;
        distanceKm: number; durationMin: number;
        declaredFare: number;
        timestamp: Date;
    }
) {
    // Indexación H3-8
    const originH3 = getH3Cell(eventData.originLat, eventData.originLng, 8);
    const destH3 = getH3Cell(eventData.destLat, eventData.destLng, 8);

    // Tarifa teórica base T_base
    const theoreticalBaseFare = calculateTheoreticalBaseFare(eventData.distanceKm, eventData.durationMin);
    const discrepancyFactor = Math.round(((eventData.declaredFare - theoreticalBaseFare) / theoreticalBaseFare) * 100) / 100;

    // Discretizar tiempo en bloque de 15 min (Zero-PII temporal)
    const timeBlock = new Date(eventData.timestamp);
    timeBlock.setMinutes(Math.floor(timeBlock.getMinutes() / 15) * 15, 0, 0);

    // Inserción irreversible en esquema OLAP mobility_intelligence
    const query = `
    INSERT INTO mobility_intelligence.mobility_events (
      origin_h3_index, dest_h3_index, estimated_distance_km, estimated_duration_min,
      declared_fare, theoretical_base_fare, fare_discrepancy_factor, time_window_block
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
  `;

    await dbPool.query(query, [
        originH3, destH3, eventData.distanceKm, eventData.durationMin,
        eventData.declaredFare, theoreticalBaseFare, discrepancyFactor, timeBlock
    ]);
}