-- Seed academico complementario para alumnos/docentes ya creados.
-- Ejecutar en Supabase SQL Editor si Auth/perfiles ya existen pero faltan cursos, materias, notas o asistencias.
-- ATENCION: borra y recrea datos academicos operativos, pero NO borra profiles ni auth.users.

begin;

-- Limpieza academica.
delete from public.course_forum_posts;
delete from public.course_forum_threads;
delete from public.course_materials;
delete from public.attendance_records;
delete from public.class_sessions;
delete from public.grades;
delete from public.assessments;
delete from public.course_enrollments;
delete from public.course_teachers;
delete from public.courses;
delete from public.subjects;
delete from public.academic_terms;

create temp table seed_students as
select
  s.profile_id,
  s.student_code,
  case ((substring(s.student_code from 2)::integer - 1) / 5) + 1
    when 1 then 'INI-S4'
    when 2 then 'INI-S5'
    when 3 then 'PRI-1A'
    when 4 then 'PRI-2A'
    when 5 then 'PRI-3A'
    when 6 then 'PRI-4A'
    when 7 then 'SEC-1A'
    when 8 then 'SEC-2A'
    when 9 then 'SEC-3A'
    else 'SEC-4A'
  end as group_key,
  case ((substring(s.student_code from 2)::integer - 1) / 5) + 1
    when 1 then 'Sala de 4'
    when 2 then 'Sala de 5'
    when 3 then '1° Primaria A'
    when 4 then '2° Primaria A'
    when 5 then '3° Primaria A'
    when 6 then '4° Primaria A'
    when 7 then '1° Secundaria A'
    when 8 then '2° Secundaria A'
    when 9 then '3° Secundaria A'
    else '4° Secundaria A'
  end as group_label,
  case
    when ((substring(s.student_code from 2)::integer - 1) / 5) + 1 <= 2 then 'Inicial'
    when ((substring(s.student_code from 2)::integer - 1) / 5) + 1 <= 6 then 'Primario'
    else 'Secundario'
  end as level_label,
  substring(s.student_code from 2)::integer as ordinal
from public.students s
where s.student_code ~ '^A[0-9]{6}$'
order by s.student_code;

create temp table seed_teachers as
select
  t.profile_id,
  t.teacher_code,
  substring(t.teacher_code from 2)::integer as ordinal
from public.teachers t
where t.teacher_code ~ '^D[0-9]{6}$'
order by t.teacher_code;

create temp table seed_courses (
  course_id bigint primary key,
  group_key text not null,
  group_label text not null,
  level_label text not null,
  subject_name text not null,
  teacher_profile_id uuid not null
) on commit drop;

-- Materias por nivel. No busca ser plan oficial completo; es una base demo consistente.
insert into public.subjects (name, code, description, is_active)
values
  ('Ambiente Natural y Social', 'INI-AMB', 'Exploración del entorno para nivel inicial.', true),
  ('Lenguajes Artísticos', 'INI-ART', 'Expresión plástica, corporal y musical.', true),
  ('Juego y Motricidad', 'INI-MOT', 'Movimiento, juego y coordinación.', true),
  ('Lengua', 'PRI-LEN', 'Prácticas del lenguaje en primaria.', true),
  ('Matemática', 'MAT', 'Matemática por nivel.', true),
  ('Ciencias Naturales', 'CN', 'Ciencias naturales por nivel.', true),
  ('Ciencias Sociales', 'CS', 'Ciencias sociales por nivel.', true),
  ('Inglés', 'ING', 'Lengua extranjera.', true),
  ('Educación Física', 'EFI', 'Educación física.', true),
  ('Lengua y Literatura', 'SEC-LIT', 'Lengua y literatura en secundaria.', true),
  ('Historia', 'HIS', 'Historia secundaria.', true),
  ('Geografía', 'GEO', 'Geografía secundaria.', true),
  ('Biología', 'BIO', 'Biología secundaria.', true),
  ('Física', 'FIS', 'Física secundaria.', true),
  ('Química', 'QUI', 'Química secundaria.', true),
  ('Tecnología', 'TEC', 'Tecnología secundaria.', true)
