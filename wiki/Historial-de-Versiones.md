# Historial de Versiones y Evolución del Sistema

Este documento resume la evolución cronológica del sistema de gestión del Centro Educativo "Educar para Transformar", detallando los principales hitos funcionales y refactorizaciones arquitectónicas.

---

## 1. Registro de Hitos y Versiones

### v1.0 — Consolidación de Arquitectura y Refactorización UI
* **Fecha:** Septiembre / Octubre 2026
* **Alcance:**
  - Desacoplamiento modular de componentes monolíticos (`AdminUsersFeature`, `useAdminUsers`).
  - Creación de componentes atómicos independientes como `<RoleBadge />` con soporte para prevención de daltonismo.
  - Estandarización de espaciados bajo la grilla de 8 puntos (8-Point Grid) en todos los paneles.
  - Consolidación del panel No Docente con emisión de reportes operativos en PDF.
  - Depuración de estilos y optimización del ciclo de renderizado en React evitando claves inestables.

---

### v0.5 — Implementación de Historias de Usuario Priorizadas
* **Fecha:** Agosto 2026
* **Alcance:**
  - **HU1:** Alta de alumnos con validación síncrona de DNI único y generación correlativa de legajo.
  - **HU2:** Módulo de asignación de materias y cursos a docentes con prevención de choques de horario.
  - **HU3:** Reporte académico consolidado 360° para alumnos y tutores.
  - **HU4:** Listado de alumnos por curso ordenado alfabéticamente (grilla de 5 columnas).
  - **HU5:** Gestión integral de tareas y avisos de mantenimiento para personal No Docente.
  - **HU6:** Grilla de carga horaria docente con registro de notas y asistencia por clase.

---

### v0.4 — Arquitectura Relacional y Seguridad RLS
* **Fecha:** Mayo 2026
* **Alcance:**
  - Transición del esquema inicial a un modelo relacional normalizado en PostgreSQL/Supabase.
  - Creación de las tablas maestras `profiles`, `app_roles`, `profile_roles`, `students`, `teachers`, `courses`, `assessments`, `grades` y `attendance_records`.
  - Configuración e implementación de políticas de seguridad **Row Level Security (RLS)** para restringir el acceso a nivel de fila según el rol autenticado.
  - Implementación de triggers para marcas de tiempo automáticas (`updated_at`).

---

### v0.3 — Autenticación y Paneles por Rol
* **Fecha:** Mayo 2026
* **Alcance:**
  - Integración de Supabase Auth con soporte para inicio de sesión seguro.
  - Agrupación de rutas en App Router por perfiles de usuario: `(admin)`, `(docente)`, `(alumno)`, `(tutor)`, `(no-docente)`.
  - Creación del middleware y Server Actions para validación de sesiones y roles.

---

### v0.2 — Identidad Visual y Portal Público
* **Fecha:** Junio 2026
* **Alcance:**
  - Construcción de la experiencia pública institucional del centro educativo.
  - Presentación institucional, oferta académica y formulario de contacto web (`contact_messages`).
  - Módulo de recepción de solicitudes de inscripción pública (`inscription_requests`).

---

### v0.1 — Configuración Base del Proyecto
* **Fecha:** Mayo 2026
* **Alcance:**
  - Inicialización del repositorio y estructura de carpetas en TypeScript.
  - Configuración del framework Next.js con App Router.
  - Integración de la librería de componentes Mantine UI y Emotion para soporte de estilos.

