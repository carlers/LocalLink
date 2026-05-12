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
  city?: string;
  barangay?: string;
};

export type Profile = {
  id: string;
  ownerName: string;
  businessName: string;
  location: string;
  city?: string;
  barangay?: string;
  trustScore: number;
  connections: number;
  inventory: InventoryItem[];
  connectedBusinesses: ConnectedBusiness[];
  profileImageUrl?: string | null;
};
