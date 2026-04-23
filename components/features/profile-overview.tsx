import type { Profile } from "@/lib/types/profile";

type ProfileOverviewProps = {
  profile: Profile;
};

export function ProfileOverview({ profile }: ProfileOverviewProps) {
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
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {profile.inventory.map((item) => (
            <li key={item.id} className="rounded-chip bg-surface-muted p-3 text-sm">
              <p className="font-medium">{item.name}</p>
              <p className="text-text-muted">{item.quantity}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
