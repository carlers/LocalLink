# AGENTS.md

This file is the operating manual for AI coding agents working on LocalLink.

## 1) Project Mission

LocalLink helps local Philippine businesses discover nearby partners, trade goods/services, and reduce waste through collaboration.

When making product decisions, optimize for:

1. Trust and clarity for small business owners.
2. Fast, low-friction actions on mobile.
3. Local relevance (proximity, barangay/city context, practical needs).

## 2) Current Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5 (strict)
- UI: React 19
- Styling: Tailwind CSS 4 via PostCSS
- Auth/backend client: @supabase/supabase-js
- Linting: ESLint 9 + eslint-config-next (Core Web Vitals + TypeScript)

Common scripts:

- npm run dev
- npm run lint
- npm run build
- npm run start

## 3) Repository Layout

Current top-level layout:

- app/: App Router routes and global app shell
- components/: reusable UI, layout, and feature components
- lib/: constants, hooks, mock data, Supabase client, and domain types
- supabase/: SQL migrations and schema policies
- public/: static assets

Current route and app structure:

- app/layout.tsx: root layout and shared navigation shell
- app/page.tsx: redirects from `/` to `/login`
- app/(app)/layout.tsx: authenticated app shell
- app/(app)/home/page.tsx: Home route with nearby business matches
- app/(app)/discover/page.tsx: Discover route with search/filters
- app/(app)/inbox/page.tsx: Inbox route with pending connection requests
- app/(app)/profile/page.tsx: current user profile and connected businesses
- app/(app)/business/[id]/page.tsx: public business profile route
- app/(auth)/login/page.tsx: login route
- app/(auth)/signup/page.tsx: signup route
- app/globals.css: token source of truth for shared visual values

Current component structure:

- components/layout/main-nav.tsx: top navigation shell
- components/ui/section-card.tsx: reusable section container
- components/features/business-list.tsx: business list with connect state actions
- components/features/connect-request-button.tsx: profile-level connect/disconnect CTA
- components/features/discover-search.tsx: search and filter controls
- components/features/inbox-columns.tsx: inbox layout and connection request actions
- components/features/profile-overview.tsx: profile summary and connected businesses

Current lib structure:

- lib/constants/routes.ts: route constants and nav item definitions
- lib/supabase/client.ts: browser Supabase client factory
- lib/supabase/server.ts: server Supabase client factory
- lib/types/: domain models for business, connection, message, and profile
- lib/mocks/: mock data layer for scaffold pages
- lib/hooks/index.ts: hooks entry point placeholder for future custom hooks

Current database migration structure:

- supabase/migrations/0001_phase_1_schema.sql: base tables, enums, and policies
- supabase/migrations/0002_connection_requests.sql: connection request table and core RLS policies
- supabase/migrations/0003_public_accepted_connections_read.sql: authenticated read policy for accepted connection graph

Environment and secrets policy:

- `.env.example` must contain variable names only (no real keys)
- real values belong in local, uncommitted environment files
- required public variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4) Non-Negotiable Engineering Rules

1. Keep TypeScript strict-safe. Do not introduce any/unsafe casts unless absolutely necessary and justified.
2. Prefer Server Components. Add "use client" only if interactivity/browser APIs are required.
3. Keep changes scoped. Do not refactor unrelated files in the same task.
4. Do not hardcode visual values in components when a token can be used.
5. Preserve existing architecture and naming patterns unless the task explicitly requires change.

## 5) Design System Rules (Source Of Truth)

All shared visual tokens must live in app/globals.css and be consumed through Tailwind semantic utility classes.

Do not place one-off style values directly in component files for:

- colors (hex/rgb/hsl)
- spacing scales
- border radius values
- typography sizes/weights

If a new visual value is truly needed:

1. Add it as a token in app/globals.css.
2. Expose/consume it through the existing Tailwind-driven pattern.
3. Reuse the token in components.

## 6) UX And Product Direction

Apply these defaults unless a task says otherwise:

- Primary color intent: teal for key actions and active states.
- Prioritize readability and high contrast.
- Build mobile-first; verify tablet/desktop behavior after.
- Keep flows simple for business owners with limited time and bandwidth.

Core feature expectations:

- Discover: search + practical filters + clear connect/disconnect action states.
- Inbox: visible updates and pending connection request accept/decline actions.
- Profile: business identity, trust indicators, and connected businesses visibility.
- Home: quick actions, relevant opportunities, trusted partner signals.
- Auth: clean sign up/login with Supabase integration.

Connection behavior expectations:

- A connection starts as a pending request from requester to receiver.
- Receiver accepts from Inbox to create an accepted connection.
- Requester can cancel pending outgoing requests.
- Connected parties can disconnect with a confirmation step.
- Connection counts should be computed from accepted connection records, not stale cached fields.

PH-specific product cues to preserve:

- low-connectivity awareness
- verification/trust badges (DTI/SEC or peer trust)
- barter/trade friendliness
- localized filtering by area and need

## 7) Accessibility And Responsiveness Baseline

Every UI change should:

1. Maintain sufficient contrast.
2. Keep keyboard focus visible.
3. Avoid text that becomes unreadable on small screens.
4. Avoid layouts that only work at desktop widths.

## 8) Agent Workflow (Required)

Follow this sequence for implementation tasks:

1. Inspect the target route/component and nearby reusable patterns before editing.
2. If route behavior or navigation changes, update `lib/constants/routes.ts` and relevant navigation components.
3. Implement the smallest correct change.
4. If schema or RLS changes are needed, add a new numbered migration in supabase/migrations (never rewrite an applied migration).
5. Keep new assets organized under public/.
6. Run npm run lint.
7. Report results: what changed, why, and verification status.

If lint/build fails:

1. Fix issues introduced by your change.
2. Re-run checks.
3. Document any remaining blockers clearly.

## 9) What To Avoid

- Introducing new UI libraries for simple UI/layout needs.
- Converting server components to client components without a real requirement.
- Leaving temporary external asset URLs when local assets can be stored in public/.
- Shipping desktop-only positioning that breaks on mobile.
- Mixing unrelated refactors into a task-focused change.

## 10) Definition Of Done For Agent Tasks

A task is done only when all are true:

1. Requested behavior is implemented.
2. Code follows token and architecture rules above.
3. Lint passes.
4. Final report includes changed files and verification outcomes.

## 11) Recommended Final Report Template

Use this concise structure when handing work back:

1. Summary of implemented change.
2. Files changed.
3. Verification results:
   - npm run lint
4. Any follow-up notes or tradeoffs.
