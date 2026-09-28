# Contexto de diseño — Componentes HTML/CSS

Este documento define el sistema de diseño y las reglas de generación de código para cualquier componente que se me pida. Debe respetarse siempre, salvo que se indique explícitamente lo contrario en el pedido puntual.

## Tecnologías del proyecto

- Backend: Flask
- Estilos: TailwindCSS (clases utilitarias como base)
- El CSS custom (animaciones, gradientes, efectos que Tailwind no resuelve con utilidades) se escribe aparte, nunca inline en `style=""` salvo casos puntuales inevitables.

## Reglas de generación de código

- Generar siempre como **componente**, nunca como archivo HTML completo (nada de `<!DOCTYPE>`, `<html>`, `<head>` ni `<body>`). El resultado debe poder pegarse directo dentro de un `<body>` ya existente.
- Entregar el HTML del componente y el CSS custom **en archivos/bloques separados**, nunca mezclados en un solo archivo.
- Todas las clases CSS deben ser **únicas**, prefijadas con un identificador propio del componente (ej: `nombre-componente-elemento`), para evitar colisiones con otros estilos del proyecto.
- No usar selectores globales ni de etiqueta: nada de `*`, `body`, `html`, `section`, `img`, etc. como selector. Siempre selectores de clase.
- Si se necesitan variables CSS (colores, spacing), scopearlas dentro de la clase raíz del componente, nunca en `:root` global.
- **No usar comentarios** en el código (ni en HTML ni en CSS).
- Todos los componentes deben ser **responsive**, ya que el sitio también se accede desde celulares. Diseñar mobile-first y probar el layout en anchos chicos (~360–414px) antes de escalar a tablet/desktop con media queries.
- Respetar `prefers-reduced-motion`.
- Usar fuentes de Google Fonts cuando se necesite tipografía custom, entregando los `<link>` correspondientes por separado para pegar en el `<head>`.

## Estética / sistema de diseño

### Paleta

Monocromática, Solo blancos, negros y grises. Exepcion de colores para avisos, iconos, etiquetas, etc.

- Fondo base: `#0A0A0A`
- Texto principal: `#F5F5F4`
- Texto secundario / muted: `#9C9C9A`
- Acento claro: `#FFFFFF`
- Acento oscuro: `#5A5A58`
- Líneas / bordes sutiles: `rgba(255,255,255,0.08–0.14)`

### Tipografía

- Display (títulos): **Fraunces** — serif con carácter, pesos 300/500/600.
- Cuerpo: **Inter** — pesos 400/500/600.

### Fondo y atmósfera

- Fondo casi negro, nunca plano: combinar con gradientes radiales blancos muy sutiles (opacidad 0.05–0.09) para dar profundidad.
- Textura opcional de grid (líneas finas blancas al 3-4% de opacidad) enmascarada con un `radial-gradient` para que se desvanezca hacia los bordes.

### Elemento firma (signature element)

- Cada componente debe tener **un** elemento distintivo con movimiento: por ejemplo, un halo/anillo giratorio con `conic-gradient` blanco → gris → blanco alrededor de un elemento clave (foto, ícono, número), acompañado de un glow difuminado (`blur`) detrás, animado en rotación lenta (14–22s, `linear infinite`).
- No abusar de más de un elemento "protagonista" por componente — el resto de la interfaz se mantiene quieta y disciplinada.

### Partículas

- Puntos pequeños (2–5px), blancos, opacidad baja (0.15–0.6), distribuidos de forma asimétrica, con animación de flotado suave (`translateY`/`translateX` + cambio de opacidad, 8–10s ease-in-out infinite, con delays distintos entre partículas).

### Animaciones de entrada

- Fade + rise sutil (`opacity 0 → 1`, `translateY(14px) → 0`) por bloque de contenido, escalonado con delays incrementales (~0.06–0.08s entre elementos).
- Curva de easing tipo `cubic-bezier(.22,1,.36,1)`.

### Interacciones (hover)

- Botones/íconos: `translateY` sutil hacia arriba + relleno con gradiente blanco→gris al hacer hover, invirtiendo el color del ícono/texto a oscuro para mantener contraste.
- Transiciones suaves (~0.25s ease) en todas las interacciones.

### Bordes y radios

- Bordes redondeados generosos (`rounded-xl`/`rounded-full` según el elemento).
- Los bordes radius de los bloques contenedores deben ser de 4rem
- Bordes sutiles en `rgba(255,255,255,0.08–0.14)`, nunca colores sólidos saturados.

## Checklist antes de entregar un componente

1. ¿Es un componente (no un HTML completo)?
2. ¿HTML y CSS están separados?
3. ¿Todas las clases son únicas y prefijadas?
4. ¿Cero comentarios en el código?
5. ¿Paleta 100% en blanco/negro/gris?
6. ¿Hay un elemento firma con movimiento, sin sobrecargar de animaciones?
7. ¿Se ve y funciona bien en mobile (~360–414px), tablet y desktop?
8. ¿Contempla `prefers-reduced-motion`?
