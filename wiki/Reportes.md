# Catálogo de Reportes Institucionales

El sistema cuenta con un módulo de emisión y consulta de reportes estructurados para la Dirección, el personal administrativo y el seguimiento académico de los alumnos.

---

## 1. Matriz de Reportes y Vistas

| # | Reporte / Vista | Columnas Obligatorias | Acceso por Rol | Ticket / HU | Estado |
|:-:|---|---|---|:-:|:-:|
| **1** | **Reporte Consolidado por Alumno** | Curso actual, Materias inscriptas, Profesor por materia, Calificaciones, Porcentaje de asistencia, Deportes y horarios, Servicio de transporte, Servicio de comedor | Dirección, Alumno, Tutor | **HU3** | **Implementado** |
| **2** | **Reporte por Docente (Carga Horaria)** | Cursos a cargo agrupados por Nivel Educativo (Inicial, Primario, Secundario), Materia dictada, Días y horarios de cursado | Dirección, Docente | **HU6** | **Implementado** |
| **3** | **Listado de Alumnos por Curso** | Nivel Educativo, Curso / División, Legajo, Apellido, Nombre *(Orden alfabético)* | Dirección, Docente, No Docente | **HU4** | **Implementado** |
| **4** | **Gestión Operativa No Docente** | Tarea / Mantenimiento, Categoría, Nivel de prioridad, Responsable, Estado (Pendiente / Resuelta), Exportación PDF | Dirección, No Docente | **HU5** | **Implementado** |
| **5** | **Listado de Alumnos por Materia** | Nivel Educativo, Curso, Materia, Docente a cargo, Apellido, Nombre, Legajo | Dirección, Docente | T01_REP | Planificado |
| **6** | **Listado de Docentes por Nivel Educativo** | Nivel Educativo, Apellido y Nombre, Legajo, Especialidad, Materias asignadas, Comisiones | Dirección | T02_REP | Planificado |
| **7** | **Listado de Alumnos por Deporte** | Disciplina deportiva, Apellido y Nombre del alumno, Legajo, Curso, Nivel Educativo | Dirección, Coordinador Deportivo | T01_EXT | Planificado |
| **8** | **Listado de Alumnos por Deporte y Nivel** | Deporte, Nivel Educativo, Total de matriculados, Alumnos agrupados por curso | Dirección, Coordinador Deportivo | T01_EXT | Planificado |
| **9** | **Listado Deporte / Horario / Docente** | Deporte, Nivel Educativo, Franja horaria, Docente responsable, Cupo cubierto, Alumnos inscriptos | Dirección, Docente | T01_REP | Planificado |
| **10** | **Listado de Alumnos por Transporte** | Recorrido asignado (Norte, Sur, Este, Oeste), Apellido, Nombre, Legajo, Curso, Dirección de parada | Dirección, Logística | T01_REP | Planificado |

---

## 2. Detalle de Reportes Clave Implementados

### Reporte Consolidado por Alumno (`REQ-ADM-03` / `HU3`)
Permite visualizar la trayectoria integral de un estudiante en una vista 360° unificada:
- **Datos Personales y de Contacto:** Legajo, DNI, datos del tutor asignado.
- **Rendimiento Curricular:** Materias en curso, docentes a cargo, historial de calificaciones parciales y promedio general acumulado.
- **Asistencia:** Porcentaje global y desglose por asignatura.
- **Servicios:** Estado de asignación a comedor escolar, recorrido de transporte y disciplinas deportivas activas.

### Reporte de Carga Horaria Docente (`REQ-ADM-04` / `HU6`)
Herramienta de control pedagógico y administrativo:
- Permite a la Dirección auditar la distribución de horas cátedra de cada docente.
- Valida que no existan solapamientos de horario entre distintas comisiones.
- Entrega al docente un calendario visual consolidado de su semana lectiva.

### Listado de Alumnos por Curso (`REQ-ADM-07` / `HU4`)
- Grilla estandarizada de 5 columnas para secretaría académica.
- Ordenamiento alfabético por Apellido y Nombre.
- Permite generar planillas rápidas de control para inicio de ciclo lectivo.

### Panel de Gestión No Docente (`REQ-ADM-10` / `HU5`)
- Seguimiento de incidencias edilicias, operativas y de mantenimiento del establecimiento.
- Filtros por estado (*Pendiente*, *En Proceso*, *Resuelta*) y prioridad (*Alta*, *Media*, *Baja*).
- Capacidad de exportación de actas e informes en formato PDF descargable.

