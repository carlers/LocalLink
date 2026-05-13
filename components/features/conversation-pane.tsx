'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { routes } from '@/lib/constants/routes';
import { useLocale } from '@/lib/hooks/useLocale';
import { translations } from '@/lib/i18n/translations';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRealtimeMessages } from '@/lib/hooks/useRealtimeMessages';
import { Spinner } from '@/components/ui/spinner';
import { ConversationLoadingFallback } from '@/components/features/conversation-loading-fallback';
import type { Message } from '@/lib/types/message';

type ConversationRow = {
  id: string;
  partner_name: string;
  last_message_preview: string | null;
  last_message_at: string | null;
  is_archived: boolean;
  profile_id: string;
};

type MessageRow = {
  id: string;
  sender_name: string;
  preview: string;
  sent_at: string;
  is_unread: boolean;
};

type ProfileRow = {
  owner_name: string;
  business_name: string;
};

type ConversationPaneProps = {
  conversationId: string | null;
  compact?: boolean;
  onBackToInbox?: () => void;
};

const toMessageRow = (message: Message): MessageRow => ({
  id: message.id,
  sender_name: message.senderName,
  preview: message.preview,
  sent_at: message.sentAt,
  is_unread: message.isUnread,
});

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

export function ConversationPane({ conversationId, compact = false, onBackToInbox }: ConversationPaneProps) {
  const { locale } = useLocale();
  const copy = translations[locale].conversation;
  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>(copy.you);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user?.id) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      setError(copy.signInToView);
      return;
    }

    const userId = authData.user.id;
    const [profileResult, conversationResult] = await Promise.all([
      supabase.from('profiles').select('owner_name, business_name').eq('id', userId).maybeSingle<ProfileRow>(),
      supabase
        .from('conversations')
        .select('id, partner_name, last_message_preview, last_message_at, is_archived, profile_id')
        .eq('id', conversationId)
        .eq('profile_id', userId)
        .maybeSingle<ConversationRow>(),
    ]);

    if (profileResult.error) {
      setError(profileResult.error.message);
      setLoading(false);
      return;
    }

    if (conversationResult.error) {
      setError(conversationResult.error.message);
      setLoading(false);
      return;
    }

    if (!conversationResult.data) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      setError(copy.conversationNotFound);
      return;
    }

    const displayName = profileResult.data?.business_name || profileResult.data?.owner_name || copy.you;
    setCurrentUserName(displayName);
    setConversation(conversationResult.data);

    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .select('id, sender_name, preview, sent_at, is_unread')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (messageError) {
      setError(messageError.message);
      setMessages([]);
      setLoading(false);
      return;
    }

    const rows = (messageData ?? []) as MessageRow[];
    setMessages(rows);

    const unreadMessageIds = rows
      .filter((message) => message.is_unread && message.sender_name !== displayName)
      .map((message) => message.id);

    if (unreadMessageIds.length > 0) {
      const { error: updateError } = await supabase.from('messages').update({ is_unread: false }).in('id', unreadMessageIds);

      if (updateError) {
        setError(updateError.message);
      }
    }

    setLoading(false);
  }, [conversationId, copy.conversationNotFound, copy.signInToView, copy.you]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversation();
    });
  }, [loadConversation]);

  const handleNewMessage = useCallback((message: Message) => {
    setMessages((prevMessages) => {
      if (prevMessages.some((msg) => msg.id === message.id)) {
        return prevMessages;
      }

      const replaced = prevMessages.map((msg) => {
        if (
          msg.id.startsWith('temp-') &&
          msg.sender_name === message.senderName &&
          msg.preview === message.preview &&
          msg.sent_at === message.sentAt
        ) {
          return toMessageRow(message);
        }

        return msg;
      });

      if (replaced.some((msg) => msg.id === message.id)) {
        return replaced;
      }

      return [...replaced, toMessageRow(message)];
    });
  }, []);

  const handleMessageUpdated = useCallback((updatedMessage: Message) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === updatedMessage.id ? toMessageRow(updatedMessage) : msg)),
    );
  }, []);

  useRealtimeMessages(conversationId, handleNewMessage, handleMessageUpdated);

  const sendMessage = async () => {
    const messageText = draft.trim();

    if (!messageText || !conversation) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user?.id) {
        throw new Error(copy.signInToSend);
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('owner_name, business_name')
        .eq('id', authData.user.id)
        .maybeSingle<ProfileRow>();

      if (profileError) {
        throw profileError;
      }

      const senderName = profileData?.business_name || profileData?.owner_name || copy.you;
      const now = new Date().toISOString();

      setMessages((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          sender_name: senderName,
          preview: messageText,
          sent_at: now,
          is_unread: false,
        },
      ]);
      setDraft('');

      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_name: senderName,
        preview: messageText,
        sent_at: now,
        is_unread: false,
      });

      if (insertError) {
        throw insertError;
      }

      const { error: updateConversationError } = await supabase
        .from('conversations')
        .update({ last_message_preview: messageText, last_message_at: now })
        .eq('id', conversation.id);

      if (updateConversationError) {
        throw updateConversationError;
      }

      const partnerResult = await supabase.from('conversations').select('id').eq('partner_name', senderName).limit(1);
      if (partnerResult.data) {
        const partner = partnerResult.data.at(0);

        if (partner) {
          await supabase.from('messages').insert({
            conversation_id: partner.id,
            sender_name: senderName,
            preview: messageText,
            sent_at: now,
            is_unread: true,
          });
          await supabase
            .from('conversations')
            .update({ last_message_preview: messageText, last_message_at: now })
            .eq('id', partner.id);
        }
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : copy.failedToSend);
    } finally {
      setSending(false);
    }
  };

  const partnerLabel = conversation?.partner_name ?? copy.title;

  if (!conversationId) {
    return (
      <section className="rounded-panel border-border-subtle bg-surface h-full min-h-0 overflow-hidden border p-4 sm:p-5">
        <h2 className="text-foreground text-lg font-semibold">{copy.title}</h2>
        <p className="text-text-muted mt-3 text-sm">{copy.selectConversationHint}</p>
      </section>
    );
  }

  return (
    <section className="rounded-panel border-border-subtle bg-surface flex h-full min-h-0 flex-col overflow-hidden border p-2.5 sm:p-3 lg:p-4 xl:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3">
        <div className="min-w-0">
          <p className="text-text-muted text-sm">
            <Link href={routes.inbox} className="hover:text-foreground transition">
              {translations[locale].nav.inbox}
            </Link>
            <span className="mx-2">/</span>
            {copy.title}
          </p>
          <h2 className="truncate text-2xl font-semibold leading-tight">{partnerLabel}</h2>
        </div>
        {onBackToInbox ? (
          <button
            type="button"
            onClick={onBackToInbox}
            className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted md:hidden"
          >
            {copy.back}
          </button>
        ) : null}
      </div>

      {error ? <div className="rounded-panel border border-status-error-fg bg-status-error-bg mt-4 shrink-0 p-4 text-sm text-status-error-fg">{error}</div> : null}

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <ConversationLoadingFallback messageCount={4} />
          ) : messages.length === 0 ? (
            <p className="text-text-muted text-sm">{copy.emptyMessages}</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwnMessage = message.sender_name === currentUserName;

                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isOwnMessage ? 'bg-brand text-white' : 'bg-surface-muted text-foreground'}`}>
                      <p className="text-sm font-medium">{message.sender_name}</p>
                      <p className="mt-1 text-sm leading-6">{message.preview}</p>
                      <p className={`mt-2 text-xs ${isOwnMessage ? 'text-white/80' : 'text-text-muted'}`}>{formatTimestamp(message.sent_at, locale)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-border-subtle border-t pt-3.5">
          <div className="relative">
            <textarea
              id="message-draft"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={compact ? 2 : 3}
              placeholder={copy.typeReply}
              className="border-border-subtle bg-background text-foreground block min-h-[3.25rem] w-full resize-none rounded-2xl border px-4 py-2.5 pr-28 text-sm outline-none transition placeholder:text-text-muted focus:border-brand"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={sending || draft.trim().length === 0}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-brand bg-brand px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1"
            >
              {sending ? (
                <>
                  <Spinner size="sm" color="white" ariaLabel={copy.sendingMessage} />
                </>
              ) : (
                copy.send
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}