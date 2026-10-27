#!/usr/bin/env bash

# Usuario u organización y nombre del repositorio:
REPO="dbetania2/educar-para-transformar"
OWNER="dbetania2"
PROJECT_NUM="3" # Proyecto 'ept' en Projects v2

echo "Iniciando carga verificada de Tickets en $REPO (Proyecto #$PROJECT_NUM)..."

create_task_if_not_exists() {
  local title="$1"
  local body="$2"

  # Buscar si ya existe un issue con el título exacto (tanto en OPEN como en CLOSED)
  local existing_url
  existing_url=$(gh issue list --repo "$REPO" --state all --search "\"$title\" in:title" --json url,title --jq ".[] | select(.title == \"$title\") | .url" | head -n 1)

  if [ -n "$existing_url" ]; then
    echo "🔄 ACTUALIZANDO (Sincronizando contenido): '$title'..."
    gh issue edit "$existing_url" --body "$body" >/dev/null
    echo "   Actualizado exitosamente: $existing_url"
    # Asegurar que esté vinculado al proyecto
    gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$existing_url" >/dev/null 2>&1 || true
  else
    echo "➕ CREANDO: '$title'..."
    local new_url
    new_url=$(gh issue create --repo "$REPO" --title "$title" --body "$body")
    echo "   Creado exitosamente: $new_url"
    gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$new_url"
  fi
  echo "----------------------------------------------------"
}

# ==============================================================================
# SPRINT 2 — Operativa de Alumnos y Legajos
# ==============================================================================

# HU1 (HECHO)
create_task_if_not_exists \
  "HU1: Alta de Legajo de Nuevo Alumno" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ALU-02 (REQ-ALU-01.1)
- **Usuario:** Personal Administrativo / Secretaría
- **Prioridad:** Alta | **Riesgo:** Bajo | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 2
- **Estado:** Done (Completado)

