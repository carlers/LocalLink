"use client";

import { useCallback, useEffect, useState } from "react";
import { InboxColumns } from "@/components/features/inbox-columns";
import type { Message, Notification } from "@/lib/types/message";
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

type NotificationRow = {
  id: string;
  title: string;
  detail: string;
  created_at: string;
  is_read: boolean;
};

type ConversationRow = {
  id: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_name: string;
  preview: string;
  sent_at: string;
  is_unread: boolean;
};

type PendingRequest = {
  id: string;
  requesterId: string;
  businessId: string | null;
  ownerName: string;
  businessName: string;
  location: string;
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function InboxPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [actionLoadingRequestId, setActionLoadingRequestId] = useState<string | null>(null);
  const [notificationActionLoadingId, setNotificationActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInboxData = useCallback(async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      setPendingRequests([]);
      setNotifications([]);
      setMessages([]);
      return;
    }

    const userId = authData.user.id;

    const [requestResult, notificationResult, conversationResult] = await Promise.all([
      supabase
        .from("connection_requests")
        .select("id, requester_id, receiver_id, status")
        .eq("receiver_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("id, title, detail, created_at, is_read")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id")
        .eq("profile_id", userId)
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    const { data, error: requestError } = requestResult;

    if (requestError) {
      setError(requestError.message);
      setPendingRequests([]);
      setNotifications([]);
      setMessages([]);
      return;
    }

    if (notificationResult.error) {
      setError(notificationResult.error.message);
      setPendingRequests([]);
      setNotifications([]);
      setMessages([]);
      return;
    }

    if (conversationResult.error) {
      setError(conversationResult.error.message);
      setPendingRequests([]);
      setNotifications([]);
      setMessages([]);
      return;
    }

    const rows = (data ?? []) as ConnectionRequestRow[];
    const requesterIds = Array.from(new Set(rows.map((row) => row.requester_id)));

    let profilesById = new Map<string, ProfileRow>();
    let businessesByOwnerId = new Map<string, BusinessRow>();

    if (requesterIds.length > 0) {
      const [businessesResult, profilesResult] = await Promise.all([
        supabase
          .from("businesses")
          .select("id, owner_id, name, location")
          .in("owner_id", requesterIds)
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, owner_name, business_name, location").in("id", requesterIds),
      ]);

      if (businessesResult.error) {
        setError(businessesResult.error.message);
        setPendingRequests([]);
        setNotifications([]);
        setMessages([]);
        return;
      }

      if (profilesResult.error) {
        setError(profilesResult.error.message);
        setPendingRequests([]);
        setNotifications([]);
        setMessages([]);
        return;
      }

      profilesById = new Map<string, ProfileRow>(
        ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
      );
      businessesByOwnerId = new Map<string, BusinessRow>();

      for (const business of (businessesResult.data ?? []) as BusinessRow[]) {
        if (business.owner_id && !businessesByOwnerId.has(business.owner_id)) {
          businessesByOwnerId.set(business.owner_id, business);
        }
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

    setNotifications(
      ((notificationResult.data ?? []) as NotificationRow[]).map((notification) => ({
        id: notification.id,
        title: notification.title,
        detail: notification.detail,
        createdAt: formatTimestamp(notification.created_at),
        isRead: notification.is_read,
      })),
    );

    const conversationIds = ((conversationResult.data ?? []) as ConversationRow[]).map((conversation) => conversation.id);
    if (conversationIds.length === 0) {
      setMessages([]);
      return;
    }

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("id, conversation_id, sender_name, preview, sent_at, is_unread")
      .in("conversation_id", conversationIds)
      .order("sent_at", { ascending: false })
      .limit(10);

    if (messagesError) {
      setError(messagesError.message);
      setMessages([]);
      return;
    }

    setMessages(
      ((messagesData ?? []) as MessageRow[]).map((message) => ({
        id: message.id,
        conversationId: message.conversation_id,
        senderName: message.sender_name,
        preview: message.preview,
        sentAt: formatTimestamp(message.sent_at),
        isUnread: message.is_unread,
      })),
    );
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadInboxData();
    });
  }, [loadInboxData]);

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

      await loadInboxData();
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

      await loadInboxData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to decline request.");
    } finally {
      setActionLoadingRequestId(null);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    setNotificationActionLoadingId(notificationId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user?.id) {
        throw new Error("Please sign in to update notifications.");
      }

      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("profile_id", authData.user.id);

      if (updateError) {
        throw updateError;
      }

      await loadInboxData();
    } catch (notificationError) {
      setError(notificationError instanceof Error ? notificationError.message : "Failed to update notification.");
    } finally {
      setNotificationActionLoadingId(null);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    setNotificationActionLoadingId(notificationId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user?.id) {
        throw new Error("Please sign in to dismiss notifications.");
      }

      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("profile_id", authData.user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadInboxData();
    } catch (notificationError) {
      setError(notificationError instanceof Error ? notificationError.message : "Failed to dismiss notification.");
    } finally {
      setNotificationActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">Inbox</h1>
      <p className="text-text-muted text-sm">
        Connection requests, notifications, and recent messages are backed by Supabase.
      </p>
      {error ? (
        <div className="rounded-panel border-border-subtle bg-status-error-bg border border-status-error-fg p-4 text-sm text-status-error-fg">
          {error}
        </div>
      ) : null}
      <InboxColumns
        notifications={notifications}
        messages={messages}
        connectionRequests={pendingRequests}
        onMarkNotificationRead={markNotificationRead}
        onDismissNotification={dismissNotification}
        onAcceptRequest={acceptRequest}
        onRejectRequest={rejectRequest}
        actionLoadingRequestId={actionLoadingRequestId}
        notificationActionLoadingId={notificationActionLoadingId}
      />
    </div>
  );
}