/**
 * Geocoding utility for Philippine cities and regions.
 * Maps location strings to approximate latitude/longitude coordinates.
 */

type LocationCoords = {
  lat: number;
  lng: number;
};
import { getBarangayCentroid } from "@/lib/constants/locations";

// Common Philippine cities and regions with approximate coordinates
const PHILIPPINES_LOCATIONS: Record<string, LocationCoords> = {
  // Metro Manila
  "manila": { lat: 14.5994, lng: 120.9842 },
  "quezon city": { lat: 14.6349, lng: 121.0388 },
  "makati": { lat: 14.5546, lng: 121.0233 },
  "pasig": { lat: 14.5794, lng: 121.0849 },
  "caloocan": { lat: 14.6427, lng: 120.9506 },
  "valenzuela": { lat: 14.7614, lng: 120.9539 },
  "malabon": { lat: 14.7607, lng: 120.8278 },
  "navotas": { lat: 14.6721, lng: 120.8398 },
  "marikina": { lat: 14.6394, lng: 121.1237 },
  "san juan": { lat: 14.5894, lng: 121.0258 },
  "mandaluyong": { lat: 14.5858, lng: 121.0237 },
  "taguig": { lat: 14.5176, lng: 121.0509 },
  "pateros": { lat: 14.5628, lng: 121.1236 },

  // Luzon - Metro Manila Adjacent
  "bulacan": { lat: 14.7538, lng: 120.9237 },
  "rizal": { lat: 14.5794, lng: 121.2633 },
  "laguna": { lat: 14.3156, lng: 121.4289 },
  "cavite": { lat: 14.3195, lng: 120.8974 },
  "batangas": { lat: 13.7563, lng: 121.0158 },

  // Metro Cebu
  "cebu": { lat: 10.3157, lng: 123.8854 },
  "cebu city": { lat: 10.3157, lng: 123.8854 },
  "lapu-lapu": { lat: 10.3205, lng: 124.0077 },
  "mandaue": { lat: 10.3648, lng: 123.9322 },
  "talisay": { lat: 10.2667, lng: 123.9167 },

  // Davao
  "davao": { lat: 7.1108, lng: 125.6423 },
  "davao city": { lat: 7.1108, lng: 125.6423 },

  // Cagayan de Oro
  "cdo": { lat: 8.4866, lng: 124.6329 },
  "cagayan de oro": { lat: 8.4866, lng: 124.6329 },

  // Iloilo
  "iloilo": { lat: 10.6918, lng: 122.5630 },
  "iloilo city": { lat: 10.6918, lng: 122.5630 },

  // Bacolod
  "bacolod": { lat: 10.3910, lng: 123.0246 },
  "bacolod city": { lat: 10.3910, lng: 123.0246 },

  // Default (Philippines center)
  "philippines": { lat: 12.8797, lng: 121.7740 },
};

/**
 * Convert a location string to approximate coordinates.
 * Returns a default center point if location is not recognized.
 */
export function geocodeLocation(location: string): LocationCoords {
  const normalized = location.toLowerCase().trim();

  // Try exact match first
  if (PHILIPPINES_LOCATIONS[normalized]) {
    return PHILIPPINES_LOCATIONS[normalized];
  }

  // Try partial match (first word or city name)
  for (const [key, coords] of Object.entries(PHILIPPINES_LOCATIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Default to Philippines center if no match
  return PHILIPPINES_LOCATIONS.philippines;
}

/**
 * Geocode using explicit city and barangay when available.
 * Returns null if not found; caller should fallback to `geocodeLocation`.
 */
export function geocodeCityBarangay(city?: string, barangay?: string): LocationCoords | null {
  if (!city) return null;
  const coords = getBarangayCentroid(city, barangay || undefined);
  if (!coords) return null;
  return { lat: coords.lat, lng: coords.lng };
}

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter businesses by proximity to a center location.
 * Returns businesses within the specified radius (in km).
 */
export function getBusinessesWithinRadius(
  businesses: Array<{ id: string; location: string;[key: string]: unknown }>,
  centerLocation: string,
  radiusKm: number = 50
): Array<{ id: string; location: string; distance: number;[key: string]: unknown }> {
  const centerCoords = geocodeLocation(centerLocation);

  return businesses
    .map((business) => {
      const businessCoords = geocodeLocation(business.location);
      const distance = calculateDistance(
        centerCoords.lat,
        centerCoords.lng,
        businessCoords.lat,
        businessCoords.lng
      );
      return { ...business, distance };
    })
    .filter((business) => business.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
