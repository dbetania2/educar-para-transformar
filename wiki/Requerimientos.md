# Requerimientos del Sistema

Este documento consolida la matriz de especificación de **Requerimientos Funcionales (RF)** y **Requerimientos No Funcionales (RNF)** del Centro Educativo "Educar para Transformar", detallando su estado de implementación y trazabilidad.

---

## 1. Matriz de Requerimientos

| Código | Tipo | Requerimiento | Descripción | Estado |
|---|---|---|---|---|
| **REQ-ADM-01.1** | RF | Configuración Académica Base | Configuración de niveles educativos, cursos, materias y correlatividades. | **Implementado** |
| **REQ-ADM-01.2** | RF | Matriculación de Alumnos | Asignación de alumnos a cursos y comisiones lectivas. | **Implementado** |
| **REQ-ADM-01.3** | RF | Control de Deportes | Alta de disciplinas. Validación de máximo 2 deportes por alumno y control de no superposición horaria. | Planificado |
| **REQ-ADM-01.4** | RF | Comedor y Transporte | Inscripción extracurricular y asignación a 4 recorridos fijos de transporte escolar. | Planificado |
| **REQ-ADM-01.5** | RF | Control de Acceso por Roles (RBAC) | Gestión jerárquica de permisos por panel (Admin, No Docente, Docente, Alumno, Tutor). | **Implementado** |
| **REQ-ADM-02** | RF | Acceso Jerárquico a Reportes | Restricción de acceso al panel analítico institucional según rol directivo. | **Implementado** |
| **REQ-ADM-03** | RF | Reporte Consolidado por Alumno | Ficha integral con materias, calificaciones, asistencias, deportes y servicios. | **Implementado (HU3)** |
| **REQ-ADM-04** | RF | Carga Horaria Docente | Grilla de horarios y asignaturas asignadas al profesor por nivel y curso. | **Implementado (HU6)** |
| **REQ-ADM-07** | RF | Listado de Alumnos por Curso | Grilla académica ordenada alfabéticamente por apellido (5 columnas). | **Implementado (HU4)** |
| **REQ-ADM-08** | RF | Listado de Alumnos por Materia | Filtro analítico por nivel, curso, materia y docente responsable. | Planificado |
| **REQ-ADM-09** | RF | Listado de Docentes por Nivel | Reporte de profesores, materias asignadas y comisiones por nivel. | Planificado |
| **REQ-ADM-10** | RF | Gestión de Tareas No Docentes | Registro, categorización por prioridad, cambio de estado (Pendiente/Resuelta) y reporte PDF. | **Implementado (HU5)** |
| **REQ-ADM-11** | RF | Listado de Transporte Escolar | Padrón de alumnos organizado por recorrido asignado. | Planificado |
| **REQ-ADM-12.1** | RF | Alumnos por Deporte | Padrón de participantes por disciplina deportiva con curso y nivel. | Planificado |
| **REQ-ADM-12.2** | RF | Alumnos por Deporte y Nivel | Listado consolidado por disciplina y nivel educativo. | Planificado |
| **REQ-ADM-12.3** | RF | Reporte Deporte / Horario / Docente | Filtro por disciplina, nivel, horario y profesor a cargo. | Planificado |
| **REQ-ALU-01.1** | RF | Alta de Alumno | Registro de alumno con verificación síncrona de DNI único. | **Implementado** |
| **REQ-ALU-01.2** | RF | Padrón y Filtros de Alumnos | Búsqueda por legajo, apellido o curso con respuesta menor a 3 segundos. | **Implementado** |
| **REQ-ALU-01.3** | RF | Modificación de Contacto | Actualización de teléfono, domicilio o correo, bloqueando edición de DNI y legajo. | Planificado |
| **REQ-ALU-01.4** | RF | Baja Lógica de Alumno | Desactivación del alumno (estado `Inactivo`) preservando integridad histórica. | Planificado |
| **REQ-ALU-02** | RF | Legajo Único de Alumno | Generación y control de legajo correlativo institucional. | **Implementado (HU1)** |
| **REQ-PRF-01.1** | RF | Alta de Docente | Registro individual con verificación de DNI y legajo docente. | Planificado |
| **REQ-PRF-01.2** | RF | Consulta de Docentes | Búsqueda por apellido o especialidad académica. | Planificado |
| **REQ-PRF-01.3** | RF | Modificación de Docente | Actualización de perfil docente con campos clave protegidos. | Planificado |
| **REQ-PRF-01.4** | RF | Baja Lógica de Docente | Desactivación lógica de perfiles docentes conservando historial de cursos. | Planificado |
| **REQ-PRF-02** | RF | Atributos Docentes | Registro de especialidad, teléfono, correo y disponibilidad horaria. | **Implementado** |
| **REQ-PRF-03** | RF | Asignación Académica Docente | Asignación de materias y comisiones con validación de choques de horario. | **Implementado (HU2)** |
| **RNF-01** | RNF | Seguridad y RLS | Protección de datos a nivel de fila mediante Row Level Security en PostgreSQL. | **Implementado** |
| **RNF-02** | RNF | Rendimiento | Tiempos de respuesta $\le$ 3 segundos en búsquedas, grillas y reportes. | **Implementado** |
| **RNF-03** | RNF | Persistencia en la Nube | Base de datos relacional PostgreSQL administrada y respaldada en Supabase. | **Implementado** |
| **RNF-04** | RNF | Usabilidad y Accesibilidad | Interfaz web 100% responsiva (móvil, tablet, escritorio) construida con Mantine UI. | **Implementado** |

---

## 2. Reglas de Negocio Críticas

1. **Unicidad de Identidad:** DNI y Legajo son inmutables tras su creación y no admiten duplicados en todo el sistema.
2. **Restricción de Cursado:** Un alumno pertenece a un único curso a la vez; cada curso pertenece a un único nivel educativo.
3. **Incompatibilidad Horaria Docente:** No se permite asignar a un docente dos cursos o materias cuyos horarios se superpongan en el mismo día.
4. **Límite Extracurricular:** Cada alumno puede inscribirse en hasta **2 deportes como máximo**, debiendo existir compatibilidad horaria entre ellos.
5. **Preservación Histórica:** No existen eliminaciones físicas en tablas maestras. Toda desvinculación se realiza mediante baja lógica (`is_active = false`).

