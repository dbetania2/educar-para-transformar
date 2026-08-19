create extension if not exists pgcrypto;

insert into public.profiles (
  auth_user_id,
  first_name,
  last_name,
  dni,
  email,
  phone,
  is_active
)
select
  ir.auth_user_id,
  split_part(trim(ir.student_full_name), ' ', 1) as first_name,
  case
    when strpos(trim(ir.student_full_name), ' ') > 0
      then trim(substring(trim(ir.student_full_name) from strpos(trim(ir.student_full_name), ' ') + 1))
    else trim(ir.student_full_name)
  end as last_name,
  trim(ir.student_dni) as dni,
  nullif(trim(ir.email), '') as email,
  nullif(trim(ir.contact_phone), '') as phone,
  true
from public.inscription_requests ir
where ir.status = 'aprobada'
on conflict (dni) do update
set
  auth_user_id = coalesce(excluded.auth_user_id, public.profiles.auth_user_id),
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = coalesce(excluded.email, public.profiles.email),
  phone = coalesce(excluded.phone, public.profiles.phone),
  is_active = true,
  updated_at = now();

insert into public.profile_roles (profile_id, role_code)
select p.id, 'alumno'
from public.profiles p
join public.inscription_requests ir
  on ir.student_dni = p.dni
where ir.status = 'aprobada'
on conflict (profile_id, role_code) do nothing;

insert into public.students (profile_id, student_code, current_status, admission_date)
select
  p.id,
  concat('ALU-', trim(ir.student_dni)),
  'activo',
  coalesce(ir.reviewed_at::date, ir.created_at::date)
from public.profiles p
join public.inscription_requests ir
  on ir.student_dni = p.dni
where ir.status = 'aprobada'
on conflict (profile_id) do update
set
  current_status = excluded.current_status,
  admission_date = coalesce(public.students.admission_date, excluded.admission_date),
  updated_at = now();

insert into public.profiles (
  first_name,
  last_name,
  dni,
  email,
  is_active
)
select
  split_part(trim(ir.tutor_full_name), ' ', 1) as first_name,
  case
    when strpos(trim(ir.tutor_full_name), ' ') > 0
      then trim(substring(trim(ir.tutor_full_name) from strpos(trim(ir.tutor_full_name), ' ') + 1))
    else trim(ir.tutor_full_name)
  end as last_name,
  trim(ir.tutor_dni) as dni,
  null,
  true
from public.inscription_requests ir
where ir.status = 'aprobada'
  and ir.responsible_type = 'tutor'
  and ir.tutor_full_name is not null
  and ir.tutor_dni is not null
on conflict (dni) do update
set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  is_active = true,
  updated_at = now();

insert into public.profile_roles (profile_id, role_code)
select p.id, 'tutor'
from public.profiles p
join public.inscription_requests ir
  on ir.tutor_dni = p.dni
where ir.status = 'aprobada'
  and ir.responsible_type = 'tutor'
  and ir.tutor_dni is not null
on conflict (profile_id, role_code) do nothing;

insert into public.student_guardians (
  student_profile_id,
  guardian_profile_id,
  relationship_type,
  is_primary
)
select
  sp.id,
  gp.id,
  'tutor',
  true
from public.inscription_requests ir
join public.profiles sp
  on sp.dni = ir.student_dni
join public.profiles gp
  on gp.dni = ir.tutor_dni
where ir.status = 'aprobada'
  and ir.responsible_type = 'tutor'
  and ir.tutor_dni is not null
on conflict (student_profile_id, guardian_profile_id, relationship_type) do nothing;

insert into public.profiles (
  first_name,
  last_name,
  dni,
  email,
  is_active
)
select
  split_part(trim(guardian_full_name), ' ', 1) as first_name,
  case
    when strpos(trim(guardian_full_name), ' ') > 0
      then trim(substring(trim(guardian_full_name) from strpos(trim(guardian_full_name), ' ') + 1))
    else trim(guardian_full_name)
  end as last_name,
  trim(guardian_dni) as dni,
  null,
  true
from (
  select father_full_name as guardian_full_name, father_dni as guardian_dni
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'

  union all

  select mother_full_name as guardian_full_name, mother_dni as guardian_dni
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'
) as guardians
where guardian_full_name is not null
  and guardian_dni is not null
on conflict (dni) do update
set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  is_active = true,
  updated_at = now();

