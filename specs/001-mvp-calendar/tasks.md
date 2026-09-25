# Tareas: MVP Calendario de Contenidos

| Campo      | Valor                                               |
| ---------- | --------------------------------------------------- |
| Feature    | 001-mvp-calendar                                    |
| Spec       | `specs/001-mvp-calendar/spec.md`                    |
| Plan       | `specs/001-mvp-calendar/plan.md`                    |
| Estado     | Pendiente de implementación                         |
| Fecha      | 2026-09-23                                          |

---

## Tareas de Implementación

### Fase 1: Setup & Servidor Flask Base (COOP/COEP Headers & SASS)

- [x] **T1: Inicializar entorno, dependencias y servidor Flask con encabezados COOP/COEP**
  - **AC asociados:** Soporte fundacional para AC-1..28 (habilita `SharedArrayBuffer` y OPFS en el navegador).
  - **Hecho cuando:** `requirements.txt` creado con Flask y dependencias base, servidor configurado en `src/app.py`, y `tests/test_flask_app.py` ejecutado y en verde con `pytest`, verificando que la raíz responde HTTP 200 y emite los encabezados `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`.

- [x] **T2: Configurar pipeline de compilación SASS y estilos base mobile-first (`docs/styles-context.md`)**
  - **AC asociados:** AC-28, AC-29.
  - **Hecho cuando:** Estructura de estilos creada en `src/static/scss/` (`_variables.scss`, `_mixins.scss`, `main.scss`) implementando la paleta monocromática (`#0A0A0A`, `#F5F5F4`, bordes sutiles `rgba(255,255,255,0.08–0.14)`), fuentes Fraunces e Inter, radio de `4rem` para bloques contenedores, elemento firma animado, clases prefijadas y cero comentarios; script de compilación SASS a `src/static/css/main.css` funcional y `tests/test_sass_compilation.py` en verde con `pytest`.

---

### Fase 2: Persistencia Local (SQLite WASM + Schema + Repositorio)

- [x] **T3: Configurar assets de SQLite WASM, worker y esquema DDL relacional**
  - **AC asociados:** Soporte de base de datos para AC-1..28.
  - **Hecho cuando:** Módulos de inicialización `src/static/js/db/schema.js` y `repository.js` implementados con tablas `stages`, `channels`, `content_types` y `contents`, capaces de abrir la base de datos en OPFS y ejecutar sentencias SQL.

- [x] **T4: Implementar `settingsService` y seed de valores predeterminados con tests**
  - **AC asociados:** AC-1, AC-2, AC-3, AC-22, AC-25.
  - **Hecho cuando:** Tests unitarios de JavaScript en verde verificando que una base de datos nueva se inicializa automáticamente con 5 etapas ("Idea", "Guion", "Grabacion", "Edicion", "Publicado"), 5 redes ("YouTube", "Instagram", "TikTok", "Linkedin", "X") y 4 tipos ("Video", "Publicacion", "Vertical", "Articulo"), y que se bloquea la eliminación si solo queda una etapa.

- [x] **T5: Implementar reglas de eliminación y reasignación en `settingsService` con tests**
  - **AC asociados:** AC-23, AC-24.
  - **Hecho cuando:** Tests unitarios en verde validando que al eliminar una etapa en uso los contenidos asociados se reasignan a la primera etapa disponible, y al eliminar una red social o tipo de contenido sus referencias pasan a `NULL` sin borrar el contenido.

---

### Fase 3: Servicios de Negocio, Markdown y Backup

- [x] **T6: Implementar `contentService` y validaciones con tests**
  - **AC asociados:** AC-4, AC-5, AC-6, AC-8.
  - **Hecho cuando:** Tests unitarios en verde comprobando que el servicio crea y actualiza contenidos, exige obligatoriedad de título, fecha de publicación y red social, rechaza campos con solo espacios en blanco y asigna "Idea" si no se proporciona etapa.

- [x] **T7: Implementar `markdownService` para editor y lectura de guión con tests**
  - **AC asociados:** AC-7, AC-15.
  - **Hecho cuando:** Tests unitarios en verde verificando la transformación segura de texto con sintaxis Markdown (títulos, negritas, cursivas, listas y párrafos) a HTML sanitizado para la vista de lectura.

- [x] **T8: Implementar `filterService` para filtros cruzados con tests**
  - **AC asociados:** AC-20, AC-21.
  - **Hecho cuando:** Tests unitarios en verde comprobando filtrado por red social, etapa, tipo de contenido, rango de fechas y restablecimiento para mostrar todos los contenidos.

- [x] **T9: Implementar `backupService` para exportación e importación de datos con tests**
  - **AC asociados:** AC-26, AC-27.
  - **Hecho cuando:** Tests unitarios en verde validando que exporta el estado completo en un archivo descargable, valida e importa una copia de seguridad previa confirmación, y rechaza archivos corruptos sin alterar los datos existentes.

