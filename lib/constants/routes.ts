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

export const mainNavItems = [
  { href: routes.home, label: "Home" },
  { href: routes.discover, label: "Discover" },
  { href: routes.inbox, label: "Inbox" },
  { href: routes.profile, label: "Profile" },
] as const;
