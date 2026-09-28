# Spec: MVP Calendario de Contenidos

| Campo           | Valor                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Estado          | Borrador                                                                                             |
| Fecha           | 2026-09-23                                                                                           |
| Pedido original | Va ser el mvp de todo el software de gestion de calendario de contenidos con todas sus funcionalidades y estilos 100% funcional. |

## 1. Resumen

El MVP del sistema de gestión de contenidos es una aplicación integral para creadores que permite planificar, redactar y organizar publicaciones en un calendario mensual y en un tablero visual por etapas. El objetivo es centralizar la redacción de guiones y la programación de contenidos en un único entorno privado, responsivo y operable sin depender de servicios externos en la nube.

## 2. Problema

Actualmente, los creadores de contenido gestionan sus publicaciones dispersando información entre calendarios generales, hojas de cálculo y editores de notas para guiones. Esta fragmentación dificulta visualizar el flujo de trabajo desde la idea inicial hasta la publicación, genera desorden en las fechas límites y no ofrece un espacio unificado optimizado para la creación de guiones junto con su estado de producción.

## 3. Historias de usuario

- **Como creador de contenidos**, quiero organizar mis contenidos en un tablero visual por etapas, para monitorear el progreso de cada pieza desde la idea hasta su publicación.
- **Como creador de contenidos**, quiero visualizar mis contenidos en un calendario mensual, para tener claridad sobre las fechas de publicación planificadas.
- **Como creador de contenidos**, quiero redactar y dar formato a mis guiones dentro de cada contenido, para tener el texto y los metadatos en un solo lugar.
- **Como creador de contenidos**, quiero una vista de solo lectura cómoda, para revisar la información y leer el guión sin riesgo de editarlo accidentalmente.
- **Como creador de contenidos**, quiero arrastrar contenidos entre columnas en el tablero o entre días en el calendario, para actualizar estados o fechas rápidamente.
- **Como creador de contenidos**, quiero filtrar mis contenidos por red social, etapa, tipo de contenido y fechas, para enfocarme en publicaciones específicas.
- **Como creador de contenidos**, quiero configurar las etapas, redes sociales y tipos de contenido, para adaptar el sistema a mi flujo de trabajo personalizado.
- **Como creador de contenidos**, quiero exportar e importar copias de seguridad de todos mis datos, para respaldar o restaurar mi información cuando lo necesite.
- **Como creador de contenidos**, quiero utilizar la aplicación fluidamente desde dispositivos móviles y de escritorio, para gestionar mis publicaciones en cualquier lugar.

## 4. Criterios de aceptación

### Configuración inicial y valores predeterminados
- **AC-1:** CUANDO el usuario inicia la aplicación por primera vez sin datos existentes, EL SISTEMA DEBE inicializar automáticamente las etapas predeterminadas: "Idea", "Guion", "Grabacion", "Edicion", "Publicado".
- **AC-2:** CUANDO el usuario inicia la aplicación por primera vez sin datos existentes, EL SISTEMA DEBE inicializar automáticamente las redes sociales predeterminadas: "YouTube", "Instagram", "TikTok", "Linkedin", "X".
- **AC-3:** CUANDO el usuario inicia la aplicación por primera vez sin datos existentes, EL SISTEMA DEBE inicializar automáticamente los tipos de contenido predeterminados: "Video", "Publicacion", "Vertical", "Articulo".

### Creación y edición de contenidos
- **AC-4:** CUANDO el usuario completa los campos obligatorios (título, fecha de publicación y red social) y solicita guardar, EL SISTEMA DEBE registrar el contenido exitosamente.
- **AC-5:** SI el usuario intenta guardar un contenido omitiendo el título, la fecha de publicación o la red social, ENTONCES EL SISTEMA DEBE impedir el guardado y señalar visualmente los campos obligatorios faltantes.
- **AC-6:** CUANDO el usuario no selecciona explícitamente una etapa durante la creación, EL SISTEMA DEBE asignar automáticamente la primera etapa configurada ("Idea").
- **AC-7:** MIENTRAS el usuario edita el guión de un contenido, EL SISTEMA DEBE permitir formateo en texto enriquecido y soporte de sintaxis Markdown.
- **AC-8:** CUANDO el usuario modifica y guarda un contenido existente, EL SISTEMA DEBE actualizar sus datos y reflejar los cambios en todas las vistas.

### Tablero Kanban
- **AC-9:** EL SISTEMA DEBE mostrar en el tablero Kanban una columna por cada etapa configurada, dispuestas en su orden de secuencia.
- **AC-10:** CUANDO el usuario visualiza una tarjeta de contenido en el tablero Kanban, EL SISTEMA DEBE exhibir su título, red social asignada, tipo de contenido y fecha de publicación.
- **AC-11:** CUANDO el usuario arrastra y suelta una tarjeta de contenido de una columna a otra, EL SISTEMA DEBE actualizar inmediatamente la etapa del contenido a la nueva columna de destino.

### Calendario mensual
- **AC-12:** EL SISTEMA DEBE mostrar un calendario con la cuadrícula completa del mes actual, permitiendo navegar hacia meses anteriores y posteriores.
- **AC-13:** CUANDO existen contenidos programados para un día, EL SISTEMA DEBE mostrar cada contenido en la celda del día correspondiente con su título y red social.
- **AC-14:** CUANDO el usuario arrastra y suelta un contenido desde un día hacia otra celda de fecha en el calendario, EL SISTEMA DEBE actualizar la fecha de publicación del contenido a la fecha de destino.

