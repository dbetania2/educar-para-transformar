create table if not exists public.course_materials (
  id bigserial primary key,
  course_id bigint not null references public.courses (id) on delete cascade,
  title text not null,
  description text null,
  resource_url text null,
  material_type text null,
  created_by uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_course_materials_updated_at on public.course_materials;

create trigger set_course_materials_updated_at
before update on public.course_materials
for each row
execute function public.set_updated_at();

create index if not exists course_materials_course_id_idx
  on public.course_materials (course_id);
