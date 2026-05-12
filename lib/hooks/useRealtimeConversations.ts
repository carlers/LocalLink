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
    const insertChannel = supabase.channel(`conversations:profile_id=eq.${profileId}`);
    insertChannel.on(
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
          lastMessageAt: payload.new.last_message_at,
          unreadCount: 0,
        };
        onNewConversation(newConversation);
      }
    );

    const updateChannel = supabase.channel(`conversations-update:profile_id=eq.${profileId}`);
    updateChannel.on(
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
          lastMessageAt: payload.new.last_message_at,
          unreadCount: 0,
        };
        onConversationUpdated(updatedConversation);
      }
    );

    void insertChannel.subscribe();
    void updateChannel.subscribe();

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [profileId, onNewConversation, onConversationUpdated]);
}
