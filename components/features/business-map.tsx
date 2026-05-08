"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Business } from "@/lib/types/business";
import { geocodeLocation, geocodeCityBarangay } from "@/lib/utils/geocoding";

const MapContainerInner = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { MapContainer, TileLayer, Marker, Popup } = mod;

      return function DynamicMap({
        centerCoords,
        displayBusinesses,
        onBusinessSelect,
      }: {
        centerCoords: { lat: number; lng: number };
        displayBusinesses: Business[];
        onBusinessSelect?: (business: Business) => void;
      }) {
        const router = useRouter();
        const formatLocation = (business: Business) =>
          business.city && business.barangay ? `${business.barangay}, ${business.city}` : business.location;

        return (
          <MapContainer
            center={[centerCoords.lat, centerCoords.lng]}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            key={`map-${centerCoords.lat}-${centerCoords.lng}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {displayBusinesses.map((business) => {
              // Determine coords: prefer explicit lat/lng, then city+barangay centroid, then free-text location
              let coords = null as { lat: number; lng: number } | null;
              if (typeof business.latitude === "number" && typeof business.longitude === "number") {
                coords = { lat: business.latitude, lng: business.longitude };
              } else {
                const by = geocodeCityBarangay(business.city, business.barangay);
                if (by) coords = by;
                else coords = geocodeLocation(business.location || "");
              }

              // Apply small deterministic jitter for businesses sharing the same barangay/centroid
              function deterministicJitter(id: string, baseLat: number, baseLng: number) {
                // Simple hash from id
                let h = 0;
                for (let i = 0; i < id.length; i++) {
                  h = (h << 5) - h + id.charCodeAt(i);
                  h |= 0;
                }
                const angle = (Math.abs(h) % 360) * (Math.PI / 180);
                const minMeters = 8; // small offset
                const maxMeters = 35; // max offset
                const radiusMeters = minMeters + (Math.abs(h) % (maxMeters - minMeters + 1));

                const deltaLat = (radiusMeters * Math.cos(angle)) / 111320;
                const deltaLng = (radiusMeters * Math.sin(angle)) / (111320 * Math.cos((baseLat * Math.PI) / 180));
                return { lat: baseLat + deltaLat, lng: baseLng + deltaLng };
              }

              const finalCoords = deterministicJitter(business.id, coords.lat, coords.lng);

              return (
                <Marker key={business.id} position={[finalCoords.lat, finalCoords.lng]}>
                  <Popup maxWidth={300}>
                    <div className="space-y-2">
                      {business.imageUrl ? (
                        <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-surface-muted">
                          <Image
                            src={business.imageUrl}
                            alt={business.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <p className="font-semibold text-foreground">{business.name}</p>
                      <p className="text-sm text-text-muted">{formatLocation(business)}</p>
                      <p className="text-sm text-text-muted">{business.category}</p>
                      <p className="line-clamp-3 text-sm text-text-muted">
                        {business.shortDescription}
                      </p>
                      <button
                        type="button"
                        className="mt-2 w-full rounded-chip bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-teal-700"
                        onClick={() => {
                          router.push(`/business/${business.id}`);
                          if (onBusinessSelect) {
                            onBusinessSelect(business);
                          }
                        }}
                      >
                        View profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        );
      };
    }),
  { ssr: false, loading: () => <div className="bg-gray-200 h-full w-full" /> }
);

type BusinessMapProps = {
  businesses: Business[];
  centerLocation?: string;
  onBusinessSelect?: (business: Business) => void;
};

export function BusinessMap({
  businesses,
  centerLocation = "manila",
  onBusinessSelect,
}: BusinessMapProps) {
  const centerCoords = geocodeLocation(centerLocation);

  const displayBusinesses = useMemo(() => {
    return businesses.slice(0, 100);
  }, [businesses]);

  // Only render map on client side to avoid Leaflet SSR issues
  if (typeof window === "undefined") {
    return <div style={{ height: "500px", width: "100%", backgroundColor: "#e5e7eb" }} />;
  }

  return (
    <div style={{ height: "500px", width: "100%", position: "relative" }}>
      <MapContainerInner
        centerCoords={centerCoords}
        displayBusinesses={displayBusinesses}
        onBusinessSelect={onBusinessSelect}
      />
    </div>
  );
}
