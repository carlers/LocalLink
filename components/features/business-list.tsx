import type { Business } from "@/lib/types/business";

type BusinessListProps = {
  businesses: Business[];
};

export function BusinessList({ businesses }: BusinessListProps) {
  return (
    <ul className="grid gap-3">
      {businesses.map((business) => (
        <li key={business.id} className="rounded-chip border-border-subtle bg-surface-muted border p-3">
          <p className="text-foreground font-medium">{business.name}</p>
          <p className="text-text-muted text-sm">{business.location} • {business.category}</p>
          <p className="text-text-muted mt-1 text-sm">{business.shortDescription}</p>
        </li>
      ))}
    </ul>
  );
}
