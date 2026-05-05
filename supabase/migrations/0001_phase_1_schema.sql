create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  create type public.business_category as enum (
    'Retail',
    'Food',
    'Services',
    'Manufacturing',
    'Other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.inventory_item_kind as enum (
    'available',
    'needed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  category public.business_category not null,
  is_dti_registered boolean not null default false,
  is_barter_friendly boolean not null default false,
  has_urgent_need boolean not null default false,
  short_description text not null,
  created_at timestamptz not null default now()
);

alter table if exists public.businesses
  add column if not exists owner_id uuid references auth.users (id) on delete cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  owner_name text not null,
  business_name text not null,
  location text not null,
  trust_score integer not null default 0 check (trust_score between 0 and 100),
  connections integer not null default 0 check (connections >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  quantity text not null,
  kind public.inventory_item_kind not null,
  created_at timestamptz not null default now()
);

create table if not exists public.business_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  status text not null default 'trusted' check (status in ('trusted', 'pending', 'blocked')),
  created_at timestamptz not null default now(),
  unique (profile_id, business_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  partner_name text not null,
  last_message_preview text,
  last_message_at timestamptz,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_name text not null,
  preview text not null,
  sent_at timestamptz not null default now(),
  is_unread boolean not null default true
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  detail text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create index if not exists businesses_location_idx on public.businesses (location);
create index if not exists businesses_category_idx on public.businesses (category);
create unique index if not exists businesses_owner_id_key on public.businesses (owner_id);
create index if not exists businesses_created_at_idx on public.businesses (created_at desc);
create index if not exists businesses_name_trgm_idx on public.businesses using gin (name gin_trgm_ops);
create index if not exists businesses_location_trgm_idx on public.businesses using gin (location gin_trgm_ops);
create index if not exists inventory_items_profile_id_idx on public.inventory_items (profile_id);
create index if not exists business_connections_profile_id_idx on public.business_connections (profile_id);
create index if not exists business_connections_business_id_idx on public.business_connections (business_id);
create index if not exists conversations_profile_id_idx on public.conversations (profile_id);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists notifications_profile_id_idx on public.notifications (profile_id);

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public can read businesses" on public.businesses;
create policy "Public can read businesses"
on public.businesses
for select
using (true);

drop policy if exists "Authenticated users can insert businesses" on public.businesses;
create policy "Authenticated users can insert businesses"
on public.businesses
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Owners can update businesses" on public.businesses;
create policy "Owners can update businesses"
on public.businesses
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "Owners can read profiles" on public.profiles;
create policy "Owners can read profiles"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Owners can update profiles" on public.profiles;
create policy "Owners can update profiles"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, owner_name, business_name, location)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'business_name', ''),
    coalesce(new.raw_user_meta_data ->> 'location', '')
  )
  on conflict (id) do update
    set owner_name = excluded.owner_name,
        business_name = excluded.business_name,
        location = excluded.location,
        updated_at = now();

  insert into public.businesses (
    owner_id,
    name,
    location,
    category,
    is_dti_registered,
    is_barter_friendly,
    has_urgent_need,
    short_description
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'business_name', ''),
    coalesce(new.raw_user_meta_data ->> 'location', ''),
    coalesce((new.raw_user_meta_data ->> 'business_category')::public.business_category, 'Other'::public.business_category),
    coalesce((new.raw_user_meta_data ->> 'business_is_dti_registered')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'business_is_barter_friendly')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'business_has_urgent_need')::boolean, false),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'short_description', '')), ''), 'New business on LocalLink.')
  )
  on conflict (owner_id) do update
    set name = excluded.name,
        location = excluded.location,
        category = excluded.category,
        is_dti_registered = excluded.is_dti_registered,
        is_barter_friendly = excluded.is_barter_friendly,
        has_urgent_need = excluded.has_urgent_need,
        short_description = excluded.short_description;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
