insert into public.app_roles (code, label)
values ('no_docente', 'No docente')
on conflict (code) do update
set label = excluded.label;

create table if not exists public.administrative_tasks (
  id bigserial primary key,
  title text not null,
  description text null,
  category text not null default 'otro',
  status text not null default 'pendiente',
  priority text not null default 'media',
  due_date date null,
  related_inscription_request_id bigint null references public.inscription_requests (id) on delete set null,
  related_student_profile_id uuid null references public.students (profile_id) on delete set null,
  assigned_profile_id uuid null references public.profiles (id) on delete set null,
  created_by_profile_id uuid null references public.profiles (id) on delete set null,
  resolved_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint administrative_tasks_category_check
    check (category in ('solicitud', 'legajo', 'asistencia', 'comunicacion', 'soporte', 'otro')),
  constraint administrative_tasks_status_check
    check (status in ('pendiente', 'en_proceso', 'resuelta', 'cancelada')),
  constraint administrative_tasks_priority_check
    check (priority in ('baja', 'media', 'alta')),
  constraint administrative_tasks_resolved_at_check
    check (resolved_at is null or status in ('resuelta', 'cancelada'))
);

drop trigger if exists set_administrative_tasks_updated_at on public.administrative_tasks;

create trigger set_administrative_tasks_updated_at
before update on public.administrative_tasks
for each row
execute function public.set_updated_at();

create index if not exists administrative_tasks_status_idx
  on public.administrative_tasks (status);

create index if not exists administrative_tasks_priority_idx
  on public.administrative_tasks (priority);

create index if not exists administrative_tasks_due_date_idx
  on public.administrative_tasks (due_date);

create index if not exists administrative_tasks_assigned_profile_id_idx
  on public.administrative_tasks (assigned_profile_id);

create index if not exists administrative_tasks_related_inscription_request_id_idx
  on public.administrative_tasks (related_inscription_request_id);

create index if not exists administrative_tasks_related_student_profile_id_idx
  on public.administrative_tasks (related_student_profile_id);
