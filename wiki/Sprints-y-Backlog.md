# Sprints y Product Backlog

Este documento detalla la planificación ágil bajo el marco de trabajo **Scrum**, la estimación de esfuerzo en **Story Points (SP)** y el desglose de las **Historias de Usuario (HU)** implementadas en el proyecto.

---

## 1. Metodología y Timeboxing

El equipo de desarrollo ("Los Metódicos") opera con iteraciones semanales rígidas:
* **Duración de cada Sprint:** 1 semana (5 días hábiles).
* **Lunes:** *Sprint Planning Meeting* (definición de Sprint Goal, estimación y desglose de tareas técnicas).
* **Martes a Jueves:** *Daily Scrum* (15 min) y desarrollo activo en capas (DB, Backend, UI).
* **Viernes:** *Sprint Review* con demostración funcional del incremento y *Sprint Retrospective*.

---

## 2. Historias de Usuario Priorizadas

Las 6 Historias de Usuario implementadas cumplen con los criterios de calidad **INVEST** (Independientes, Negociables, Valiosas, Estimables, Pequeñas y Testeables):

| Código | Título de la Historia de Usuario | Rol Beneficiario | Story Points | Sprint | Estado |
|:---:|---|:---:|:---:|:---:|:---:|
| **HU1** | Alta de Legajo y Ficha de Alumno | Administrador | 5 SP | Sprint 2 | **Completado** |
| **HU2** | Asignación Docente sin Choques Horarios | Administrador | 8 SP | Sprint 4 | **Completado** |
| **HU3** | Reporte Académico Consolidado por Alumno | Alumno / Tutor | 8 SP | Sprint 8 | **Completado** |
| **HU4** | Listado de Alumnos por Curso (5 columnas) | Administrativo | 5 SP | Sprint 6 | **Completado** |
| **HU5** | Gestión Operativa y Reportes de Tareas | No Docente | 5 SP | Sprint 7 | **Completado** |
| **HU6** | Carga Horaria, Notas y Asistencias | Docente | 8 SP | Sprint 8 | **Completado** |

---

## 3. Desglose Estándar de Tareas Técnicas por HU

Cada Historia de Usuario se descompone en 4 tareas técnicas concretas dentro del tablero:

```
[HU-X] Historia de Usuario
  ├── T1 (DB): Modelado de tablas, constraints y políticas RLS en PostgreSQL/Supabase.
  ├── T2 (Backend): Server Actions, validación de reglas de negocio y mutaciones seguras.
  ├── T3 (UI/Frontend): Componentes atómicos en Mantine, grillas responsivas y formularios.
  └── T4 (QA): Pruebas manuales cruzadas, validación de criterios de aceptación y build check.
```

### Detalle de Implementación por Historia:

* **HU1 — Alta de Alumno (`REQ-ALU-01.1`, `REQ-ALU-02`):**
  - Validación síncrona en base de datos de unicidad de DNI y generación de legajo correlativo.
  - Formulario responsivo con campos obligatorios validados en cliente y servidor.
* **HU2 — Asignación Docente (`REQ-PRF-03`):**
  - Motor de validación de colisiones de horario: impide asignar un profesor si ya tiene asignada otra materia en el mismo horario y día de la semana.
* **HU3 — Reporte Consolidado (`REQ-ADM-03`):**
  - Consulta integral unificando notas, porcentaje de asistencias por asignatura, deporte asignado y transporte.
* **HU4 — Listado de Alumnos por Curso (`REQ-ADM-07`):**
  - Grilla responsiva de 5 columnas (Nivel, Curso, Legajo, Apellido, Nombre) ordenada alfabéticamente por apellido.
* **HU5 — Panel No Docente (`REQ-ADM-10`):**
  - Registro de incidentes de infraestructura con priorización, cambio de estado y exportación a informe PDF.
* **HU6 — Carga Horaria y Asistencias (`REQ-ADM-04`):**
  - Calendario semanal para el docente con registro directo de ausencias/presentismos y actas de calificaciones.

---

## 4. Definición de Hecho (Definition of Done - DoD)

Una Historia de Usuario se considera formalmente **Done** únicamente cuando:
1. Las 4 tareas técnicas (DB, Backend, UI, QA) están completadas.
2. Cumple al 100% con sus criterios de aceptación funcionales.
3. El código respeta la arquitectura en capas y Atomic Design sin estilos duplicados.
4. Las pruebas de compilación (`npm run build`) y linter (`npm run lint`) finalizan sin errores.
5. El Pull Request asociado fue revisado y fusionado a la rama `main`.