;

insert into public.academic_terms (name, year, starts_on, ends_on, is_active)
values ('Ciclo lectivo', 2026, date '2026-03-02', date '2026-12-18', true)
;

-- Cursos por grupo y nivel.
with group_subjects(group_key, group_label, level_label, subject_name, slot) as (
  values
    ('INI-S4','Sala de 4','Inicial','Ambiente Natural y Social',1),
    ('INI-S4','Sala de 4','Inicial','Lenguajes Artísticos',2),
    ('INI-S4','Sala de 4','Inicial','Juego y Motricidad',3),
    ('INI-S5','Sala de 5','Inicial','Ambiente Natural y Social',1),
    ('INI-S5','Sala de 5','Inicial','Lenguajes Artísticos',2),
    ('INI-S5','Sala de 5','Inicial','Juego y Motricidad',3),
    ('PRI-1A','1° Primaria A','Primario','Lengua',1),
    ('PRI-1A','1° Primaria A','Primario','Matemática',2),
    ('PRI-1A','1° Primaria A','Primario','Ciencias Naturales',3),
    ('PRI-1A','1° Primaria A','Primario','Ciencias Sociales',4),
    ('PRI-1A','1° Primaria A','Primario','Inglés',5),
    ('PRI-1A','1° Primaria A','Primario','Educación Física',6),
    ('PRI-2A','2° Primaria A','Primario','Lengua',1),
    ('PRI-2A','2° Primaria A','Primario','Matemática',2),
    ('PRI-2A','2° Primaria A','Primario','Ciencias Naturales',3),
    ('PRI-2A','2° Primaria A','Primario','Ciencias Sociales',4),
    ('PRI-2A','2° Primaria A','Primario','Inglés',5),
    ('PRI-2A','2° Primaria A','Primario','Educación Física',6),
    ('PRI-3A','3° Primaria A','Primario','Lengua',1),
    ('PRI-3A','3° Primaria A','Primario','Matemática',2),
    ('PRI-3A','3° Primaria A','Primario','Ciencias Naturales',3),
    ('PRI-3A','3° Primaria A','Primario','Ciencias Sociales',4),
    ('PRI-3A','3° Primaria A','Primario','Inglés',5),
    ('PRI-3A','3° Primaria A','Primario','Educación Física',6),
    ('PRI-4A','4° Primaria A','Primario','Lengua',1),
    ('PRI-4A','4° Primaria A','Primario','Matemática',2),
    ('PRI-4A','4° Primaria A','Primario','Ciencias Naturales',3),
    ('PRI-4A','4° Primaria A','Primario','Ciencias Sociales',4),
    ('PRI-4A','4° Primaria A','Primario','Inglés',5),
    ('PRI-4A','4° Primaria A','Primario','Educación Física',6),
    ('SEC-1A','1° Secundaria A','Secundario','Lengua y Literatura',1),
    ('SEC-1A','1° Secundaria A','Secundario','Matemática',2),
    ('SEC-1A','1° Secundaria A','Secundario','Historia',3),
    ('SEC-1A','1° Secundaria A','Secundario','Geografía',4),
    ('SEC-1A','1° Secundaria A','Secundario','Biología',5),
    ('SEC-1A','1° Secundaria A','Secundario','Inglés',6),
    ('SEC-1A','1° Secundaria A','Secundario','Educación Física',7),
    ('SEC-1A','1° Secundaria A','Secundario','Tecnología',8),
    ('SEC-2A','2° Secundaria A','Secundario','Lengua y Literatura',1),
    ('SEC-2A','2° Secundaria A','Secundario','Matemática',2),
    ('SEC-2A','2° Secundaria A','Secundario','Historia',3),
    ('SEC-2A','2° Secundaria A','Secundario','Geografía',4),
    ('SEC-2A','2° Secundaria A','Secundario','Biología',5),
    ('SEC-2A','2° Secundaria A','Secundario','Inglés',6),
    ('SEC-2A','2° Secundaria A','Secundario','Educación Física',7),
    ('SEC-2A','2° Secundaria A','Secundario','Tecnología',8),
    ('SEC-3A','3° Secundaria A','Secundario','Lengua y Literatura',1),
    ('SEC-3A','3° Secundaria A','Secundario','Matemática',2),
    ('SEC-3A','3° Secundaria A','Secundario','Historia',3),
    ('SEC-3A','3° Secundaria A','Secundario','Geografía',4),
    ('SEC-3A','3° Secundaria A','Secundario','Física',5),
    ('SEC-3A','3° Secundaria A','Secundario','Química',6),
    ('SEC-3A','3° Secundaria A','Secundario','Inglés',7),
    ('SEC-3A','3° Secundaria A','Secundario','Tecnología',8),
    ('SEC-4A','4° Secundaria A','Secundario','Lengua y Literatura',1),
    ('SEC-4A','4° Secundaria A','Secundario','Matemática',2),
    ('SEC-4A','4° Secundaria A','Secundario','Historia',3),
    ('SEC-4A','4° Secundaria A','Secundario','Geografía',4),
    ('SEC-4A','4° Secundaria A','Secundario','Física',5),
    ('SEC-4A','4° Secundaria A','Secundario','Química',6),
    ('SEC-4A','4° Secundaria A','Secundario','Inglés',7),
    ('SEC-4A','4° Secundaria A','Secundario','Tecnología',8)
), numbered as (
  select gs.*, row_number() over (order by group_key, slot) as rn
  from group_subjects gs
), inserted_courses as (
  insert into public.courses (subject_id, academic_term_id, teacher_profile_id, name, commission, classroom, schedule_summary, status)
  select
    s.id,
    at.id,
    t.profile_id,
    n.subject_name || ' - ' || n.group_label,
    n.group_key,
    'Aula ' || (((n.rn - 1) % 12) + 1),
    case ((n.rn - 1) % 5)
      when 0 then 'Lunes 08:00 a 09:20'
      when 1 then 'Martes 09:30 a 10:50'
      when 2 then 'Miércoles 11:00 a 12:20'
      when 3 then 'Jueves 13:30 a 14:50'
      else 'Viernes 15:00 a 16:20'
    end,
    'activa'
  from numbered n
  join public.subjects s on s.name = n.subject_name
  join public.academic_terms at on at.name = 'Ciclo lectivo' and at.year = 2026
  join seed_teachers t on t.ordinal = (((n.rn - 1) % 10) + 1)
  returning id, name, commission, teacher_profile_id
)
insert into seed_courses (course_id, group_key, group_label, level_label, subject_name, teacher_profile_id)
select ic.id, n.group_key, n.group_label, n.level_label, n.subject_name, ic.teacher_profile_id
from inserted_courses ic
join numbered n on ic.name = n.subject_name || ' - ' || n.group_label;

