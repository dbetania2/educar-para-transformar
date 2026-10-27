# Guía de Carga y Gestión del Backlog en GitHub

Procedimiento estándar para la creación por lotes de tickets mediante GitHub CLI (`gh`), organización en el Backlog y su posterior vinculación a GitHub Projects (`ept` - Proyecto #3).

---

## 1. Conceptos Fundamentales de Gestión (Backlog vs. Sprint Board)

- **Product Backlog (Fuente Única de Verdad):** Es el depósito central de todo el trabajo pendiente del proyecto (Épicas, Historias de Usuario, Tareas Técnicas y Bugs).
  - Todo ticket recién creado con el script debe ingresar primeramente al **Backlog**.
- **Sprint Board (Tablero de Trabajo Activo):** Es un subconjunto del Backlog. Solo debe contener los tickets asignados a la iteración activa actual (ej. *Sprint 2*, *Sprint 4*). Las historias planificadas para sprints futuros permanecen en el Backlog hasta que llegue su turno.

---

## 2. Nomenclatura Estándar Obligatoria de Tickets

Para mantener la consistencia y trazabilidad en el tablero, **todos los miembros del equipo deben respetar strictly el formato de títulos**:

- **Historias de Usuario:** Usar el prefijo **`HU1`**, **`HU2`**, **`HU3`**... 
  - *Ejemplo:* `HU1: Alta de Legajo de Nuevo Alumno`
- **Tareas Técnicas / Individuales:** Usar el prefijo **`T01`**, **`T02`**, **`T03`**...
  - *Ejemplo:* `T01: Configuración del Entorno de Desarrollo y Estructura Base`
  - ⚠️ **REGLA:** **NO** usar variaciones como `TASK-01`, `Tarea 1`, `Task`, etc. Usar únicamente `T01`, `T02`, etc.

---

## 3. Instalación y Autenticación de GitHub CLI (`gh`)

Instalá la herramienta según tu sistema operativo y autentícate en tu cuenta de GitHub:

```bash
gh auth login
```

---

## 4. Consideraciones Iniciales

- El directorio local `automation/` debe estar listado en `.gitignore` para no subir scripts auxiliares al repositorio.
- GitHub actúa como fuente única de verdad: una vez creados los tickets, el historial y la trazabilidad quedan registrados en la plataforma.
- Para conocer la estructura del script o agregar nuevas tandas de tickets, consulta la [Plantilla y Documentación Técnica del Script](file:///home/bet/Escritorio/automation/PLANTILLA_SCRIPT_CARGA.md).

---

## 5. Flujo de Trabajo para Cargar Tickets

1. **Editar el script:**
   Añade o modifica los tickets al final del script `automation/cargar_tickets.sh` (siguiendo la estructura explicada en [`PLANTILLA_SCRIPT_CARGA.md`](file:///home/bet/Escritorio/automation/PLANTILLA_SCRIPT_CARGA.md)).

2. **Ejecutar en terminal según el Sistema Operativo:**

   - **En Linux / macOS:**
     ```bash
     chmod +x automation/cargar_tickets.sh
     ./automation/cargar_tickets.sh
     ```

   - **En Windows (PowerShell / CMD / Git Bash):**
     ```powershell
     # Si usas Git Bash o WSL:
     chmod +x automation/cargar_tickets.sh
     ./automation/cargar_tickets.sh

     # Si usas PowerShell o CMD (con Git instalado):
     bash automation/cargar_tickets.sh
     ```

---

## 6. Configuración Recomendada de Pestañas (Vistas) en GitHub Projects

En tu tablero de **GitHub Projects** (`ept` - #3), se recomienda estructurar las siguientes pestañas/vistas:

### 📄 Pestaña 1: "Backlog" (Vista Principal)

- **Layout:** Lista / Tabla (`Table`) o Tablero (`Board`).
- **Propósito:** Almacenar y priorizar **todas** las Historias de Usuario (HU1 a HU6) y tareas creadas.
- **Campos clave:** `Title`, `Assignees`, `Status` (Backlog/Todo), `Iteration` (Sprint 2, Sprint 4, Sprint 6, Sprint 7, Sprint 8), `Labels`.

### 📊 Pestaña 2: "Sprint Board" (Tablero Kanban del Sprint Activo)

- **Layout:** Tablero de Columnas (`Board`).
- **Columnas recomendadas:** `Backlog` | `Ready` | `In progress` | `In review` | `Done`.
- **Filtro activo:** Filtrar para mostrar únicamente los elementos del Sprint en curso (ej: `Iteration: "Sprint 2"`).
- **Propósito:** Seguimiento diario del equipo sobre las tareas comprometidas para la iteración.

### 🗓️ Pestaña 3 (Opcional): "Roadmap" / "Planning"

- **Layout:** Cronograma (`Timeline`) o Tabla agrupada por el campo `Iteration`.
- **Propósito:** Visualizar de forma panorámica la distribución de las Historias de Usuario a lo largo de los Sprints planificados.

---

## 7. Instrucciones y Comandos para Colaboradores

Cualquier colaborador (con rol de edición o administración en el proyecto) puede consultar y actualizar el estado del tablero directamente desde su terminal (**funciona exactamente igual en Linux y Windows**).

### A. Permiso de Proyectos (Solo la primera vez)

```bash
gh auth refresh -s read:project
```

> **Nota sobre el dueño (`--owner dbetania2`):** El parámetro `--owner dbetania2` se incluye para indicarle a la consola la ubicación o cuenta creadora donde reside el tablero de proyecto (independientemente de que los colaboradores tengan rol de Administrador).

### B. Comandos de Consulta de Estado

- **Ver las tareas y su estado actual en la terminal:**

  ```bash
  gh project item-list 3 --owner dbetania2
  ```

- **Abrir el tablero en el navegador:**
  ```bash
  gh project view 3 --owner dbetania2 --web
  ```

### C. Refresco Periódico de Datos (Sincronización)

Dado que el equipo estará moviendo tarjetas, cambiando estados o creando nuevas historias:

- **Refresco en Consola:** Se recomienda volver a ejecutar `gh project item-list 3 --owner dbetania2` cada ciertos minutos o al inicio de cada jornada para traer la información más reciente de GitHub.
- **Refresco en Navegador:** Si están usando la vista web, recargar la página (`F5` o `Ctrl + R`) para asegurar que estén viendo la última versión en tiempo real del Backlog y del Sprint Board.

