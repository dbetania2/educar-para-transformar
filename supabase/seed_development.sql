-- Seed de desarrollo para EducAR para Transformar.
-- Ejecutar manualmente en Supabase SQL Editor.
-- ATENCION: borra datos operativos/publicos y conserva perfiles con rol admin/administrativo.
-- No borra filas de auth.users; los alumnos/docentes seed NO son usuarios de login.

begin;

create extension if not exists pgcrypto;

-- Roles base.
insert into public.app_roles (code, label)
values
  ('admin', 'Administrador'),
  ('alumno', 'Alumno'),
  ('docente', 'Docente'),
  ('tutor', 'Tutor'),
  ('preceptor', 'Preceptor'),
  ('administrativo', 'Administrativo'),
  ('no_docente', 'No docente')
on conflict (code) do update set label = excluded.label;

create temp table seed_admin_profiles as
select distinct p.id
from public.profiles p
left join public.profile_roles pr on pr.profile_id = p.id
left join auth.users au on au.id = p.auth_user_id
where pr.role_code in ('admin', 'administrativo')
   or au.raw_app_meta_data ->> 'role' in ('admin', 'administrativo')
   or au.raw_user_meta_data ->> 'role' in ('admin', 'administrativo');

-- Limpieza operativa. Se preservan perfiles admin/administrativo y sus roles.
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
delete from public.student_guardians;
delete from public.students;
delete from public.teachers;
delete from public.subjects;
delete from public.academic_terms;
delete from public.audit_logs;
delete from public.administrative_tasks;
delete from public.contact_messages;
delete from public.inscription_requests;
delete from public.profile_roles
where profile_id not in (select id from seed_admin_profiles);
delete from public.profiles
where id not in (select id from seed_admin_profiles);

-- Tablas temporales para armar relaciones.
create temp table seed_students (
  profile_id uuid primary key,
  student_code text not null,
  group_key text not null,
  group_label text not null,
  level_label text not null,
  gender text not null,
  ordinal integer not null
) on commit drop;

create temp table seed_teachers (
  profile_id uuid primary key,
  teacher_code text not null,
  gender text not null,
  ordinal integer not null
) on commit drop;

create temp table seed_courses (
  course_id bigint primary key,
  group_key text not null,
  group_label text not null,
  level_label text not null,
  subject_name text not null,
  teacher_profile_id uuid not null
) on commit drop;

-- Docentes: 5 mujeres, 5 varones.
with teacher_data(first_name, last_name, dni, email, phone, gender, title, ordinal) as (
  values
    ('Mariana', 'Pereyra', '31010001', 'mariana.pereyra@educar.test', '3515001001', 'F', 'Profesora de Nivel Inicial', 1),
    ('Lucia', 'Benitez', '31010002', 'lucia.benitez@educar.test', '3515001002', 'F', 'Profesora de Lengua', 2),
    ('Camila', 'Sosa', '31010003', 'camila.sosa@educar.test', '3515001003', 'F', 'Profesora de Matemática', 3),
    ('Valentina', 'Molina', '31010004', 'valentina.molina@educar.test', '3515001004', 'F', 'Profesora de Ciencias Naturales', 4),
    ('Florencia', 'Herrera', '31010005', 'florencia.herrera@educar.test', '3515001005', 'F', 'Profesora de Inglés', 5),
    ('Federico', 'Roldan', '31010006', 'federico.roldan@educar.test', '3515001006', 'M', 'Profesor de Educación Física', 6),
    ('Martin', 'Castro', '31010007', 'martin.castro@educar.test', '3515001007', 'M', 'Profesor de Historia', 7),
    ('Tomas', 'Navarro', '31010008', 'tomas.navarro@educar.test', '3515001008', 'M', 'Profesor de Tecnología', 8),
    ('Nicolas', 'Luna', '31010009', 'nicolas.luna@educar.test', '3515001009', 'M', 'Profesor de Artes', 9),
    ('Agustin', 'Vega', '31010010', 'agustin.vega@educar.test', '3515001010', 'M', 'Profesor de Música', 10)
), inserted_profiles as (
  insert into public.profiles (first_name, last_name, dni, email, phone, birth_date, address, is_active)
  select first_name, last_name, dni, email, phone, (date '1985-01-01' + (ordinal * interval '97 days'))::date, 'Av. Docente ' || ordinal, true
  from teacher_data
  returning id, dni
), teacher_rows as (
  insert into public.teachers (profile_id, teacher_code, title, hire_date)
  select p.id, 'D' || lpad(td.ordinal::text, 6, '0'), td.title, date '2026-02-15'
  from inserted_profiles p
  join teacher_data td on td.dni = p.dni
  returning profile_id, teacher_code
)
insert into seed_teachers (profile_id, teacher_code, gender, ordinal)
select tr.profile_id, tr.teacher_code, td.gender, td.ordinal
from teacher_rows tr
join teacher_data td on td.dni = (select dni from public.profiles where id = tr.profile_id);

