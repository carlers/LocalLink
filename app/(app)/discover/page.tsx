"use client";

import { useEffect, useState } from "react";
import { BusinessList } from "@/components/features/business-list";
import { DiscoverSearch } from "@/components/features/discover-search";
import { SectionCard } from "@/components/ui/section-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Business } from "@/lib/types/business";

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState("Search businesses by name, category, or location.");

  const fetchBusinesses = async (
    searchQuery: string,
    category: string,
    location: string
  ) => {
    setIsLoading(true);
    setError(null);
    setResultSummary("Searching businesses...");

    try {
      const supabase = createSupabaseBrowserClient();

      let query = supabase
        .from("businesses")
        .select(
          "id, name, location, category, is_dti_registered, is_barter_friendly, has_urgent_need, short_description",
        )
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (location) {
        query = query.ilike("location", `%${location}%`);
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw dbError;
      }

      const formattedBusinesses: Business[] = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        location: row.location,
        category: row.category as Business["category"],
        isDtiRegistered: row.is_dti_registered,
        isBarterFriendly: row.is_barter_friendly,
        hasUrgentNeed: row.has_urgent_need,
        shortDescription: row.short_description,
      }));

      setBusinesses(formattedBusinesses);
      setResultSummary(
        formattedBusinesses.length > 0
          ? `${formattedBusinesses.length} result${formattedBusinesses.length === 1 ? "" : "s"} found`
          : "No businesses found for these filters.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch businesses.";
      setError(message);
      setBusinesses([]);
      setResultSummary("Unable to load businesses right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadBusinesses = async () => {
      await fetchBusinesses("", "", "");
    };

    void loadBusinesses();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Discover Businesses</h1>

      <SectionCard title="Search And Filters" description="Find businesses by location, category, and practical needs.">
        <DiscoverSearch onFilter={fetchBusinesses} isLoading={isLoading} />
      </SectionCard>

      <SectionCard title="Business Matches" description="Matched business profiles from your search criteria.">
        {error && (
          <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
            Loading businesses...
          </div>
        )}

        {!isLoading && businesses.length === 0 && !error && (
          <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
            No businesses are available right now. Try broadening your search or check back later.
          </div>
        )}

        {!isLoading && businesses.length > 0 && <BusinessList businesses={businesses} />}
      </SectionCard>
    </div>
  );
}