---

### Fase 4: Componentes de UI Transversales y Layout

- [x] **T10: Maquetar layout base, enrutador cliente (`appRouter`) y navegación responsiva**
  - **AC asociados:** AC-28, AC-29.
  - **Hecho cuando:** Plantilla Jinja2 y `appRouter.js` implementados, permitiendo navegar de forma instantánea entre las 5 vistas (Kanban, Calendario, Crear/Editar, Ver Detalle, Settings) con barra de navegación adaptada a móvil y escritorio, tipografía Fraunces/Inter, y contenedores con radio de 4rem según `docs/styles-context.md`.

- [x] **T11: Implementar componente Modal reutilizable para confirmaciones y avisos**
  - **AC asociados:** AC-17, AC-18, AC-19, AC-27, AC-29.
  - **Hecho cuando:** Módulo `modal.js` y estilos asociados implementados, permitiendo mostrar diálogos modales accesibles para confirmación de eliminación o importación con estética monocromática, backdrop blur, y cierre sin cambios al cancelar o ejecución de la acción al confirmar.

- [x] **T12: Implementar controlador unificado de Drag & Drop (Mouse + Touch)**
  - **AC asociados:** AC-11, AC-14, AC-28.
  - **Hecho cuando:** Módulo `dragDrop.js` implementado soportando tanto eventos nativos HTML5 drag como eventos táctiles (`touchstart`, `touchmove`, `touchend`), permitiendo arrastrar tarjetas a zonas válidas y restaurándolas a su posición original si se sueltan en áreas inválidas.

---

### Fase 5: Vistas Principales de la Aplicación

- [x] **T13: Implementar vista de Creación y Edición de Contenidos (`contentFormView`)**
  - **AC asociados:** AC-4, AC-5, AC-6, AC-7, AC-8, AC-28, AC-29.
  - **Hecho cuando:** Vista de formulario funcional respetando el sistema de diseño (clases prefijadas, sin comentarios, paleta monocromática), validación visual en tiempo real de campos obligatorios, selectores dinámicos de red/tipo/etapa, barra de herramientas para edición de guión con soporte Markdown y persistencia en SQLite local.

- [x] **T14: Implementar vista de Detalle / Lectura no editable (`contentDetailView`)**
  - **AC asociados:** AC-15, AC-16, AC-17, AC-18, AC-28, AC-29.
  - **Hecho cuando:** Vista de solo lectura operativa con visualización estética y cómoda del guión renderizado, elemento firma con rotación suave (`conic-gradient`), cabecera de datos del contenido y botones de acceso directo para editar o abrir modal de confirmación de eliminación.

- [x] **T15: Implementar vista Tablero Kanban (`kanbanView`) con Drag & Drop entre etapas**
  - **AC asociados:** AC-9, AC-10, AC-11, AC-20, AC-21, AC-28, AC-29.
  - **Hecho cuando:** Tablero muestra columnas por cada etapa en orden, tarjetas con estilo visual de `docs/styles-context.md`, título, badge de red, tipo y fecha; reasignación de etapa inmediata al arrastrar tarjetas entre columnas y filtrado interactivo funcional.

- [x] **T16: Implementar vista de Calendario Mensual (`calendarView`) con Drag & Drop de fechas**
  - **AC asociados:** AC-12, AC-13, AC-14, AC-20, AC-21, AC-28, AC-29.
  - **Hecho cuando:** Cuadrícula mensual con navegación entre meses, renderizado de contenidos por día programado con estilos acordes al sistema de diseño, reprogramación de fecha de publicación al arrastrar contenidos a otro día y respuesta inmediata a los filtros.

- [x] **T17: Implementar vista de Configuración (`settingsView`) y panel de Backup**
  - **AC asociados:** AC-22, AC-23, AC-24, AC-25, AC-26, AC-27, AC-28, AC-29.
  - **Hecho cuando:** Interfaz completa para crear, editar y eliminar etapas, redes sociales y tipos de contenido; feedback de validación en duplicados o última etapa; y botones para exportar e importar backups locales con modal de confirmación y checklist de diseño cumplida.

---

### Fase 6: Integración Final, Pulido Mobile y Verificación E2E

- [x] **T18: Integración general, verificación responsive mobile/desktop y suite de pruebas en verde**
  - **AC asociados:** AC-1 a AC-29.
  - **Hecho cuando:** Todas las vistas interactúan fluidamente sin recargas ni pérdida de estado, cumplen la checklist de diseño de `docs/styles-context.md`, la suite completa de tests de Python (`pytest`) y JavaScript está en verde, `ruff check .` pasa sin advertencias, y se verifica el cumplimiento de los 29 criterios de aceptación en móvil y escritorio.
