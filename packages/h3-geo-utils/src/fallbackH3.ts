import { getH3Cell, getH3ParentFallback, calculateTheoreticalBaseFare } from './index';

export interface PercentileDistribution {
  p25: number;
  p50: number; // Mediana
  p75: number;
  sampleSize: number;
  resolution: 'H3-8' | 'H3-7' | 'THEORETICAL_BASE';
}

export function calculatePercentiles(values: number[]): { p25: number; p50: number; p75: number } {
  if (values.length === 0) return { p25: 0, p50: 0, p75: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const getP = (p: number) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 100) / 100;
  };
  return { p25: getP(25), p50: getP(50), p75: getP(75) };
}

/**
 * Motor de Fallback Adaptativo:
 * 1. Intenta evaluar observaciones en H3-8 (resolución fina ~700m).
 * 2. Si N < 5, realiza fallback a H3-7 (resolución ampliada ~5km).
 * 3. Si persiste N < 5, retorna la tarifa teórica calculada por OSRM (T_base).
 */
export async function getAdaptiveH3Distribution(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  distanceKm: number,
  durationMin: number,
  querySamplesFn: (origH3: string, destH3: string) => Promise<number[]>
): Promise<PercentileDistribution> {
  const origH3_8 = getH3Cell(originLat, originLng, 8);
  const destH3_8 = getH3Cell(destLat, destLng, 8);

  // Intento 1: H3-8
  const samplesH3_8 = await querySamplesFn(origH3_8, destH3_8);
  if (samplesH3_8.length >= 5) {
    const { p25, p50, p75 } = calculatePercentiles(samplesH3_8);
    return { p25, p50, p75, sampleSize: samplesH3_8.length, resolution: 'H3-8' };
  }

  // Fallback 1: H3-7
  const origH3_7 = getH3ParentFallback(origH3_8, 7);
  const destH3_7 = getH3ParentFallback(destH3_8, 7);
  const samplesH3_7 = await querySamplesFn(origH3_7, destH3_7);
  if (samplesH3_7.length >= 5) {
    const { p25, p50, p75 } = calculatePercentiles(samplesH3_7);
    return { p25, p50, p75, sampleSize: samplesH3_7.length, resolution: 'H3-7' };
  }

  // Fallback 2: Base Teórica (Costo determinístico por fórmula OSRM)
  const tBase = calculateTheoreticalBaseFare(distanceKm, durationMin);
  return {
    p25: Math.round(tBase * 0.95 * 100) / 100,
    p50: tBase,
    p75: Math.round(tBase * 1.15 * 100) / 100,
    sampleSize: samplesH3_8.length + samplesH3_7.length,
    resolution: 'THEORETICAL_BASE'
  };
}
