# Plan Técnico: MVP Calendario de Contenidos

| Campo      | Valor                                               |
| ---------- | --------------------------------------------------- |
| Feature    | 001-mvp-calendar                                    |
| Spec       | `specs/001-mvp-calendar/spec.md`                    |
| Estado     | Borrador técnico                                    |
| Fecha      | 2026-09-23                                          |

---

## 1. Resumen y Objetivos de Arquitectura

El propósito técnico de este plan es diseñar una arquitectura modular, liviana y desacoplada que cumpla estrictamente con la **Constitution** (`docs/constitution.md`) y cubra los criterios de aceptación **AC-1 a AC-28** de `specs/001-mvp-calendar/spec.md`.

El sistema se compone de:
1. **Servidor Flask (Python 3.12+):** Actúa como anfitrión de entrega para los documentos HTML, hojas de estilo compiladas, módulos JavaScript nativos y binarios WebAssembly de SQLite. Configura los encabezados HTTP necesarios (`COOP`/`COEP`) para habilitar el acceso a hilos de trabajo y al sistema de archivos privado del navegador (OPFS).
2. **Capa de Persistencia Local (SQLite WASM + OPFS):** La base de datos SQLite se ejecuta íntegramente en el navegador del usuario utilizando OPFS (Origin Private File System) para persistencia transaccional y duradera offline, sin almacenamiento centralizado ni comunicación de datos a servidores.
3. **Capa Frontend Modular (ES Modules + SASS):** JavaScript nativo estructurado en capas (Repositorio, Servicios de Negocio, Controladores y Vistas), con maquetación móvil-primero compilada mediante SASS.

---

## 2. Decisiones Técnicas y Alternativas Descartadas

### 2.1. Persistencia: SQLite WASM con OPFS
- **Decisión:** Emplear la compilación oficial de SQLite WebAssembly (`sqlite3.wasm` y script de inicialización) interactuando con el backend de VFS `opfs` (Origin Private File System).
- **Justificación:** Cumple el Principio 5 de la Constitución (datos 100% locales en el cliente), soporta transacciones ACID reales y SQL nativo, lo que simplifica consultas complejas de calendario, filtros y ordenamiento.
- **Alternativa descartada:** *IndexedDB nativo*: Requeriría construir manualmente índices y consultas complejas de ordenamiento y filtrado relacional, incrementando la fragilidad del código sin aportar ventajas de rendimiento sobre SQLite OPFS.
- **Alternativa descartada:** *Base de datos en servidor Flask*: Violación directa de la Constitución (Principio 5) y del requerimiento de privacidad por diseño y funcionamiento offline.

### 2.2. Servidor de Entrega y Headers: Flask (Python 3.12+)
- **Decisión:** Utilizar Flask exclusivamente para el enrutamiento de páginas/vistas, renderizado de plantillas base de layout (Jinja2) y servicio de estáticos, incorporando un middleware que inyecte los encabezados:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- **Justificación:** Cumple el Principio 1 de la Constitución (stack simple sin servidores de compilación complejos) y es requisito técnico imprescindible para que el navegador habilite `SharedArrayBuffer` y el Worker de OPFS para SQLite WASM.
- **Alternativa descartada:** *Servidor Node.js / Express*: Introduce duplicidad de entornos de ejecución sin aportar valor adicional dado que Python 3.12 es el estándar del proyecto.

### 2.3. Estructura Frontend: JavaScript Modular Nativo (ES Modules)
- **Decisión:** JavaScript ES2022+ modular organizado por responsabilidades claras (Servicios, Repositorios, Vistas y Componentes UI), sin frameworks de terceros.
- **Justificación:** Cumple el Principio 1 (evitar frameworks frontend pesados) y Principio 3 (separación de lógica y vista). Permite recarga inmediata y desarrollo directo sin empaquetadores pesados (Webpack/Vite).
- **Alternativa descartada:** *React / Vue / Angular*: Sobrecarga innecesaria de dependencias, compilación obligatoria y mayor peso de descarga, en contra del Principio 1.

