"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";
import type { Business } from "@/lib/types/business";
import type { BusinessConnectionState } from "@/lib/types/connection";

type ConnectionsCopy = {
  connect: string;
  requestSent: string;
  respondInInbox: string;
  connected: string;
};

type BusinessListProps = {
  businesses: Business[];
  connectionStates?: Record<string, BusinessConnectionState>;
  connectLoadingBusinessId?: string | null;
  onConnect?: (business: Business, connectionState: BusinessConnectionState) => void | Promise<void>;
};

function resolveConnectLabel(connectionState: BusinessConnectionState | undefined, copy: ConnectionsCopy) {
  if (connectionState === "pending-outgoing") {
    return copy.requestSent;
  }

  if (connectionState === "pending-incoming") {
    return copy.respondInInbox;
  }

  if (connectionState === "connected") {
    return copy.connected;
  }

  return copy.connect;
}

export function BusinessList({
  businesses,
  connectionStates,
  connectLoadingBusinessId,
  onConnect,
}: BusinessListProps) {
  const { locale } = useLocale();
  const copy = translations[locale].connections;
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
                    {copy.noBusinessPhoto}
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
                      {copy.dtiRegistered}
                    </span>
                  )}
                  {business.isBarterFriendly && (
                    <span className="rounded-full border border-foreground/10 bg-surface-muted px-2 py-0.5">
                      {copy.barterFriendly}
                    </span>
                  )}
                  {business.hasUrgentNeed && (
                    <span className="rounded-full border border-accent-urgent/20 bg-accent-urgent/10 px-2 py-0.5 text-accent-urgent">
                      {copy.urgentNeed}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-text-muted">{business.shortDescription}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/business/${business.id}`}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  {copy.viewProfile}
                </Link>
                {connectionStates?.[business.id] === "pending-incoming" ? (
                  <Link
                    href="/inbox"
                    className="btn-secondary text-xs px-3 py-1.5"
                  >
                    {copy.respondInInbox}
                  </Link>
                ) : (
                  <button
                    className="btn-secondary text-xs px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1.5"
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
                    {connectLoadingBusinessId === business.id ? (
                      <Spinner size="sm" color="muted" ariaLabel={copy.processingRequest} />
                    ) : isConfirmingDisconnect ? (
                      copy.confirmDisconnect
                    ) : (
                      resolveConnectLabel(connectionState, copy)
                    )}
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
