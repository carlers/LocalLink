import { ConversationPane } from "@/components/features/conversation-pane";
import { ConversationList } from "@/components/features/conversation-list";
import type { Conversation, Notification } from "@/lib/types/message";

type PendingConnectionRequest = {
  id: string;
  requesterId: string;
  businessId: string | null;
  ownerName: string;
  businessName: string;
  location: string;
};

type InboxColumnsProps = {
  notifications: Notification[];
  conversations: Conversation[];
  connectionRequests?: PendingConnectionRequest[];
  onMarkNotificationRead?: (notificationId: string) => void | Promise<void>;
  onDismissNotification?: (notificationId: string) => void | Promise<void>;
  onAcceptRequest?: (requestId: string) => void | Promise<void>;
  onRejectRequest?: (requestId: string) => void | Promise<void>;
  actionLoadingRequestId?: string | null;
  notificationActionLoadingId?: string | null;
  selectedConversationId?: string | null;
  onSelectConversation?: (conversationId: string) => void;
  onBackToInbox?: () => void;
};

export function InboxColumns({
  notifications,
  conversations,
  connectionRequests = [],
  onMarkNotificationRead,
  onDismissNotification,
  onAcceptRequest,
  onRejectRequest,
  actionLoadingRequestId,
  notificationActionLoadingId,
  selectedConversationId = null,
  onSelectConversation,
  onBackToInbox,
}: InboxColumnsProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden sm:gap-3 lg:gap-4">
      {/* Top band: requests and notifications - more compact on mobile */}
      <div className="grid gap-2 sm:gap-3 lg:grid-cols-2">
        <section className="rounded-panel border-border-subtle bg-surface border p-2.5 sm:p-3 lg:p-3.5">
          <h2 className="text-foreground text-base font-semibold">Connection Requests</h2>
          {connectionRequests.length === 0 ? (
            <p className="text-text-muted mt-2 text-sm">No pending connection requests.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {connectionRequests.map((request) => (
                <li key={request.id} className="rounded-chip bg-surface-muted p-2.5">
                  <p className="text-sm font-medium">{request.businessName}</p>
                  <p className="text-text-muted text-sm">Owner: {request.ownerName}</p>
                  <p className="text-text-muted text-sm">Location: {request.location}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {request.businessId ? (
                      <a
                        href={`/business/${request.businessId}`}
                        className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted"
                      >
                        View profile
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={actionLoadingRequestId === request.id}
                      onClick={() => {
                        if (!onAcceptRequest) {
                          return;
                        }

                        void onAcceptRequest(request.id);
                      }}
                    >
                      {actionLoadingRequestId === request.id ? "Processing..." : "Accept"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={actionLoadingRequestId === request.id}
                      onClick={() => {
                        if (!onRejectRequest) {
                          return;
                        }

                        void onRejectRequest(request.id);
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-panel border-border-subtle bg-surface border p-2.5 sm:p-3 lg:p-3.5">
          <h2 className="text-foreground text-base font-semibold">Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-text-muted mt-2 text-sm">No notifications yet.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`rounded-chip border p-2.5 ${notification.isRead ? 'border-border-subtle bg-surface-muted' : 'border-brand/30 bg-brand/5'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-text-muted text-sm">{notification.detail}</p>
                    </div>
                    <span className="text-text-muted shrink-0 text-xs">{notification.createdAt}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!notification.isRead ? (
                      <span className="text-brand inline-flex rounded-full bg-brand/10 px-2 py-1 text-xs font-medium">
                        Unread
                      </span>
                    ) : null}
                    {onMarkNotificationRead && !notification.isRead ? (
                      <button
                        type="button"
                        className="text-brand rounded-full border border-brand/30 px-3 py-1 text-xs font-medium transition hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={notificationActionLoadingId === notification.id}
                        onClick={() => {
                          void onMarkNotificationRead(notification.id);
                        }}
                      >
                        {notificationActionLoadingId === notification.id ? 'Updating...' : 'Mark read'}
                      </button>
                    ) : null}
                    {onDismissNotification ? (
                      <button
                        type="button"
                        className="rounded-full border border-border-subtle px-3 py-1 text-xs font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={notificationActionLoadingId === notification.id}
                        onClick={() => {
                          void onDismissNotification(notification.id);
                        }}
                      >
                        {notificationActionLoadingId === notification.id ? 'Updating...' : 'Dismiss'}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-panel border-border-subtle bg-surface flex min-h-0 flex-1 flex-col border p-2.5 sm:p-3 lg:p-4">
        {/* On mobile: show list OR chat depending on selection. On desktop: show both */}
        {selectedConversationId ? (
          // Selected: show chat full-width on mobile, right side on desktop
          <div className="flex min-h-0 flex-1 flex-col gap-4 xl:grid xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Desktop only: show list on the left */}
            <div className="hidden rounded-panel border-border-subtle bg-surface-muted flex-col border p-3 sm:p-3.5 xl:flex xl:p-4 min-h-0 flex-1">
              <h2 className="text-foreground text-lg font-semibold">Conversations</h2>
              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                <ConversationList
                  conversations={conversations}
                  selectedConversationId={selectedConversationId}
                  onSelectConversation={onSelectConversation}
                />
              </div>
            </div>

            {/* Chat pane: takes full width on mobile, right side on desktop */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <ConversationPane conversationId={selectedConversationId} compact onBackToInbox={onBackToInbox} />
            </div>
          </div>
        ) : (
          // Not selected: show list full-width
          <div className="rounded-panel border-border-subtle bg-surface-muted flex min-h-0 flex-1 flex-col border p-3 sm:p-3.5 lg:p-4">
            <h2 className="text-foreground text-lg font-semibold">Conversations</h2>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
