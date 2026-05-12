// Minimal PH city -> barangay mapping with centroids for initial rollout.
// Expand this list over time. Barangay centroids are approximate and
// intended for display / clustering only.

export type Coords = { lat: number; lng: number };

export const LOCATIONS: Record<
  string,
  { centroid: Coords; barangays: Record<string, Coords | null> }
> = {
  "Quezon City": {
    centroid: { lat: 14.6349, lng: 121.0388 },
    barangays: {
      "Commonwealth": { lat: 14.6760, lng: 121.0590 },
      "Diliman": { lat: 14.6578, lng: 121.0283 },
      "Cubao": { lat: 14.6209, lng: 121.0496 },
      "Tandang Sora": { lat: 14.6821, lng: 121.0410 },
    },
  },
  "Manila": {
    centroid: { lat: 14.5994, lng: 120.9842 },
    barangays: {
      "San Miguel": { lat: 14.6049, lng: 120.9930 },
      "Quiapo": { lat: 14.5995, lng: 120.9781 },
      "Intramuros": { lat: 14.5900, lng: 120.9740 },
    },
  },
  "Makati": {
    centroid: { lat: 14.5546, lng: 121.0233 },
    barangays: {
      "Bel-Air": { lat: 14.5760, lng: 121.0250 },
      "Pio Del Pilar": { lat: 14.5488, lng: 121.0232 },
    },
  },
};

export function getCities() {
  return Object.keys(LOCATIONS);
}

export function getBarangaysForCity(city: string) {
  const entry = LOCATIONS[city];
  if (!entry) return [];
  return Object.keys(entry.barangays);
}

export function getBarangayCentroid(city: string, barangay?: string) {
  const entry = LOCATIONS[city];
  if (!entry) return null;
  if (barangay) {
    const coords = entry.barangays[barangay];
    if (coords) return coords;
  }
  return entry.centroid;
}
