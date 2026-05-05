'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Real-time hook for updating the inbox badge count.
 * Listens for changes to pending connection requests, unread notifications, and unread messages.
 */
export function useInboxBadgeCount(userId: string | null): number {
  const [badgeCount, setBadgeCount] = useState(0);

  const loadBadgeCountAsync = useCallback(async () => {
    if (!userId) {
      setBadgeCount(0);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    const [notificationCountResult, requestCountResult, conversationResult] = await Promise.all([
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('profile_id', userId).eq('is_read', false),
      supabase.from('connection_requests').select('id', { count: 'exact', head: true }).eq('receiver_id', userId).eq('status', 'pending'),
      supabase.from('conversations').select('id').eq('profile_id', userId).eq('is_archived', false),
    ]);

    let unreadMessages = 0;
    const conversationIds = (conversationResult.data ?? []).map((conversation) => conversation.id);
    if (conversationIds.length > 0) {
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_unread', true);

      unreadMessages = unreadCount ?? 0;
    }

    const unreadNotifications = notificationCountResult.count ?? 0;
    const pendingRequests = requestCountResult.count ?? 0;
    setBadgeCount(unreadNotifications + pendingRequests + unreadMessages);
  }, [userId]);

  // Initial load
  useEffect(() => {
    queueMicrotask(() => {
      void loadBadgeCountAsync();
    });
  }, [loadBadgeCountAsync]);

  // Real-time subscription for notifications
  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();

    const notificationSubscription = supabase
      .channel(`notifications-badge:profile_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          // Trigger reload of badge count
          void loadBadgeCountAsync();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationSubscription);
    };
  }, [userId, loadBadgeCountAsync]);

  // Real-time subscription for connection requests
  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();

    const requestSubscription = supabase
      .channel(`requests-badge:receiver_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connection_requests',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          // Trigger reload of badge count
          void loadBadgeCountAsync();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestSubscription);
    };
  }, [userId, loadBadgeCountAsync]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!userId) return;

    const supabase = createSupabaseBrowserClient();

    // Subscribe to changes in conversations first to know which ones to monitor
    const conversationSubscription = supabase
      .channel(`conversations-badge:profile_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `profile_id=eq.${userId}`,
        },
        () => {
          void loadBadgeCountAsync();
        }
      )
      .subscribe();

    // Subscribe to changes in messages
    const messageSubscription = supabase
      .channel(`messages-badge`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          void loadBadgeCountAsync();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationSubscription);
      supabase.removeChannel(messageSubscription);
    };
  }, [userId, loadBadgeCountAsync]);

  return badgeCount;
}
