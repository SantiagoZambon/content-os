# PROMPTS

### 1. Generar constitution.md
```
Proyecto: [descripción].

Redacta docs/constitution.md: 6 principios innegociables, cortos y
verificables, sobre stack simple, relación spec↔código, separación
lógica/interfaz, política de tests, persistencia de datos, e idioma
del código y los mensajes. Máx. 15 líneas. Espera mi aprobación antes
de crear el archivo.
```

### 2. Generar spec.md
```
NO escribas código. Vamos a redactar la spec de la primera funcionalidad.
Lee docs/constitution.md.

Idea inicial: [idea].

1. Hazme preguntas de UNA en UNA para sacar ambigüedades (casos límite,
   errores). Máx. 6.
2. Con mis respuestas, genera specs/<feature>/spec.md siguiendo el
   template: AC numerados (AC-x) en notación EARS, en español, y dudas
   sin resolver marcadas [NECESITA ACLARACIÓN].
3. Solo el QUÉ y el POR QUÉ — nada de stack, arquitectura ni archivos.
```

### 3. Generar plan.md
```
Lee docs/constitution.md y specs/<feature>/spec.md. NO escribas código.

Preferencias técnicas: [stack, restricciones, si las hay].

Genera specs/<feature>/plan.md con: arquitectura y decisiones técnicas
justificadas (con su alternativa descartada), y estrategia de tests.
Debe respetar la constitución, cubrir todos los AC, y marcar qué AC
cubre cada parte.
```

### 4. Generar tasks.md
```
A partir de specs/<feature>/spec.md y plan.md, genera specs/<feature>/tasks.md:
tareas chicas (máx. 20-30 min c/u), en orden de dependencia, cada una con
los AC que cubre y un "Hecho cuando:" verificable. Usa checkboxes.
```

### 5.a Implementar una tarea (Implementar tarea 1 a 1)
```
Implementa SOLO la tarea [T2] de specs/<feature>/tasks.md, siguiendo
plan.md y la constitución. Primero los tests, después el código. Ejecuta
los tests y muéstrame el resultado. Al terminar: marca [T2] en tasks.md,
indica qué AC cubre, y PÁRATE — no sigas con la próxima tarea.
```

### 5.b Implementar todas las tareas (Implementar todas las tareas)
```
Implementa todas las tareas pendientes de specs/<feature>/tasks.md, en
orden, siguiendo plan.md y la constitución. Para cada una: primero los
tests, después el código, y ejecuta los tests. Márcala como hecha en
tasks.md recién cuando pase todo y funcione — si algo falla o queda
incompleto, PÁRATE ahí, no sigas con las demás, y cuéntame qué pasó.
```

### 6. Validar todo
```
Recorre specs/<feature>/spec.md AC por AC ([AC-1 a AC-N]). Para cada
uno: qué test lo cubre y el resultado de ejecutarlo. Si alguno no está
cubierto o falla, dilo explícitamente. Después revisa los criterios de
finalización y dame un veredicto: ¿la spec está cumplida o no?
```