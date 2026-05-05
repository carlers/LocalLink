-- Add Row Level Security for inventory items
-- Allow public reads and owner-only writes

alter table public.inventory_items enable row level security;

-- Public read access to inventory items
create policy "Public can read inventory items"
  on public.inventory_items
  for select
  using (true);

-- Owner can insert inventory items for their profile
create policy "Owners can insert inventory items"
  on public.inventory_items
  for insert
  to authenticated
  with check (
    auth.uid() = profile_id
  );

-- Owner can update their own inventory items
create policy "Owners can update inventory items"
  on public.inventory_items
  for update
  to authenticated
  using (
    auth.uid() = profile_id
  )
  with check (
    auth.uid() = profile_id
  );

-- Owner can delete their own inventory items
create policy "Owners can delete inventory items"
  on public.inventory_items
  for delete
  to authenticated
  using (
    auth.uid() = profile_id
  );
