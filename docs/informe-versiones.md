# Informe general de versiones

**Proyecto:** Educar Para Transformar  
**Fecha del informe:** 3 de junio de 2026

Este documento resume la evolución general del proyecto por etapas funcionales. No detalla cada commit técnico, sino los principales hitos de desarrollo alcanzados.

---

## v0.1 - Configuración inicial del proyecto

Se realizó la configuración base del proyecto y se definió la arquitectura inicial de la aplicación.

**Incluye:**

- Configuración inicial del repositorio.
- Implementación de Next.js con App Router.
- Integración de Mantine y Emotion para la interfaz visual.
- Organización inicial de carpetas, componentes y estructura general.

---

## v0.2 - Identidad visual y página de inicio

Se construyó la primera experiencia pública del sitio, enfocada en la presentación institucional.

**Incluye:**

- Layout principal del sitio.
- Hero de la página de inicio.
- Navegación responsive.
- Definición de tema visual, colores y tokens de diseño.
- Footer institucional.
- Ajustes de visualización en dispositivos móviles.
- Correcciones para mejorar la carga inicial de estilos.

---

## v0.3 - Páginas públicas institucionales

Se agregaron las principales secciones públicas del sitio web.

**Incluye:**

- Página de Contacto.
- Página de Nosotros.
- Página de Noticias.
- Estandarización de botones y llamados a la acción.
- Mejoras visuales generales en las páginas públicas.

---

## v0.4 - Integración con Supabase

Se incorporó Supabase como base para registrar información enviada desde el sitio.

**Incluye:**

- Integración del formulario de contacto con Supabase.
- Registro de consultas enviadas desde la web.
- Base inicial para flujos dinámicos conectados a datos reales.

---

## v0.5 - Panel administrativo y refactor general

Se realizó una reorganización importante del proyecto y se incorporó la base del panel administrativo.

**Incluye:**

- Refactor general de la aplicación.
- Creación de la estructura del panel de administración.
- Ajustes visuales del área administrativa.
- Mejoras en formularios y botones.
- Correcciones para asegurar compatibilidad con build de producción.

---

## v0.6 - Campus académico y roles de usuario

Se amplió el sistema para soportar distintos perfiles institucionales.

**Incluye:**

- Estructura para roles de usuario.
- Dashboards para perfiles académicos.
- Secciones para alumnos, docentes, tutores y administración.
- Navegación interna del campus.
- Vistas iniciales de cursos y seguimiento académico.

---

## v0.7 - Gestión académica y usuarios

Se incorporaron herramientas administrativas para gestionar usuarios y datos académicos.

**Incluye:**

- Gestión de usuarios desde administración.
- Creación manual de alumnos.
- Ajustes de perfiles.
- Seeds de usuarios y datos académicos.
- Accesos centralizados mediante modales.
- Migración hacia un modelo de datos relacional para estudiantes.

---

## v0.8 - Noticias y materiales educativos

Se agregaron funcionalidades vinculadas a comunicación institucional y recursos académicos.

**Incluye:**

- Gestión de noticias desde el panel administrativo.
- Visualización pública de noticias.
- Descarga de materiales de cursos.
- Ajustes de carga de imágenes en noticias.

---

## v0.9 - Mejoras de experiencia en el campus

Se trabajó sobre la experiencia de uso en las áreas internas del sistema.

**Incluye:**

- Mejoras de UI/UX en administración.
- Mejoras de UI/UX en perfiles docente, alumno y tutor.
- Ajustes de estilos generales.
- Corrección de contraseñas iniciales para usuarios académicos.

---

## v1.0 - Área no docente, reportes y datos demo

Se incorporó soporte para perfiles no docentes y vistas de seguimiento institucional.

**Incluye:**

- Dashboard para perfil no docente.
- Reportes institucionales.
- Datos demo para presentación y prueba del sistema.
- Cursos activos y flujos preparados para demostración.

---

## v1.1 - Galería institucional en Nosotros

Se enriqueció la página Nosotros con contenido visual institucional.

**Incluye:**

- Galería de imágenes institucionales.
- Secciones visuales para comunidad educativa, deportes e instalaciones.
- Incorporación de imágenes específicas para actividades e infraestructura.

---

## v1.2 - Ajustes finales de páginas públicas

Se realizaron mejoras finales en las páginas públicas para una presentación más completa.

**Incluye:**

- Reorganización de la página Nosotros.
- Carruseles integrados dentro de cada sección de contenido.
- Modal de imágenes con navegación entre fotos de cada galería.
- Optimización de carga en Noticias.
- Incorporación de un bloque de Bolsa de empleo dentro de Contacto.
- Validación de build para producción.

---

## Estado actual

El proyecto cuenta actualmente con una base pública institucional, paneles internos por rol, integración con Supabase, gestión de noticias, materiales educativos, reportes y una presentación visual más completa de la institución.

La última versión validada compila correctamente para producción.
