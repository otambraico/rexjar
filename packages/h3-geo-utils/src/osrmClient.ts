// packages/h3-geo-utils/src/osrmClient.ts
export interface RouteResult {
    distanceKm: number;
    durationMin: number;
    source: 'OSRM' | 'HAVERSINE_FALLBACK';
}

export function calculateHaversineDistanceKm(
    lat1: number, lon1: number, lat2: number, lon2: number
): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
}

export async function getRouteDistanceAndDuration(
    originLat: number, originLng: number, destLat: number, destLng: number,
    osrmBaseUrl: string = process.env.OSRM_URL || 'http://localhost:5000'
): Promise<RouteResult> {
    try {
        const url = `${osrmBaseUrl}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=false`;
        const response = await fetch(url, { signal: AbortSignal.timeout(3000) });

        if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
                return {
                    distanceKm: Math.round((data.routes[0].distance / 1000) * 100) / 100,
                    durationMin: Math.round((data.routes[0].duration / 60) * 10) / 10,
                    source: 'OSRM'
                };
            }
        }
    } catch (error) {
        // Fallback silencioso a Haversine
    }

    const distanceKm = calculateHaversineDistanceKm(originLat, originLng, destLat, destLng);
    const durationMin = Math.round((distanceKm / 22) * 60 * 10) / 10;
    return { distanceKm, durationMin, source: 'HAVERSINE_FALLBACK' };
}