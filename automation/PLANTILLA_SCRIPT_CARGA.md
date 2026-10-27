# Plantilla y Documentación Técnica del Script de Carga (`cargar_tickets.sh`)

Esta guía técnica explica la estructura interna de los scripts de automatización y cómo utilizarlos como plantilla base reutilizable para cargar nuevas tandas de tickets (Historias de Usuario y Tareas Técnicas) en GitHub sin generar duplicados.

---

## 1. Regla de Nomenclatura de Títulos

Para mantener la ordenación y claridad del backlog, se debe respetar el siguiente formato:
- **Historias de Usuario:** Usar `HU1`, `HU2`, `HU3`... (Ej: `HU1: Alta de Legajo de Nuevo Alumno`).
- **Tareas Técnicas / Individuales:** Usar `T01`, `T02`, `T03`... (Ej: `T01: Configuración del Entorno de Desarrollo y Estructura Base`).
- 🛑 **NO usar:** `TASK-01`, `Tarea 1`, `Task`, etc.

---

## 2. Estructura de la Plantilla Base

El script utiliza una función que valida la existencia previa del ticket antes de crearlo (Idempotencia).

```bash
#!/usr/bin/env bash

# 1. Configuración de Repositorio y Proyecto GitHub:
REPO="dbetania2/educar-para-transformar"
OWNER="dbetania2"
PROJECT_NUM="3" # Proyecto 'ept' en Projects v2

echo "Iniciando carga verificada de tickets en $REPO (Proyecto #$PROJECT_NUM)..."

# 2. Función Antiduplicados (Idempotente):
create_task_if_not_exists() {
  local title="$1"
  local body="$2"

  # Buscar si ya existe un issue con el título exacto en GitHub
  local existing_url
  existing_url=$(gh issue list --repo "$REPO" --search "\"$title\" in:title" --json url,title --jq ".[] | select(.title == \"$title\") | .url" | head -n 1)

  if [ -n "$existing_url" ]; then
    echo "⚠️  OMITIDO (Ya existe): '$title'"
    echo "   URL: $existing_url"
    # Asegurar vinculación al tablero de proyecto
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

# ==============================================================================
# 3. LISTADO DE TAREAS / HISTORIAS DE USUARIO A CARGAR
# ==============================================================================

# Ejemplo para Tarea Técnica:
create_task_if_not_exists \
  "T01: Nombre de la Tarea Técnica" \
  "### Ficha Técnica
- **Tipo:** Tarea Técnica / Infrastructure
- **Prioridad:** Alta | **Estimación:** 3 SP
- **Iteración Planificada:** Sprint 1

---
### Descripción
Como desarrollador, quiero [objetivo técnico], para [propósito].

---
### Criterios de Aceptación
- [ ] Criterio 1.
- [ ] Criterio 2."
```

---

## 3. Beneficios de esta arquitectura

* **Cero duplicados:** Si el script se interrumpe o se vuelve a ejecutar, omitirá los tickets que ya fueron creados previamente.
* **Vinculación automática:** Cada ticket recién creado (o re-verificado) queda automáticamente asignado al tablero de **GitHub Projects v2**.