insert into public.profile_roles (profile_id, role_code)
select p.id, 'tutor'
from public.profiles p
join (
  select father_dni as guardian_dni
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'

  union

  select mother_dni as guardian_dni
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'
) as guardians
  on guardians.guardian_dni = p.dni
where guardians.guardian_dni is not null
on conflict (profile_id, role_code) do nothing;

insert into public.student_guardians (
  student_profile_id,
  guardian_profile_id,
  relationship_type,
  is_primary
)
select
  sp.id,
  gp.id,
  relation_type,
  is_primary
from (
  select student_dni, father_dni as guardian_dni, 'padre'::text as relation_type, false as is_primary
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'
    and father_dni is not null

  union all

  select student_dni, mother_dni as guardian_dni, 'madre'::text as relation_type, true as is_primary
  from public.inscription_requests
  where status = 'aprobada'
    and responsible_type = 'parents'
    and mother_dni is not null
) as links
join public.profiles sp
  on sp.dni = links.student_dni
join public.profiles gp
  on gp.dni = links.guardian_dni
on conflict (student_profile_id, guardian_profile_id, relationship_type) do nothing;

insert into public.subjects (name, code, is_active)
select distinct
  trim(sc.course_name),
  null,
  true
from public.student_courses sc
where trim(sc.course_name) <> ''
on conflict (name) do nothing;

insert into public.academic_terms (name, year, is_active)
select distinct
  coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int)) as name,
  coalesce(
    nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
    extract(year from now())::int
  ) as year,
  true
from public.student_courses sc
on conflict (name, year) do nothing;

insert into public.profiles (
  first_name,
  last_name,
  dni,
  email,
  is_active
)
select distinct
  split_part(trim(sc.teacher_name), ' ', 1) as first_name,
  case
    when strpos(trim(sc.teacher_name), ' ') > 0
      then trim(substring(trim(sc.teacher_name) from strpos(trim(sc.teacher_name), ' ') + 1))
    else trim(sc.teacher_name)
  end as last_name,
  concat('DOCAUTO-', md5(lower(trim(sc.teacher_name)))) as dni,
  null,
  false
from public.student_courses sc
where sc.teacher_name is not null
  and trim(sc.teacher_name) <> ''
on conflict (dni) do nothing;

insert into public.profile_roles (profile_id, role_code)
select p.id, 'docente'
from public.profiles p
where p.dni like 'DOCAUTO-%'
on conflict (profile_id, role_code) do nothing;

insert into public.teachers (profile_id, teacher_code, title, hire_date)
select
  p.id,
  concat('DOC-', upper(substr(md5(p.dni), 1, 8))),
  null,
  null
from public.profiles p
where p.dni like 'DOCAUTO-%'
on conflict (profile_id) do nothing;

insert into public.courses (
  subject_id,
  academic_term_id,
  teacher_profile_id,
  name,
  commission,
  classroom,
  schedule_summary,
  status
)
select distinct
  s.id,
  at.id,
  t.profile_id,
  trim(sc.course_name),
  null,
  nullif(trim(sc.classroom), ''),
  nullif(trim(sc.schedule_summary), ''),
  case
    when sc.status in ('activa', 'completada', 'pausada', 'cancelada') then sc.status
    else 'activa'
  end
from public.student_courses sc
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
left join public.profiles teacher_profile
  on teacher_profile.dni = concat('DOCAUTO-', md5(lower(trim(coalesce(sc.teacher_name, '')))))
left join public.teachers t
  on t.profile_id = teacher_profile.id
where trim(sc.course_name) <> ''
  and not exists (
    select 1
    from public.courses existing
    where existing.subject_id = s.id
      and existing.academic_term_id = at.id
      and existing.name = trim(sc.course_name)
  );

insert into public.course_teachers (course_id, teacher_profile_id, role_in_course)
select distinct
  c.id,
  t.profile_id,
  'titular'
from public.student_courses sc
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
left join public.profiles teacher_profile
  on teacher_profile.dni = concat('DOCAUTO-', md5(lower(trim(coalesce(sc.teacher_name, '')))))
left join public.teachers t
  on t.profile_id = teacher_profile.id
where t.profile_id is not null
on conflict (course_id, teacher_profile_id) do nothing;

insert into public.course_enrollments (
  course_id,
  student_profile_id,
  enrollment_status,
  enrolled_at
)
select distinct
  c.id,
  st.profile_id,
  case
    when sc.status = 'completada' then 'completada'
    when sc.status = 'pausada' then 'pausada'
    else 'activa'
  end,
  sc.created_at