insert into public.profile_roles (profile_id, role_code)
select profile_id, 'docente' from seed_teachers;

-- Alumnos: 25 chicas y 25 chicos, distribuidos en 10 grupos de 5.
with group_map(group_no, group_key, group_label, level_label) as (
  values
    (1, 'INI-S4', 'Sala de 4', 'Inicial'),
    (2, 'INI-S5', 'Sala de 5', 'Inicial'),
    (3, 'PRI-1A', '1° Primaria A', 'Primario'),
    (4, 'PRI-2A', '2° Primaria A', 'Primario'),
    (5, 'PRI-3A', '3° Primaria A', 'Primario'),
    (6, 'PRI-4A', '4° Primaria A', 'Primario'),
    (7, 'SEC-1A', '1° Secundaria A', 'Secundario'),
    (8, 'SEC-2A', '2° Secundaria A', 'Secundario'),
    (9, 'SEC-3A', '3° Secundaria A', 'Secundario'),
    (10, 'SEC-4A', '4° Secundaria A', 'Secundario')
), female_names(first_name, last_name, ordinal) as (
  values
    ('Sofia','Acosta',1),('Valentina','Aguilar',2),('Martina','Alvarez',3),('Emma','Arias',4),('Catalina','Barrios',5),
    ('Olivia','Cabrera',6),('Isabella','Campos',7),('Mia','Correa',8),('Alma','Diaz',9),('Lola','Farias',10),
    ('Clara','Gimenez',11),('Juana','Godoy',12),('Renata','Gutierrez',13),('Amparo','Ibarra',14),('Josefina','Juarez',15),
    ('Abril','Ledesma',16),('Emilia','Medina',17),('Victoria','Mendez',18),('Morena','Miranda',19),('Pilar','Moyano',20),
    ('Malena','Nunez',21),('Bianca','Ortiz',22),('Delfina','Paz',23),('Aitana','Quiroga',24),('Guadalupe','Romero',25)
), male_names(first_name, last_name, ordinal) as (
  values
    ('Mateo','Acosta',26),('Benjamin','Aguilar',27),('Bautista','Alvarez',28),('Felipe','Arias',29),('Joaquin','Barrios',30),
    ('Lorenzo','Cabrera',31),('Santino','Campos',32),('Thiago','Correa',33),('Bruno','Diaz',34),('Lautaro','Farias',35),
    ('Dante','Gimenez',36),('Franco','Godoy',37),('Valentino','Gutierrez',38),('Tomas','Ibarra',39),('Ignacio','Juarez',40),
    ('Facundo','Ledesma',41),('Gael','Medina',42),('Nicolas','Mendez',43),('Juan','Miranda',44),('Pedro','Moyano',45),
    ('Salvador','Nunez',46),('Elias','Ortiz',47),('Manuel','Paz',48),('Simon','Quiroga',49),('Santiago','Romero',50)
), student_data as (
  select first_name, last_name, ordinal, 'F'::text as gender from female_names
  union all
  select first_name, last_name, ordinal, 'M'::text as gender from male_names
), enriched as (
  select
    sd.*,
    gm.group_key,
    gm.group_label,
    gm.level_label,
    '45020' || lpad(sd.ordinal::text, 3, '0') as dni,
    lower(sd.first_name || '.' || sd.last_name || sd.ordinal || '@alumnos.educar.test') as email
  from student_data sd
  join group_map gm on gm.group_no = ((sd.ordinal - 1) / 5) + 1
), inserted_profiles as (
  insert into public.profiles (first_name, last_name, dni, email, phone, birth_date, address, is_active)
  select
    first_name,
    last_name,
    dni,
    email,
    '351600' || lpad(ordinal::text, 4, '0'),
    case
      when level_label = 'Inicial' then (date '2021-01-01' + (ordinal * interval '11 days'))::date
      when level_label = 'Primario' then (date '2016-01-01' + (ordinal * interval '19 days'))::date
      else (date '2011-01-01' + (ordinal * interval '23 days'))::date
    end,
    'Calle Alumno ' || ordinal,
    true
  from enriched
  returning id, dni
), student_rows as (
  insert into public.students (profile_id, student_code, current_status, admission_date)
  select p.id, 'A' || lpad(e.ordinal::text, 6, '0'), 'activo', date '2026-03-01'
  from inserted_profiles p
  join enriched e on e.dni = p.dni
  returning profile_id, student_code
)
insert into seed_students (profile_id, student_code, group_key, group_label, level_label, gender, ordinal)
select sr.profile_id, sr.student_code, e.group_key, e.group_label, e.level_label, e.gender, e.ordinal
from student_rows sr
join public.profiles p on p.id = sr.profile_id
join enriched e on e.dni = p.dni;

