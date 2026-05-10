'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Message } from '@/lib/types/message';

/**
 * Real-time subscription hook for messages in a conversation.
 * Listens for new messages and message read status changes.
 */
export function useRealtimeMessages(
  conversationId: string | null,
  onNewMessage: (message: Message) => void,
  onMessageUpdated: (message: Message) => void
): void {
  useEffect(() => {
    if (!conversationId) return;

    const supabase = createSupabaseBrowserClient();

    const insertChannel = supabase.channel(`messages:conversation_id=eq.${conversationId}`);
    insertChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const newMessage: Message = {
          id: payload.new.id,
          conversationId: payload.new.conversation_id,
          senderName: payload.new.sender_name,
          preview: payload.new.preview,
          sentAt: payload.new.sent_at,
          isUnread: payload.new.is_unread,
        };
        onNewMessage(newMessage);
      }
    );

    const updateChannel = supabase.channel(`messages-update:conversation_id=eq.${conversationId}`);
    updateChannel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const updatedMessage: Message = {
          id: payload.new.id,
          conversationId: payload.new.conversation_id,
          senderName: payload.new.sender_name,
          preview: payload.new.preview,
          sentAt: payload.new.sent_at,
          isUnread: payload.new.is_unread,
        };
        onMessageUpdated(updatedMessage);
      }
    );

    void insertChannel.subscribe();
    void updateChannel.subscribe();

    return () => {
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [conversationId, onNewMessage, onMessageUpdated]);
}