insert into public.course_teachers (course_id, teacher_profile_id, role_in_course)
select course_id, teacher_profile_id, 'Titular'
from seed_courses;

insert into public.course_enrollments (course_id, student_profile_id, enrollment_status, enrolled_at)
select c.course_id, s.profile_id, 'activa', timestamptz '2026-03-02 08:00:00-03'
from seed_courses c
join seed_students s on s.group_key = c.group_key;

-- Evaluaciones y notas.
with assessment_seed as (
  select course_id, teacher_profile_id, 'Diagnóstico' as title, 'evaluacion' as evaluation_type, date '2026-04-10' as evaluated_at, 1 as idx
  from seed_courses
  union all
  select course_id, teacher_profile_id, 'Trabajo práctico 1', 'trabajo_practico', date '2026-05-20', 2
  from seed_courses
), inserted_assessments as (
  insert into public.assessments (course_id, title, description, evaluation_type, max_score, evaluated_at, created_by)
  select course_id, title, 'Evaluación seed para datos de prueba.', evaluation_type, 10, evaluated_at, teacher_profile_id
  from assessment_seed
  returning id, course_id, title, created_by
)
insert into public.grades (assessment_id, student_profile_id, score, approved, teacher_comment, recorded_by)
select
  a.id,
  ce.student_profile_id,
  greatest(4, least(10, 5 + ((abs(hashtext(ce.student_profile_id::text || '-' || a.id::text)) % 6))))::numeric(5,2),
  (5 + ((abs(hashtext(ce.student_profile_id::text || '-' || a.id::text)) % 6))) >= 6,
  case when (abs(hashtext(ce.student_profile_id::text || '-' || a.id::text)) % 5) = 0 then 'Reforzar contenidos clave.' else 'Buen desempeño general.' end,
  a.created_by
