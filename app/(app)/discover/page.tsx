"use client";

import { useEffect, useState } from "react";
import { BusinessList } from "@/components/features/business-list";
import { DiscoverSearch } from "@/components/features/discover-search";
import { SectionCard } from "@/components/ui/section-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Business } from "@/lib/types/business";
import type { BusinessConnectionState } from "@/lib/types/connection";

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
};

export default function DiscoverPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState("Search businesses by name, category, or location.");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, BusinessConnectionState>>({});
  const [connectLoadingBusinessId, setConnectLoadingBusinessId] = useState<string | null>(null);

  const hydrateConnectionStates = async (
    userId: string,
    nextBusinesses: Business[],
  ) => {
    const ownerIds = Array.from(
      new Set(
        nextBusinesses
          .map((business) => business.ownerId)
          .filter((ownerId): ownerId is string => Boolean(ownerId)),
      ),
    );

    if (ownerIds.length === 0) {
      setConnectionStates({});
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { data, error: requestError } = await supabase
      .from("connection_requests")
      .select("id, requester_id, receiver_id, status")
      .or(
        [
          `and(requester_id.eq.${userId},receiver_id.in.(${ownerIds.join(",")}))`,
          `and(receiver_id.eq.${userId},requester_id.in.(${ownerIds.join(",")}))`,
        ].join(","),
      );

    if (requestError) {
      return;
    }

    const requests = (data ?? []) as ConnectionRequestRow[];
    const nextStates: Record<string, BusinessConnectionState> = {};

    for (const business of nextBusinesses) {
      const ownerId = business.ownerId;
      if (!ownerId) {
        nextStates[business.id] = "none";
        continue;
      }

      const pairRequests = requests.filter(
        (request) =>
          (request.requester_id === userId && request.receiver_id === ownerId)
          || (request.receiver_id === userId && request.requester_id === ownerId),
      );

      if (pairRequests.some((request) => request.status === "accepted")) {
        nextStates[business.id] = "connected";
      } else if (
        pairRequests.some(
          (request) => request.status === "pending" && request.requester_id === userId,
        )
      ) {
        nextStates[business.id] = "pending-outgoing";
      } else if (
        pairRequests.some(
          (request) => request.status === "pending" && request.receiver_id === userId,
        )
      ) {
        nextStates[business.id] = "pending-incoming";
      } else {
        nextStates[business.id] = "none";
      }
    }

    setConnectionStates(nextStates);
  };

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
          "id, owner_id, name, location, category, is_dti_registered, is_barter_friendly, has_urgent_need, short_description, image_url",
        )
        .order("created_at", { ascending: false });

      let signedInUserId: string | null = null;

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (category) {
        query = query.eq("category", category);
      }

      if (location) {
        query = query.ilike("location", `%${location}%`);
      }

      // Exclude the current user's own business from results
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          signedInUserId = authData.user.id;
          setCurrentUserId(authData.user.id);
          query = query.neq("owner_id", authData.user.id);
        }
      } catch {
        // ignore auth errors and return public results
      }

      const { data, error: dbError } = await query;

      if (dbError) {
        throw dbError;
      }

      const formattedBusinesses: Business[] = (data ?? []).map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        location: row.location,
        category: row.category as Business["category"],
        isDtiRegistered: row.is_dti_registered,
        isBarterFriendly: row.is_barter_friendly,
        hasUrgentNeed: row.has_urgent_need,
        shortDescription: row.short_description,
        imageUrl: row.image_url,
      }));

      setBusinesses(formattedBusinesses);
      if (signedInUserId) {
        await hydrateConnectionStates(signedInUserId, formattedBusinesses);
      } else {
        setConnectionStates({});
      }
      setResultSummary(
        formattedBusinesses.length > 0
          ? `${formattedBusinesses.length} result${formattedBusinesses.length === 1 ? "" : "s"} found`
          : "No businesses found for these filters.",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch businesses.";
      setError(message);
      setBusinesses([]);
      setConnectionStates({});
      setResultSummary("Unable to load businesses right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (
    business: Business,
    connectionState: BusinessConnectionState,
  ) => {
    if (!currentUserId || !business.ownerId) {
      return;
    }

    setConnectLoadingBusinessId(business.id);
    try {
      const supabase = createSupabaseBrowserClient();
      if (connectionState === "pending-outgoing") {
        const { error: deleteError } = await supabase
          .from("connection_requests")
          .delete()
          .eq("requester_id", currentUserId)
          .eq("receiver_id", business.ownerId)
          .eq("status", "pending");

        if (deleteError) {
          throw deleteError;
        }

        setConnectionStates((previousState) => ({
          ...previousState,
          [business.id]: "none",
        }));
      } else if (connectionState === "connected") {
        const { error: deleteError } = await supabase
          .from("connection_requests")
          .delete()
          .eq("status", "accepted")
          .or(
            [
              `and(requester_id.eq.${currentUserId},receiver_id.eq.${business.ownerId})`,
              `and(requester_id.eq.${business.ownerId},receiver_id.eq.${currentUserId})`,
            ].join(","),
          );

        if (deleteError) {
          throw deleteError;
        }

        setConnectionStates((previousState) => ({
          ...previousState,
          [business.id]: "none",
        }));
      } else {
        const { error: insertError } = await supabase
          .from("connection_requests")
          .insert({
            requester_id: currentUserId,
            receiver_id: business.ownerId,
            status: "pending",
          });

        if (insertError) {
          throw insertError;
        }

        setConnectionStates((previousState) => ({
          ...previousState,
          [business.id]: "pending-outgoing",
        }));
      }
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : connectionState === "pending-outgoing"
          ? "Failed to cancel connection request."
          : connectionState === "connected"
            ? "Failed to disconnect business."
            : "Failed to send connection request.";
      setError(message);
    } finally {
      setConnectLoadingBusinessId(null);
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

      <SectionCard title="Search And Filters" description={resultSummary}>
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

        {!isLoading && businesses.length > 0 && (
          <BusinessList
            businesses={businesses}
            connectionStates={connectionStates}
            connectLoadingBusinessId={connectLoadingBusinessId}
            onConnect={handleConnect}
          />
        )}
      </SectionCard>
    </div>
  );
}