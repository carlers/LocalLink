create table if not exists public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists connection_requests_unique_pair_idx
  on public.connection_requests (
    least(requester_id, receiver_id),
    greatest(requester_id, receiver_id)
  );

create index if not exists connection_requests_requester_idx on public.connection_requests (requester_id);
create index if not exists connection_requests_receiver_idx on public.connection_requests (receiver_id);
create index if not exists connection_requests_status_idx on public.connection_requests (status);

alter table public.connection_requests enable row level security;

drop policy if exists "Users can read their own connection requests" on public.connection_requests;
create policy "Users can read their own connection requests"
on public.connection_requests
for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = receiver_id);

drop policy if exists "Users can create outgoing connection requests" on public.connection_requests;
create policy "Users can create outgoing connection requests"
on public.connection_requests
for insert
to authenticated
with check (
  auth.uid() = requester_id
  and requester_id <> receiver_id
);

drop policy if exists "Receivers can accept pending requests" on public.connection_requests;
create policy "Receivers can accept pending requests"
on public.connection_requests
for update
to authenticated
using (auth.uid() = receiver_id)
with check (
  auth.uid() = receiver_id
  and status = 'accepted'
);

drop policy if exists "Participants can remove their connection requests" on public.connection_requests;
create policy "Participants can remove their connection requests"
on public.connection_requests
for delete
to authenticated
using (auth.uid() = requester_id or auth.uid() = receiver_id);
