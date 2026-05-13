import Link from "next/link";
import { routes } from "@/lib/constants/routes";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";
import type { Conversation } from "@/lib/types/message";

type ConversationListProps = {
  conversations: Conversation[];
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
};

export function ConversationList({ conversations, selectedConversationId = null, onSelectConversation }: ConversationListProps) {
  const { locale } = useLocale();
  const copy = translations[locale].inbox;

  return (
    <div className="grid gap-3">
      {conversations.length === 0 ? (
        <p className="text-text-muted text-sm">{copy.noConversationsYet}</p>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`rounded-chip border p-3 transition ${conversation.id === selectedConversationId ? 'border-brand bg-brand/5' : 'border-border-subtle bg-surface-muted hover:border-brand/40 hover:bg-brand/5'}`}
          >
            {onSelectConversation ? (
              <button
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{conversation.partnerName}</p>
                  <p className="text-text-muted mt-1 line-clamp-2 text-sm">{conversation.lastMessagePreview}</p>
                  {conversation.lastMessageAt ? <p className="text-text-muted mt-2 text-xs">{conversation.lastMessageAt}</p> : null}
                </div>
                {conversation.unreadCount > 0 ? (
                  <span className="bg-brand text-white inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                ) : null}
              </button>
            ) : (
              <Link href={routes.inboxConversation(conversation.id)} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{conversation.partnerName}</p>
                  <p className="text-text-muted mt-1 line-clamp-2 text-sm">{conversation.lastMessagePreview}</p>
                  {conversation.lastMessageAt ? <p className="text-text-muted mt-2 text-xs">{conversation.lastMessageAt}</p> : null}
                </div>
                {conversation.unreadCount > 0 ? (
                  <span className="bg-brand text-white inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                ) : null}
              </Link>
            )}
          </div>
        ))
      )}
    </div>
  );
}