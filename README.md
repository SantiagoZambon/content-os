# Content OS

Aplicación web moderna y minimalista de gestión, planificación y redacción de contenidos para creadores, desarrollada con **Python (Flask)** y **SQLite compilado a WebAssembly (WASM)** con persistencia en **OPFS (Origin Private File System)**.

---

# Video del Proyecto Completo

[![Video donde desarrollamos el proyecto](https://img.youtube.com/vi/FHa3arhRZCY/hqdefault.jpg)](https://youtu.be/FHa3arhRZCY)

---

# Recursos (prompts, templates)

- **Carpeta de Recursos:** [📁Resources](/resources/)

---

### 🌐 Acceso a la aplicación en producción

El proyecto está desplegado y disponible públicamente en:

### **Link:** [https://contentos.zambon.app](https://contentos.zambon.app)

---

## 💡 ¿Qué problema resuelve?

Muchos creadores de contenido gestionan sus publicaciones dispersando información entre calendarios generales, hojas de cálculo y editores de notas para guiones. Esto genera falta de foco, desorden en las fechas y dependencia de servidores en la nube que recopilan datos personales.

**Content OS centraliza todo el flujo de trabajo en una única herramienta:**

1. **Planificación visual:** Organiza ideas y publicaciones en un tablero Kanban con drag & drop y en un calendario mensual completo.
2. **Redacción de guiones integrada:** Editor en texto enriquecido con soporte para Markdown y vista previa en tiempo real dentro de cada contenido.
3. **Privacidad por diseño (Offline-First):** Por defecto, la base de datos corre de manera 100% local en tu propio navegador web mediante SQLite WASM + OPFS. Ningún contenido viaja a servidores externos salvo que decidas operar en modo servidor autenticado.

---

## ✨ Características principales

- **Cinco vistas integradas:**
  - **Tablero Kanban (drag & drop):** Flujo de trabajo visual ordenado por etapas (Idea, Guión, Grabación, Edición, Publicado).
  - **Calendario Mensual:** Vista del mes con contenidos por día y reprogramación de fechas arrastrando tarjetas.
  - **Crear / Editar Contenido:** Formulario con selección de redes, tipos de formato y editor dedicado para guiones.
  - **Ver Detalle:** Modo lectura cómodo y no editable del guión y los metadatos.
  - **Ajustes:** Personalización de etapas, redes sociales con colores propios, tipos de contenido y exportación/importación de copias de seguridad en JSON.
- **Filtros cruzados:** Filtrado instantáneo por red social, etapa, tipo de contenido y rango de fechas.
- **Estética disciplinada:** Diseño monocromático mobile-first (`#0A0A0A`/`#F5F5F4`), bordes redondeados generosos, tipografía Fraunces e Inter, y elemento firma animado con halo de luz.
- **Soporte dual de almacenamiento:**
  - **Modo Local:** SQLite en navegador (OPFS) para cualquier usuario sin registro.
  - **Modo Servidor:** Autenticación privada para administradores que persisten sus datos en el disco de su servidor/VPS.

---

## 🚀 Cómo clonar y ejecutar el proyecto en local

### Requisitos previos

- **Git**
- **Python 3.12+** (o **Docker**)
- **Node.js 20+** (opcional, únicamente si deseas ejecutar la suite de pruebas unitarias de JavaScript)

---

### Opción 1: Ejecutar con Python (Recomendado para desarrollo)

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/content-os.git
   cd content-os
   ```

2. **Crear y activar el entorno virtual:**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Instalar dependencias:**

   ```bash
   pip install -r requirements.txt
   ```

4. **(Opcional) Configurar variables de entorno para Modo Servidor:**
   Si deseas utilizar la autenticación privada y base de datos persistente en servidor:

   ```bash
   cp .env.example .env
   # Genera el hash de tu contraseña:
   python scripts/generate_password_hash.py "tu_contraseña"
   # Pega el hash y define una clave secreta en tu archivo .env
   ```

5. **Iniciar la aplicación:**

   ```bash
   python run.py
   ```

6. **Abrir en el navegador:**
   - Modo público / local: [http://localhost:5000](http://localhost:5000)
   - Acceso de administración (si configuraste `.env`): [http://localhost:5000/auth](http://localhost:5000/auth)

---

### Opción 2: Ejecutar con Docker Compose

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/content-os.git
   cd content-os
   ```

2. **Crear el archivo `.env`:**

   ```bash
   cp .env.example .env
   # Completa tus variables en .env si vas a usar modo servidor
   ```

3. **Construir y levantar el contenedor:**

   ```bash
   docker compose up -d --build
   ```

4. **Acceder:**
   Abre [http://localhost:5000](http://localhost:5000) en tu navegador.

---

## 🧪 Pruebas automáticas y calidad de código

Para verificar el correcto funcionamiento de toda la suite:

```bash
# Activar entorno virtual
source .venv/bin/activate

# Ejecutar tests de integración y servidor (Python/pytest)
pytest

# Ejecutar tests unitarios de frontend y base de datos (Node.js)
node --test tests/js/*.test.js

# Chequeo de linter y formato
ruff check .
```

---

Desarrollado por: Santiago Zambon
