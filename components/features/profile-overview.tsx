"use client";

import Image from "next/image";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";
import type { Profile } from "@/lib/types/profile";

type ProfileOverviewProps = {
  profile?: Profile | null;
  onDisconnect?: (ownerId: string) => void | Promise<void>;
  disconnectingOwnerId?: string | null;
};

export function ProfileOverview({
  profile,
  onDisconnect,
  disconnectingOwnerId,
}: ProfileOverviewProps) {
  const { locale } = useLocale();
  const copy = translations[locale].profile;

  if (!profile) {
    return (
      <div className="rounded-panel border-border-subtle bg-surface border p-6">
        <h2 className="text-foreground text-lg font-semibold">{copy.profile}</h2>
        <p className="text-text-muted mt-3 text-sm">{copy.noProfileData}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-panel border-border-subtle bg-surface border p-6 shadow-sm shadow-surface-muted/50">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-surface-muted text-3xl font-semibold text-brand sm:h-32 sm:w-32">
            {profile.profileImageUrl ? (
              <Image
                src={profile.profileImageUrl}
                alt={profile.ownerName}
                fill
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-semibold">
                {profile.ownerName
                  .split(" ")
                  .map((part) => part.slice(0, 1).toUpperCase())
                  .join("")}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-text-muted">{copy.yourBusinessProfile}</p>
            <h2 className="text-2xl font-semibold text-foreground">{profile.businessName}</h2>
            <p className="text-sm text-text-muted">{copy.ownedBy} {profile.ownerName}</p>
            <p className="text-sm text-text-muted">{profile.location}</p>
            <div className="flex flex-wrap gap-2 pt-3">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                {copy.trustScoreLabel} {profile.trustScore}
              </span>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-foreground">
                {profile.connections} {copy.connections}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-panel border-border-subtle bg-surface border p-6">
          <h3 className="text-lg font-semibold text-foreground">{copy.inventorySnapshot}</h3>
          {profile.inventory.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">{copy.noInventoryItems}</p>
          ) : (
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {profile.inventory.map((item) => (
                <li key={item.id} className="rounded-panel border-border-subtle bg-surface-muted border p-4">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <p className="mt-1 text-sm text-text-muted">{item.quantity}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-panel border-border-subtle bg-surface border p-6">
          <h3 className="text-lg font-semibold text-foreground">{copy.trustAndNetwork}</h3>
          <p className="mt-3 text-sm text-text-muted">{copy.trustScoreHelp}</p>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(profile.trustScore, 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-text-muted">
              <span>{copy.trustScore}</span>
              <span>{profile.trustScore}%</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="rounded-panel border-border-subtle bg-surface-muted border p-4">
              <p className="text-sm font-medium text-foreground">{copy.connectedBusinesses}</p>
              <p className="mt-1 text-sm text-text-muted">{profile.connectedBusinesses.length} {copy.trustedPartners}</p>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-panel border-border-subtle bg-surface border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{copy.connectedBusinessesTitle}</h3>
            <p className="mt-1 text-sm text-text-muted">{copy.managePartners}</p>
          </div>
        </div>

        {profile.connectedBusinesses.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">{copy.noConnectedBusinesses}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {profile.connectedBusinesses.map((connectedBusiness) => (
              <li key={connectedBusiness.id} className="rounded-panel border-border-subtle bg-surface-muted border p-4">
                <p className="font-semibold text-foreground">{connectedBusiness.businessName}</p>
                <p className="mt-1 text-sm text-text-muted">{copy.owner}: {connectedBusiness.ownerName}</p>
                <p className="text-sm text-text-muted">{connectedBusiness.location}</p>
                <button
                  type="button"
                  className="mt-4 inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={disconnectingOwnerId === connectedBusiness.ownerId}
                  onClick={() => {
                    if (!onDisconnect) return;
                    void onDisconnect(connectedBusiness.ownerId);
                  }}
                >
                  {disconnectingOwnerId === connectedBusiness.ownerId ? copy.disconnecting : copy.disconnect}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
