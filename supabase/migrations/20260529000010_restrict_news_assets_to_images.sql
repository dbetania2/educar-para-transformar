alter table public.news
  drop constraint if exists news_file_type_check;

alter table public.news
  add constraint news_file_type_check
  check (file_type is null or file_type = 'image');
