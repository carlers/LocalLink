import Link from "next/link";
import type { Message, Notification } from "@/lib/types/message";

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
  messages: Message[];
  connectionRequests?: PendingConnectionRequest[];
  onAcceptRequest?: (requestId: string) => void | Promise<void>;
  onRejectRequest?: (requestId: string) => void | Promise<void>;
  actionLoadingRequestId?: string | null;
};

export function InboxColumns({
  notifications,
  messages,
  connectionRequests = [],
  onAcceptRequest,
  onRejectRequest,
  actionLoadingRequestId,
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
        <ul className="mt-3 space-y-2">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-chip bg-surface-muted p-3">
              <p className="font-medium">{notification.title}</p>
              <p className="text-text-muted text-sm">{notification.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-panel border-border-subtle bg-surface border p-4">
        <h2 className="text-foreground text-lg font-semibold">Messages</h2>
        <ul className="mt-3 space-y-2">
          {messages.map((message) => (
            <li key={message.id} className="rounded-chip bg-surface-muted p-3">
              <p className="font-medium">{message.senderName}</p>
              <p className="text-text-muted text-sm">{message.preview}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
