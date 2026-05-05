import Link from "next/link";
import { routes } from "@/lib/constants/routes";
import type { Conversation } from "@/lib/types/message";

type ConversationListProps = {
  conversations: Conversation[];
};

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="grid gap-3">
      {conversations.length === 0 ? (
        <p className="text-text-muted text-sm">No conversations yet. Accepted connections will appear here.</p>
      ) : (
        conversations.map((conversation) => (
          <Link
            key={conversation.id}
            href={routes.inboxConversation(conversation.id)}
            className="rounded-chip border-border-subtle bg-surface-muted hover:border-brand/40 hover:bg-brand/5 flex items-start justify-between gap-3 border p-3 transition"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{conversation.partnerName}</p>
              <p className="text-text-muted mt-1 line-clamp-2 text-sm">{conversation.lastMessagePreview}</p>
              {conversation.lastMessageAt ? (
                <p className="text-text-muted mt-2 text-xs">{conversation.lastMessageAt}</p>
              ) : null}
            </div>
            {conversation.unreadCount > 0 ? (
              <span className="bg-brand text-white inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-xs font-semibold">
                {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
              </span>
            ) : null}
          </Link>
        ))
      )}
    </div>
  );
}