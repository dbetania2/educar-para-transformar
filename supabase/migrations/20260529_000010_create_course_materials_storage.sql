insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Course materials are publicly readable" on storage.objects;

create policy "Course materials are publicly readable"
on storage.objects
for select
using (bucket_id = 'course-materials');
