export type InventoryItem = {
  id: string;
  name: string;
  quantity: string;
  kind: "available" | "needed";
};

export type ConnectedBusiness = {
  id: string;
  ownerId: string;
  ownerName: string;
  businessName: string;
  location: string;
};

export type Profile = {
  id: string;
  ownerName: string;
  businessName: string;
  location: string;
  trustScore: number;
  connections: number;
  inventory: InventoryItem[];
  connectedBusinesses: ConnectedBusiness[];
};
