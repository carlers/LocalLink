"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import type { Business } from "@/lib/types/business";
import type { BusinessConnectionState } from "@/lib/types/connection";

type BusinessListProps = {
  businesses: Business[];
  connectionStates?: Record<string, BusinessConnectionState>;
  connectLoadingBusinessId?: string | null;
  onConnect?: (business: Business, connectionState: BusinessConnectionState) => void | Promise<void>;
};

function resolveConnectLabel(connectionState: BusinessConnectionState | undefined) {
  if (connectionState === "pending-outgoing") {
    return "Request sent";
  }

  if (connectionState === "pending-incoming") {
    return "Respond in inbox";
  }

  if (connectionState === "connected") {
    return "Connected";
  }

  return "Connect";
}

export function BusinessList({
  businesses,
  connectionStates,
  connectLoadingBusinessId,
  onConnect,
}: BusinessListProps) {
  const [confirmDisconnectBusinessId, setConfirmDisconnectBusinessId] = useState<string | null>(null);

  const formatLocation = (business: Business) =>
    business.city && business.barangay ? `${business.barangay}, ${business.city}` : business.location;

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {businesses.map((business) => {
        const connectionState = connectionStates?.[business.id] ?? "none";
        const isConfirmingDisconnect =
          connectionState === "connected" && confirmDisconnectBusinessId === business.id;

        return (
          <li key={business.id} className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm shadow-black/10">
            <div className="relative aspect-[7/4] w-full overflow-hidden bg-surface-muted">
              {business.imageUrl ? (
                <Image
                  src={business.imageUrl}
                  alt={business.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-end bg-gradient-to-br from-brand/20 via-surface-muted to-surface-muted p-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                    No business photo yet
                  </span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-base font-semibold text-foreground">{business.name}</p>
                  <p className="mt-1 text-xs text-text-muted">
                    {formatLocation(business)} • {business.category}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                  {business.isDtiRegistered && (
                    <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 text-brand">
                      DTI Registered
                    </span>
                  )}
                  {business.isBarterFriendly && (
                    <span className="rounded-full border border-foreground/10 bg-surface-muted px-2 py-0.5">
                      Barter Friendly
                    </span>
                  )}
                  {business.hasUrgentNeed && (
                    <span className="rounded-full border border-accent-urgent/20 bg-accent-urgent/10 px-2 py-0.5 text-accent-urgent">
                      Urgent Need
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-text-muted">{business.shortDescription}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/business/${business.id}`}
                  className="rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand/90"
                >
                  View profile
                </Link>
                {connectionStates?.[business.id] === "pending-incoming" ? (
                  <Link
                    href="/inbox"
                    className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-surface"
                  >
                    Respond in inbox
                  </Link>
                ) : (
                  <button
                    className="rounded-xl border border-border-subtle bg-surface-muted px-4 py-2 text-xs font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
                    type="button"
                    disabled={!business.ownerId || connectLoadingBusinessId === business.id}
                    onClick={() => {
                      if (!onConnect) return;
                      if (connectionState === "connected" && !isConfirmingDisconnect) {
                        setConfirmDisconnectBusinessId(business.id);
                        return;
                      }
                      setConfirmDisconnectBusinessId(null);
                      void onConnect(business, connectionState);
                    }}
                  >
                    {connectLoadingBusinessId === business.id
                      ? connectionState === "pending-outgoing"
                        ? "Cancelling..."
                        : connectionState === "connected"
                          ? "Disconnecting..."
                          : "Sending..."
                      : isConfirmingDisconnect
                        ? "Confirm disconnect"
                        : resolveConnectLabel(connectionState)}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
