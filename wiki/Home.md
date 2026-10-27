# Educar para Transformar — Sistema de Gestión

Bienvenido/a a la Wiki del **Sistema de Gestión del Centro Educativo "Educar para Transformar"**.

## ¿Qué es?

Un sistema web **centralizado y responsivo** que unifica los procesos académicos, administrativos y de servicios del colegio (apertura proyectada: **marzo 2027**).

Reemplaza la gestión manual, que hoy genera:
- Inconsistencia de datos.
- Riesgo de inscripciones duplicadas.
- Superposición de horarios docentes.
- Falta de control de cupos en transporte, comedor y deportes.

## Objetivos

1. **Control académico:** gestión de alumnos y docentes sin planillas, sin DNI duplicados ni choques de horario.
2. **Logística extracurricular:** máximo 2 deportes por alumno sin superposición horaria, comedor y 4 recorridos fijos de transporte.
3. **Gestión analítica y seguridad:** reportes para la Dirección protegidos por roles.
4. **Calidad y despliegue:** pruebas integrales y publicación en producción.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Mantine UI, Emotion |
| Backend | Next.js Server Actions + Supabase (BaaS) |
| Base de datos | PostgreSQL (Supabase) con Row Level Security |
| Despliegue | Vercel |
| Gestión | GitHub Issues, GitHub Projects (Kanban), GitHub Actions |

## Equipo — "Los Metódicos"

| Integrante | GitHub | Responsabilidad principal |
|---|---|---|
| Daiana Betania Del Grecco | [@dbetania2](https://github.com/dbetania2) | Módulos Alumnos y Docentes |
| Angelo Gallardi | [@angelogllrd](https://github.com/angelogllrd) | Base de datos, Administración y Reportes |

## Navegación

- [Arquitectura](Arquitectura)
- [Módulos y Roles](Modulos-y-Roles)
- [Requerimientos](Requerimientos)
- [Reportes](Reportes)
- [Modelo de Datos](Modelo-de-Datos)
- [Sprints y Backlog](Sprints-y-Backlog)
- [Flujo de Trabajo](Flujo-de-Trabajo)
- [Guía de Frontend](Guia-de-Frontend)
- [Instalación y Despliegue](Instalacion-y-Despliegue)
- [Historial de Versiones](Historial-de-Versiones)
