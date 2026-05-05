export type ConnectionRequestStatus = "pending" | "accepted";

export type BusinessConnectionState =
  | "none"
  | "pending-outgoing"
  | "pending-incoming"
  | "connected";

export type ConnectionRequest = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  acceptedAt: string | null;
};
