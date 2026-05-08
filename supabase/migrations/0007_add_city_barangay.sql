-- 0007_add_city_barangay.sql
-- Add city and barangay columns to profiles and businesses and update onboarding trigger

alter table if exists public.profiles
  add column if not exists city text;

alter table if exists public.profiles
  add column if not exists barangay text;

alter table if exists public.businesses
  add column if not exists city text;

alter table if exists public.businesses
  add column if not exists barangay text;

-- Indexes for quick filtering
create index if not exists businesses_city_idx on public.businesses (city);
create index if not exists businesses_barangay_idx on public.businesses (barangay);
create index if not exists profiles_city_idx on public.profiles (city);

-- Update handle_new_user to populate city and barangay from auth metadata when present
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, owner_name, business_name, location, city, barangay)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'business_name', ''),
    coalesce(new.raw_user_meta_data ->> 'location', ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'city', ''), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'barangay', ''), '')
  )
  on conflict (id) do update
    set owner_name = excluded.owner_name,
        business_name = excluded.business_name,
        location = excluded.location,
        city = excluded.city,
        barangay = excluded.barangay,
        updated_at = now();

  insert into public.businesses (
    owner_id,
    name,
    location,
    city,
    barangay,
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
    nullif(coalesce(new.raw_user_meta_data ->> 'city', ''), ''),
    nullif(coalesce(new.raw_user_meta_data ->> 'barangay', ''), ''),
    coalesce((new.raw_user_meta_data ->> 'business_category')::public.business_category, 'Other'::public.business_category),
    coalesce((new.raw_user_meta_data ->> 'business_is_dti_registered')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'business_is_barter_friendly')::boolean, false),
    coalesce((new.raw_user_meta_data ->> 'business_has_urgent_need')::boolean, false),
    coalesce(nullif(btrim(coalesce(new.raw_user_meta_data ->> 'short_description', '')), ''), 'New business on LocalLink.')
  )
  on conflict (owner_id) do update
    set name = excluded.name,
        location = excluded.location,
        city = excluded.city,
        barangay = excluded.barangay,
        category = excluded.category,
        is_dti_registered = excluded.is_dti_registered,
        is_barter_friendly = excluded.is_barter_friendly,
        has_urgent_need = excluded.has_urgent_need,
        short_description = excluded.short_description;

  return new;
end;
$$;
