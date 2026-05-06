"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Business } from "@/lib/types/business";
import { geocodeLocation } from "@/lib/utils/geocoding";

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
