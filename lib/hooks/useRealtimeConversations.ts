'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Conversation } from '@/lib/types/message';

/**
 * Real-time subscription hook for conversations.
 * Listens for new conversations and updates to existing conversations.
 */
export function useRealtimeConversations(
  profileId: string | null,
  onNewConversation: (conversation: Conversation) => void,
  onConversationUpdated: (conversation: Conversation) => void
): void {
  useEffect(() => {
    if (!profileId) return;

    const supabase = createSupabaseBrowserClient();

    // Subscribe to INSERT events for new conversations
    const insertSubscription = supabase
      .channel(`conversations:profile_id=eq.${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const newConversation: Conversation = {
            id: payload.new.id,
            partnerName: payload.new.partner_name,
            lastMessagePreview: payload.new.last_message_preview,
            lastMessageAt: payload.new.last_message_at ? new Date(payload.new.last_message_at) : null,
            unreadCount: 0,
          };
          onNewConversation(newConversation);
        }
      )
      .subscribe();

    // Subscribe to UPDATE events for conversation changes
    const updateSubscription = supabase
      .channel(`conversations-update:profile_id=eq.${profileId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          const updatedConversation: Conversation = {
            id: payload.new.id,
            partnerName: payload.new.partner_name,
            lastMessagePreview: payload.new.last_message_preview,
            lastMessageAt: payload.new.last_message_at ? new Date(payload.new.last_message_at) : null,
            unreadCount: 0,
          };
          onConversationUpdated(updatedConversation);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(insertSubscription);
      supabase.removeChannel(updateSubscription);
    };
  }, [profileId, onNewConversation, onConversationUpdated]);
}
