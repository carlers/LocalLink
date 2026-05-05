"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/lib/constants/routes";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BusinessConnectionState } from "@/lib/types/connection";

type ConnectionRequestRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted";
};

type ConnectRequestButtonProps = {
  receiverOwnerId: string | null;
};

export function ConnectRequestButton({ receiverOwnerId }: ConnectRequestButtonProps) {
  const [connectionState, setConnectionState] = useState<BusinessConnectionState>("none");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      if (!receiverOwnerId) {
        setConnectionState("none");
        setCurrentUserId(null);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id ?? null;

      setCurrentUserId(userId);

      if (!userId || userId === receiverOwnerId) {
        setConnectionState("none");
        return;
      }

      const { data } = await supabase
        .from("connection_requests")
        .select("id, requester_id, receiver_id, status")
        .or(
          [
            `and(requester_id.eq.${userId},receiver_id.eq.${receiverOwnerId})`,
            `and(requester_id.eq.${receiverOwnerId},receiver_id.eq.${userId})`,
          ].join(","),
        )
        .limit(1);

      const request = ((data ?? []) as ConnectionRequestRow[])[0];
      if (!request) {
        setConnectionState("none");
        return;
      }

      if (request.status === "accepted") {
        setConnectionState("connected");
      } else if (request.requester_id === userId) {
        setConnectionState("pending-outgoing");
      } else {
        setConnectionState("pending-incoming");
      }
    };

    void loadState();
  }, [receiverOwnerId]);

  if (!receiverOwnerId || !currentUserId || currentUserId === receiverOwnerId) {
    return (
      <button className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground" type="button" disabled>
        Connect
      </button>
    );
  }

  if (connectionState === "pending-incoming") {
    return (
      <Link href="/inbox" className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground transition hover:bg-surface">
        Respond in inbox
      </Link>
    );
  }

  if (connectionState === "pending-outgoing") {
    return (
      <button
        className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
        type="button"
        disabled={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true);

          try {
            const supabase = createSupabaseBrowserClient();
            const { error } = await supabase
              .from("connection_requests")
              .delete()
              .eq("requester_id", currentUserId)
              .eq("receiver_id", receiverOwnerId)
              .eq("status", "pending");

            if (error) {
              throw error;
            }

            setConfirmDisconnect(false);
            setConnectionState("none");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? "Cancelling..." : "Request sent"}
      </button>
    );
  }

  if (connectionState === "connected") {
    if (confirmDisconnect) {
      return (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <button
            className="rounded-full border border-status-error-fg bg-status-error-bg px-6 py-2 font-medium text-status-error-fg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true);

              try {
                const supabase = createSupabaseBrowserClient();
                const { error } = await supabase
                  .from("connection_requests")
                  .delete()
                  .eq("status", "accepted")
                  .or(
                    [
                      `and(requester_id.eq.${currentUserId},receiver_id.eq.${receiverOwnerId})`,
                      `and(requester_id.eq.${receiverOwnerId},receiver_id.eq.${currentUserId})`,
                    ].join(","),
                  );

                if (error) {
                  throw error;
                }

                setConfirmDisconnect(false);
                setConnectionState("none");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {isSubmitting ? "Disconnecting..." : "Confirm disconnect"}
          </button>
          <button
            className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setConfirmDisconnect(false);
            }}
          >
            Keep connected
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Link
          href={routes.inbox}
          className="rounded-full border border-brand bg-brand px-6 py-2 font-semibold text-white transition hover:bg-teal-700"
        >
          Open inbox
        </Link>
        <button
          className="rounded-full border border-border-subtle bg-surface-muted px-6 py-2 font-medium text-foreground transition hover:bg-surface"
          type="button"
          onClick={() => {
            setConfirmDisconnect(true);
          }}
        >
          Connected
        </button>
      </div>
    );
  }

  return (
    <button
      className="rounded-full border border-brand bg-brand px-6 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
      type="button"
      disabled={isSubmitting}
      onClick={async () => {
        setIsSubmitting(true);

        try {
          const supabase = createSupabaseBrowserClient();
          const { error } = await supabase
            .from("connection_requests")
            .insert({
              requester_id: currentUserId,
              receiver_id: receiverOwnerId,
              status: "pending",
            });

          if (error) {
            throw error;
          }

          setConfirmDisconnect(false);
          setConnectionState("pending-outgoing");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      {isSubmitting ? "Sending..." : "Connect"}
    </button>
  );
}