### 2.4. Estilos, Diseño y Sistema Visual: SASS (SCSS) + `docs/styles-context.md`
- **Decisión:** Implementar estrictamente las especificaciones de diseño de `docs/styles-context.md` estructuradas en SASS (SCSS):
  - **Paleta monocromática:** Fondo base `#0A0A0A`, texto principal `#F5F5F4`, texto secundario `#9C9C9A`, acento claro `#FFFFFF`, acento oscuro `#5A5A58`, bordes `rgba(255,255,255,0.08–0.14)`. Colores saturados restringidos exclusivamente a badges y avisos.
  - **Tipografía:** Fraunces para display y encabezados; Inter para cuerpo de texto y controles.
  - **Bordes y contenedores:** Bloques contenedores con `border-radius: 4rem`; elementos interactivos con bordes generosos (`rounded-xl`/`rounded-full`).
  - **Elemento firma (signature element):** Halo/anillo rotatorio con `conic-gradient` y blur/glow sutil animado de 14-22s `linear infinite` en un elemento destacado.
  - **Atmósfera y animaciones:** Fondo casi negro enriquecido con gradientes radiales blancos sutiles (opacidad 0.05-0.09) y partículas flotantes discretas; animación de entrada escalonada fade + rise con `cubic-bezier(.22,1,.36,1)`.
  - **Reglas estrictas de entrega:** CERO comentarios en CSS ni HTML; HTML y CSS en archivos/bloques desacoplados; clases únicas prefijadas por componente (ej. `kanban-column-header`); cero selectores globales o de etiqueta; soporte completo de `prefers-reduced-motion` y mobile-first (~360–414px de base).
  - Se compila a un archivo CSS estático estándar distribuido por Flask (`libsass`).
- **Justificación:** Garantiza una estética de alta gama coherente, profesional y disciplinada, cumpliendo el Principio 7 de la Constitución.
- **Alternativa descartada:** *Tailwind CSS con build tools pesados*: Requeriría dependencias Node/npm para purga y compilación de utilidades. *CSS plano sin variables ni mixins*: Mayor duplicación y dificultad para mantener la paleta y breakpoints.

### 2.5. Editor de Guión: Texto Enriquecido con Soporte Markdown
- **Decisión:** Editor híbrido liviano en JavaScript nativo: un área de edición con barra de herramientas de formato rápido (negrita, cursiva, listas, títulos) que almacena formato Markdown estándar y proporciona una vista previa renderizada visualmente mediante un parser liviano de Markdown en cliente.
- **Justificación:** Garantiza portabilidad del guión (almacenado en texto plano/Markdown en SQLite) y lectura cómoda en la vista de detalle.
- **Alternativa descartada:** *TinyMCE / CKEditor*: Librerías masivas de varios megabytes con código cerrado o configuraciones intrusivas, contrarias a la simplicidad del stack.

### 2.6. Interacción Drag & Drop y Soporte Táctil
- **Decisión:** Implementar un controlador unificado `DragDropController` basado en la API nativa de Drag & Drop para escritorio (`dragstart`, `dragover`, `drop`), complementado con emulación mediante Pointer/Touch Events (`touchstart`, `touchmove`, `touchend`) para permitir reasignación táctil suave en dispositivos móviles.
- **Justificación:** Garantiza experiencia consistente y fluida tanto en navegadores de escritorio como en teléfonos y tabletas móviles.
- **Alternativa descartada:** *Librerías externas pesadas (ej. SortableJS / Dragula)*: No son requeridas para la complejidad del flujo Kanban/Calendario y añaden peso externo.

---

## 3. Arquitectura del Sistema y Separación de Capas

