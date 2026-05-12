import { ConversationPane } from "@/components/features/conversation-pane";
import { ConversationList } from "@/components/features/conversation-list";
import { Spinner } from "@/components/ui/spinner";
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
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        View profile
                      </a>
                    ) : null}
                    <button
                      type="button"
                      className="btn-primary text-xs px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1"
                      disabled={actionLoadingRequestId === request.id}
                      onClick={() => {
                        if (!onAcceptRequest) {
                          return;
                        }

                        void onAcceptRequest(request.id);
                      }}
                    >
                      {actionLoadingRequestId === request.id ? (
                        <Spinner size="sm" color="white" ariaLabel="Processing request" />
                      ) : (
                        "Accept"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-xs px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-70"
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
                        className="btn-secondary text-xs px-3 py-1 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1"
                        disabled={notificationActionLoadingId === notification.id}
                        onClick={() => {
                          void onMarkNotificationRead(notification.id);
                        }}
                      >
                        {notificationActionLoadingId === notification.id ? (
                          <Spinner size="sm" color="brand" ariaLabel="Updating notification" />
                        ) : (
                          'Mark read'
                        )}
                      </button>
                    ) : null}
                    {onDismissNotification ? (
                      <button
                        type="button"
                        className="btn-secondary text-xs px-3 py-1 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-1"
                        disabled={notificationActionLoadingId === notification.id}
                        onClick={() => {
                          void onDismissNotification(notification.id);
                        }}
                      >
                        {notificationActionLoadingId === notification.id ? (
                          <Spinner size="sm" color="muted" ariaLabel="Dismissing notification" />
                        ) : (
                          'Dismiss'
                        )}
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-panel border-border-subtle bg-surface flex flex-1 flex-col border p-2.5 sm:p-3 lg:p-4 min-h-0">
        {/* Always show sidebar on desktop, chat takes remaining space */}
        <div className="flex min-h-0 flex-1 gap-4 xl:grid xl:grid-cols-[300px_minmax(0,1fr)]">
          {/* Conversation sidebar: always visible on desktop */}
          <div className="rounded-panel border-border-subtle bg-surface-muted flex-col border p-3 sm:p-3.5 xl:flex xl:p-4 min-h-0 flex-1 max-h-full">
            <h2 className="text-foreground text-lg font-semibold mb-3">Conversations</h2>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
              />
            </div>
          </div>

          {/* Chat pane: takes full width on mobile when selected, right side on desktop */}
          <div className="min-h-0 flex-1 overflow-hidden xl:block">
            {selectedConversationId ? (
              <div className="h-full min-h-0">
                <ConversationPane conversationId={selectedConversationId} onBackToInbox={onBackToInbox} />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-panel border-2 border-dashed border-border-subtle bg-surface-muted/50 h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-foreground text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-text-muted text-sm">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
