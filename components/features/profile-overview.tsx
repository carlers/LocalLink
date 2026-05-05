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
  if (!profile) {
    return (
      <div className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Profile</h2>
        <p className="text-text-muted mt-2 text-sm">No profile data available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Business Identity</h2>
        <p className="text-text-muted mt-2 text-sm">Owner: {profile.ownerName}</p>
        <p className="text-text-muted text-sm">Business: {profile.businessName}</p>
        <p className="text-text-muted text-sm">Location: {profile.location}</p>
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Trust And Network</h2>
        <p className="text-text-muted mt-2 text-sm">Trust score: {profile.trustScore}</p>
        <p className="text-text-muted text-sm">Connections: {profile.connections}</p>
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4 md:col-span-2">
        <h2 className="text-foreground text-lg font-semibold">Inventory Snapshot</h2>
        {profile.inventory.length === 0 ? (
          <p className="text-text-muted mt-3 text-sm">No inventory items yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {profile.inventory.map((item) => (
              <li key={item.id} className="rounded-chip bg-surface-muted p-3 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-text-muted">{item.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4 md:col-span-2">
        <h2 className="text-foreground text-lg font-semibold">Connected Businesses</h2>
        {profile.connectedBusinesses.length === 0 ? (
          <p className="text-text-muted mt-3 text-sm">No connected businesses yet.</p>
        ) : (
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {profile.connectedBusinesses.map((connectedBusiness) => (
              <li key={connectedBusiness.id} className="rounded-chip bg-surface-muted p-3 text-sm">
                <p className="font-medium">{connectedBusiness.businessName}</p>
                <p className="text-text-muted">Owner: {connectedBusiness.ownerName}</p>
                <p className="text-text-muted">Location: {connectedBusiness.location}</p>
                <button
                  type="button"
                  className="mt-3 rounded-full border border-border-subtle bg-surface px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={disconnectingOwnerId === connectedBusiness.ownerId}
                  onClick={() => {
                    if (!onDisconnect) {
                      return;
                    }

                    void onDisconnect(connectedBusiness.ownerId);
                  }}
                >
                  {disconnectingOwnerId === connectedBusiness.ownerId ? "Disconnecting..." : "Disconnect"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