```
content-os/
├── src/
│   ├── app.py                      # Fábrica y configuración de Flask con headers COOP/COEP
│   ├── routes.py                   # Enrutamiento de vistas principales (Index/App)
│   ├── static/
│   │   ├── css/
│   │   │   └── main.css            # CSS compilado desde SASS
│   │   ├── js/
│   │   │   ├── db/
│   │   │   │   ├── sqliteWorker.js # Inicialización y Worker de SQLite WASM + OPFS
│   │   │   │   ├── schema.js       # DDL de tablas y migraciones iniciales
│   │   │   │   └── repository.js   # Operaciones CRUD sobre SQLite (AC-1..3, 4, 8, 11, 14, 18, 22..25)
│   │   │   ├── services/
│   │   │   │   ├── contentService.js # Reglas de negocio de contenidos y validaciones (AC-4..6, 8, 23..24)
│   │   │   │   ├── settingsService.js# Gestión de etapas, redes, tipos y defaults (AC-1..3, 22..25)
│   │   │   │   ├── filterService.js  # Motor de filtrado en memoria / SQL (AC-20..21)
│   │   │   │   ├── backupService.js  # Exportación e importación JSON/SQLite (AC-26..27)
│   │   │   │   └── markdownService.js# Parser de Markdown para guiones (AC-7, 15)
│   │   │   ├── ui/
│   │   │   │   ├── kanbanView.js     # Render y eventos de tablero Kanban (AC-9..11, 28)
│   │   │   │   ├── calendarView.js   # Render y eventos de vista calendario (AC-12..14, 28)
│   │   │   │   ├── contentFormView.js# Formulario crear/editar contenido y guión (AC-4..7, 28)
│   │   │   │   ├── contentDetailView.js# Vista de lectura de contenido y guión (AC-15..16, 28)
│   │   │   │   ├── settingsView.js   # Vista de configuración y administración (AC-22..25)
│   │   │   │   ├── modal.js          # Componente modal de confirmación y avisos (AC-17..19, 27)
│   │   │   │   ├── dragDrop.js       # Manejador drag & drop unificado mouse + touch (AC-11, 14, 28)
│   │   │   │   └── appRouter.js      # Navegación entre las 5 vistas en cliente
│   │   │   └── vendor/
│   │   │       ├── sqlite3.wasm    # Binario WASM oficial de SQLite
│   │   │       └── sqlite3.js      # Wrapper JS oficial de SQLite WASM
│   │   ├── scss/
│   │   │   ├── _variables.scss     # Paleta, tipografías, dimensiones
│   │   │   ├── _mixins.scss        # Breakpoints móviles y utilidades
│   │   │   ├── _kanban.scss        # Estilos de columnas y tarjetas
│   │   │   ├── _calendar.scss      # Estilos de cuadrícula mensual y celdas
│   │   │   ├── _forms.scss         # Formulario, editor de guión y lectura
│   │   │   ├── _settings.scss      # Tablas y listas de configuración
│   │   │   ├── _modal.scss         # Diálogos y ventanas modales
│   │   │   └── main.scss           # Punto de entrada SCSS
│   └── templates/
│       ├── base.html               # Estructura HTML común (meta tags móviles, navegación)
│       └── index.html              # Contenedores de las 5 vistas y templates dinámicos
├── tests/
│   ├── test_flask_app.py           # Verificación de rutas Flask y headers COOP/COEP
│   ├── test_sass_compilation.py    # Verificación de compilación de assets SASS a CSS
│   ├── js/
│   │   ├── test_content_service.js # Pruebas unitarias de reglas de contenido y validaciones
│   │   ├── test_settings_service.js# Pruebas unitarias de etapas, defaults y reasignaciones
│   │   ├── test_filter_service.js  # Pruebas unitarias de filtros combinados
│   │   ├── test_backup_service.js  # Pruebas unitarias de exportación/importación
│   │   └── test_markdown_service.js# Pruebas unitarias de renderizado de guión
│   └── e2e/
│       └── test_e2e_navigation.py  # Pruebas de integración / navegación web
└── requirements.txt                # Flask, libsass, etc.
```

