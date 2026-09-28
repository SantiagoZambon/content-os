# Constitution

1. **Stack simple:** Flask para servir la app, JS modular nativo y SQLite WASM; sin frameworks frontend pesados ni dependencias innecesarias.
2. **Relación spec↔código:** Ningún código se escribe sin spec aprobada; cada cambio debe responder directamente a un criterio de aceptación (AC).
3. **Separación lógica/interfaz:** El acceso a datos (SQLite) y las reglas de negocio deben estar desacoplados de la manipulación del DOM y la UI.
4. **Política de tests:** TDD obligatorio; todos los tests automáticos deben estar en verde antes de dar una tarea por terminada.
5. **Persistencia de datos:** Los datos residen 100% locales en el dispositivo del usuario vía SQLite WASM + OPFS; sin persistencia en servidor.
6. **Idioma:** Código, tests, commits e identificadores en inglés; documentación, especificaciones (specs), tareas y UI en español.
7. **Estilo gráfico innegociable:** Respetar estrictamente `docs/styles-context.md` en cada vista y componente (paleta monocromática #0A0A0A, tipografía Fraunces/Inter, contenedores con radio 4rem, clases prefijadas, sin comentarios en HTML/CSS, y diseño mobile-first con elemento firma).
