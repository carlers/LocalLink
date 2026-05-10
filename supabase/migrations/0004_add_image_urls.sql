-- Add image URL columns to support profile pictures and business photos
-- These columns store the public URLs generated from Supabase Storage

-- Add profile_image_url to profiles table
alter table if exists public.profiles
  add column if not exists profile_image_url text;

-- Add image_url to businesses table for business photos
alter table if exists public.businesses
  add column if not exists image_url text;

-- Index image URLs for optional future queries
create index if not exists profiles_profile_image_url_idx on public.profiles (profile_image_url);
create index if not exists businesses_image_url_idx on public.businesses (image_url);

-- Notes for Storage setup:
-- Buckets and object policies are provisioned in 0006_add_storage_buckets.sql.
-- The runtime ensure route is only a fallback for older environments.
--
-- RLS Policy for profile-images bucket:
--   authenticated users can upload/delete only files in their own user_id path
--
-- RLS Policy for business-images bucket:
--   authenticated users can upload/delete only files in their own user_id path