insert into public.profile_roles (profile_id, role_code)
select profile_id, 'alumno' from seed_students;

-- Tutores simples para cada alumno, sin usuario de login.
with tutor_source as (
  select s.*, p.last_name
  from seed_students s
  join public.profiles p on p.id = s.profile_id
), inserted_tutors as (
  insert into public.profiles (first_name, last_name, dni, email, phone, address, is_active)
  select
    case when gender = 'F' then 'Responsable' else 'Tutor' end,
    last_name,
    '52020' || lpad(ordinal::text, 3, '0'),
    lower('familia.' || last_name || ordinal || '@familias.educar.test'),
    '351700' || lpad(ordinal::text, 4, '0'),
    'Domicilio familiar ' || ordinal,
    true
  from tutor_source
  returning id, dni
)
insert into public.student_guardians (student_profile_id, guardian_profile_id, relationship_type, is_primary)
select s.profile_id, t.id, 'tutor', true
from seed_students s
join inserted_tutors t on t.dni = '52020' || lpad(s.ordinal::text, 3, '0');

insert into public.profile_roles (profile_id, role_code)
select guardian_profile_id, 'tutor' from public.student_guardians;

-- Tutores de prueba adicionales para validar casos reales de familias con varios hijos.
with extra_tutors as (
  select * from (
    values
      ('Carolina', 'Fernandez', '52090001', 'carolina.fernandez@familias.educar.test', '3518000001', 'Domicilio familiar multi-hijos'),
      ('Ricardo', 'Gomez', '52090002', 'ricardo.gomez@familias.educar.test', '3518000002', 'Domicilio familiar hijo unico')
  ) as v(first_name, last_name, dni, email, phone, address)
), inserted_extra_tutors as (
  insert into public.profiles (first_name, last_name, dni, email, phone, address, is_active)
  select first_name, last_name, dni, email, phone, address, true
  from extra_tutors
  returning id, dni, last_name
)
insert into public.profile_roles (profile_id, role_code)
select id, 'tutor'
from inserted_extra_tutors;

with tutor_multi as (
  select id as tutor_profile_id
  from public.profiles
  where dni = '52090001'
), tutor_single as (
  select id as tutor_profile_id
  from public.profiles
  where dni = '52090002'
)
insert into public.student_guardians (student_profile_id, guardian_profile_id, relationship_type, is_primary)
select s.profile_id, t.tutor_profile_id, 'tutor', false
from seed_students s
join tutor_multi t on s.student_code in ('A000006', 'A000029', 'A000043')
on conflict do nothing;

with tutor_single as (
  select id as tutor_profile_id
  from public.profiles
  where dni = '52090002'
)
insert into public.student_guardians (student_profile_id, guardian_profile_id, relationship_type, is_primary)
select s.profile_id, t.tutor_profile_id, 'tutor', true
from seed_students s
join tutor_single t on s.student_code = 'A000017'
on conflict do nothing;

-- Personal no docente con usuario de login por legajo.
with no_docente_data as (
  select * from (
    values
      ('Andrea', 'Mansilla', '33090001', 'andrea.mansilla@educar.test', '3518100001', 'Mesa de entrada y legajos'),
      ('Pablo', 'Suarez', '33090002', 'pablo.suarez@educar.test', '3518100002', 'Soporte administrativo')
  ) as v(first_name, last_name, dni, email, phone, address)
), inserted_no_docentes as (
  insert into public.profiles (first_name, last_name, dni, email, phone, address, is_active)
  select first_name, last_name, dni, email, phone, address, true
  from no_docente_data
  returning id
)
insert into public.profile_roles (profile_id, role_code)
select id, 'no_docente'
from inserted_no_docentes;

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

