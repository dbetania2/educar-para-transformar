# Educar para Transformar 🎓

> Plataforma web integral para la gestión académica y administrativa de instituciones educativas.

**Educar para Transformar** centraliza la administración de cursos, solicitudes de inscripción, legajos, calificaciones, asistencia y novedades institucionales, conectando a docentes, alumnos, tutores y personal administrativo en un entorno único y accesible.

---

## 🚀 Funcionalidades Principales

### 🏢 Módulo Administrativo y No-Docentes
* **Gestión de inscripciones:** Revisión y aprobación de solicitudes de ingreso.
* **Administración central:** Control total de legajos, cursos, asignaturas y bandeja de mensajes de contacto.

### 👩‍🏫 Módulo para Docentes
* **Gestión de aulas:** Visualización rápida de cursos asignados y listados actualizados de alumnos.
* **Seguimiento académico:** Herramientas para la carga de calificaciones, toma de asistencia y administración de materiales de estudio.

### 👨‍🎓 Portal de Alumnos y Tutores
* **Autogestión:** Sistema integrado para la inscripción a asignaturas.
* **Consultas en tiempo real:** Acceso directo e inmediato a notas, historial académico y registro de asistencia.

### 📰 Sección Institucional
* **Cartelera virtual:** Publicación y visualización de noticias, eventos y comunicados oficiales de la institución.

---

## ⚙️ Cómo Ejecutar el Proyecto

### Requisitos Previos
* **Node.js**: Versión 18 o superior.
* **Gestor de paquetes**: `npm`, `yarn` o `pnpm`.
* **Base de Datos**: Cuenta activa en [Supabase](https://supabase.com/) con las claves correspondientes del proyecto.

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/dbetania2/educar-para-transformar.git
   cd educar-para-transformar
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo llamado `.env.local` en la raíz del proyecto y agrega tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Visualizar la aplicación:**
   Abre tu navegador web e ingresa a [http://localhost:3000](http://localhost:3000).

---

## 👥 Integrantes del Equipo

* **Daiana Del Grecco**
* **Angelo Gallardi**