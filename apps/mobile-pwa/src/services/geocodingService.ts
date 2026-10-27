import { LIMA_POIS, LimaPoi } from '../data/limaPois';

export interface PlaceItem {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  isLocalPoi: boolean;
  category?: string;
}

/**
 * Normaliza cadenas de texto para búsqueda insensible a acentos y mayúsculas
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca en la base de datos local de POIs de Lima (instantáneo, sin red)
 */
export function searchLocalPois(query: string, limit = 5): PlaceItem[] {
  const normQuery = normalizeText(query);
  if (!normQuery) {
    // Si la consulta está vacía, devuelve los 4 puntos neurálgicos más frecuentes
    return LIMA_POIS.slice(0, 4).map((poi) => ({
      id: poi.id,
      title: poi.name,
      subtitle: `${poi.district} · ${poi.category}`,
      lat: poi.lat,
      lng: poi.lng,
      isLocalPoi: true,
      category: poi.category,
    }));
  }

  const queryTerms = normQuery.split(/\s+/).filter(Boolean);

  const matched = LIMA_POIS.filter((poi) => {
    const normName = normalizeText(poi.name);
    const normDistrict = normalizeText(poi.district);
    const normKeywords = poi.keywords.map(normalizeText).join(' ');
    const haystack = `${normName} ${normDistrict} ${normKeywords}`;

    // Todos los términos ingresados deben coincidir con algún campo del POI
    return queryTerms.every((term) => haystack.includes(term));
  });

  return matched.slice(0, limit).map((poi) => ({
    id: poi.id,
    title: poi.name,
    subtitle: `${poi.district} · ${poi.category}`,
    lat: poi.lat,
    lng: poi.lng,
    isLocalPoi: true,
    category: poi.category,
  }));
}

/**
 * Geocodificación remota con Photon (OpenStreetMap) con sesgo a Lima Metropolitana
 */
export async function searchPhotonOsm(query: string, signal?: AbortSignal, limit = 5): Promise<PlaceItem[]> {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 3) return [];

  try {
    // Centro de Lima: -12.0463, -77.0427. Bounding Box: W: -77.25, S: -12.35, E: -76.80, N: -11.75
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&lat=-12.046374&lon=-77.042793&bbox=-77.25,-12.35,-76.80,-11.75&limit=${limit}`;

    const res = await fetch(url, { signal });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.features || !Array.isArray(data.features)) return [];

    return data.features.map((feature: any, index: number) => {
      const coords = feature.geometry?.coordinates || [-77.03, -12.04];
      const props = feature.properties || {};

      const name = props.name || props.street || cleanQuery;
      const details = [
        props.district || props.suburb || props.city,
        props.state || 'Lima',
        props.country || 'Perú',
      ].filter(Boolean).join(', ');

      return {
        id: `osm-${props.osm_id || index}-${Date.now()}`,
        title: props.housenumber ? `${name} ${props.housenumber}` : name,
        subtitle: details || 'Lima, Perú',
        lat: coords[1],
        lng: coords[0],
        isLocalPoi: false,
        category: props.osm_value || 'Dirección',
      };
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return [];
    }
    // Si falla Photon, intentamos fallback rápido a Nominatim
    return searchNominatimFallback(cleanQuery, signal, limit);
  }
}

/**
 * Fallback a Nominatim si Photon no responde
 */
async function searchNominatimFallback(query: string, signal?: AbortSignal, limit = 4): Promise<PlaceItem[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Lima, Peru')}&format=json&countrycodes=pe&limit=${limit}`;
    const res = await fetch(url, {
      signal,
      headers: {
        'Accept-Language': 'es',
      },
    });
    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any, idx: number) => ({
      id: `nom-${item.place_id || idx}`,
      title: item.display_name.split(',')[0] || query,
      subtitle: item.display_name.split(',').slice(1, 4).join(', ').trim() || 'Lima, Perú',
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      isLocalPoi: false,
      category: item.type || 'Lugar',
    }));
  } catch {
    return [];
  }
}

/**
 * Búsqueda Híbrida: Local POIs primero (<5ms) + Geocodificación OSM si hay >= 3 letras
 */
export async function searchPlacesHybrid(
  query: string,
  signal?: AbortSignal
): Promise<PlaceItem[]> {
  const localResults = searchLocalPois(query, 5);

  // Si no hay consulta o la consulta es muy corta, devolvemos los POIs locales inmediatos
  if (query.trim().length < 3) {
    return localResults;
  }

  // Si tenemos coincidencia local exacta o muy relevante, aún consultamos OSM en segundo plano para direcciones
  try {
    const remoteResults = await searchPhotonOsm(query, signal, 5);

    // Unificamos y descartamos duplicados por coordenadas cercanas (< 100m)
    const combined = [...localResults];
    for (const rem of remoteResults) {
      const isDuplicate = combined.some(
        (loc) => Math.abs(loc.lat - rem.lat) < 0.001 && Math.abs(loc.lng - rem.lng) < 0.001
      );
      if (!isDuplicate) {
        combined.push(rem);
      }
    }

    return combined.slice(0, 8);
  } catch {
    return localResults;
  }
}

/**
 * Obtener la ubicación actual del usuario mediante Geolocation API
 */
export function getCurrentGpsLocation(): Promise<PlaceItem> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada en este navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          id: 'user-current-gps',
          title: 'Mi ubicación actual',
          subtitle: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLocalPoi: true,
          category: 'GPS',
        });
      },
      (err) => {
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}
