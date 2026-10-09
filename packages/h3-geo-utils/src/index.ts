// =============================================================================
// REXJAR - UTILIDADES GEOESPACIALES H3 Y CÁLCULO DE TARIFAS
// =============================================================================

import { latLngToCell, cellToParent } from 'h3-js';

// Parámetros Oficiales del Operador de Taxi (Valores Paramétricos)
export interface TaxiTariffParams {
  banderazo: number;      // Tarifa base inicial (e.g., 4.50 PEN)
  tariffPerKm: number;    // Tarifa por kilómetro recorrido (e.g., 1.80 PEN)
  tariffPerMin: number;   // Tarifa por minuto de tiempo (e.g., 0.35 PEN)
}

export const DEFAULT_LIMA_TAXI_TARIFF: TaxiTariffParams = {
  banderazo: 4.50,
  tariffPerKm: 1.80,
  tariffPerMin: 0.35,
};

/**
 * Convierte coordenadas (lat, lng) en celda H3 a resolución especificada (por defecto Res 8).
 */
export function getH3Cell(lat: number, lng: number, res: number = 8): string {
  return latLngToCell(lat, lng, res);
}

/**
 * Obtiene la celda padre de resolución inferior (ej. Res 8 -> Res 7) para fallback adaptativo.
 */
export function getH3ParentFallback(h3Index: string, targetRes: number = 7): string {
  return cellToParent(h3Index, targetRes);
}

/**
 * Calcula la Tarifa Base Teórica T_base aplicando la fórmula oficial del operador:
 * T_base = Banderazo + (d * Tariff_km) + (t * Tariff_min)
 */
export function calculateTheoreticalBaseFare(
  distanceKm: number,
  durationMin: number,
  params: TaxiTariffParams = DEFAULT_LIMA_TAXI_TARIFF
): number {
  const fare = params.banderazo + (distanceKm * params.tariffPerKm) + (durationMin * params.tariffPerMin);
  return Math.round(fare * 100) / 100;
}

/**
 * Calcula el Score de Desvío (%) de la tarifa declarada respecto a la teórica:
 * Score = ((T_declarada - T_teorica) / T_teorica) * 100
 */
export function calculateAnomalyScore(declaredFare: number, theoreticalFare: number): {
  scorePercent: number;
  classification: 'NORMAL' | 'RISK' | 'FRAUD';
} {
  if (theoreticalFare <= 0) return { scorePercent: 0, classification: 'NORMAL' };
  
  const scorePercent = Math.round(((declaredFare - theoreticalFare) / theoreticalFare) * 100 * 100) / 100;

  let classification: 'NORMAL' | 'RISK' | 'FRAUD' = 'NORMAL';
  if (scorePercent > 35) {
    classification = 'FRAUD';
  } else if (scorePercent > 15) {
    classification = 'RISK';
  }

  return { scorePercent, classification };
}

export * from './osrmClient';