from inserted_assessments a
join public.course_enrollments ce on ce.course_id = a.course_id
;

-- Clases y asistencias: 4 clases por curso.
with session_seed as (
  select course_id, teacher_profile_id, date '2026-05-06' as session_date, 'Presentación de unidad' as topic from seed_courses
  union all select course_id, teacher_profile_id, date '2026-05-13', 'Práctica guiada' from seed_courses
  union all select course_id, teacher_profile_id, date '2026-05-20', 'Actividad integradora' from seed_courses
  union all select course_id, teacher_profile_id, date '2026-05-27', 'Revisión y cierre' from seed_courses
), inserted_sessions as (
  insert into public.class_sessions (course_id, session_date, topic, created_by)
  select course_id, session_date, topic, teacher_profile_id
  from session_seed
  returning id, course_id, session_date, created_by
)
insert into public.attendance_records (class_session_id, student_profile_id, status, notes, recorded_by)
select
  cs.id,
  ce.student_profile_id,
  case (abs(hashtext(cs.id::text || '-' || ce.student_profile_id::text)) % 12)
    when 0 then 'ausente'
    when 1 then 'justificada'
    when 2 then 'tarde'
    else 'presente'
  end,
  case (abs(hashtext(cs.id::text || '-' || ce.student_profile_id::text)) % 12)
    when 0 then 'Ausencia sin justificar.'
    when 1 then 'Justificación familiar registrada.'
    when 2 then 'Llegó tarde al inicio de clase.'
    else null
  end,
  cs.created_by
from inserted_sessions cs
join public.course_enrollments ce on ce.course_id = cs.course_id
;

-- Materiales por curso.
insert into public.course_materials (course_id, title, description, resource_url, material_type, created_by)
select
  course_id,
  'Guía inicial - ' || subject_name,
  '<p>Material de lectura y actividades para iniciar el seguimiento del curso.</p>',
  'https://example.com/materiales/' || course_id,
  'Guía',
  teacher_profile_id
from seed_courses;

-- Foro básico por curso.
with inserted_threads as (
  insert into public.course_forum_threads (course_id, title, body, author_profile_id, author_role, pinned)
  select course_id, 'Bienvenida al curso', 'Espacio de consultas y avisos del curso.', teacher_profile_id, 'docente', true
  from seed_courses
  returning id, author_profile_id
)
insert into public.course_forum_posts (thread_id, body, author_profile_id, author_role)
select id, 'Primer mensaje de bienvenida. Pueden dejar consultas generales en este hilo.', author_profile_id, 'docente'
from inserted_threads;

commit;

select * from (
  values
    ('subjects', (select count(*)::integer from public.subjects)),
    ('courses', (select count(*)::integer from public.courses)),
    ('course_teachers', (select count(*)::integer from public.course_teachers)),
    ('course_enrollments', (select count(*)::integer from public.course_enrollments)),
    ('assessments', (select count(*)::integer from public.assessments)),
    ('grades', (select count(*)::integer from public.grades)),
    ('class_sessions', (select count(*)::integer from public.class_sessions)),
    ('attendance_records', (select count(*)::integer from public.attendance_records)),
    ('course_materials', (select count(*)::integer from public.course_materials)),
    ('course_forum_threads', (select count(*)::integer from public.course_forum_threads))
) as seed_counts(table_name, rows_created);
