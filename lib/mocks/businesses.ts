import type { Business } from "@/lib/types/business";

export const mockBusinesses: Business[] = [
  {
    id: "biz-1",
    name: "San Miguel Sari-Sari",
    location: "Quezon City",
    category: "Retail",
    isDtiRegistered: true,
    isBarterFriendly: true,
    hasUrgentNeed: false,
    shortDescription: "Neighborhood store looking for wholesale snack suppliers.",
  },
  {
    id: "biz-2",
    name: "Bayanihan Bakers",
    location: "Marikina",
    category: "Food",
    isDtiRegistered: true,
    isBarterFriendly: false,
    hasUrgentNeed: true,
    shortDescription: "Bakery seeking packaging and logistics support this week.",
  },
];
