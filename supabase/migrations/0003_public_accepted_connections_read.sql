drop policy if exists "Authenticated users can read accepted connection requests" on public.connection_requests;

create policy "Authenticated users can read accepted connection requests"
on public.connection_requests
for select
to authenticated
using (status = 'accepted');
