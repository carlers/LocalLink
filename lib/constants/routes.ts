export const routes = {
  root: "/",
  home: "/home",
  discover: "/discover",
  inbox: "/inbox",
  inboxConversation: (conversationId: string) => `/inbox/${conversationId}`,
  profile: "/profile",
  login: "/login",
  signup: "/signup",
} as const;

export type MainNavLabelKey = "home" | "discover" | "inbox" | "profile";

export const mainNavItems = [
  { href: routes.home, labelKey: "home" },
  { href: routes.discover, labelKey: "discover" },
  { href: routes.inbox, labelKey: "inbox" },
  { href: routes.profile, labelKey: "profile" },
] as const;
