"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { routes } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import type { Message } from "@/lib/types/message";

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

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const router = useRouter();
  const conversationId = params.conversationId;

  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [currentUserName, setCurrentUserName] = useState<string>("You");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user?.id) {
      setConversation(null);
      setMessages([]);
      setLoading(false);
      setError("Please sign in to view conversations.");
      return;
    }

    const userId = authData.user.id;
    const [profileResult, conversationResult] = await Promise.all([
      supabase.from("profiles").select("owner_name, business_name").eq("id", userId).maybeSingle<ProfileRow>(),
      supabase
        .from("conversations")
        .select("id, partner_name, last_message_preview, last_message_at, is_archived, profile_id")
        .eq("id", conversationId)
        .eq("profile_id", userId)
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
      setError("Conversation not found.");
      return;
    }

    const displayName = profileResult.data?.business_name || profileResult.data?.owner_name || "You";
    setCurrentUserName(displayName);
    setConversation(conversationResult.data);

    const { data: messageData, error: messageError } = await supabase
      .from("messages")
      .select("id, sender_name, preview, sent_at, is_unread")
      .eq("conversation_id", conversationId)
      .order("sent_at", { ascending: true });

    if (messageError) {
      setError(messageError.message);
      setMessages([]);
      setLoading(false);
      return;
    }

    setMessages((messageData ?? []) as MessageRow[]);

    const unreadMessageIds = (messageData ?? [])
      .filter((message) => message.is_unread && message.sender_name !== displayName)
      .map((message) => message.id);

    if (unreadMessageIds.length > 0) {
      const { error: updateError } = await supabase.from("messages").update({ is_unread: false }).in("id", unreadMessageIds);

      if (updateError) {
        setError(updateError.message);
      }
    }

    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversation();
    });
  }, [loadConversation]);

  const handleNewMessage = useCallback(
    (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, { ...message, sentAt: message.sentAt instanceof Date ? message.sentAt.toISOString() : message.sentAt } as MessageRow]);
    },
    []
  );

  const handleMessageUpdated = useCallback(
    (updatedMessage: Message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id ? { ...updatedMessage, sentAt: updatedMessage.sentAt instanceof Date ? updatedMessage.sentAt.toISOString() : updatedMessage.sentAt } as MessageRow : msg
        )
      );
    },
    []
  );

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
        throw new Error("Please sign in to send messages.");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("owner_name, business_name")
        .eq("id", authData.user.id)
        .maybeSingle<ProfileRow>();

      if (profileError) {
        throw profileError;
      }

      const senderName = profileData?.business_name || profileData?.owner_name || "You";
      const now = new Date().toISOString();

      // Optimistically add message to state
      const optimisticMessage: MessageRow = {
        id: `temp-${Date.now()}`,
        sender_name: senderName,
        preview: messageText,
        sent_at: now,
        is_unread: false,
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      setDraft("");

      const { error: insertError } = await supabase.from("messages").insert({
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
        .from("conversations")
        .update({ last_message_preview: messageText, last_message_at: now })
        .eq("id", conversation.id);

      if (updateConversationError) {
        throw updateConversationError;
      }

      // Bidirectional messaging: also send to partner's conversation
      const partnerResult = await supabase.from("conversations").select("id").eq("partner_name", senderName).limit(1);
      if (partnerResult.data) {
        const partner = partnerResult.data.at(0);
        if (partner) {
          await supabase.from("messages").insert({
            conversation_id: partner.id,
            sender_name: senderName,
            preview: messageText,
            sent_at: now,
            is_unread: true
          });
          await supabase.from("conversations").update({
            last_message_preview: messageText,
            last_message_at: now
          }).eq("id", partner.id);
        }
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const partnerLabel = conversation?.partner_name ?? "Conversation";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-text-muted text-sm">
            <Link href={routes.inbox} className="hover:text-foreground transition">
              Inbox
            </Link>
            <span className="mx-2">/</span>
            Conversation
          </p>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{partnerLabel}</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push(routes.inbox)}
          className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
        >
          Back to inbox
        </button>
      </div>

      {error ? (
        <div className="rounded-panel border border-status-error-fg bg-status-error-bg p-4 text-sm text-status-error-fg">
          {error}
        </div>
      ) : null}

      <section className="rounded-panel border-border-subtle bg-surface border p-4 sm:p-5">
        {loading ? (
          <p className="text-text-muted text-sm">Loading conversation...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-text-muted text-sm">No messages yet. Start the conversation below.</p>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_name === currentUserName;

                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isOwnMessage ? "bg-brand text-white" : "bg-surface-muted text-foreground"}`}>
                        <p className="text-sm font-medium">{message.sender_name}</p>
                        <p className="mt-1 text-sm leading-6">{message.preview}</p>
                        <p className={`mt-2 text-xs ${isOwnMessage ? "text-white/80" : "text-text-muted"}`}>
                          {formatTimestamp(message.sent_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-border-subtle border-t pt-4">
              <label className="text-foreground block text-sm font-medium" htmlFor="message-draft">
                Write a message
              </label>
              <textarea
                id="message-draft"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={4}
                placeholder="Type your reply..."
                className="border-border-subtle bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-text-muted focus:border-brand"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={sending || draft.trim().length === 0}
                  className="rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {sending ? "Sending..." : "Send message"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}