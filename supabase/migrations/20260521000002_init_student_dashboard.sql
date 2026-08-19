create table if not exists public.student_courses (
  id bigserial primary key,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null,
  teacher_name text null,
  academic_period text null,
  schedule_summary text null,
  classroom text null,
  status text not null default 'activa' check (status in ('activa', 'completada', 'pausada')),
  created_at timestamptz not null default now()
);

create table if not exists public.student_grade_records (
  id bigserial primary key,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null,
  evaluation_name text not null,
  grade_value numeric(5,2) null,
  max_grade_value numeric(5,2) null default 10,
  approved boolean null,
  teacher_comment text null,
  evaluated_at date null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_attendance_records (
  id bigserial primary key,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  course_name text not null,
  class_date date not null,
  status text not null default 'presente' check (status in ('presente', 'ausente', 'justificada', 'tarde')),
  notes text null,
  created_at timestamptz not null default now()
);

create index if not exists student_courses_auth_user_id_idx
  on public.student_courses (auth_user_id);

create index if not exists student_grade_records_auth_user_id_idx
  on public.student_grade_records (auth_user_id);

create index if not exists student_grade_records_evaluated_at_idx
  on public.student_grade_records (evaluated_at desc);

create index if not exists student_attendance_records_auth_user_id_idx
  on public.student_attendance_records (auth_user_id);

create index if not exists student_attendance_records_class_date_idx
  on public.student_attendance_records (class_date desc);
