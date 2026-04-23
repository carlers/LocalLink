export type InventoryItem = {
  id: string;
  name: string;
  quantity: string;
  kind: "available" | "needed";
};

export type Profile = {
  id: string;
  ownerName: string;
  businessName: string;
  location: string;
  trustScore: number;
  connections: number;
  inventory: InventoryItem[];
};
