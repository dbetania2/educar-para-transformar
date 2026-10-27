# Guía de Frontend y Estándares de Diseño UI/UX

Este documento define las normas de arquitectura frontend, principios de diseño UI/UX y buenas prácticas de desarrollo implementadas en el proyecto con **Next.js (App Router)** y **Mantine UI**.

---

## 1. Principio Fundamental de Reutilización

Antes de crear un nuevo componente o vista, es **obligatorio verificar si existe un componente base reutilizable o generalizable**.
- **Cero duplicación de lógica visual:** No se copian ni clonan componentes entre paneles. Si una tarjeta de detalle, modal o grilla se requiere en dos paneles, se extrae a `src/components/`.
- **Desacoplamiento de estilos:** La lógica visual debe estar desacoplada de la vista de datos.

---

## 2. Metodología Atomic Design

La interfaz de usuario se estructura siguiendo una jerarquía estricta:

```
src/components/
├── atoms/        # Elementos básicos indivisibles (Botones, Inputs, Iconos)
├── molecules/    # Combinación de átomos con un fin específico (ej. RoleBadge, UserAvatar)
├── organisms/    # Bloques funcionales autónomos (ResponsiveDataTable, SearchBar)
└── templates/    # Estructura y layouts de pantalla por perfil (DashboardTemplate)
```

### Ejemplo: Componente `<RoleBadge />`
Diseñado como molécula independiente para eliminar funciones inline en vistas (`renderRoleBadge`), encapsulando colores estandarizados y los íconos de cada rol (`@tabler/icons-react`).

---

## 3. Sistema de Espaciado y Grilla (8-Point Grid)

Toda la aplicación respeta una escala matemática basada en múltiplos de 8:
- **Espaciados y Márgenes:** `8px`, `16px`, `24px`, `32px`, `48px`.
- **Estructura 2D (Grillas):** CSS Grid a través del componente `SimpleGrid` de Mantine para tableros superiores de estadísticas y tarjetas de métricas.
- **Alineación 1D (Listas y Formularios):** Uso de `Group` (horizontal) y `Stack` (vertical) para asegurar consistencia visual y ritmos predecibles.
- **Tablas:** El componente `ResponsiveDataTable` gestiona su propia paginación, celdas y ordenamiento sin inyectar clases manuales inline.

---

## 4. Principios de UX y Accesibilidad

1. **Reducción de Carga Cognitiva (Leyes de Miller y Hick):** La información compleja se presenta fragmentada mediante paginación, filtros contextuales y acordeones para no abrumar al operador.
2. **Accesibilidad y Prevención del Daltonismo:** La interfaz **nunca comunica estado exclusivamente mediante color**. Todo badge, alerta o indicador combina un color semántico con un ícono explícito y un texto legible.
3. **Diseño Responsivo:** Compatibilidad probada en pantallas móviles, tablets y escritorios de alta resolución mediante breakpoints estándar de Mantine.

---

## 5. Rendimiento en React y Ciclo de Reconciliación

* **Paradigma Declarativo:** $\text{UI} = f(\text{state})$. Las vistas reflejan de forma predecible el estado de los datos.
* **Manejo de Colecciones y `keys`:**
  - Al iterar listas con `.map()`, es obligatorio usar identificadores únicos y estables (`key={item.id}`).
  - **Prohibición de `key={index}`:** El uso del índice como clave está desaconsejado en colecciones dinámicas, ya que rompe la reconciliación del Virtual DOM durante filtrados o reordenamientos.
* **Separación de Lógica y Presentación:** Los hooks personalizados (ej. `useAdminUsers.ts`) manejan el estado y las Server Actions, dejando los componentes visuales (`AdminUsersFeature.tsx`) orientados puramente al renderizado.