---
### Descripción
Como personal administrativo, quiero registrar el legajo completo de nuevos alumnos en la base de datos de Supabase, para disponer de la información centralizada y segura de la matrícula inicial.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Diseñar tablas \`profiles\` (datos generales con DNI y rol 'alumno') y \`students\` (legajo único, estado) en PostgreSQL.
- [x] **Supabase:** Configurar índice único para \`DNI\` en \`profiles\` y de \`legajo\` en \`students\`.
- [x] **Next.js:** Maquetar formulario de registro con Atomic Design usando componentes de Mantine (Inputs, Selectors, Notification toasts).
- [x] **Next.js:** Implementar validaciones del lado del cliente (campos obligatorios y formato de correo).
- [x] **Next.js (API):** Crear Server Action en TypeScript para persistir los datos de forma síncrona en Supabase.

---
### Criterios de Aceptación (Validación)
- [x] Bloquear guardado y mostrar toast de alerta en rojo de Mantine ante campos vacíos o DNI duplicado.
- [x] Generar automáticamente número de legajo incremental único.
- [x] Inicializar el perfil de alumno con estado \"activo\" por defecto en la base de datos."

# T02_ALU (HECHO)
create_task_if_not_exists \
  "T02_ALU: Modificación de Contacto y Baja Lógica de Alumnos" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ALU-01.3 / REQ-ALU-01.4
- **Usuario:** Personal Administrativo
- **Prioridad:** Media | **Riesgo:** Bajo | **Estimación:** 3 SP
- **Iteración Planificada:** Sprint 2
- **Estado:** Done (Completado)

---
### Descripción
Como personal administrativo, quiero editar los datos de contacto del alumno y realizar la baja lógica (desactivación), para mantener actualizada la información sin perder la trazabilidad histórica.

---
### Tareas Técnicas de Desarrollo
- [x] **Next.js:** Crear formulario de edición de datos de contacto (domicilio, teléfono, correo) bloqueando la modificación de DNI y Legajo.
- [x] **Supabase:** Crear Server Action para actualizar los campos en \`profiles\` mediante \`supabase.from('profiles').update()\`.
- [x] **Next.js:** Implementar botón y flujo de confirmación para Baja Lógica cambiando el estado a \`Inactivo\`.

---
### Criterios de Aceptación (Validación)
- [x] Permitir modificar contacto manteniendo bloqueados DNI y Legajo.
- [x] Al ejecutar la baja lógica, el alumno pasa a estado \`Inactivo\` sin eliminarse físicamente de PostgreSQL."

# ==============================================================================
# SPRINT 3 — Operativa de Docentes y Legajos
# ==============================================================================

# T01_PRF (PENDIENTE)
create_task_if_not_exists \
  "T01_PRF: Registro, Edición y Baja Lógica de Docentes" \
  "### Ficha Técnica
- **Requerimiento:** REQ-PRF-01.1 / REQ-PRF-01.3 / REQ-PRF-01.4 (REQ-PRF-02)
- **Usuario:** Personal Administrativo / Dirección
- **Prioridad:** Alta | **Riesgo:** Bajo | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 3
- **Estado:** To Do (Pendiente)

---
### Descripción
Como administrador, quiero gestionar los legajos del cuerpo docente (alta, edición de contacto y baja lógica), para mantener el registro actualizado del personal académico.

---
### Tareas Técnicas de Desarrollo
- [ ] **Supabase:** Diseñar tabla \`teachers\` vinculada a \`profiles\` (Legajo docente correlativo, especialidad, estado).
- [ ] **Next.js:** Maquetar interfaz de alta y edición de docentes en el panel administrativo.
- [ ] **Next.js (API):** Implementar Server Actions para crear y actualizar perfiles docentes.
- [ ] **Next.js:** Implementar función de baja lógica del docente preservando su historial de materias dictadas.

---
### Criterios de Aceptación (Validación)
- [ ] Generación correlativa automática del número de Legajo docente.
- [ ] Edición de datos de contacto con bloqueo de DNI y Legajo.
- [ ] La baja lógica preserva las relaciones académicas pasadas del profesor."

# ==============================================================================
# SPRINT 4 — Relaciones Académicas (Asignación y Matrícula)
# ==============================================================================

# HU2 (HECHO)
create_task_if_not_exists \
  "HU2: Asignación de Materias y Cursos a Docentes" \
  "### Ficha Técnica
- **Requerimiento:** REQ-PRF-03 / REQ-ADM-01.2
- **Usuario:** Personal Administrativo / Dirección
- **Prioridad:** Alta | **Riesgo:** Medio | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 4
- **Estado:** Done (Completado)

---
### Descripción
Como personal administrativo, quiero vincular docentes a materias y cursos garantizando, de forma síncrona, que no existan colisiones ni superposiciones en sus grillas horarias.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Diseñar tablas \`courses\`, \`subjects\` y la tabla relacional \`course_teachers\`.
- [x] **Supabase:** Programar función en PostgreSQL para validar no superposición horaria docente.
- [x] **Next.js:** Diseñar pantalla de asignación académica en el panel administrativo con Mantine UI.
- [x] **Next.js (API):** Implementar Server Action para asociar registros en \`course_teachers\` capturando colisiones.

---
### Criterios de Aceptación (Validación)
- [x] Buscar un docente por legajo o apellido y listar sus asignaciones académicas actuales.
- [x] Impedir asignaciones ante colisiones horarias, mostrando alerta emergente de conflicto."

# ==============================================================================
# SPRINT 5 — Servicios Extracurriculares y Complementarios
# ==============================================================================

# T01_EXT (PENDIENTE)
create_task_if_not_exists \
  "T01_EXT: Servicios Extracurriculares (Deportes, Comedor y Transporte)" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-01.3 / REQ-ADM-01.4 / REQ-ADM-12.1 / REQ-ADM-12.2
- **Usuario:** Personal Administrativo / Logística
- **Prioridad:** Media | **Riesgo:** Medio | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 5
- **Estado:** To Do (Pendiente)

---
### Descripción
Como administrador, quiero gestionar las inscripciones a actividades deportivas (con límite de 2 por alumno), asignar cupos para comedor y transporte escolar (4 recorridos fijos), y emitir los reportes analíticos de deportes por disciplina y nivel educativo.

---
### Tareas Técnicas de Desarrollo
- [ ] **Supabase:** Crear tablas \`sports\`, \`student_sports\`, \`cafeteria_subscriptions\` y \`transport_routes\`.
- [ ] **Supabase:** Configurar restricción en PostgreSQL/Server Action para validar máximo 2 deportes por alumno y sin superposición de horario.
- [ ] **Next.js:** Maquetar panel de inscripción extracurricular con selectores de deportes y recorridos de transporte.
- [ ] **Next.js (Reporte 6 - REQ-ADM-12.1):** Maquetar vista de *Listado de Alumnos por Deporte* (Deporte, Alumno, Curso, Nivel).
- [ ] **Next.js (Reporte 7 - REQ-ADM-12.2):** Maquetar vista de *Listado de Alumnos por Deporte y Nivel* (Deporte, Nivel, Alumnos).

---
### Criterios de Aceptación (Validación)
- [ ] Bloquear inscripción si el alumno ya registra 2 deportes o si existe conflicto de horario.
- [ ] Registrar opción de comedor y asignación a 1 de los 4 recorridos fijos de micro.
- [ ] Generar grillas filtrables para los listados de deportes por disciplina y por nivel educativo."

# ==============================================================================
# SPRINT 6 — Seguridad y Listados Operativos
# ==============================================================================

# HU4 (HECHO)
create_task_if_not_exists \
  "HU4: Listado de Alumnos por Curso" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-07 / REQ-ADM-01.5
- **Usuario:** Personal Administrativo / No Docente / Dirección
- **Prioridad:** Alta | **Riesgo:** Bajo | **Estimación:** 3 SP
- **Iteración Planificada:** Sprint 6
- **Estado:** Done (Completado)

---
### Descripción
Como personal administrativo, quiero listar y filtrar de forma directa a los alumnos matriculados por nivel y curso en una grilla responsiva ordenada alfabéticamente por apellido.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Habilitar políticas de seguridad RLS (Row Level Security) para restringir accesos según roles (admin, no_docente).
- [x] **Next.js:** Maquetar la interfaz de consulta con componentes desplegables de Mantine UI.
- [x] **Next.js (API):** Escribir Server Action para recuperar la información uniendo \`students\` y \`profiles\` por \`course_id\`.
- [x] **Next.js:** Diseñar estados de carga y manejo de listas vacías usando el componente Table de Mantine.

---
### Criterios de Aceptación (Validación)
- [x] El listado se completa únicamente al seleccionar un nivel y curso específicos.
- [x] Mostrar columnas: Legajo, Apellido, Nombre, Correo y Estado ordenados alfabéticamente.
- [x] Mostrar mensaje informativo si no hay alumnos matriculados en el curso seleccionado."

# ==============================================================================
# SPRINT 7 — Gestión No Docente y Reportes Básicos
# ==============================================================================

# HU5 (HECHO)
create_task_if_not_exists \
  "HU5: Gestión de Tareas y Avisos Administrativos (No Docente)" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-10
- **Usuario:** Personal No Docente / Mantenimiento / Secretaría
- **Prioridad:** Media | **Riesgo:** Bajo | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 7
- **Estado:** Done (Completado)

---
### Descripción
Como personal no docente, quiero disponer de un panel de gestión para registrar, seguir y emitir reportes de tareas administrativas e incidentes de mantenimiento de forma centralizada.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Diseñar la tabla \`administrative_tasks\` en PostgreSQL.
- [x] **Next.js:** Crear vista del panel del personal No Docente usando pestañas Tabs de Mantine UI.
- [x] **Next.js (API):** Implementar actualización dinámica de estado a través de Supabase.
- [x] **Next.js:** Desarrollar componente de descarga de reportes de tareas en formato PDF.

---
### Criterios de Aceptación (Validación)
- [x] El panel muestra las tareas clasificadas por prioridad (Alta, Media, Baja) y estado.
- [x] Permitir cambiar el estado de las tareas (ej: de Pendiente a En proceso) y refrescar la tabla.
- [x] Permitir exportar el consolidado administrativo a PDF."

# T01_REP (PENDIENTE)
create_task_if_not_exists \
  "T01_REP: Consultas de Servicios y Reportes Operativos Adicionales" \
  "### Ficha Técnica
- **Requerimiento:** REQ-PRF-01.2 / REQ-ADM-08 / REQ-ADM-11 / REQ-ADM-12.3
- **Usuario:** Personal Administrativo / Dirección
- **Prioridad:** Baja | **Riesgo:** Bajo | **Estimación:** 3 SP
- **Iteración Planificada:** Sprint 7
- **Estado:** To Do (Pendiente)

---
### Descripción
Como administrador, quiero consultar perfiles docentes por especialidad (<3s), listar alumnos matriculados por materia, generar reportes por recorrido de transporte escolar y emitir el listado detallado por deporte, nivel, horario y profesor.

---
### Tareas Técnicas de Desarrollo
- [ ] **Next.js:** Implementar buscador avanzado de docentes por Apellido o Especialidad (<3s).
- [ ] **Next.js (Reporte 4 - REQ-ADM-08):** Maquetar vista de *Listado de Alumnos por Materia* (Nivel, Curso, Materia, Profesor, Alumno, Legajo).
- [ ] **Next.js (Reporte 9 - REQ-ADM-11):** Desarrollar vista de *Listado de Alumnos por Recorrido de Transporte* (Micros 1 a 4).
- [ ] **Next.js (Reporte 8 - REQ-ADM-12.3):** Maquetar vista de *Listado por Deporte, Nivel, Horario y Profesor*.

---
### Criterios de Aceptación (Validación)
- [ ] Búsqueda docente por especialidad con tiempo de respuesta < 3 segundos.
- [ ] Grillas de consulta de alumnos por materia, recorridos de micro y filtro integral de deporte/horario/profesor."

# ==============================================================================
# SPRINT 8 — Consolidación Analítica (MIS) y Cierre
# ==============================================================================

# HU3 (HECHO)
create_task_if_not_exists \
  "HU3: Generación de Reporte Integral por Alumno (Campus)" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-03
- **Usuario:** Alumno / Tutor
- **Prioridad:** Media | **Riesgo:** Medio | **Estimación:** 8 SP
- **Iteración Planificada:** Sprint 8
- **Estado:** Done (Completado)

---
### Descripción
Como alumno o tutor, quiero acceder a un dashboard consolidado con materias, promedio de calificaciones, asistencias y materiales de estudio, para realizar un seguimiento académico integral.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Diseñar consultas relacionales a \`grades\`, \`attendance_records\` y materiales.
- [x] **Next.js:** Maquetar la interfaz del dashboard académico del alumno con Mantine Cards y barras de progreso.
- [x] **Next.js:** Programar lógica condicional para deshabilitar descargas si no hay materiales cargados.

---
### Criterios de Aceptación (Validación)
- [x] El reporte debe dispararse al iniciar sesión el alumno, cargando sus materias asociadas.
- [x] Integrar promedio de calificaciones, % de asistencia general y estado del ciclo lectivo.
- [x] Renderizar mensaje informativo si el alumno no registra inscripciones activas."

# HU6 (HECHO)
create_task_if_not_exists \
  "HU6: Visualización de Cursos y Gestión Académica del Docente" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-04
- **Usuario:** Docente / Profesor
- **Prioridad:** Alta | **Riesgo:** Medio | **Estimación:** 5 SP
- **Iteración Planificada:** Sprint 8
- **Estado:** Done (Completado)

---
### Descripción
Como docente, quiero visualizar mis cursos asignados, gestionar las calificaciones y tomar asistencia a los alumnos matriculados.

---
### Tareas Técnicas de Desarrollo
- [x] **Supabase:** Diseñar consultas asociando \`courses\`, docentes vinculados y alumnos inscritos.
- [x] **Next.js:** Diseñar la grilla de control de notas y asistencia con Mantine Accordion por curso.
- [x] **Next.js:** Programar interfaz interactiva para modificar notas y tomar asistencia.
- [x] **Next.js (API):** Crear Server Actions para enviar actualizaciones en lote a \`grades\` y \`attendance_records\`.

---
### Criterios de Aceptación (Validación)
- [x] El docente puede seleccionar sus cursos activos y ver el listado de alumnos matriculados.
- [x] Permitir modificar calificaciones e impactar en Supabase de forma inmediata.
- [x] Validar notas dentro del rango permitido (1 al 10)."

# T02_REP (PENDIENTE)
create_task_if_not_exists \
  "T02_REP: Listado Consolidado de Docentes por Nivel Educativo" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-09 / REQ-ADM-02
- **Usuario:** Dirección / Administración
- **Prioridad:** Baja | **Riesgo:** Bajo | **Estimación:** 2 SP
- **Iteración Planificada:** Sprint 8
- **Estado:** To Do (Pendiente)

---
### Descripción
Como miembro de la dirección, quiero consultar la distribución consolidada del cuerpo docente agrupada por nivel educativo (Inicial, Primario, Secundario) con control de acceso jerárquico.

---
### Tareas Técnicas de Desarrollo
- [ ] **Supabase:** Escribir consulta que agrupe docentes, materias a cargo y comisiones por nivel.
- [ ] **Next.js:** Maquetar vista analítica protegida por RBAC para la dirección.

---
### Criterios de Aceptación (Validación)
- [ ] Acceso restringido únicamente a usuarios con rol de Dirección / Admin.
- [ ] Grilla consolidada por nivel educativo con información de profesores y comisiones asignadas."

echo "Carga verificada y completada exitosamente."