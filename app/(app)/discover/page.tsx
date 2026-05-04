"use client";

import { useState } from "react";
import { BusinessList } from "@/components/features/business-list";
import { DiscoverSearch } from "@/components/features/discover-search";
import { SectionCard } from "@/components/ui/section-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Business } from "@/lib/types/business";
import { mockBusinesses } from "@/lib/mocks/businesses";

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async (
    searchQuery: string,
    category: string,
    location: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      let query = supabase.from("businesses").select("*");

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

      if (data && data.length > 0) {
        const formattedBusinesses: Business[] = data.map((row) => {
          const category = row.category as Business["category"];
          return {
            id: row.id,
            name: row.name,
            location: row.location,
            category,
            isDtiRegistered: row.is_dti_registered,
            isBarterFriendly: row.is_barter_friendly,
            hasUrgentNeed: row.has_urgent_need,
            shortDescription: row.short_description,
          };
        });
        setBusinesses(formattedBusinesses);
      } else {
        setBusinesses([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch businesses";
      setError(message);
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Discover Businesses</h1>

      <SectionCard title="Search And Filters" description="Find businesses by location, category, and practical needs.">
        <DiscoverSearch onFilter={fetchBusinesses} isLoading={isLoading} />
      </SectionCard>

      <SectionCard title="Business Matches" description="Template list for connect-ready business profiles.">
        {error && (
          <div className="rounded-chip border-border-subtle bg-surface-muted border p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-chip border-border-subtle bg-surface-muted border p-3 text-sm text-text-muted">
            Loading businesses...
          </div>
        )}

        {!isLoading && businesses.length === 0 && !error && (
          <div className="rounded-chip border-border-subtle bg-surface-muted border p-3 text-sm text-text-muted">
            No businesses found. Try adjusting your search filters.
          </div>
        )}

        {!isLoading && businesses.length > 0 && <BusinessList businesses={businesses} />}
      </SectionCard>
    </div>
  );
}