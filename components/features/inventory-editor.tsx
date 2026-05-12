import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import type { InventoryItem } from "@/lib/types/profile";

type InventoryEditorProps = {
  items: InventoryItem[];
  onItemsChange: (items: InventoryItem[]) => void;
  isLoading?: boolean;
};

export function InventoryEditor({ items, onItemsChange, isLoading = false }: InventoryEditorProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemKind, setNewItemKind] = useState<InventoryItem["kind"]>("available");

  const handleUpdateItem = (id: string, field: keyof InventoryItem, value: string) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemQuantity.trim()) {
      return;
    }

    const newItem: InventoryItem = {
      id: `temp-${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQuantity.trim(),
      kind: newItemKind,
    };

    onItemsChange([...items, newItem]);
    setNewItemName("");
    setNewItemQuantity("");
    setNewItemKind("available");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No inventory items yet. Add items to share your stock and needs.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-panel border-border-subtle bg-surface-muted border p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Item</label>
                      <input
                        type="text"
                        className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        value={item.name}
                        onChange={(event) => handleUpdateItem(item.id, "name", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Quantity / Notes</label>
                      <input
                        type="text"
                        className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        value={item.quantity}
                        onChange={(event) => handleUpdateItem(item.id, "quantity", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select
                        className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        value={item.kind}
                        onChange={(event) => handleUpdateItem(item.id, "kind", event.target.value)}
                      >
                        <option value="available">Available</option>
                        <option value="needed">Needed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="rounded-chip border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-panel border-border-subtle bg-surface border p-4">
        <p className="text-sm font-semibold text-foreground">Add inventory item</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Item</label>
            <input
              type="text"
              className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={newItemName}
              onChange={(event) => setNewItemName(event.target.value)}
              placeholder="Rice, milk, packaging"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Quantity / Notes</label>
            <input
              type="text"
              className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={newItemQuantity}
              onChange={(event) => setNewItemQuantity(event.target.value)}
              placeholder="5 sacks, 10 liters"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium">Type</label>
            <select
              className="rounded-chip border-border-subtle mt-1 w-full border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              value={newItemKind}
              onChange={(event) => setNewItemKind(event.target.value as InventoryItem["kind"])}
            >
              <option value="available">Available</option>
              <option value="needed">Needed</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading || !newItemName.trim() || !newItemQuantity.trim()}
          onClick={handleAddItem}
          className="mt-4 rounded-chip bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="white" ariaLabel="Adding item" />
            </>
          ) : (
            "Add item"
          )}
        </button>
      </div>
    </div>
  );
}
