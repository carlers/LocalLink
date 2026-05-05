import type { Profile } from "@/lib/types/profile";

export const mockProfile: Profile = {
  id: "profile-1",
  ownerName: "Maria Cruz",
  businessName: "Cruz Mini Mart",
  location: "Quezon City",
  trustScore: 89,
  connections: 14,
  connectedBusinesses: [
    {
      id: "profile-2",
      ownerId: "profile-2",
      ownerName: "Jose Reyes",
      businessName: "Reyes Grocery",
      location: "Makati",
    },
  ],
  inventory: [
    {
      id: "inv-1",
      name: "Rice sacks",
      quantity: "10 sacks",
      kind: "available",
    },
    {
      id: "inv-2",
      name: "Bottled oil",
      quantity: "Need 24 bottles",
      kind: "needed",
    },
  ],
};
