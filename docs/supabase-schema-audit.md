# Auditoria SQL y propuesta relacional para Supabase

Fecha: 2026-05-24

## 1. Estado actual del esquema

Hoy el proyecto tiene estas tablas en Supabase:

1. `public.contact_messages`
2. `public.inscription_requests`
3. `public.student_courses`
4. `public.student_grade_records`
5. `public.student_attendance_records`

### Hallazgos principales

1. `inscription_requests` mezcla solicitud de ingreso, datos personales del alumno, datos de responsables y parte del workflow administrativo en una sola tabla.
2. `student_courses`, `student_grade_records` y `student_attendance_records` están atadas directo a `auth_user_id`.
3. En esas tablas académicas, `course_name` y `teacher_name` son texto libre en vez de claves foráneas.
4. No existe una tabla maestra de personas, alumnos, docentes, materias, cursos, comisiones ni inscripciones.
5. Los roles viven en `auth.users.app_metadata` y `user_metadata`, pero no en tablas relacionales auditables.
6. El flujo admin usa `inscription_requests` como fuente de verdad para nombre, DNI y reseteo de contraseña.
7. No existe una tabla formal de notas, asistencias por clase, ni asociación alumno-curso.
8. No hay una capa de auditoría relacional para cambios importantes.

## 2. Problemas de modelado

### Acoplamientos incorrectos

1. `auth.users` está siendo usado como identidad académica.
2. La solicitud de inscripción está siendo usada como ficha del alumno.
3. Curso, materia y docente no están normalizados.

### Riesgos funcionales

1. Si cambia el nombre de una materia o docente, se rompe la consistencia histórica porque hoy queda guardado como texto.
2. No se puede modelar bien que un docente dicte varias materias o una materia tenga distintas comisiones.
3. No se puede modelar legajo de alumno ni legajo de docente de forma robusta.
4. No se puede asociar varios responsables a un alumno sin seguir agregando columnas.
5. No se puede auditar bien quién cambió una nota, asistencia, inscripción o rol.

### Riesgos para Supabase

1. Las políticas RLS van a ser difíciles si todo depende de texto y metadata.
2. Las consultas del campus alumno no pueden crecer bien sin relaciones reales.
3. Migrar desde este modelo a reportes, dashboards y panel docente sería caro después.

## 3. Criterio de rediseño

Punto fijo pedido: el admin es único y no se toca.

Entonces conviene separar:

1. Autenticación: `auth.users`
2. Identidad de personas: tabla propia en `public`
3. Roles: tablas relacionales
4. Estructura académica: materias, cursos, docentes, alumnos, inscripciones
5. Operación académica: notas y asistencias
6. Workflow de ingreso: solicitudes
7. Auditoría: logs de cambios

## 4. Modelo objetivo recomendado

### 4.1 Personas y acceso

#### `public.profiles`

Tabla maestra para cualquier persona vinculada al sistema.

Campos sugeridos:

1. `id uuid primary key default gen_random_uuid()`
2. `auth_user_id uuid null unique references auth.users(id) on delete set null`
3. `first_name text not null`
4. `last_name text not null`
5. `dni text not null unique`
6. `email text null`
7. `phone text null`
8. `birth_date date null`
9. `address text null`
10. `is_active boolean not null default true`
11. `created_at timestamptz not null default now()`
12. `updated_at timestamptz not null default now()`

Notas:

1. Esta tabla reemplaza el uso de nombre/DNI disperso en varias tablas.
2. Un alumno o docente puede existir aunque todavía no tenga cuenta en `auth.users`.

#### `public.roles`

Catálogo de roles.

Valores sugeridos:

1. `admin`
2. `alumno`
3. `docente`
4. `tutor`
5. `preceptor`
6. `administrativo`

Como pediste admin único, `admin` puede seguir además en metadata para el bootstrap, pero conviene reflejarlo también en tabla si luego querés auditoría completa.

#### `public.profile_roles`

Tabla pivote entre persona y rol.

Campos:

1. `id bigserial primary key`
2. `profile_id uuid not null references public.profiles(id) on delete cascade`
3. `role_code text not null references public.roles(code)`
4. `created_at timestamptz not null default now()`

Constraint sugerido:

1. `unique(profile_id, role_code)`

Esto evita atar todo a un solo rol por metadata y permite casos reales:

1. docente que también es tutor
2. administrativo que además dicta materia

### 4.2 Estructura académica

#### `public.subjects`

Materia base.

Campos:

1. `id bigserial primary key`
2. `name text not null unique`
3. `code text null unique`
4. `description text null`
5. `is_active boolean not null default true`

#### `public.teachers`

Extensión del perfil para docentes.

Campos:

1. `profile_id uuid primary key references public.profiles(id) on delete cascade`
2. `teacher_code text null unique`
3. `title text null`
4. `hire_date date null`

#### `public.students`

Extensión del perfil para alumnos.

Campos:

