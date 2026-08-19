create table if not exists public.course_forum_threads (
  id bigserial primary key,
  course_id bigint not null references public.courses(id) on delete cascade,
  title text not null,
  body text not null,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_role text not null check (author_role in ('docente', 'alumno')),
  status text not null default 'abierto' check (status in ('abierto', 'cerrado')),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_forum_posts (
  id bigserial primary key,
  thread_id bigint not null references public.course_forum_threads(id) on delete cascade,
  body text not null,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_role text not null check (author_role in ('docente', 'alumno')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_forum_threads_course_id_idx on public.course_forum_threads(course_id);
create index if not exists course_forum_threads_updated_at_idx on public.course_forum_threads(updated_at desc);
create index if not exists course_forum_posts_thread_id_idx on public.course_forum_posts(thread_id);

create trigger set_course_forum_threads_updated_at
before update on public.course_forum_threads
for each row execute function public.set_updated_at();

create trigger set_course_forum_posts_updated_at
before update on public.course_forum_posts
for each row execute function public.set_updated_at();
