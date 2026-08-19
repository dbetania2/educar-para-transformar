create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid null unique references auth.users (id) on delete set null,
  first_name text not null,
  last_name text not null,
  dni text not null unique,
  email text null,
  phone text null,
  birth_date date null,
  address text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_check check (email is null or email ~* '^[^@]+@[^@]+\\.[^@]+$'),
  constraint profiles_dni_check check (char_length(trim(dni)) >= 7)
);

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create table if not exists public.app_roles (
  code text primary key,
  label text not null unique,
  created_at timestamptz not null default now()
);

insert into public.app_roles (code, label)
values
  ('admin', 'Administrador'),
  ('alumno', 'Alumno'),
  ('docente', 'Docente'),
  ('tutor', 'Tutor'),
  ('preceptor', 'Preceptor'),
  ('administrativo', 'Administrativo')
on conflict (code) do update
set label = excluded.label;

create table if not exists public.profile_roles (
  id bigserial primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_code text not null references public.app_roles (code) on delete restrict,
  created_at timestamptz not null default now(),
  unique (profile_id, role_code)
);

create table if not exists public.students (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  student_code text not null unique,
  current_status text not null default 'activo',
  admission_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint students_current_status_check
    check (current_status in ('activo', 'egresado', 'baja', 'suspendido', 'pendiente'))
);

drop trigger if exists set_students_updated_at on public.students;

create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create table if not exists public.teachers (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  teacher_code text null unique,
  title text null,
  hire_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_teachers_updated_at on public.teachers;

create trigger set_teachers_updated_at
before update on public.teachers
for each row
execute function public.set_updated_at();

create table if not exists public.student_guardians (
  id bigserial primary key,
  student_profile_id uuid not null references public.students (profile_id) on delete cascade,
  guardian_profile_id uuid not null references public.profiles (id) on delete cascade,
  relationship_type text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (student_profile_id, guardian_profile_id, relationship_type),
  constraint student_guardians_relationship_type_check
    check (relationship_type in ('tutor', 'madre', 'padre', 'responsable', 'otro'))
);

create table if not exists public.subjects (
  id bigserial primary key,
  name text not null unique,
  code text null unique,
  description text null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_subjects_updated_at on public.subjects;

create trigger set_subjects_updated_at
before update on public.subjects
for each row
execute function public.set_updated_at();

create table if not exists public.academic_terms (
  id bigserial primary key,
  name text not null,
  year integer not null,
  starts_on date null,
  ends_on date null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, year),
  constraint academic_terms_year_check check (year between 2000 and 2100),
  constraint academic_terms_date_range_check check (
    starts_on is null or ends_on is null or starts_on <= ends_on
  )
);

drop trigger if exists set_academic_terms_updated_at on public.academic_terms;

create trigger set_academic_terms_updated_at
before update on public.academic_terms
for each row
execute function public.set_updated_at();

create table if not exists public.courses (
  id bigserial primary key,
  subject_id bigint not null references public.subjects (id) on delete restrict,
  academic_term_id bigint not null references public.academic_terms (id) on delete restrict,
  teacher_profile_id uuid null references public.teachers (profile_id) on delete set null,
  name text not null,
  commission text null,
  classroom text null,
  schedule_summary text null,
  status text not null default 'activa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint courses_status_check
    check (status in ('activa', 'completada', 'pausada', 'cancelada'))
);

drop trigger if exists set_courses_updated_at on public.courses;

create trigger set_courses_updated_at
before update on public.courses
for each row
execute function public.set_updated_at();

create table if not exists public.course_teachers (
  id bigserial primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  teacher_profile_id uuid not null references public.teachers (profile_id) on delete cascade,
  role_in_course text null,
  created_at timestamptz not null default now(),
  unique (course_id, teacher_profile_id)
);

create table if not exists public.course_enrollments (
  id bigserial primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  student_profile_id uuid not null references public.students (profile_id) on delete cascade,
  enrollment_status text not null default 'activa',
  enrolled_at timestamptz not null default now(),
  withdrawn_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_profile_id),
  constraint course_enrollments_status_check
    check (enrollment_status in ('activa', 'completada', 'retirada', 'pausada')),
  constraint course_enrollments_dates_check
    check (withdrawn_at is null or withdrawn_at >= enrolled_at)
);

drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;

create trigger set_course_enrollments_updated_at
before update on public.course_enrollments
for each row
execute function public.set_updated_at();

create table if not exists public.assessments (
  id bigserial primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  title text not null,
  description text null,
  evaluation_type text null,
  max_score numeric(5,2) not null default 10,
  evaluated_at date null,
  created_by uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessments_max_score_check check (max_score > 0)
);

