"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Business } from "@/lib/types/business";
import { geocodeLocation } from "@/lib/utils/geocoding";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
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
    return businesses.slice(0, 100); // Limit to 100 for performance
  }, [businesses]);

  return (
    <div className="h-96 w-full overflow-hidden rounded-panel border-border-subtle border shadow-sm">
      <MapContainer
        center={[centerCoords.lat, centerCoords.lng]}
        zoom={12}
        scrollWheelZoom={false}
        className="z-10 h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {displayBusinesses.map((business) => {
          const coords = geocodeLocation(business.location);
          return (
            <Marker key={business.id} position={[coords.lat, coords.lng]}>
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
                  <p className="text-sm text-text-muted">{business.location}</p>
                  <p className="text-sm text-text-muted">{business.category}</p>
                  <p className="line-clamp-3 text-sm text-text-muted">
                    {business.shortDescription}
                  </p>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-chip bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-teal-700"
                    onClick={() => {
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
    </div>
  );
}