### Vista de lectura (Ver contenido)
- **AC-15:** CUANDO el usuario selecciona un contenido para ver su detalle, EL SISTEMA DEBE presentar una vista de solo lectura con toda la información y una visualización cómoda del guión renderizado.
- **AC-16:** CUANDO el usuario se encuentra en la vista de solo lectura, EL SISTEMA DEBE proporcionar accesos directos para pasar al modo de edición o solicitar la eliminación del contenido.

### Eliminación y modales de confirmación
- **AC-17:** CUANDO el usuario solicita eliminar un contenido, EL SISTEMA DEBE presentar un modal de confirmación antes de ejecutar la eliminación.
- **AC-18:** CUANDO el usuario confirma la eliminación dentro del modal, EL SISTEMA DEBE remover el contenido de forma definitiva y actualizar la vista actual.
- **AC-19:** CUANDO el usuario cancela la acción en el modal de confirmación, EL SISTEMA DEBE cerrar el modal sin alterar los datos.

### Filtros
- **AC-20:** CUANDO el usuario aplica filtros en el tablero Kanban o en el Calendario (por red social, etapa, tipo de contenido o rango de fechas), EL SISTEMA DEBE mostrar únicamente los contenidos que cumplan con la combinación de filtros seleccionada.
- **AC-21:** CUANDO el usuario restablece o limpia los filtros, EL SISTEMA DEBE volver a mostrar todos los contenidos programados.

### Gestión de configuración (Settings)
- **AC-22:** CUANDO el usuario accede a Configuración, EL SISTEMA DEBE permitir crear, editar y eliminar etapas, redes sociales y tipos de contenido.
- **AC-23:** SI el usuario elimina una etapa que posee contenidos asignados, ENTONCES EL SISTEMA DEBE reasignar automáticamente dichos contenidos a la primera etapa disponible.
- **AC-24:** SI el usuario elimina una red social o un tipo de contenido que está asignado a contenidos existentes, ENTONCES EL SISTEMA DEBE dejar dicho valor sin asignar en los contenidos afectados sin eliminarlos.
- **AC-25:** SI el usuario intenta eliminar la última etapa restante del sistema, ENTONCES EL SISTEMA DEBE rechazar la acción informando que debe existir al menos una etapa activa.

### Copias de seguridad (Backup)
- **AC-26:** CUANDO el usuario solicita exportar los datos desde Configuración, EL SISTEMA DEBE generar y descargar un archivo de copia de seguridad con todos los contenidos y configuraciones locales.
- **AC-27:** CUANDO el usuario carga un archivo de copia de seguridad válido para importar, EL SISTEMA DEBE restaurar los contenidos y configuraciones contenidos en el archivo previa confirmación mediante modal.

### Adaptabilidad, diseño responsivo y estilo visual (`docs/styles-context.md`)
- **AC-28:** CUANDO la aplicación se visualiza en dispositivos móviles o pantallas reducidas, EL SISTEMA DEBE adaptar la disposición de las cinco vistas manteniendo la funcionalidad completa y habilitando interacciones táctiles para la navegación y la reasignación de contenidos.
- **AC-29:** EL SISTEMA DEBE aplicar estrictamente en todas las vistas y componentes el sistema de diseño definido en `docs/styles-context.md`: paleta monocromática con fondo base `#0A0A0A`, texto `#F5F5F4` y acentos neutros; tipografía Fraunces (títulos/display) e Inter (cuerpo); radio de curvatura de `4rem` para los bloques contenedores; elemento firma con rotación suave y glow difuminado; clases CSS únicas y prefijadas; ausencia total de comentarios en código HTML y CSS; y respeto por la preferencia de movimiento reducido (`prefers-reduced-motion`).

## 5. Casos límite

- **Campos con solo espacios en blanco:** Si el usuario ingresa solo espacios en blanco en campos obligatorios (título), el sistema debe tratarlos como campos vacíos y rechazar el guardado.
- **Arrastre cancelado o zona inválida:** Si un elemento se suelta fuera de las columnas Kanban o fuera de los días del calendario, el sistema debe devolver la tarjeta a su posición original sin alterar los datos.
- **Múltiples contenidos en un mismo día:** Si un día del calendario acumula muchos contenidos, la celda debe ofrecer un indicador visual o mecanismo de desplazamiento para consultar todos los elementos sin romper la cuadrícula.
- **Archivo de respaldo corrupto o incompatible:** Si se intenta importar un archivo no válido o con formato corrupto, el sistema debe mostrar un mensaje de error claro y conservar los datos existentes intactos.
- **Nombres duplicados en configuración:** Si se intenta crear una etapa, red social o tipo de contenido con un nombre idéntico a uno ya existente, el sistema debe rechazar la duplicación.

## 6. Fuera de alcance

- Conexión o publicación automática mediante APIs directas a redes sociales (YouTube, Instagram, TikTok, etc.).
- Sincronización multiusuario en la nube o sistema de cuentas y autenticación en servidor.
- Notificaciones push o recordatorios por correo electrónico.
- Métricas, estadísticas o analíticas de rendimiento de publicaciones.

## 7. Preguntas abiertas

(Ninguna. Todos los requisitos y comportamientos esperados fueron acordados y clarificados).
