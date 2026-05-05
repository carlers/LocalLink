import Link from "next/link";
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
}: InboxColumnsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-panel border-border-subtle bg-surface border p-4 md:col-span-2">
        <h2 className="text-foreground text-lg font-semibold">Connection Requests</h2>
        {connectionRequests.length === 0 ? (
          <p className="text-text-muted mt-3 text-sm">No pending connection requests.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {connectionRequests.map((request) => (
              <li key={request.id} className="rounded-chip bg-surface-muted p-3">
                <p className="font-medium">{request.businessName}</p>
                <p className="text-text-muted text-sm">Owner: {request.ownerName}</p>
                <p className="text-text-muted text-sm">Location: {request.location}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {request.businessId ? (
                    <Link
                      href={`/business/${request.businessId}`}
                      className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                    >
                      View profile
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                    className="rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-70"
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

      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-text-muted mt-3 text-sm">No notifications yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded-chip border p-3 ${notification.isRead ? "border-border-subtle bg-surface-muted" : "border-brand/30 bg-brand/5"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-text-muted text-sm">{notification.detail}</p>
                  </div>
                  <span className="text-text-muted shrink-0 text-xs">{notification.createdAt}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
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
                      {notificationActionLoadingId === notification.id ? "Updating..." : "Mark read"}
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
                      {notificationActionLoadingId === notification.id ? "Updating..." : "Dismiss"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Conversations</h2>
        <div className="mt-3">
          <ConversationList conversations={conversations} />
        </div>
      </section>
    </div>
  );
}
