create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id bigserial primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.inscription_requests (
  id bigserial primary key,
  auth_user_id uuid null references auth.users (id) on delete set null,
  student_full_name text not null,
  student_dni text not null,
  level text not null,
  responsible_type text not null check (responsible_type in ('tutor', 'parents')),
  tutor_full_name text null,
  tutor_dni text null,
  father_full_name text null,
  father_dni text null,
  mother_full_name text null,
  mother_dni text null,
  contact_phone text not null,
  email text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'en_revision', 'aprobada', 'rechazada')),
  internal_notes text null,
  reviewed_at timestamptz null,
  reviewed_by text null,
  created_at timestamptz not null default now()
);

alter table public.inscription_requests
  add column if not exists auth_user_id uuid null references auth.users (id) on delete set null,
  add column if not exists status text not null default 'pendiente',
  add column if not exists internal_notes text null,
  add column if not exists reviewed_at timestamptz null,
  add column if not exists reviewed_by text null,
  add column if not exists created_at timestamptz not null default now();

alter table public.inscription_requests
  drop constraint if exists inscription_requests_status_check;

alter table public.inscription_requests
  add constraint inscription_requests_status_check
  check (status in ('pendiente', 'en_revision', 'aprobada', 'rechazada'));

create unique index if not exists inscription_requests_auth_user_id_key
  on public.inscription_requests (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists inscription_requests_email_key
  on public.inscription_requests (email);

create unique index if not exists inscription_requests_student_dni_key
  on public.inscription_requests (student_dni);

create index if not exists inscription_requests_status_idx
  on public.inscription_requests (status);

create index if not exists inscription_requests_created_at_idx
  on public.inscription_requests (created_at desc);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);
