"use client";

import { useEffect, useState } from "react";
import { InboxColumns } from "@/components/features/inbox-columns";
import { mockMessages, mockNotifications } from "@/lib/mocks/messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
};

type ProfileRow = {
  id: string;
  owner_name: string;
  business_name: string;
  location: string;
};

type BusinessRow = {
  id: string;
  owner_id: string | null;
  name: string;
  location: string;
};

type PendingRequest = {
  id: string;
  requesterId: string;
  businessId: string | null;
  ownerName: string;
  businessName: string;
  location: string;
};

export default function InboxPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [actionLoadingRequestId, setActionLoadingRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPendingRequests = async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      setPendingRequests([]);
      return;
    }

    const { data, error: requestError } = await supabase
      .from("connection_requests")
      .select("id, requester_id, receiver_id, status")
      .eq("receiver_id", authData.user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (requestError) {
      setError(requestError.message);
      setPendingRequests([]);
      return;
    }

    const rows = (data ?? []) as ConnectionRequestRow[];
    if (rows.length === 0) {
      setPendingRequests([]);
      return;
    }

    const requesterIds = Array.from(new Set(rows.map((row) => row.requester_id)));
    const { data: businessesData, error: businessesError } = await supabase
      .from("businesses")
      .select("id, owner_id, name, location")
      .in("owner_id", requesterIds)
      .order("created_at", { ascending: false });

    if (businessesError) {
      setError(businessesError.message);
      setPendingRequests([]);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, owner_name, business_name, location")
      .in("id", requesterIds);

    if (profilesError) {
      setError(profilesError.message);
      setPendingRequests([]);
      return;
    }

    const profilesById = new Map<string, ProfileRow>(
      ((profilesData ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
    );
    const businessesByOwnerId = new Map<string, BusinessRow>();

    for (const business of (businessesData ?? []) as BusinessRow[]) {
      if (business.owner_id && !businessesByOwnerId.has(business.owner_id)) {
        businessesByOwnerId.set(business.owner_id, business);
      }
    }

    setPendingRequests(
      rows.map((row) => {
        const profile = profilesById.get(row.requester_id);
        const business = businessesByOwnerId.get(row.requester_id);

        return {
          id: row.id,
          requesterId: row.requester_id,
          businessId: business?.id ?? null,
          ownerName: profile?.owner_name ?? "Business owner",
          businessName: business?.name ?? profile?.business_name ?? "Local business",
          location: business?.location ?? profile?.location ?? "Unknown area",
        };
      }),
    );
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadPendingRequests();
    });
  }, []);

  const acceptRequest = async (requestId: string) => {
    setActionLoadingRequestId(requestId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase
        .from("connection_requests")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", requestId)
        .eq("status", "pending");

      if (updateError) {
        throw updateError;
      }

      await loadPendingRequests();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to accept request.");
    } finally {
      setActionLoadingRequestId(null);
    }
  };

  const rejectRequest = async (requestId: string) => {
    setActionLoadingRequestId(requestId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase
        .from("connection_requests")
        .delete()
        .eq("id", requestId)
        .eq("status", "pending");

      if (deleteError) {
        throw deleteError;
      }

      await loadPendingRequests();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to decline request.");
    } finally {
      setActionLoadingRequestId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Inbox</h1>
      <p className="text-text-muted text-sm">
        Notifications and messaging placeholders are ready for Supabase wiring.
      </p>
      {error ? (
        <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
          {error}
        </div>
      ) : null}
      <InboxColumns
        notifications={mockNotifications}
        messages={mockMessages}
        connectionRequests={pendingRequests}
        onAcceptRequest={acceptRequest}
        onRejectRequest={rejectRequest}
        actionLoadingRequestId={actionLoadingRequestId}
      />
    </div>
  );
}