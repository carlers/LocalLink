'use client';

import { useEffect, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types/message';

/**
 * Real-time subscription hook for notifications.
 * Listens for new notifications and notification status changes.
 */
export function useRealtimeNotifications(
  profileId: string | null,
  onNewNotification: (notification: Notification) => void,
  onNotificationUpdated: (notification: Notification) => void
): void {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (!profileId) return;

    const supabase = createSupabaseBrowserClient();

    // Subscribe to INSERT events for new notifications
    const insertSubscription = supabase
      .channel(`notifications:profile_id=eq.${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const newNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            detail: payload.new.detail,
            createdAt: new Date(payload.new.created_at),
            isRead: payload.new.is_read,
          };
          onNewNotification(newNotification);
        }
      )
      .subscribe();

    // Subscribe to UPDATE events for notification status changes
    const updateSubscription = supabase
      .channel(`notifications-update:profile_id=eq.${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          if (!isMountedRef.current) return;
          const updatedNotification: Notification = {
            id: payload.new.id,
            title: payload.new.title,
            detail: payload.new.detail,
            createdAt: new Date(payload.new.created_at),
            isRead: payload.new.is_read,
          };
          onNotificationUpdated(updatedNotification);
        }
      )
      .subscribe();

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(insertSubscription);
      supabase.removeChannel(updateSubscription);
    };
  }, [profileId, onNewNotification, onNotificationUpdated]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
}
