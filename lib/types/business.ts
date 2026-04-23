export type BusinessCategory =
  | "Retail"
  | "Food"
  | "Services"
  | "Manufacturing"
  | "Other";

export type Business = {
  id: string;
  name: string;
  location: string;
  category: BusinessCategory;
  isDtiRegistered: boolean;
  isBarterFriendly: boolean;
  hasUrgentNeed: boolean;
  shortDescription: string;
};
