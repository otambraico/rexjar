import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { calculateTheoreticalBaseFare, calculateAnomalyScore, getH3Cell } from '@rexjar/h3-geo-utils';
import { testDatabaseConnection } from './config/db';
import { expenseRouter } from './routes/expenseRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'REXJAR Core API',
    timestamp: new Date().toISOString()
  });
});

// RF-01 & RF-02: Endpoint para estimación de Tarifa Teórica Base y Celdas H3
app.post('/api/v1/tariff/estimate', (req: Request, res: Response) => {
  try {
    const { originLat, originLng, destLat, destLng, distanceKm, durationMin, declaredFare } = req.body;

    if (!originLat || !originLng || !destLat || !destLng) {
      return res.status(400).json({ error: 'Coordenadas de origen y destino son obligatorias' });
    }

    // Indexación Hexagonal H3 Resolucin 8
    const originH3 = getH3Cell(originLat, originLng, 8);
    const destH3 = getH3Cell(destLat, destLng, 8);

    // Distancia y tiempo por defecto si no vienen informados (ej. simulación OSRM)
    const dist = distanceKm || 5.2; // km
    const dur = durationMin || 14.5; // min

    // Cálculo determinístico T_base
    const theoreticalFare = calculateTheoreticalBaseFare(dist, dur);

    // Anomaly score si se envía la tarifa declarada
    let anomalyResult = null;
    if (declaredFare !== undefined) {
      anomalyResult = calculateAnomalyScore(declaredFare, theoreticalFare);
    }

    res.json({
      success: true,
      data: {
        originH3,
        destH3,
        estimatedDistanceKm: dist,
        estimatedDurationMin: dur,
        theoreticalBaseFare: theoreticalFare,
        anomaly: anomalyResult
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// RF-05: Generación de Políticas Presigned Upload con Restricciones Criptográficas
app.post('/api/v1/upload/presigned', (req: Request, res: Response) => {
  const { fileName, fileType, fileSize } = req.body;

  // Validación de políticas de tamaño (RF-05 Security Architecture)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

  if (fileSize > MAX_IMAGE_SIZE) {
    return res.status(400).json({ error: 'El archivo supera el límite permitido de 5 MB' });
  }

  if (!ALLOWED_MIME_TYPES.includes(fileType)) {
    return res.status(400).json({ error: 'Formato de archivo no soportado. Use JPG, PNG o PDF' });
  }

  // Generación simulada de Presigned Upload URL con hash de seguridad
  const fileKey = `uploads/quarantine/${Date.now()}_${fileName}`;
  const mockPresignedUrl = `https://storage.rexjar.com/${fileKey}?signature=mock_crypto_signature`;

  res.json({
    success: true,
    data: {
      uploadUrl: mockPresignedUrl,
      fileKey,
      expiresInSeconds: 300, // 5 min expiry
      headers: {
        'Content-Type': fileType
      }
    }
  });
});

// Rutas de rendición de gastos con scoring H3
app.use('/api/v1/expenses', expenseRouter);

// Endpoint de salud de Base de Datos
app.get('/health/db', async (req: Request, res: Response) => {
  const dbHealth = await testDatabaseConnection();
  if (dbHealth.ok) {
    res.json({ status: 'OK', database: 'PostgreSQL (PostGIS + RLS)', version: dbHealth.version });
  } else {
    res.status(503).json({ status: 'ERROR', message: dbHealth.error });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 REXJAR Backend API ejecutándose en el puerto ${PORT}`);
});