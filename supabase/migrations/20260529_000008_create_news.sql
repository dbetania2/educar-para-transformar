create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description_html text not null,
  image_url text null,
  file_url text null,
  file_name text null,
  file_type text null,
  is_published boolean not null default true,
  created_by uuid null references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_title_check check (char_length(trim(title)) >= 3),
  constraint news_description_html_check check (char_length(trim(description_html)) >= 1),
  constraint news_file_type_check check (file_type is null or file_type = 'image')
);

drop trigger if exists set_news_updated_at on public.news;

create trigger set_news_updated_at
before update on public.news
for each row
execute function public.set_updated_at();

create index if not exists news_created_at_idx
  on public.news (created_at desc);

create index if not exists news_is_published_created_at_idx
  on public.news (is_published, created_at desc);

insert into storage.buckets (id, name, public)
values ('news-assets', 'news-assets', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "News assets are publicly readable" on storage.objects;

create policy "News assets are publicly readable"
on storage.objects
for select
using (bucket_id = 'news-assets');
