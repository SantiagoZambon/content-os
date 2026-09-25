# AGENTS.md

## 1. ¿Qué es este proyecto?

Aplicación web de calendario y gestión de contenidos para creadores desarrollada con Flask (Python) y SQLite compilado a WebAssembly con persistencia en OPFS (Origin Private File System), almacenando la base de datos de manera 100% local en el dispositivo del usuario (privacidad por diseño y soporte offline-first).

Dispone de cinco vistas principales:
1. **Tablero Kanban (drag & drop):** flujo visual de trabajo por etapas (idea, guión, grabación, edición, listo para publicar, etc.).
2. **Calendario:** vista mensual integral con los contenidos programados por día.
3. **Crear / Editar Contenido:** formulario completo para metadata del contenido con editor dedicado para la creación del guión.
4. **Ver Contenido:** vista de lectura (no editable) para consultar la información del contenido y visualizar el guión de forma cómoda.
5. **Configuración (Settings):** administración de etapas personalizadas, redes sociales, tipos de contenido y ajustes locales.

La interfaz es 100% responsiva y adaptada a dispositivos móviles (mobile-first y soporte táctil para interacción y drag & drop).

## 2. Puesta en marcha

- **Dependencias:**
  - Python 3.12+
  - Creación del entorno virtual: `python3 -m venv .venv && source .venv/bin/activate`
  - Instalación: `pip install -r requirements.txt` (desarrollo: `pip install -r requirements-dev.txt` o `pytest ruff`)
- **Ejecutar aplicación:**
  - Servidor Flask de desarrollo: `flask --app src.app run --debug --port 5000`
- **Tests y Linting:**
  - Tests automáticos: `pytest`
  - Chequeo de linter/formato: `ruff check .` y `ruff format --check .`

## 3. Cómo se escribe el código acá

- **Versión del lenguaje:** Python 3.12+ con type hints estrictos (`typing`). JavaScript moderno (ES2022+) modular para la capa cliente (WASM / OPFS / UI).
- **Convenciones de nombres:**
  - Python: `snake_case` para módulos, funciones, métodos y variables; `PascalCase` para clases; `UPPER_SNAKE_CASE` para constantes.
  - JavaScript: `camelCase` para variables y funciones; `PascalCase` para clases/controladores; `UPPER_SNAKE_CASE` para constantes.
  - CSS / HTML: clases en `kebab-case` semántico; clases únicas prefijadas por componente (`componente-elemento`), sin selectores globales ni de etiqueta (`*`, `body`, `div`).
  - Base de datos (SQLite): tablas en `snake_case` plural (`contents`, `stages`, `channels`), columnas en `snake_case`.
- **Sistema de diseño y estilo gráfico (`docs/styles-context.md`):**
  - **Obligatorio:** Cada componente y vista debe seguir estrictamente `docs/styles-context.md`.
  - **Paleta monocromática:** Fondo `#0A0A0A`, texto principal `#F5F5F4`, texto muted `#9C9C9A`, acentos `#FFFFFF` / `#5A5A58`, bordes `rgba(255,255,255,0.08–0.14)`. Colores saturados permitidos únicamente para badges/avisos puntuales.
  - **Tipografía:** Fraunces para display/títulos, Inter para cuerpo de texto.
  - **Bordes y radios:** Border-radius de `4rem` para bloques contenedores; bordes redondeados generosos en elementos internos.
  - **Elemento firma:** Halo/anillo con `conic-gradient` rotatorio lento (14-22s) y glow difuminado en un elemento clave por vista.
  - **Reglas estrictas de código:** CERO comentarios en HTML y CSS; HTML y CSS en archivos/bloques separados; variables CSS scopeadas en la clase raíz; soporte `prefers-reduced-motion`; mobile-first (~360–414px).
- **Idioma:**
  - Código (identificadores, funciones, clases, tests, archivos, commits): **Inglés**.
  - Documentación de especificación (Constitution, specs, planes, tareas, criterios AC): **Español**.
  - Interfaz de usuario (UI y mensajes al usuario): **Español**.
- **Commits:** Conventional Commits en inglés (`feat: ...`, `fix: ...`, `test: ...`, `refactor: ...`, `docs: ...`).

## 4. Antes de programar

- Metodología obligatoria: **SDD (Spec-Driven Development)**:
  1. Revisar `docs/constitution.md` (reglas innegociables), `docs/styles-context.md` (sistema de diseño obligatorio) y la spec de la feature en `specs/<feature>/spec.md`.
  2. Si no existe spec para la funcionalidad solicitada, **NO escribir código**: redactar primero la spec usando `resources/spec-template.md` y esperar la confirmación del usuario.
  3. Derivar `specs/<feature>/plan.md` (decisiones de arquitectura, stack, estrategia de tests y adopción de estilos) y `specs/<feature>/tasks.md` (tareas pequeñas de 20-30 min con AC asociados y condición "Hecho cuando:").
  4. Si hay ambigüedad o dudas en los criterios de aceptación (AC), preguntar puntualmente al usuario antes de asumir o programar.
  5. Desarrollo guiado por pruebas (TDD): escribir primero los tests que cubren el AC antes del código de implementación.

## 5. Qué no tocar sin permiso

- `docs/constitution.md` y `docs/styles-context.md` (principios innegociables del proyecto y sistema de diseño; requieren aprobación explícita para cambios).
- Specs y planes ya aprobados (`specs/**/spec.md`, `specs/**/plan.md`) salvo corrección acordada explícitamente.
- Nuevas librerías externas o dependencias en `requirements.txt` o paquetes frontend sin previa autorización.
- Modificaciones estructurales al motor de persistencia SQLite WASM / OPFS que puedan comprometer la compatibilidad hacia atrás o borrar datos del usuario.
- Configuración de Git, entorno o archivos sensibles (`.gitignore`, `.env`, CI/CD).

## 6. Antes de dar una tarea por terminada

- **Verificación obligatoria:**
  - Todos los tests relevantes ejecutados y en verde (`pytest`).
  - Linter y formateo sin advertencias (`ruff check .`).
  - Cumplir la checklist de diseño de `docs/styles-context.md` en tareas visuales (paleta monocromática, 4rem de radius en contenedores, tipografía Fraunces/Inter, clases prefijadas, sin comentarios, responsive mobile-first y elemento firma).
  - Comprobar funcionamiento en pantalla móvil y desktop en cambios de interfaz.
- **Trazabilidad SDD:**
  - Identificar con precisión qué criterio de aceptación (`AC-x`) fue cubierto y validado por la tarea.
  - Actualizar `specs/<feature>/tasks.md` marcando la tarea como completada (`[x]`).
  - Si se implementa tarea por tarea (modo 5.a de prompts), **detenerse** y esperar la confirmación del usuario antes de avanzar con la siguiente tarea.
