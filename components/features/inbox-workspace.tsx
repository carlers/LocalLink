'use client';

import { useCallback, useEffect, useState } from 'react';
import { InboxColumns } from '@/components/features/inbox-columns';
import { useLocale } from '@/lib/hooks/useLocale';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRealtimeConversations } from '@/lib/hooks/useRealtimeConversations';
import { useRealtimeNotifications } from '@/lib/hooks/useRealtimeNotifications';
import type { Conversation, Notification } from '@/lib/types/message';

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
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
  partner_name: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  is_archived: boolean;
};

type UnreadMessageRow = {
  conversation_id: string;
};

type PendingRequest = {
  id: string;
  requesterId: string;
  businessId: string | null;
  ownerName: string;
  businessName: string;
  location: string;
};

type UserSummaryRow = {
  owner_name: string;
  business_name: string;
};

type InboxWorkspaceProps = {
  initialConversationId?: string | null;
};

const formatTimestamp = (value: string, locale: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === 'tl' ? 'fil-PH' : 'en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export function InboxWorkspace({ initialConversationId = null }: InboxWorkspaceProps) {
  const { locale } = useLocale();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [actionLoadingRequestId, setActionLoadingRequestId] = useState<string | null>(null);
  const [notificationActionLoadingId, setNotificationActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId);

  const loadInboxData = useCallback(async () => {
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      setPendingRequests([]);
      setNotifications([]);
      setConversations([]);
      setSelectedConversationId(null);
      setUserId(null);
      return;
    }

    const currentUserId = authData.user.id;
    setUserId(currentUserId);

    const [requestResult, notificationResult, conversationResult] = await Promise.all([
      supabase
        .from('connection_requests')
        .select('id, requester_id, receiver_id, status')
        .eq('receiver_id', currentUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('id, title, detail, created_at, is_read')
        .eq('profile_id', currentUserId)
        .order('created_at', { ascending: false }),
      supabase
        .from('conversations')
        .select('id, partner_name, last_message_preview, last_message_at, is_archived')
        .eq('profile_id', currentUserId)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false })
        .order('created_at', { ascending: false }),
    ]);

    const { data, error: requestError } = requestResult;

    if (requestError) {
      setError(requestError.message);
      setPendingRequests([]);
      setNotifications([]);
      setConversations([]);
      return;
    }

    if (notificationResult.error) {
      setError(notificationResult.error.message);
      setPendingRequests([]);
      setNotifications([]);
      setConversations([]);
      return;
    }

    if (conversationResult.error) {
      setError(conversationResult.error.message);
      setPendingRequests([]);
      setNotifications([]);
      setConversations([]);
      return;
    }

    const rows = (data ?? []) as ConnectionRequestRow[];
    const requesterIds = Array.from(new Set(rows.map((row) => row.requester_id)));

    let profilesById = new Map<string, ProfileRow>();
    let businessesByOwnerId = new Map<string, BusinessRow>();

    if (requesterIds.length > 0) {
      const [businessesResult, profilesResult] = await Promise.all([
        supabase
          .from('businesses')
          .select('id, owner_id, name, location')
          .in('owner_id', requesterIds)
          .order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, owner_name, business_name, location').in('id', requesterIds),
      ]);

      if (businessesResult.error) {
        setError(businessesResult.error.message);
        setPendingRequests([]);
        setNotifications([]);
        setConversations([]);
        return;
      }

      if (profilesResult.error) {
        setError(profilesResult.error.message);
        setPendingRequests([]);
        setNotifications([]);
        setConversations([]);
        return;
      }

      profilesById = new Map<string, ProfileRow>((profilesResult.data ?? []).map((profile) => [profile.id, profile]));
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
          ownerName: profile?.owner_name ?? (locale === 'tl' ? 'May-ari ng negosyo' : 'Business owner'),
          businessName: business?.name ?? profile?.business_name ?? (locale === 'tl' ? 'Lokal na negosyo' : 'Local business'),
          location: business?.location ?? profile?.location ?? (locale === 'tl' ? 'Hindi kilalang lugar' : 'Unknown area'),
        };
      }),
    );

    setNotifications(
      ((notificationResult.data ?? []) as NotificationRow[]).map((notification) => ({
        id: notification.id,
        title: notification.title,
        detail: notification.detail,
        createdAt: formatTimestamp(notification.created_at, locale),
        isRead: notification.is_read,
      })),
    );

    const conversationRows = (conversationResult.data ?? []) as ConversationRow[];
    const conversationIds = conversationRows.map((conversation) => conversation.id);

    const unreadCounts = new Map<string, number>();

    if (conversationIds.length > 0) {
      const { data: unreadMessagesData, error: unreadMessagesError } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .eq('is_unread', true);

      if (unreadMessagesError) {
        setError(unreadMessagesError.message);
        setConversations([]);
        return;
      }

      for (const message of (unreadMessagesData ?? []) as UnreadMessageRow[]) {
        unreadCounts.set(message.conversation_id, (unreadCounts.get(message.conversation_id) ?? 0) + 1);
      }
    }

    setConversations(
      conversationRows.map((conversation) => ({
        id: conversation.id,
        partnerName: conversation.partner_name,
        lastMessagePreview: conversation.last_message_preview ?? (locale === 'tl' ? 'Wala pang mensahe.' : 'No messages yet.'),
        lastMessageAt: conversation.last_message_at ? formatTimestamp(conversation.last_message_at, locale) : null,
        unreadCount: unreadCounts.get(conversation.id) ?? 0,
      })),
    );

  }, [locale]);

  const getUserSummary = async (supabase: ReturnType<typeof createSupabaseBrowserClient>, currentUserId: string) => {
    const [profileResult, businessResult] = await Promise.all([
      supabase.from('profiles').select('owner_name, business_name').eq('id', currentUserId).maybeSingle<UserSummaryRow>(),
      supabase.from('businesses').select('name').eq('owner_id', currentUserId).maybeSingle<{ name: string }>(),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (businessResult.error) {
      throw businessResult.error;
    }

    return {
      ownerName: profileResult.data?.owner_name ?? (locale === 'tl' ? 'May-ari ng negosyo' : 'Business owner'),
      businessName: businessResult.data?.name ?? profileResult.data?.business_name ?? (locale === 'tl' ? 'Lokal na negosyo' : 'Local business'),
    };
  };

  const ensureConversationSnapshot = async (
    supabase: ReturnType<typeof createSupabaseBrowserClient>,
    profileId: string,
    partnerName: string,
    lastMessagePreview: string,
    lastMessageAt: string,
  ) => {
    const { data: existingConversation, error: selectError } = await supabase
      .from('conversations')
      .select('id')
      .eq('profile_id', profileId)
      .eq('partner_name', partnerName)
      .maybeSingle<{ id: string }>();

    if (selectError) {
      throw selectError;
    }

    if (existingConversation?.id) {
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_preview: lastMessagePreview, last_message_at: lastMessageAt, is_archived: false })
        .eq('id', existingConversation.id);

      if (updateError) {
        throw updateError;
      }

      return existingConversation.id;
    }

    const { data: insertedConversation, error: insertError } = await supabase
      .from('conversations')
      .insert({
        profile_id: profileId,
        partner_name: partnerName,
        last_message_preview: lastMessagePreview,
        last_message_at: lastMessageAt,
        is_archived: false,
      })
      .select('id')
      .maybeSingle<{ id: string }>();

    if (insertError) {
      throw insertError;
    }

    return insertedConversation?.id ?? null;
  };

  useEffect(() => {
    queueMicrotask(() => {
      void loadInboxData();
    });
  }, [loadInboxData]);

  const handleNewConversation = useCallback((conversation: Conversation) => {
    setConversations((prevConversations) => {
      const updated = [...prevConversations];
      updated.unshift(conversation);
      return updated;
    });
  }, []);

  const handleConversationUpdated = useCallback((conversation: Conversation) => {
    setConversations((prevConversations) =>
      prevConversations
        .map((conv) => (conv.id === conversation.id ? conversation : conv))
        .sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        }),
    );
  }, []);

  const handleNewNotification = useCallback((notification: Notification) => {
    setNotifications((prevNotifications) => [notification, ...prevNotifications]);
  }, []);

  const handleNotificationUpdated = useCallback((notification: Notification) => {
    setNotifications((prevNotifications) => prevNotifications.map((notif) => (notif.id === notification.id ? notification : notif)));
  }, []);

  useRealtimeConversations(userId, handleNewConversation, handleConversationUpdated);
  useRealtimeNotifications(userId, handleNewNotification, handleNotificationUpdated);

  const acceptRequest = async (requestId: string) => {
    setActionLoadingRequestId(requestId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user?.id) {
        throw new Error('Please sign in to accept requests.');
      }

      const request = pendingRequests.find((item) => item.id === requestId);
      if (!request) {
        throw new Error('Request not found.');
      }

      const [currentUserSummary] = await Promise.all([getUserSummary(supabase, authData.user.id)]);

      const acceptedAt = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('connection_requests')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('status', 'pending');

      if (updateError) {
        throw updateError;
      }

      const welcomeMessage = 'Connection accepted. Say hello to start the conversation.';

      await ensureConversationSnapshot(supabase, authData.user.id, request.businessName, welcomeMessage, acceptedAt);
      await ensureConversationSnapshot(supabase, request.requesterId, currentUserSummary.businessName, welcomeMessage, acceptedAt);

      const { error: notificationError } = await supabase.from('notifications').insert({
        profile_id: request.requesterId,
        title: 'Connection accepted',
        detail: `${currentUserSummary.businessName} accepted your connection request.`,
        is_read: false,
      });

      if (notificationError) {
        throw notificationError;
      }

      await loadInboxData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to accept request.');
    } finally {
      setActionLoadingRequestId(null);
    }
  };

  const rejectRequest = async (requestId: string) => {
    setActionLoadingRequestId(requestId);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: deleteError } = await supabase.from('connection_requests').delete().eq('id', requestId).eq('status', 'pending');

      if (deleteError) {
        throw deleteError;
      }

      await loadInboxData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to decline request.');
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
        throw new Error('Please sign in to update notifications.');
      }

      const { error: updateError } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId).eq('profile_id', authData.user.id);

      if (updateError) {
        throw updateError;
      }

      await loadInboxData();
    } catch (notificationError) {
      setError(notificationError instanceof Error ? notificationError.message : 'Failed to update notification.');
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
        throw new Error('Please sign in to dismiss notifications.');
      }

      const { error: deleteError } = await supabase.from('notifications').delete().eq('id', notificationId).eq('profile_id', authData.user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadInboxData();
    } catch (notificationError) {
      setError(notificationError instanceof Error ? notificationError.message : 'Failed to dismiss notification.');
    } finally {
      setNotificationActionLoadingId(null);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 overflow-hidden">
      {error ? <div className="rounded-panel border border-status-error-fg bg-status-error-bg p-4 text-sm text-status-error-fg">{error}</div> : null}

      <InboxColumns
        notifications={notifications}
        conversations={conversations}
        connectionRequests={pendingRequests}
        onMarkNotificationRead={markNotificationRead}
        onDismissNotification={dismissNotification}
        onAcceptRequest={acceptRequest}
        onRejectRequest={rejectRequest}
        actionLoadingRequestId={actionLoadingRequestId}
        notificationActionLoadingId={notificationActionLoadingId}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
        onBackToInbox={() => setSelectedConversationId(null)}
      />
    </div>
  );
}