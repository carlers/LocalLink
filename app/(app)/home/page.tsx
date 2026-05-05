"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { BusinessList } from "@/components/features/business-list";
import { SectionCard } from "@/components/ui/section-card";
import type { Business } from "@/lib/types/business";
import type { BusinessConnectionState } from "@/lib/types/connection";

type Partner = {
  name: string;
  type: string;
  logo: string;
};

type BusinessRow = {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
  category: string;
  is_dti_registered: boolean;
  is_barter_friendly: boolean;
  has_urgent_need: boolean;
  short_description: string;
};

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
};

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("Suggested businesses near your area.");
  const [businessName, setBusinessName] = useState("Your business");
  const [ownerName, setOwnerName] = useState("Business owner");
  const [businessLocation, setBusinessLocation] = useState("Your area");
  const [stats, setStats] = useState({ total: 0, urgent: 0, barter: 0 });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, BusinessConnectionState>>({});
  const [connectLoadingBusinessId, setConnectLoadingBusinessId] = useState<string | null>(null);

  const trustedPartners: Partner[] = [
    { name: "Aling Nena's Eatery", type: "Restaurant", logo: "🍳" },
    { name: "Mang Tomas Sari-Sari Store", type: "Retail", logo: "🏪" },
    { name: "Lola's Tailoring Shop", type: "Services", logo: "👗" },
  ];

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
    location = ""
  ) => {
    setIsLoading(true);
    setError(null);
    setSummary(location ? `Loading businesses near ${location}...` : "Loading businesses across the network...");

    try {
      const supabase = createSupabaseBrowserClient();
      let query = supabase
        .from("businesses")
        .select(
          "id, owner_id, name, location, category, is_dti_registered, is_barter_friendly, has_urgent_need, short_description"
        )
        .order("created_at", { ascending: false });

      let signedInUserId: string | null = null;

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

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const rows = (data ?? []) as BusinessRow[];
      const formattedBusinesses = rows.map((row) => ({
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        location: row.location,
        category: row.category as Business["category"],
        isDtiRegistered: row.is_dti_registered,
        isBarterFriendly: row.is_barter_friendly,
        hasUrgentNeed: row.has_urgent_need,
        shortDescription: row.short_description,
      }));

      setBusinesses(formattedBusinesses);
      if (signedInUserId) {
        await hydrateConnectionStates(signedInUserId, formattedBusinesses);
      } else {
        setConnectionStates({});
      }
      setStats({
        total: formattedBusinesses.length,
        urgent: formattedBusinesses.filter((business) => business.hasUrgentNeed).length,
        barter: formattedBusinesses.filter((business) => business.isBarterFriendly).length,
      });
      setSummary(
        formattedBusinesses.length > 0
          ? `${formattedBusinesses.length} match${formattedBusinesses.length === 1 ? "" : "es"} found${location ? ` near ${location}` : ""}`
          : location
            ? `No businesses found near ${location}.`
            : "No businesses available yet."
      );
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to load businesses.";
      setError(message);
      setBusinesses([]);
      setConnectionStates({});
      setSummary("Unable to load businesses right now.");
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
    const loadHome = async () => {
      let location = "";

      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          const metadata = data.user.user_metadata as {
            full_name?: string;
            business_name?: string;
            location?: string;
          } | null;

          setOwnerName(metadata?.full_name ?? data.user.email ?? "Business owner");
          setBusinessName(metadata?.business_name ?? "Your business");
          setBusinessLocation(metadata?.location ?? "Your area");
          location = metadata?.location ?? "";
        }
      } catch {
        // Keep defaults if user metadata is unavailable.
      }

      await fetchBusinesses(location);
    };

    void loadHome();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="rounded-panel border-border-subtle bg-surface border p-4 shadow-sm shadow-surface-muted/40 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.28em] text-brand">Home</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Welcome back, {ownerName}.</h1>
            <p className="mt-3 text-text-muted sm:text-base">
              Browse local suppliers, urgent needs, and barter-friendly partners near {businessLocation}.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[320px]">
            <div className="rounded-chip bg-surface-muted p-4 text-sm">
              <p className="text-text-muted">Matches</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <div className="rounded-chip bg-surface-muted p-4 text-sm">
              <p className="text-text-muted">Urgent needs</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stats.urgent}</p>
            </div>
            <div className="rounded-chip bg-surface-muted p-4 text-sm">
              <p className="text-text-muted">Barter friendly</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stats.barter}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[285px_1fr]">
        <aside className="space-y-6">
          <SectionCard title="Business summary">
            <div className="space-y-4">
              <div className="rounded-panel border-border-subtle bg-surface border p-4">
                <p className="text-sm text-text-muted">Business</p>
                <p className="mt-2 text-lg font-semibold text-foreground">{businessName}</p>
                <p className="mt-1 text-sm text-text-muted">{businessLocation}</p>
              </div>

              <div className="rounded-panel border-border-subtle bg-surface border p-4">
                <p className="text-sm text-text-muted">Quick actions</p>
                <div className="mt-3 grid gap-3">
                  <Link href="/discover" className="rounded-chip bg-brand px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-teal-700 sm:py-2">
                    Browse suppliers
                  </Link>
                  <Link href="/profile" className="rounded-chip border border-border-subtle bg-surface-muted px-4 py-3 text-sm font-medium text-foreground text-center transition hover:bg-surface sm:py-2">
                    View profile
                  </Link>
                  <Link href="/inbox" className="rounded-chip border border-border-subtle bg-surface-muted px-4 py-3 text-sm font-medium text-foreground text-center transition hover:bg-surface sm:py-2">
                    Check inbox
                  </Link>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Trusted partners" description="Local businesses already working with the network.">
            <div className="space-y-3">
              {trustedPartners.map((partner) => (
                <div key={partner.name} className="flex items-center gap-3 rounded-panel border-border-subtle bg-surface border p-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-xl">
                    {partner.logo}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{partner.name}</p>
                    <p className="text-sm text-text-muted">{partner.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </aside>

        <main className="space-y-6">
          <SectionCard title="Nearby matches" description={summary}>
            {error ? (
              <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
                {error}
              </div>
            ) : null}

            {isLoading ? (
              <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
                Loading businesses...
              </div>
            ) : null}

            {!isLoading && businesses.length === 0 && !error ? (
              <div className="rounded-panel border-border-subtle bg-surface-muted border p-4 text-sm text-text-muted">
                No businesses available yet. Try broadening your search or updating your filters.
              </div>
            ) : null}

            {!isLoading && businesses.length > 0 ? (
              <BusinessList
                businesses={businesses}
                connectionStates={connectionStates}
                connectLoadingBusinessId={connectLoadingBusinessId}
                onConnect={handleConnect}
              />
            ) : null}
          </SectionCard>
        </main>
      </div>
    </div>
  );
}

