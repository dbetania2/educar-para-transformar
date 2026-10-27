#!/usr/bin/env bash

# Configuración de Repositorio y Proyecto GitHub:
REPO="dbetania2/educar-para-transformar"
OWNER="dbetania2"
PROJECT_NUM="3" # Proyecto 'ept' en Projects v2

echo "Iniciando carga de Tarea Inicial en $REPO (Proyecto #$PROJECT_NUM)..."

create_task_if_not_exists() {
  local title="$1"
  local body="$2"

  # Buscar si ya existe un issue con el título exacto en GitHub
  local existing_url
  existing_url=$(gh issue list --repo "$REPO" --search "\"$title\" in:title" --json url,title --jq ".[] | select(.title == \"$title\") | .url" | head -n 1)

  if [ -n "$existing_url" ]; then
    echo "⚠️  OMITIDO (Ya existe): '$title'"
    echo "   URL: $existing_url"
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

# T01: Configuración del entorno
create_task_if_not_exists \
  "T01: Configuración del Entorno de Desarrollo y Estructura Académica Base" \
  "### Ficha Técnica
- **Requerimiento:** REQ-ADM-01.1
- **Tipo:** Tarea Técnica / Infrastructure
- **Prioridad:** Alta | **Estimación:** 3 SP
- **Iteración Planificada:** Sprint 1
- **Estado:** Done (Completado)

---
### Descripción
Como desarrollador, quiero configurar el entorno local de trabajo con Next.js (App Router, Mantine UI) y la estructura base en Supabase (PostgreSQL), para contar con la infraestructura necesaria para desarrollar las Historias de Usuario del proyecto.

---
### Tareas Técnicas de Desarrollo
- [x] **Entorno:** Inicializar proyecto Next.js con TypeScript, App Router y Mantine UI.
- [x] **Base de Datos:** Configurar conexión a Supabase PostgreSQL y esquemas iniciales.
- [x] **Estructura Académica:** Definir tablas relacionales para Niveles, Cursos y Materias.

---
### Criterios de Aceptación (Validación)
- [x] Entorno local configurado y ejecutable (\`npm run dev\`).
- [x] Estructura base de carpetas (Atomic Design, App Router) y dependencias de UI/Supabase inicializadas.
- [x] Configuración del repositorio Git y variables de entorno (\`.env.local\`) validadas."

echo "Carga de tarea inicial completada exitosamente."
