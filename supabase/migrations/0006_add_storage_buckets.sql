-- Provision storage buckets for profile and business images so uploads do not
-- depend on the runtime service role ensure route.

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', true),
  ('business-images', 'business-images', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;

drop policy if exists "Public can view profile images" on storage.objects;
create policy "Public can view profile images"
on storage.objects
for select
using (bucket_id = 'profile-images');

drop policy if exists "Authenticated users can upload profile images" on storage.objects;
create policy "Authenticated users can upload profile images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update profile images" on storage.objects;
create policy "Authenticated users can update profile images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete profile images" on storage.objects;
create policy "Authenticated users can delete profile images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Public can view business images" on storage.objects;
create policy "Public can view business images"
on storage.objects
for select
using (bucket_id = 'business-images');

drop policy if exists "Authenticated users can upload business images" on storage.objects;
create policy "Authenticated users can upload business images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can update business images" on storage.objects;
create policy "Authenticated users can update business images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Authenticated users can delete business images" on storage.objects;
create policy "Authenticated users can delete business images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'business-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
