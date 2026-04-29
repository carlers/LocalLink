create extension if not exists pgcrypto;

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
create index if not exists inventory_items_profile_id_idx on public.inventory_items (profile_id);
create index if not exists business_connections_profile_id_idx on public.business_connections (profile_id);
create index if not exists business_connections_business_id_idx on public.business_connections (business_id);
create index if not exists conversations_profile_id_idx on public.conversations (profile_id);
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists notifications_profile_id_idx on public.notifications (profile_id);

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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
