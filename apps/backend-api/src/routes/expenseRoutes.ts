// apps/backend-api/src/routes/expenseRoutes.ts
import { Router } from 'express';
import { calculateAnomalyScore, getH3Cell, calculateTheoreticalBaseFare } from '@rexjar/h3-geo-utils';

export const expenseRouter = Router();

// Endpoint: Crear ítem de rendición con scoring de desvío H3
expenseRouter.post('/items', async (req, res) => {
    const { claimId, category, declaredFare, originLat, originLng, destLat, destLng, distanceKm, durationMin } = req.body;

    // 1. Estimar Tarifa Teórica H3
    const theoreticalFare = calculateTheoreticalBaseFare(distanceKm || 5.0, durationMin || 15.0);

    // 2. Score de Desvío (%)
    const anomaly = calculateAnomalyScore(declaredFare, theoreticalFare);

    res.json({
        success: true,
        data: {
            claimId,
            category,
            declaredFare,
            theoreticalFare,
            anomalyScore: anomaly.scorePercent,
            classification: anomaly.classification, // NORMAL, RISK, FRAUD
            trafficLightStatus: 'GREEN'
        }
    });
});