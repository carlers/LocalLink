import { BusinessList } from "@/components/features/business-list";
import { SectionCard } from "@/components/ui/section-card";
import { mockBusinesses } from "@/lib/mocks/businesses";

export default function DiscoverPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Discover Businesses</h1>

      <SectionCard title="Search And Filters" description="Find businesses by location, category, and practical needs.">
        <div className="grid gap-3 md:grid-cols-2">
          <p className="text-text-muted rounded-chip bg-surface-muted p-3 text-sm">Search input placeholder</p>
          <p className="text-text-muted rounded-chip bg-surface-muted p-3 text-sm">Filter controls placeholder</p>
        </div>
      </SectionCard>

      <SectionCard title="Business Matches" description="Template list for connect-ready business profiles.">
        <BusinessList businesses={mockBusinesses} />
      </SectionCard>
    </div>
  );
}