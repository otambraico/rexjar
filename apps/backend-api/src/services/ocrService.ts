// apps/backend-api/src/services/ocrService.ts
import { TrafficLightStatus, ExtractedReceiptData } from '@rexjar/shared-types';

export function evaluateOcrTrafficLight(confidence: number): TrafficLightStatus {
    if (confidence >= 0.85) return 'GREEN';
    if (confidence >= 0.50) return 'YELLOW';
    return 'RED';
}

export async function processReceiptOcr(imageKey: string): Promise<ExtractedReceiptData> {
    // Simulación del motor OCR / Visión Multimodal
    const mockConfidence = 0.92;
    const overallStatus = evaluateOcrTrafficLight(mockConfidence);

    return {
        totalAmount: { value: 35.00, confidence: 0.95, boundingBox: { x: 120, y: 340, width: 80, height: 30 } },
        taxId: { value: '20601234567', confidence: 0.89 },
        vendorName: { value: 'Servicio de Taxi Ejecutivo S.A.C.', confidence: 0.92 },
        originAddress: { value: 'Av. Javier Prado Este 4200, Surco', confidence: 0.88 },
        destinationAddress: { value: 'Av. José Pardo 601, Miraflores', confidence: 0.86 },
        overallStatus
    };
}