---

## 4. Esquema de Base de Datos Local (SQLite WASM)

El esquema relacional residirá íntegramente en la base de datos local `content_os.sqlite3` en OPFS:

```sql
-- Etapas de Kanban
CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Redes sociales / Canales
CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tipos de contenido
CREATE TABLE IF NOT EXISTS content_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contenidos
CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,          -- Formato ISO: YYYY-MM-DD
    stage_id INTEGER NOT NULL,
    channel_id INTEGER,
    content_type_id INTEGER,
    script TEXT DEFAULT '',              -- Texto del guión en formato Markdown
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE RESTRICT,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE SET NULL
);
```

---

## 5. Mapeo Exhaustivo de Criterios de Aceptación (AC)

| Módulo / Componente | Criterios de Aceptación Cubiertos | Descripción Técnica de Cobertura |
| :--- | :--- | :--- |
| **`schema.js` + `settingsService.js`** | **AC-1, AC-2, AC-3** | Inicializa automáticamente tablas y registros por defecto si la base de datos es nueva: 5 etapas (Idea, Guion, Grabacion, Edicion, Publicado), 5 redes (YouTube, Instagram, TikTok, Linkedin, X) y 4 tipos (Video, Publicacion, Vertical, Articulo). |
| **`contentService.js` + `contentFormView.js`** | **AC-4, AC-5, AC-6** | Valida obligatoriedad y no vaciedad de título, fecha de publicación y red social. Rechaza campos de solo espacios en blanco. Si no se selecciona etapa, asocia automáticamente la primera etapa ("Idea"). |
| **`markdownService.js` + `contentFormView.js`** | **AC-7** | Editor con botones de formato enriquecido que insertan sintaxis Markdown y renderizan vista previa inmediata. |
| **`contentService.js` + `appRouter.js`** | **AC-8** | Actualización en base de datos local y emisión de evento de sincronización para actualizar Kanban, Calendario o Detalle inmediatamente. |
| **`kanbanView.js`** | **AC-9, AC-10** | Renderiza columnas ordenadas por `position` y tarjetas con título, badge de red social, tipo de contenido y fecha de publicación. |
| **`dragDrop.js` + `kanbanView.js`** | **AC-11** | Detecta soltado de tarjeta en columna diferente, actualiza `stage_id` en SQLite mediante `contentService.js` y reposiciona la tarjeta en la vista. |
| **`calendarView.js`** | **AC-12, AC-13** | Cuadrícula mensual de 7 columnas (Lunes a Domingo), controles de navegación prev/next mes, renderizado de eventos con título y red social dentro de cada celda. |
| **`dragDrop.js` + `calendarView.js`** | **AC-14** | Arrastre y soltado de tarjetas entre días del calendario; actualiza `publish_date` en SQLite y refresca el mes. |
| **`contentDetailView.js`** | **AC-15, AC-16** | Muestra vista no editable con cabecera de datos y lectura amplia del guión parseado a HTML. Botones de acción "Editar" y "Eliminar". |
| **`modal.js`** | **AC-17, AC-18, AC-19** | Diálogo modal nativo (`<dialog>` o componente accesible) con confirmación explícita antes de eliminar. Si confirma, borra en SQLite y cierra; si cancela, cierra sin cambios. |
| **`filterService.js` + `ui/`** | **AC-20, AC-21** | Barra de filtros transversal (por red, etapa, tipo y rango de fechas). Aplica cláusulas `WHERE` combinadas en SQLite o filtro reactivo en memoria. Botón "Limpiar filtros" restaura la visualización completa. |
| **`settingsService.js` + `settingsView.js`** | **AC-22, AC-23, AC-24, AC-25** | Formulario para altas, bajas y modificaciones. Regla AC-23: reasigna contenidos a la primera etapa disponible al eliminar una etapa en uso. Regla AC-24: coloca `NULL` en `channel_id` o `content_type_id` sin borrar contenidos. Regla AC-25: bloquea la eliminación si solo queda una etapa. |
| **`backupService.js` + `settingsView.js`** | **AC-26, AC-27** | Exporta la base de datos / snapshot a un archivo descargable `.json` o `.sqlite3`. Importa archivo con validación de estructura, solicitando confirmación modal antes de sobrescribir. |
| **`scss/` + `dragDrop.js` + `ui/`** | **AC-28, AC-29** | CSS responsivo compilado con SASS implementando rigurosamente `docs/styles-context.md` (paleta monocromática #0A0A0A, Fraunces/Inter, contenedores con radio 4rem, elemento firma con conic-gradient animado, mobile-first, soporte táctil, cero comentarios en CSS/HTML y clases prefijadas). |

---

## 6. Estrategia de Tests y Verificación (TDD)

En conformidad con el Principio 4 de la Constitución (*TDD obligatorio; tests en verde antes de dar una tarea por terminada*), la estrategia de pruebas comprende:

### 6.1. Pruebas de Servidor y Entorno (Python / Pytest)
- **`tests/test_flask_app.py`:**
  - Verifica que las rutas principales de Flask respondan con código HTTP 200.
  - Verifica la presencia mandatoria de encabezados HTTP `Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp` en todas las respuestas para habilitar SQLite WASM + OPFS.
  - Verifica el servicio de binarios y módulos estáticos con los tipos MIME correspondientes (`application/wasm`, `text/javascript`).
- **`tests/test_sass_compilation.py`:**
  - Verifica que los archivos SASS (`src/static/scss/*.scss`) compilen sin errores de sintaxis a `main.css`.
  - Verifica la inclusión de reglas responsivas esenciales (breakpoints móviles).

### 6.2. Pruebas Unitarias de Lógica y Servicios (JavaScript / Node Runner o Test Suite en Cliente)
- **`tests/js/test_content_service.js`:**
  - Validación de campos obligatorios: rechaza guardado sin título, fecha o red social (**AC-5**).
  - Rechaza strings con solo espacios en blanco.
  - Asigna etapa por defecto cuando se omite (**AC-6**).
- **`tests/js/test_settings_service.js`:**
  - Inicialización de los 5 estados, 5 canales y 4 tipos predeterminados (**AC-1, AC-2, AC-3**).
  - Reasignación automática de etapa al eliminar una etapa con contenidos asignados (**AC-23**).
  - Asignación de null en red social o tipo al eliminarlos sin borrar el contenido (**AC-24**).
  - Prevención de eliminación de la última etapa restante (**AC-25**).
  - Detección y rechazo de nombres duplicados.
- **`tests/js/test_filter_service.js`:**
  - Filtrado combinado por red social, etapa y tipo de contenido (**AC-20**).
  - Filtrado por rango de fechas en calendario.
  - Restablecimiento completo de filtros (**AC-21**).
- **`tests/js/test_backup_service.js`:**
  - Serialización correcta de configuración y contenidos a payload exportable (**AC-26**).
  - Validación e hidratación de backup válido (**AC-27**).
  - Detección y rechazo seguro de archivos corruptos o estructuras JSON/SQLite inválidas.
- **`tests/js/test_markdown_service.js`:**
  - Parseo correcto de negritas, cursivas, listas y títulos a HTML seguro (**AC-7, AC-15**).

### 6.3. Verificación de UI y Drag & Drop
- Comprobación en navegador de escritorio y emulador móvil (responsive design):
  - Apertura y cierre de modales de confirmación (**AC-17, AC-19**).
  - Interacciones táctiles y drag & drop en tablero Kanban (**AC-11**) y calendario (**AC-14**).
  - Navegación fluida entre las 5 vistas.