1. `profile_id uuid primary key references public.profiles(id) on delete cascade`
2. `student_code text not null unique`
3. `current_status text not null default 'activo'`
4. `admission_date date null`

`student_code` es donde debe vivir el legajo.

#### `public.student_guardians`

Relación alumno-responsable.

Campos:

1. `id bigserial primary key`
2. `student_profile_id uuid not null references public.students(profile_id) on delete cascade`
3. `guardian_profile_id uuid not null references public.profiles(id) on delete cascade`
4. `relationship_type text not null`
5. `is_primary boolean not null default false`
6. `created_at timestamptz not null default now()`

Esto reemplaza las columnas:

1. `tutor_*`
2. `father_*`
3. `mother_*`

#### `public.academic_terms`

Períodos lectivos.

Campos:

1. `id bigserial primary key`
2. `name text not null`
3. `year int not null`
4. `starts_on date null`
5. `ends_on date null`
6. `is_active boolean not null default true`

#### `public.courses`

Curso/comisión concreta.

Campos:

1. `id bigserial primary key`
2. `subject_id bigint not null references public.subjects(id)`
3. `teacher_profile_id uuid null references public.teachers(profile_id)`
4. `academic_term_id bigint not null references public.academic_terms(id)`
5. `name text not null`
6. `commission text null`
7. `classroom text null`
8. `schedule_summary text null`
9. `status text not null default 'activa'`
10. `created_at timestamptz not null default now()`

Relación clave:

1. una materia puede tener muchos cursos/comisiones
2. un docente puede estar asociado a muchos cursos

Si necesitás varios docentes por curso, no uses `teacher_profile_id` directo: creá `course_teachers`.

#### `public.course_teachers`

Recomendada si un curso puede tener más de un docente.

Campos:

1. `id bigserial primary key`
2. `course_id bigint not null references public.courses(id) on delete cascade`
3. `teacher_profile_id uuid not null references public.teachers(profile_id) on delete cascade`
4. `role_in_course text null`
5. `unique(course_id, teacher_profile_id)`

### 4.3 Inscripciones académicas

#### `public.course_enrollments`

Asociación alumno-curso.

Campos:

1. `id bigserial primary key`
2. `course_id bigint not null references public.courses(id) on delete cascade`
3. `student_profile_id uuid not null references public.students(profile_id) on delete cascade`
4. `enrollment_status text not null default 'activa'`
5. `enrolled_at timestamptz not null default now()`
6. `withdrawn_at timestamptz null`
7. `unique(course_id, student_profile_id)`

Esta tabla es indispensable. Sin esto no existe la relación real entre alumno y curso.

### 4.4 Notas

#### `public.assessments`

Evaluaciones de un curso.

Campos:

1. `id bigserial primary key`
2. `course_id bigint not null references public.courses(id) on delete cascade`
3. `title text not null`
4. `description text null`
5. `evaluation_type text null`
6. `max_score numeric(5,2) not null default 10`
7. `evaluated_at date null`
8. `created_by uuid null references public.profiles(id)`
9. `created_at timestamptz not null default now()`

#### `public.grades`

Nota por alumno y evaluación.

Campos:

1. `id bigserial primary key`
2. `assessment_id bigint not null references public.assessments(id) on delete cascade`
3. `student_profile_id uuid not null references public.students(profile_id) on delete cascade`
4. `score numeric(5,2) null`
5. `approved boolean null`
6. `teacher_comment text null`
7. `recorded_by uuid null references public.profiles(id)`
8. `recorded_at timestamptz not null default now()`
9. `unique(assessment_id, student_profile_id)`

La tabla actual `student_grade_records` debería desaparecer después de migrar.

### 4.5 Asistencias

#### `public.class_sessions`

Cada clase dictada.

Campos:

1. `id bigserial primary key`
2. `course_id bigint not null references public.courses(id) on delete cascade`
3. `session_date date not null`
4. `topic text null`
5. `created_by uuid null references public.profiles(id)`
6. `created_at timestamptz not null default now()`
7. `unique(course_id, session_date)`

#### `public.attendance_records`

Asistencia por alumno en una clase.

Campos:

1. `id bigserial primary key`
2. `class_session_id bigint not null references public.class_sessions(id) on delete cascade`
3. `student_profile_id uuid not null references public.students(profile_id) on delete cascade`
4. `status text not null`
5. `notes text null`
6. `recorded_by uuid null references public.profiles(id)`
7. `recorded_at timestamptz not null default now()`
8. `unique(class_session_id, student_profile_id)`

La tabla actual `student_attendance_records` también debería migrarse y luego retirarse.

### 4.6 Workflow de inscripción

#### `public.inscription_requests`

Conviene conservarla, pero solo como workflow de ingreso.

Cambios sugeridos:

1. mantener datos de solicitud
2. agregar `student_profile_id uuid null`
3. agregar `resolved_auth_user_id uuid null`
4. agregar `resolved_by_profile_id uuid null`
5. mantener `status`, `internal_notes`, `reviewed_at`

