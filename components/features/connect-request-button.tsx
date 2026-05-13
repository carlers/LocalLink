"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { routes } from "@/lib/constants/routes";
import { useLocale } from "@/lib/hooks/useLocale";
import { translations } from "@/lib/i18n/translations";
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
  const { locale } = useLocale();
  const copy = translations[locale].connections;
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
      <button className="btn-secondary" type="button" disabled>
        {copy.connect}
      </button>
    );
  }

  if (connectionState === "pending-incoming") {
    return (
      <Link href="/inbox" className="btn-secondary">
        {copy.respondInInbox}
      </Link>
    );
  }

  if (connectionState === "pending-outgoing") {
    return (
      <button
        className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
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
        {isSubmitting ? copy.cancelling : copy.requestSent}
      </button>
    );
  }

  if (connectionState === "connected") {
    if (confirmDisconnect) {
      return (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <button
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
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
            {isSubmitting ? copy.disconnecting : copy.confirmDisconnect}
          </button>
          <button
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-70"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setConfirmDisconnect(false);
            }}
          >
            {copy.keepConnected}
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2 sm:flex-nowrap">
        <Link
          href={routes.inbox}
          className="btn-primary"
        >
          {copy.openInbox}
        </Link>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => {
            setConfirmDisconnect(true);
          }}
        >
          {copy.connected}
        </button>
      </div>
    );
  }

  return (
    <button
      className="btn-primary disabled:cursor-not-allowed disabled:opacity-70"
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
      {isSubmitting ? copy.sending : copy.connect}
    </button>
  );
}
