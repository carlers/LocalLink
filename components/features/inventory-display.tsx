import type { InventoryItem } from "@/lib/types/profile";
import { translations } from "@/lib/i18n/translations";

type InventoryDisplayCopy = {
  empty: string;
  availableForTrade: string;
  noAvailableItems: string;
  lookingFor: string;
  noNeededItems: string;
};

type InventoryDisplayProps = {
  items: InventoryItem[];
  copy?: InventoryDisplayCopy;
};

const defaultCopy = translations.en.inventoryDisplay;

export function InventoryDisplay({ items, copy = defaultCopy }: InventoryDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
        {copy.empty}
      </div>
    );
  }

  const availableItems = items.filter((item) => item.kind === "available");
  const neededItems = items.filter((item) => item.kind === "needed");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-panel border-border-subtle bg-surface-muted border p-4">
        <h4 className="text-sm font-semibold text-foreground">{copy.availableForTrade}</h4>
        {availableItems.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">{copy.noAvailableItems}</p>
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
        <h4 className="text-sm font-semibold text-foreground">{copy.lookingFor}</h4>
        {neededItems.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">{copy.noNeededItems}</p>
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