Importante:

1. la solicitud no debe ser la ficha viva del alumno
2. al aprobar, se crea o vincula `profiles` + `students` + `profile_roles`

### 4.7 Auditoría

#### `public.audit_logs`

Campos:

1. `id bigserial primary key`
2. `actor_profile_id uuid null references public.profiles(id)`
3. `entity_name text not null`
4. `entity_id text not null`
5. `action text not null`
6. `old_data jsonb null`
7. `new_data jsonb null`
8. `created_at timestamptz not null default now()`

Eventos mínimos para loguear:

1. cambio de rol
2. aprobación o rechazo de solicitud
3. alta/baja de inscripción a curso
4. carga o edición de nota
5. carga o edición de asistencia

## 5. Relaciones clave

Relaciones recomendadas:

1. `auth.users 1 - 0..1 profiles`
2. `profiles 1 - n profile_roles`
3. `profiles 1 - 0..1 students`
4. `profiles 1 - 0..1 teachers`
5. `subjects 1 - n courses`
6. `academic_terms 1 - n courses`
7. `teachers 1 - n course_teachers`
8. `courses 1 - n course_teachers`
9. `students n - n courses` mediante `course_enrollments`
10. `courses 1 - n assessments`
11. `assessments 1 - n grades`
12. `courses 1 - n class_sessions`
13. `class_sessions 1 - n attendance_records`
14. `students 1 - n grades`
15. `students 1 - n attendance_records`
16. `students n - n guardians` mediante `student_guardians`

## 6. Qué falta además de alumno, docente, curso, notas y asistencias

Además de lo que mencionaste, faltan al menos estas piezas:

1. `profiles` como tabla central de identidad
2. `students` y `teachers` como extensiones formales
3. `subjects` separada de `courses`
4. `course_enrollments` para asociar alumnos a cursos
5. `student_guardians` para responsables
6. `assessments` para definir cada instancia evaluativa
7. `class_sessions` para que la asistencia sea por clase real y no solo por fecha suelta
8. `audit_logs` para trazabilidad
9. `academic_terms` para ciclo lectivo

## 7. Estrategia de migración a Supabase

Orden recomendado:

1. Crear nuevas tablas base: `profiles`, `roles`, `profile_roles`, `students`, `teachers`, `subjects`, `academic_terms`.
2. Crear tablas académicas relacionales: `courses`, `course_teachers`, `course_enrollments`, `assessments`, `grades`, `class_sessions`, `attendance_records`, `student_guardians`.
3. Adaptar `inscription_requests` para que apunte a `profiles` y deje de ser fuente maestra.
4. Migrar datos desde `inscription_requests` hacia `profiles`, `students` y responsables.
5. Migrar `student_courses` a `courses` + `course_enrollments`.
6. Migrar `student_grade_records` a `assessments` + `grades`.
7. Migrar `student_attendance_records` a `class_sessions` + `attendance_records`.
8. Actualizar la app para consultar el nuevo esquema.
9. Recién después retirar tablas viejas.

## 8. Impacto en el código actual

Hoy el código depende de estas decisiones viejas:

1. `src/lib/studentDashboard.ts` consulta tablas desnormalizadas por `auth_user_id`.
2. `src/app/api/admin/users/route.ts` y `src/app/api/admin/users/[userId]/route.ts` leen nombre y DNI desde `inscription_requests` y metadata.
3. `src/app/api/admin/solicitudes/[requestId]/route.ts` aprueba solicitudes creando usuarios `auth` y marcando metadata, pero no crea ficha académica real.
4. `src/lib/auth/roles.ts` considera roles solo desde metadata.

Conclusión: el cambio no es solo SQL. También hay que mover la lógica de app desde:

1. metadata de auth
2. solicitud de inscripción
3. tablas académicas por texto

hacia tablas relacionales en `public`.

## 9. Recomendación práctica

Para este proyecto, la estructura más sana es:

1. dejar `auth.users` solo para login
2. dejar el admin único como caso especial de bootstrap
3. usar `profiles` como persona central
4. usar `students` y `teachers` para datos específicos
5. usar `subjects`, `courses` y `course_enrollments` para la relación académica
6. usar `grades` y `attendance_records` con claves foráneas reales
7. usar `audit_logs` para todo cambio sensible

## 10. Siguiente paso recomendado

El próximo paso técnico debería ser una migración nueva de Supabase que cree el modelo relacional objetivo sin borrar todavía las tablas existentes.

Prioridad exacta:

1. `profiles`
2. `roles`
3. `profile_roles`
4. `students`
5. `teachers`
6. `subjects`
7. `academic_terms`
8. `courses`
9. `course_enrollments`
10. `assessments`
11. `grades`
12. `class_sessions`
13. `attendance_records`
14. `student_guardians`
15. `audit_logs`

Cuando eso exista, recién conviene tocar APIs y pantallas.
