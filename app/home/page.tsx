import { SectionCard } from "@/components/ui/section-card";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Welcome back, your business hub is ready.</h1>

      <SectionCard title="Quick Actions" description="Start fast actions for your daily operations.">
        <ul className="text-text-muted list-inside list-disc text-sm">
          <li>Post a Need (placeholder)</li>
          <li>Post an Offer (placeholder)</li>
        </ul>
      </SectionCard>

      <SectionCard title="Trusted Partners" description="Your trusted business connections appear here.">
        <p className="text-text-muted text-sm">Partner list placeholder for upcoming data integration.</p>
      </SectionCard>

      <SectionCard title="Nearby Opportunities" description="Relevant opportunities near your area.">
        <p className="text-text-muted text-sm">Nearby businesses and opportunities placeholder.</p>
      </SectionCard>
    </div>
  );
}
