# Tareas: Autenticación Privada y Almacenamiento en Servidor

| Campo   | Valor                                                 |
| ------- | ----------------------------------------------------- |
| Feature | 002-server-auth-storage                               |
| Spec    | `specs/002-server-auth-storage/spec.md`               |
| Plan    | `specs/002-server-auth-storage/plan.md`               |
| Estado  | Pendiente de implementación                           |
| Fecha   | 2026-09-28                                            |

---

## Tareas de Implementación

- [x] **T1: Configurar variables de entorno, utilidades de hash y `.gitignore`**
  - **AC asociados:** AC-1, AC-3.
  - **Hecho cuando:** `database/` y `scripts/` añadidos a `.gitignore`, script `scripts/generate_password_hash.py` implementado para generar hashes de contraseñas de forma interactiva y soporte de `.env` configurado.

- [x] **T2: Implementar módulo de base de datos del servidor (`src/server_db.py`) con tests**
  - **AC asociados:** AC-6.
  - **Hecho cuando:** `tests/test_server_db.py` ejecutado y en verde con `pytest`, verificando que crea `database/content_os_server.sqlite3` con el esquema relacional idéntico, semillas iniciales y operaciones de consulta/modificación.

- [x] **T3: Implementar rutas de autenticación `/auth`, `/logout` y `/api/auth/status` con tests**
  - **AC asociados:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-9, AC-10.
  - **Hecho cuando:** `tests/test_server_auth.py` en verde con `pytest`, validando vista de login monocromática (`templates/login.html`), validación segura con `check_password_hash`, redirecciones, cookie de sesión y cierre de sesión.

- [x] **T4: Implementar endpoints protegidos de la API del servidor (`src/server_api.py`) con tests**
  - **AC asociados:** AC-6, AC-7.
  - **Hecho cuando:** `tests/test_server_api.py` en verde con `pytest`, comprobando que rechaza solicitudes no autenticadas con HTTP 401 y permite operaciones completas de contenidos, etapas, canales y backup para el usuario autenticado.

- [x] **T5: Adaptar `repository.js` en frontend para soporte dual (modo servidor / modo local) con tests**
  - **AC asociados:** AC-6, AC-7.
  - **Hecho cuando:** `tests/js/test_repository_mode.test.js` en verde con Node test runner, verificando que el repositorio conmuta a llamadas HTTP hacia `/api/server/*` cuando `status.authenticated` es true y mantiene SQLite local en false.

- [x] **T6: Integrar botón "Cerrar sesión" en Ajustes y verificación integral**
  - **AC asociados:** AC-8, AC-9.
  - **Hecho cuando:** La vista de Ajustes muestra indicador de modo servidor y botón para cerrar sesión solo si el usuario está autenticado, y toda la suite de pruebas (`pytest`, node tests y `ruff check .`) está en verde.