from public.student_courses sc
join public.profiles p
  on p.auth_user_id = sc.auth_user_id
join public.students st
  on st.profile_id = p.id
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
on conflict (course_id, student_profile_id) do update
set
  enrollment_status = excluded.enrollment_status,
  updated_at = now();

insert into public.assessments (
  course_id,
  title,
  description,
  evaluation_type,
  max_score,
  evaluated_at
)
select distinct
  c.id,
  trim(sgr.evaluation_name),
  null,
  null,
  coalesce(sgr.max_grade_value, 10),
  sgr.evaluated_at
from public.student_grade_records sgr
join public.student_courses sc
  on sc.auth_user_id = sgr.auth_user_id
 and sc.course_name = sgr.course_name
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
where trim(sgr.evaluation_name) <> ''
  and not exists (
    select 1
    from public.assessments existing
    where existing.course_id = c.id
      and existing.title = trim(sgr.evaluation_name)
      and coalesce(existing.evaluated_at, date '1900-01-01') = coalesce(sgr.evaluated_at, date '1900-01-01')
      and existing.max_score = coalesce(sgr.max_grade_value, 10)
  );

insert into public.grades (
  assessment_id,
  student_profile_id,
  score,
  approved,
  teacher_comment,
  recorded_at
)
select
  a.id,
  st.profile_id,
  sgr.grade_value,
  sgr.approved,
  sgr.teacher_comment,
  sgr.created_at
from public.student_grade_records sgr
join public.profiles p
  on p.auth_user_id = sgr.auth_user_id
join public.students st
  on st.profile_id = p.id
join public.student_courses sc
  on sc.auth_user_id = sgr.auth_user_id
 and sc.course_name = sgr.course_name
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
join public.assessments a
  on a.course_id = c.id
 and a.title = trim(sgr.evaluation_name)
 and coalesce(a.evaluated_at, date '1900-01-01') = coalesce(sgr.evaluated_at, date '1900-01-01')
 and a.max_score = coalesce(sgr.max_grade_value, 10)
on conflict (assessment_id, student_profile_id) do update
set
  score = excluded.score,
  approved = excluded.approved,
  teacher_comment = excluded.teacher_comment,
  recorded_at = excluded.recorded_at,
  updated_at = now();

insert into public.class_sessions (
  course_id,
  session_date,
  topic,
  created_at
)
select distinct
  c.id,
  sar.class_date,
  null,
  sar.created_at
from public.student_attendance_records sar
join public.student_courses sc
  on sc.auth_user_id = sar.auth_user_id
 and sc.course_name = sar.course_name
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
on conflict (course_id, session_date) do nothing;

insert into public.attendance_records (
  class_session_id,
  student_profile_id,
  status,
  notes,
  recorded_at
)
select
  cs.id,
  st.profile_id,
  sar.status,
  sar.notes,
  sar.created_at
from public.student_attendance_records sar
join public.profiles p
  on p.auth_user_id = sar.auth_user_id
join public.students st
  on st.profile_id = p.id
join public.student_courses sc
  on sc.auth_user_id = sar.auth_user_id
 and sc.course_name = sar.course_name
join public.subjects s
  on s.name = trim(sc.course_name)
join public.academic_terms at
  on at.name = coalesce(nullif(trim(sc.academic_period), ''), concat('Ciclo lectivo ', extract(year from now())::int))
 and at.year = coalesce(
   nullif(substring(sc.academic_period from '([0-9]{4})'), '')::int,
   extract(year from now())::int
 )
join public.courses c
  on c.subject_id = s.id
 and c.academic_term_id = at.id
 and c.name = trim(sc.course_name)
join public.class_sessions cs
  on cs.course_id = c.id
 and cs.session_date = sar.class_date
on conflict (class_session_id, student_profile_id) do update
set
  status = excluded.status,
  notes = excluded.notes,
  recorded_at = excluded.recorded_at,
  updated_at = now();

update public.inscription_requests ir
set
  student_profile_id = p.id,
  resolved_auth_user_id = coalesce(ir.resolved_auth_user_id, ir.auth_user_id),
  resolved_by_profile_id = ir.resolved_by_profile_id
from public.profiles p
where p.dni = ir.student_dni
  and ir.status = 'aprobada';
