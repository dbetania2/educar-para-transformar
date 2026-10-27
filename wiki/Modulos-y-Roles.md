# Módulos y Roles

## Épicas (módulos funcionales)

Cada épica se identifica en el tablero con una etiqueta.

| Épica | Etiqueta | Alcance |
|---|---|---|
| Alumnos | `épica: alumnos` | Legajos, padrón, datos de contacto, baja lógica |
| Docentes | `épica: docentes` | Perfiles docentes, asignación de materias y cursos |
| Extracurriculares | `épica: extracurriculares` | Deportes, comedor y transporte |
| Reportes | `épica: reportes` | Panel analítico (MIS) e informes consolidados |

## Roles del sistema

Cada rol accede únicamente a su panel (RBAC).

| Rol | Puede |
|---|---|
| **Administrador** | Gestionar toda la información: alumnos, docentes, niveles, cursos, materias, deportes, horarios, inscripciones, transporte, comedor, usuarios y permisos. Acceder a todos los reportes |
| **No Docente** | Gestionar tareas y avisos administrativos |
| **Docente** | Ver sus cursos, registrar notas y asistencias |
| **Alumno** | Consultar su información académica y materiales |
| **Tutor (padre/madre)** | Consultar la información **solo de sus hijos**: profesores por materia, deportes, inscripción al cursado |

## Datos mínimos

**Alumno:** Legajo, DNI, Nombre, Apellido, Fecha de nacimiento, Domicilio, Teléfono, Correo, Nivel educativo, Curso, Estado.

**Docente:** Legajo, DNI, Nombre, Apellido, Especialidad, Correo, Teléfono, Estado.

## Reglas de negocio

**Académicas**
- Cada alumno pertenece a **un único curso**, y cada curso a **un único nivel educativo**.
- Un alumno puede cursar varias materias.
- Una materia puede dictarse en distintos cursos y tener distintos profesores según el curso.
- No se permiten superposiciones horarias en la agenda de un docente.

**Extracurriculares**
- Cada alumno puede inscribirse a **máximo 2 deportes**, sin conflicto de horarios entre ellos.
- Cada deporte tiene un profesor responsable y puede tener grupos según nivel y horario.
- El transporte tiene **4 recorridos fijos**.
- Los alumnos pueden inscribirse al comedor.

**Acceso e integridad**
- Un tutor puede tener uno o varios hijos asociados y solo ve la información de ellos.
- Cada usuario solo accede a las secciones de su rol.
- No se permiten inscripciones duplicadas.
- Las bajas son **lógicas** (estado `Inactivo`) para conservar el historial.
