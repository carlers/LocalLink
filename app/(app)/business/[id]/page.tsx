import Image from "next/image";
import Link from "next/link";
import { ConnectRequestButton } from "@/components/features/connect-request-button";
import { BusinessMap } from "@/components/features/business-map";
import { InventoryDisplay } from "@/components/features/inventory-display";
import { SectionCard } from "@/components/ui/section-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/types/business";
import type { InventoryItem } from "@/lib/types/profile";

type BusinessRow = {
  id: string;
  name: string;
  location: string;
  city: string | null;
  barangay: string | null;
  category: string;
  is_dti_registered: boolean;
  is_barter_friendly: boolean;
  has_urgent_need: boolean;
  short_description: string;
  owner_id: string | null;
  created_at: string;
  image_url: string | null;
};

type InventoryRow = {
  id: string;
  name: string;
  quantity: string;
  kind: "available" | "needed";
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BusinessProfilePage({ params }: PageProps) {
  const { id } = await params;
  let business: Business | null = null;
  let connectionCount = 0;
  let inventory: InventoryItem[] = [];

  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name, location, city, barangay, category, is_dti_registered, is_barter_friendly, has_urgent_need, short_description, owner_id, created_at, image_url")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        const row = data as BusinessRow;
        business = {
          id: row.id,
          ownerId: row.owner_id,
          name: row.name,
          location: row.location,
          city: row.city ?? undefined,
          barangay: row.barangay ?? undefined,
          category: row.category as Business["category"],
          isDtiRegistered: row.is_dti_registered,
          isBarterFriendly: row.is_barter_friendly,
          hasUrgentNeed: row.has_urgent_need,
          shortDescription: row.short_description,
          imageUrl: row.image_url,
        };

        if (row.owner_id) {
          const { count, error: countError } = await supabase
            .from("connection_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "accepted")
            .or(`requester_id.eq.${row.owner_id},receiver_id.eq.${row.owner_id}`);

          if (!countError) {
            connectionCount = count ?? 0;
          }

          const { data: inventoryData, error: inventoryError } = await supabase
            .from("inventory_items")
            .select("id, name, quantity, kind")
            .eq("profile_id", row.owner_id)
            .order("created_at", { ascending: false });

          if (!inventoryError && inventoryData) {
            inventory = inventoryData.map((item: InventoryRow) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              kind: item.kind,
            }));
          }
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch business:", error);
  }

  if (!business) {
    return (
      <div className="space-y-4">
        <Link href="/discover" className="text-brand hover:underline">
          ← Back to discover
        </Link>
        <div className="rounded-panel border-border-subtle bg-surface border p-6">
          <h1 className="text-2xl font-semibold">Business not found</h1>
          <p className="text-text-muted mt-2">The business you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/discover" className="text-brand hover:underline">
        ← Back to discover
      </Link>

      <section className="rounded-panel border-border-subtle bg-surface border p-6 shadow-sm shadow-surface-muted/40">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-muted">
            {business.imageUrl ? (
              <Image
                src={business.imageUrl}
                alt={business.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-end bg-gradient-to-br from-brand/20 via-surface-muted to-surface-muted p-5">
                <span className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                  No business photo yet
                </span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{business.name}</h1>
              <p className="text-text-muted mt-2 text-lg">
                {business.barangay && business.city ? `${business.barangay}, ${business.city}` : business.location} • {business.category}
              </p>
              <p className="text-text-muted mt-4 text-base leading-relaxed">{business.shortDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              <ConnectRequestButton receiverOwnerId={business.ownerId ?? null} />
              <button className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground transition hover:bg-surface" type="button">
                Message
              </button>
            </div>
          </div>
        </div>
      </section>

      <SectionCard
        title="Business Details"
        description="Credentials and trading preferences"
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-chip bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">DTI Registration</p>
            <p className="text-text-muted mt-1">
              {business.isDtiRegistered ? "✓ Registered" : "Not registered"}
            </p>
          </div>
          <div className="rounded-chip bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">Barter Friendly</p>
            <p className="text-text-muted mt-1">
              {business.isBarterFriendly ? "✓ Yes" : "No"}
            </p>
          </div>
          <div className="rounded-chip bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">Urgent Need</p>
            <p className="text-text-muted mt-1">
              {business.hasUrgentNeed ? "✓ Yes" : "No"}
            </p>
          </div>
          <div className="rounded-chip bg-surface-muted p-4 text-sm">
            <p className="font-semibold text-foreground">Connections</p>
            <p className="text-text-muted mt-1">{connectionCount}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Inventory Snapshot"
        description="What this business has available for trade and what it is looking for."
      >
        <InventoryDisplay items={inventory} />
      </SectionCard>

      <SectionCard
        title="About This Business"
        description="Category and location information"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-text-muted">CATEGORY</p>
            <p className="mt-1 text-foreground">{business.category}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-muted">LOCATION</p>
            <p className="mt-1 text-foreground">
              {business.barangay && business.city ? `${business.barangay}, ${business.city}` : business.location}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Business Map"
        description="Approximate pin for this business and its barangay context"
      >
        <BusinessMap businesses={[business]} centerLocation={business.city ?? business.location} />
      </SectionCard>
    </div>
  );
}
