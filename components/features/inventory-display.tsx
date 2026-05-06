import type { InventoryItem } from "@/lib/types/profile";

type InventoryDisplayProps = {
  items: InventoryItem[];
};

export function InventoryDisplay({ items }: InventoryDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
        No inventory items listed yet.
      </div>
    );
  }

  const availableItems = items.filter((item) => item.kind === "available");
  const neededItems = items.filter((item) => item.kind === "needed");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-panel border-border-subtle bg-surface-muted border p-4">
        <h4 className="text-sm font-semibold text-foreground">Available for trade</h4>
        {availableItems.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No available items listed.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {availableItems.map((item) => (
              <li key={item.id} className="rounded-panel border-border-subtle bg-surface border p-3">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-text-muted">{item.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-panel border-border-subtle bg-surface-muted border p-4">
        <h4 className="text-sm font-semibold text-foreground">Looking for</h4>
        {neededItems.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No needed items listed.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {neededItems.map((item) => (
              <li key={item.id} className="rounded-panel border-border-subtle bg-surface border p-3">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-text-muted">{item.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
