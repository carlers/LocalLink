"use client";

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

  return (
    <ul className="grid gap-4">
      {businesses.map((business) => {
        const connectionState = connectionStates?.[business.id] ?? "none";
        const isConfirmingDisconnect =
          connectionState === "connected" && confirmDisconnectBusinessId === business.id;

        return (
          <li key={business.id} className="rounded-panel border-border-subtle bg-surface border p-4 shadow-sm shadow-surface-muted/40 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{business.name}</p>
                <p className="mt-1 text-sm text-text-muted">
                  {business.location} • {business.category}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-text-muted">
                {business.isDtiRegistered ? (
                  <span className="rounded-full border border-brand/20 bg-brand/10 px-2 py-1 text-brand">
                    DTI Registered
                  </span>
                ) : null}
                {business.isBarterFriendly ? (
                  <span className="rounded-full border border-foreground/10 bg-surface-muted px-2 py-1">
                    Barter Friendly
                  </span>
                ) : null}
                {business.hasUrgentNeed ? (
                  <span className="rounded-full border border-accent-urgent/20 bg-accent-urgent/10 px-2 py-1 text-accent-urgent">
                    Urgent Need
                  </span>
                ) : null}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-text-muted">{business.shortDescription}</p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/business/${business.id}`} className="rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700" type="button">
                View profile
              </Link>
              {connectionStates?.[business.id] === "pending-incoming" ? (
                <Link
                  href="/inbox"
                  className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface"
                >
                  Respond in inbox
                </Link>
              ) : (
                <button
                  className="rounded-full border border-border-subtle bg-surface-muted px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={
                    !business.ownerId
                    || connectLoadingBusinessId === business.id
                  }
                  onClick={() => {
                    if (!onConnect) {
                      return;
                    }

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
          </li>
        );
      })}
    </ul>
  );
}
