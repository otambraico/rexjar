// =============================================================================
// REXJAR - DEFINICIONES Y TIPOS COMPARTIDOS (TypeScript)
// =============================================================================

export type TrafficLightStatus = 'GREEN' | 'YELLOW' | 'RED';
export type AnomalyClassification = 'NORMAL' | 'RISK' | 'FRAUD';
export type ExpenseCategory = 'TAXI' | 'TOLL' | 'PARKING' | 'MEAL' | 'LODGING' | 'OTHER';
export type ClaimStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface OcrFieldResult<T> {
  value: T;
  confidence: number; // 0.00 to 1.00
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ExtractedReceiptData {
  totalAmount: OcrFieldResult<number>;
  taxId?: OcrFieldResult<string>; // RUC / RFC / NIT
  date?: OcrFieldResult<string>;
  vendorName?: OcrFieldResult<string>;
  originAddress?: OcrFieldResult<string>;
  destinationAddress?: OcrFieldResult<string>;
  overallStatus: TrafficLightStatus;
}

export interface ExpenseItemDTO {
  id: string;
  claimId: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  ocrConfidence: number;
  trafficLightStatus: TrafficLightStatus;
  imageUrl?: string;
  originAddress?: string;
  destinationAddress?: string;
  anomalyScore?: number;
  anomalyClassification: AnomalyClassification;
  createdAt: string;
}

export interface MobilityEventAnonymizedDTO {
  originH3Index: string; // H3-8
  destH3Index: string;   // H3-8
  estimatedDistanceKm: number;
  estimatedDurationMin: number;
  declaredFare: number;
  theoreticalBaseFare: number;
  fareDiscrepancyFactor: number;
  timeWindowBlock: string; // 15 min block ISO String
  vehicleType: string;
}

export interface TheoreticalTariffRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  vehicleType?: string;
}

export interface TheoreticalTariffResponse {
  theoreticalBaseFare: number;
  distanceKm: number;
  durationMin: number;
  originH3: string;
  destH3: string;
  percentilesH3?: {
    p25: number;
    p50: number;
    p75: number;
    sampleSize: number;
    effectiveResolution: 'H3-8' | 'H3-7' | 'GLOBAL_BASE';
  };
}