-- Cursos activos reales: 3 cursos para 4 alumnos y 2 docentes.
with course_seed(subject_name, course_name, commission, classroom, schedule_summary, teacher_ordinal) as (
  values
    ('Matemática', 'Matemática - Grupo Activo', 'A', 'Aula 1', 'Lunes y miércoles 08:00 a 09:30', 1),
    ('Lengua', 'Lengua - Grupo Activo', 'A', 'Aula 2', 'Martes y jueves 10:00 a 11:30', 2),
    ('Ciencias Naturales', 'Ciencias Naturales - Proyecto Huerta', 'Taller', 'Laboratorio', 'Viernes 09:00 a 10:30', 1)
), inserted_courses as (
  insert into public.courses (subject_id, academic_term_id, teacher_profile_id, name, commission, classroom, schedule_summary, status)
  select
    subj.id,
    at.id,
    teacher.profile_id,
    cs.course_name,
    cs.commission,
    cs.classroom,
    cs.schedule_summary,
    'activa'
  from course_seed cs
  join public.subjects subj on subj.name = cs.subject_name
  join public.academic_terms at on at.name = 'Ciclo lectivo' and at.year = 2026
  join seed_teachers teacher on teacher.ordinal = cs.teacher_ordinal
  returning id, name, commission, teacher_profile_id
)
insert into seed_courses (course_id, group_key, group_label, level_label, subject_name, teacher_profile_id)
select
  ic.id,
  'ACTIVOS',
  'Grupo Activo',
  'Primario',
  cs.subject_name,
  ic.teacher_profile_id
from inserted_courses ic
join course_seed cs on cs.course_name = ic.name;

insert into public.course_teachers (course_id, teacher_profile_id, role_in_course)
select course_id, teacher_profile_id, 'titular'
from seed_courses;

insert into public.course_enrollments (course_id, student_profile_id, enrollment_status, enrolled_at)
select c.course_id, s.profile_id, 'activa', timestamptz '2026-03-02 08:00:00-03'
from seed_courses c
cross join seed_students s
where s.ordinal <= 4;

-- Evaluaciones y notas.
with assessment_seed(subject_name, title, description, evaluation_type, evaluated_at, scores) as (
  values
    ('Matemática', 'Trabajo práctico 1', 'Operaciones combinadas', 'trabajo_practico', date '2026-04-10', array[8.5, 7.0, 9.0, 6.5]::numeric[]),
    ('Matemática', 'Evaluación de unidad', 'Resolución de problemas', 'evaluacion', date '2026-05-08', array[9.0, 7.5, 8.0, 7.0]::numeric[]),
    ('Lengua', 'Comprensión lectora', 'Lectura y análisis de cuento', 'actividad', date '2026-04-12', array[8.0, 8.5, 7.5, 9.0]::numeric[]),
    ('Lengua', 'Producción escrita', 'Texto narrativo breve', 'trabajo_practico', date '2026-05-12', array[7.5, 8.0, 8.5, 8.0]::numeric[]),
    ('Ciencias Naturales', 'Registro de observación', 'Seguimiento del crecimiento de plantas', 'proyecto', date '2026-04-18', array[9.0, 8.0, 8.5, 7.5]::numeric[])
), inserted_assessments as (
  insert into public.assessments (course_id, title, description, evaluation_type, max_score, evaluated_at, created_by)
  select c.course_id, a.title, a.description, a.evaluation_type, 10, a.evaluated_at, c.teacher_profile_id
  from assessment_seed a
  join seed_courses c on c.subject_name = a.subject_name
  returning id, course_id, title, created_by
)
insert into public.grades (assessment_id, student_profile_id, score, approved, teacher_comment, recorded_by)
select
  ia.id,
  st.profile_id,
  a.scores[st.ordinal],
  a.scores[st.ordinal] >= 6,
  case when a.scores[st.ordinal] >= 8 then 'Muy buen desempeño.' else 'Reforzar práctica y seguimiento.' end,
  ia.created_by
from inserted_assessments ia
join seed_courses c on c.course_id = ia.course_id
join assessment_seed a on a.subject_name = c.subject_name and a.title = ia.title
join seed_students st on st.ordinal <= 4;