drop trigger if exists set_assessments_updated_at on public.assessments;

create trigger set_assessments_updated_at
before update on public.assessments
for each row
execute function public.set_updated_at();

create table if not exists public.grades (
  id bigserial primary key,
  assessment_id bigint not null references public.assessments (id) on delete cascade,
  student_profile_id uuid not null references public.students (profile_id) on delete cascade,
  score numeric(5,2) null,
  approved boolean null,
  teacher_comment text null,
  recorded_by uuid null references public.profiles (id) on delete set null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, student_profile_id),
  constraint grades_score_check check (score is null or score >= 0)
);

drop trigger if exists set_grades_updated_at on public.grades;

create trigger set_grades_updated_at
before update on public.grades
for each row
execute function public.set_updated_at();

create table if not exists public.class_sessions (
  id bigserial primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  session_date date not null,
  topic text null,
  created_by uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, session_date)
);

drop trigger if exists set_class_sessions_updated_at on public.class_sessions;

create trigger set_class_sessions_updated_at
before update on public.class_sessions
for each row
execute function public.set_updated_at();

create table if not exists public.attendance_records (
  id bigserial primary key,
  class_session_id bigint not null references public.class_sessions (id) on delete cascade,
  student_profile_id uuid not null references public.students (profile_id) on delete cascade,
  status text not null,
  notes text null,
  recorded_by uuid null references public.profiles (id) on delete set null,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_session_id, student_profile_id),
  constraint attendance_records_status_check
    check (status in ('presente', 'ausente', 'justificada', 'tarde'))
);

drop trigger if exists set_attendance_records_updated_at on public.attendance_records;

create trigger set_attendance_records_updated_at
before update on public.attendance_records
for each row
execute function public.set_updated_at();

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_profile_id uuid null references public.profiles (id) on delete set null,
  entity_name text not null,
  entity_id text not null,
  action text not null,
  old_data jsonb null,
  new_data jsonb null,
  created_at timestamptz not null default now()
);

alter table public.inscription_requests
  add column if not exists student_profile_id uuid null references public.students (profile_id) on delete set null,
  add column if not exists resolved_auth_user_id uuid null references auth.users (id) on delete set null,
  add column if not exists resolved_by_profile_id uuid null references public.profiles (id) on delete set null;

create index if not exists profiles_auth_user_id_idx
  on public.profiles (auth_user_id);

create index if not exists profiles_last_name_first_name_idx
  on public.profiles (last_name, first_name);

create index if not exists profiles_email_idx
  on public.profiles (email);

create index if not exists profile_roles_role_code_idx
  on public.profile_roles (role_code);

create index if not exists student_guardians_student_profile_id_idx
  on public.student_guardians (student_profile_id);

create index if not exists student_guardians_guardian_profile_id_idx
  on public.student_guardians (guardian_profile_id);

create index if not exists subjects_name_idx
  on public.subjects (name);

create index if not exists academic_terms_year_idx
  on public.academic_terms (year);

create index if not exists courses_subject_id_idx
  on public.courses (subject_id);

create index if not exists courses_academic_term_id_idx
  on public.courses (academic_term_id);

create index if not exists courses_teacher_profile_id_idx
  on public.courses (teacher_profile_id);

create index if not exists course_teachers_teacher_profile_id_idx
  on public.course_teachers (teacher_profile_id);

create index if not exists course_enrollments_student_profile_id_idx
  on public.course_enrollments (student_profile_id);

create index if not exists course_enrollments_course_id_idx
  on public.course_enrollments (course_id);

create index if not exists assessments_course_id_idx
  on public.assessments (course_id);

create index if not exists assessments_evaluated_at_idx
  on public.assessments (evaluated_at desc);

create index if not exists grades_student_profile_id_idx
  on public.grades (student_profile_id);

create index if not exists class_sessions_course_id_idx
  on public.class_sessions (course_id);

create index if not exists class_sessions_session_date_idx
  on public.class_sessions (session_date desc);

create index if not exists attendance_records_student_profile_id_idx
  on public.attendance_records (student_profile_id);

create index if not exists audit_logs_actor_profile_id_idx
  on public.audit_logs (actor_profile_id);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_name, entity_id);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists inscription_requests_student_profile_id_idx
  on public.inscription_requests (student_profile_id);

create index if not exists inscription_requests_resolved_auth_user_id_idx
  on public.inscription_requests (resolved_auth_user_id);

create index if not exists inscription_requests_resolved_by_profile_id_idx
  on public.inscription_requests (resolved_by_profile_id);
