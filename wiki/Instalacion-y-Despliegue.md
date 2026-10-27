# Guía de Instalación y Despliegue

Este documento describe los pasos técnicos para configurar el entorno de desarrollo local y realizar el despliegue del sistema en producción.

---

## 1. Requisitos Previos

- **Node.js:** Versión 20.x LTS o superior (definida en `.nvmrc` y `.node-version`).
- **Gestor de paquetes:** `npm` (v10+).
- **Git:** Para control de versiones.
- **Instancia de Base de Datos:** Proyecto activo en [Supabase](https://supabase.com).

---

## 2. Instalación Local

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/dbetania2/educar-para-transformar.git
cd educar-para-transformar
```

### Paso 2: Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar variables de entorno
Crear un archivo `.env.local` en la raíz del proyecto tomando como referencia la siguiente plantilla:

```env
# Supabase Configuration (Públicas del cliente)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica

# Supabase Service Role (Uso exclusivo en Server Actions del backend)
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-privada

# URL base de la aplicación
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> [!CAUTION]
> **Seguridad:** Nunca agregues claves reales en el control de versiones. El archivo `.env.local` está ignorado en `.gitignore`. La clave `SUPABASE_SERVICE_ROLE_KEY` otorga permisos de superusuario y solo debe emplearse en Server Actions del lado servidor.

---

## 3. Inicialización de la Base de Datos

Las migraciones de PostgreSQL se encuentran en la carpeta `supabase/migrations/` en orden secuencial cronológico:

1. Aplicar los archivos `.sql` directamente desde el SQL Editor de Supabase o mediante Supabase CLI:
   ```bash
   # Ejemplo utilizando Supabase CLI
   supabase db push
   ```
2. Las migraciones aplican automáticamente:
   - Extensiones criptográficas (`pgcrypto`).
   - Tablas maestras (`profiles`, `app_roles`, `students`, `teachers`, `courses`, etc.).
   - Triggers de actualización (`set_updated_at`).
   - Políticas de seguridad Row Level Security (RLS).

---

## 4. Scripts de Desarrollo y Calidad

| Comando | Acción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:3000` con hot reload. |
| `npm run build` | Compila la aplicación y valida tipos TypeScript para producción. |
| `npm run start` | Ejecuta el build compilado en modo producción. |
| `npm run lint` | Ejecuta ESLint para validar sintaxis y estilos de código. |

---

## 5. Despliegue en Producción (Vercel)

El proyecto está preparado para integración y despliegue continuo (**CI/CD**) a través de **Vercel**:

1. Vincular el repositorio `educar-para-transformar` en el panel de Vercel.
2. Configurar el Framework Preset como **Next.js**.
3. En la sección **Environment Variables**, declarar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (URL del dominio de producción provisto por Vercel).
4. El despliegue se ejecutará automáticamente ante cada *merge* confirmado en la rama `main`.