-- Clases y asistencias.
with session_seed(subject_name, session_date, topic, statuses) as (
  values
    ('Matemática', date '2026-04-01', 'Operaciones combinadas', array['presente','presente','tarde','presente']),
    ('Matemática', date '2026-04-03', 'Problemas con datos', array['presente','ausente','presente','presente']),
    ('Matemática', date '2026-04-08', 'Revisión de ejercicios', array['presente','presente','presente','justificada']),
    ('Lengua', date '2026-04-02', 'Cuento y personajes', array['presente','presente','presente','presente']),
    ('Lengua', date '2026-04-07', 'Planificación de escritura', array['tarde','presente','presente','ausente']),
    ('Lengua', date '2026-04-09', 'Revisión de borradores', array['presente','presente','presente','presente']),
    ('Ciencias Naturales', date '2026-04-04', 'Preparación del suelo', array['presente','presente','presente','presente']),
    ('Ciencias Naturales', date '2026-04-11', 'Siembra y registro', array['presente','presente','tarde','presente']),
    ('Ciencias Naturales', date '2026-04-18', 'Observación de cambios', array['presente','justificada','presente','presente'])
), inserted_sessions as (
  insert into public.class_sessions (course_id, session_date, topic, created_by)
  select c.course_id, s.session_date, s.topic, c.teacher_profile_id
  from session_seed s
  join seed_courses c on c.subject_name = s.subject_name
  returning id, course_id, session_date, created_by
)
insert into public.attendance_records (class_session_id, student_profile_id, status, notes, recorded_by)
select
  sess.id,
  st.profile_id,
  ss.statuses[st.ordinal],
  case ss.statuses[st.ordinal]
    when 'ausente' then 'Ausencia registrada para seguimiento.'
    when 'tarde' then 'Llegó tarde al inicio de clase.'
    when 'justificada' then 'Justificación familiar registrada.'
    else null
  end,
  sess.created_by
from inserted_sessions sess
join seed_courses c on c.course_id = sess.course_id
join session_seed ss on ss.subject_name = c.subject_name and ss.session_date = sess.session_date
join seed_students st on st.ordinal <= 4;

-- Materiales por curso.
insert into public.course_materials (course_id, title, description, resource_url, material_type, created_by)
select c.course_id, m.title, m.description, m.resource_url, m.material_type, c.teacher_profile_id
from seed_courses c
join (
  values
    ('Matemática', 'Guía de operaciones', 'Ejercicios de suma, resta y multiplicación.', 'https://educar.test/materiales/matematica-guia-operaciones.pdf', 'guia'),
    ('Matemática', 'Problemas para practicar', 'Situaciones problemáticas para resolver en casa.', 'https://educar.test/materiales/matematica-problemas.pdf', 'pdf'),
    ('Lengua', 'Lecturas de abril', 'Selección de cuentos breves para comprensión lectora.', 'https://educar.test/materiales/lengua-lecturas-abril.pdf', 'lectura'),
    ('Lengua', 'Rúbrica de escritura', 'Criterios para producción de textos.', 'https://educar.test/materiales/lengua-rubrica-escritura.pdf', 'rubrica'),
    ('Ciencias Naturales', 'Ficha de observación', 'Registro semanal para el proyecto huerta.', 'https://educar.test/materiales/ciencias-ficha-huerta.pdf', 'ficha'),
    ('Ciencias Naturales', 'Presentación: ciclos de vida', 'Material de apoyo para la clase de laboratorio.', 'https://educar.test/materiales/ciencias-ciclos-vida.pdf', 'presentacion')
) as m(subject_name, title, description, resource_url, material_type) on m.subject_name = c.subject_name;

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

-- Solicitudes de inscripción de muestra, todas aprobadas y vinculadas al alumno correspondiente.
insert into public.inscription_requests (
  student_full_name,
  student_dni,
  level,
  responsible_type,
  tutor_full_name,
  tutor_dni,
  contact_phone,
  email,
  status,
  internal_notes,
  reviewed_at,
  reviewed_by,
  created_at,
  student_profile_id
)
select
  p.first_name || ' ' || p.last_name,
  p.dni,
  s.level_label,
  'tutor',
  'Responsable ' || p.last_name,
  '52020' || lpad(s.ordinal::text, 3, '0'),
  p.phone,
  p.email,
  'aprobada',
  'Solicitud seed aprobada automáticamente.',
  now(),
  'seed',
  now() - (s.ordinal || ' days')::interval,
  s.profile_id
from seed_students s
join public.profiles p on p.id = s.profile_id
;

-- La base real de trabajo conserva activos solo 4 alumnos y 2 docentes.
update public.students st
set current_status = case when st.student_code in ('A000001', 'A000002', 'A000003', 'A000004') then 'activo' else 'baja' end
where st.profile_id in (select profile_id from seed_students);

update public.profiles p
set is_active = s.student_code in ('A000001', 'A000002', 'A000003', 'A000004')
from seed_students s
where p.id = s.profile_id;

update public.profiles p
set is_active = t.teacher_code in ('D000001', 'D000002')
from seed_teachers t
where p.id = t.profile_id;

commit;
