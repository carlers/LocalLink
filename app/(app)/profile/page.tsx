"use client";

import { useEffect, useState } from "react";
import { ProfileOverview } from "@/components/features/profile-overview";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ConnectedBusiness, Profile } from "@/lib/types/profile";

type ProfileRow = {
  id: string;
  owner_name: string;
  business_name: string;
  location: string;
  trust_score: number;
  connections: number;
};

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
};

type BusinessOwnerRow = {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
};

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingOwnerId, setDisconnectingOwnerId] = useState<string | null>(null);

  const loadProfile = async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setProfileData(null);
      return;
    }

    const currentUserId = userData.user.id;
    const { data: profileRowData } = await supabase
      .from("profiles")
      .select("id, owner_name, business_name, location, trust_score, connections")
      .eq("id", currentUserId)
      .maybeSingle();

    const profileRow = profileRowData as ProfileRow | null;
    const metadata = userData.user.user_metadata as {
      full_name?: string;
      business_name?: string;
      location?: string;
    } | null;

    const { data: connectionsData, error: connectionsError } = await supabase
      .from("connection_requests")
      .select("id, requester_id, receiver_id, status")
      .eq("status", "accepted")
      .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

    if (connectionsError) {
      setError(connectionsError.message);
    }

    const connectionRows = (connectionsData ?? []) as ConnectionRequestRow[];
    const connectedOwnerIds = Array.from(
      new Set(
        connectionRows.map((row) =>
          row.requester_id === currentUserId ? row.receiver_id : row.requester_id,
        ),
      ),
    );

    let connectedBusinesses: ConnectedBusiness[] = [];
    if (connectedOwnerIds.length > 0) {
      const [{ data: connectedProfilesData }, { data: connectedBusinessesData }] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, owner_name, business_name, location")
          .in("id", connectedOwnerIds),
        supabase
          .from("businesses")
          .select("id, owner_id, name, location")
          .in("owner_id", connectedOwnerIds)
          .order("created_at", { ascending: false }),
      ]);

      const profilesById = new Map(
        (connectedProfilesData ?? []).map((row) => [row.id, row]),
      );
      const businessByOwnerId = new Map<string, BusinessOwnerRow>();

      for (const businessRow of (connectedBusinessesData ?? []) as BusinessOwnerRow[]) {
        if (businessRow.owner_id && !businessByOwnerId.has(businessRow.owner_id)) {
          businessByOwnerId.set(businessRow.owner_id, businessRow);
        }
      }

      connectedBusinesses = connectedOwnerIds.map((ownerId) => {
        const profile = profilesById.get(ownerId);
        const business = businessByOwnerId.get(ownerId);

        return {
          id: business?.id ?? ownerId,
          ownerId,
          ownerName: profile?.owner_name ?? "Business owner",
          businessName: business?.name ?? profile?.business_name ?? "Local business",
          location: business?.location ?? profile?.location ?? "Unknown area",
        };
      });
    }

    setProfileData({
      id: currentUserId,
      ownerName: profileRow?.owner_name ?? metadata?.full_name ?? userData.user.email ?? "",
      businessName: profileRow?.business_name ?? metadata?.business_name ?? "",
      location: profileRow?.location ?? metadata?.location ?? "",
      trustScore: profileRow?.trust_score ?? 0,
      connections: connectionRows.length,
      inventory: [],
      connectedBusinesses,
    });
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadProfile();
    });
  }, []);

  const disconnectBusiness = async (ownerId: string) => {
    setDisconnectingOwnerId(ownerId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setProfileData(null);
        return;
      }

      const currentUserId = userData.user.id;
      const { error: deleteError } = await supabase
        .from("connection_requests")
        .delete()
        .eq("status", "accepted")
        .or(
          [
            `and(requester_id.eq.${currentUserId},receiver_id.eq.${ownerId})`,
            `and(requester_id.eq.${ownerId},receiver_id.eq.${currentUserId})`,
          ].join(","),
        );

      if (deleteError) {
        throw deleteError;
      }

      await loadProfile();
    } catch (disconnectError) {
      setError(disconnectError instanceof Error ? disconnectError.message : "Failed to disconnect business.");
    } finally {
      setDisconnectingOwnerId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Profile</h1>
      <p className="text-text-muted text-sm">Business identity, trust indicators, and inventory placeholders.</p>
      {error ? (
        <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
          {error}
        </div>
      ) : null}
      <ProfileOverview
        profile={profileData}
        onDisconnect={disconnectBusiness}
        disconnectingOwnerId={disconnectingOwnerId}
      />
    </div>
  );
}