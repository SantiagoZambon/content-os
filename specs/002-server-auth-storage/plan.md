# Plan Técnico: Autenticación Privada y Almacenamiento en Servidor

| Campo   | Valor                                                 |
| ------- | ----------------------------------------------------- |
| Feature | 002-server-auth-storage                               |
| Spec    | `specs/002-server-auth-storage/spec.md`               |
| Estado  | Plan Aprobado                                         |
| Fecha   | 2026-09-28                                            |

---

## 1. Resumen y Objetivos Técnicos

Implementar un mecanismo de autenticación privada para un único usuario administrador configurado vía variables de entorno (`.env`). Cuando el usuario inicia sesión en la ruta privada `/auth`, el frontend conmuta automáticamente su persistencia a una base de datos SQLite alojada en el servidor (`database/content_os_server.sqlite3`), manteniendo los datos persistentes en el disco de la VPS (o contenedor Docker). Los usuarios anónimos continúan operando con persistencia local en su navegador (SQLite WASM + OPFS) sin alteraciones.

---

## 2. Decisiones Técnicas y Alternativas Descartadas

### 2.1. Gestión de Credenciales y Sesión
- **Decisión:** Variables de entorno `ADMIN_USER`, `ADMIN_PASSWORD_HASH`, y `SECRET_KEY` leídas desde `.env` con fallback seguro. Validación de contraseñas mediante `werkzeug.security.check_password_hash` (PBKDF2/SHA256). Sesión gestionada con cookies firmadas `HttpOnly`, `SameSite=Lax`.
- **Justificación:** Simple, estándar en Flask, no requiere tablas adicionales para usuarios, y mantiene las credenciales fuera del repositorio.
- **Alternativa descartada:** *JWT en localStorage*: Expuesto a ataques XSS y añade complejidad innecesaria respecto a cookies de sesión HttpOnly.

### 2.2. Base de Datos en el Servidor
- **Decisión:** Base de datos SQLite estándar gestionada con Python `sqlite3` en el directorio `database/content_os_server.sqlite3` (ignorado en `.gitignore`). Aplica el mismo esquema DDL y semillas por defecto (`stages`, `channels`, `content_types`, `contents`).
- **Justificación:** Mismo modelo relacional exacto que la base local WASM, garantizando consistencia absoluta en consultas y tipos de datos.
- **Alternativa descartada:** *PostgreSQL / MySQL*: Introduce dependencias externas pesadas contrarias a la Constitución (Principio 1).

### 2.3. Capa de Transporte Frontend-Backend
- **Decisión:** Adaptador transparente en `Repository` (`repository.js`). Al iniciar (`init()`), consulta `/api/auth/status`. Si `authenticated: true`, opera en modo `'server'` delegando `query`, `exec`, `exportData` e `importData` a endpoints REST `/api/server/*`. Si no está autenticado, opera con SQLite WASM + OPFS.
- **Justificación:** Desacopla la lógica de negocio (`contentService`, `settingsService`, etc.) que permanece idéntica en cliente sin importar dónde residen los datos.
- **Alternativa descartada:** *Reescribir servicios en Python*: Duplicaría la lógica de negocio y rompería la paridad con el modo local cliente.

### 2.4. Vista de Login
- **Decisión:** Plantilla Flask `templates/login.html` que extiende `base.html`, siguiendo `docs/styles-context.md` (bloque contenedor con 4rem de border-radius, paleta monocromática, Fraunces/Inter, elemento firma halo animado y cero comentarios).
- **Justificación:** Coherencia visual idéntica al resto de la aplicación.

---

## 3. Mapeo de Criterios de Aceptación (AC)

| Módulo / Archivo | Criterios de Aceptación Cubiertos | Descripción |
| :--- | :--- | :--- |
| **`src/auth.py` + `src/templates/login.html`** | **AC-1, AC-2, AC-10** | Ruta `/auth` con formulario de acceso sin enlaces en el frontend público, estética monocromática con radio 4rem. |
| **`src/auth.py` + `src/app.py`** | **AC-3, AC-4, AC-5** | Validación contra `.env`, inicio de sesión con cookie segura, rechazo con mensaje neutro, redirección si ya está autenticado. |
| **`src/server_db.py` + `src/server_api.py`** | **AC-6** | Persistencia SQLite en `database/content_os_server.sqlite3`, endpoints protegidos con `@login_required`. |
| **`src/static/js/db/repository.js`** | **AC-6, AC-7** | Conmutación automática a modo servidor para autenticados; persistencia OPFS intacta para usuarios anónimos. |
| **`src/static/js/ui/settingsView.js` + `src/auth.py`** | **AC-8, AC-9** | Botón "Cerrar sesión" en Ajustes solo para usuario autenticado; ruta `/logout` que invalida la sesión y retorna a modo local. |

---

## 4. Estrategia de Pruebas (TDD)

1. **`tests/test_server_auth.py` (Pytest):**
   - GET `/auth` responde 200 y muestra formulario.
   - POST `/auth` con credenciales incorrectas devuelve error.
   - POST `/auth` con credenciales válidas crea sesión y redirige.
   - GET `/api/auth/status` refleja estado de autenticación.
   - POST `/logout` limpia la sesión.
2. **`tests/test_server_api.py` (Pytest):**
   - Endpoints `/api/server/*` devuelven 401 si no está autenticado.
   - Con sesión activa: CRUD de contenidos, etapas, canales y backup en la base de datos SQLite del servidor.
3. **`tests/js/test_repository_mode.test.js` (Node test runner):**
   - Verificación del comportamiento del repositorio en modo servidor y modo local.
