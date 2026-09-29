# Spec: Autenticación Privada y Almacenamiento en Servidor

| Campo           | Valor                                                                                                                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estado          | Borrador                                                                                                                                                                                                                                                                                                   |
| Fecha           | 2026-09-28                                                                                                                                                                                                                                                                                                 |
| Pedido original | Crear un sistema de autenticación con su propia base de datos en el servidor para que sea persistente en la VPS. La función de loguearse no debe estar visible en el frontend ni tener ningún botón, solo accesible desde la ruta privada. Los usuarios no autenticados seguirán usando su base local. |

## 1. Resumen

Esta funcionalidad añade un modo de operación privado mediante autenticación de credenciales maestras al que solo se accede ingresando manualmente a una dirección URL privada. Al iniciar sesión, el usuario autenticado accede a un espacio de datos persistente alojado en el servidor anfitrión, mientras que cualquier usuario no autenticado continúa operando de forma anónima con su propio almacenamiento local en su dispositivo.

## 2. Problema

Actualmente, todos los datos residen exclusivamente en el almacenamiento local del navegador web de cada dispositivo. Cuando el creador o administrador desea gestionar sus contenidos desde distintos dispositivos o mantener una copia centralizada persistente en su propio servidor privado (VPS) sin depender de exportar e importar archivos de respaldo manualmente, requiere un mecanismo seguro que vincule sus operaciones a un repositorio en el servidor sin alterar la experiencia privada y offline de los visitantes públicos.

## 3. Historias de usuario

- **Como administrador del sistema**, quiero acceder a una pantalla de inicio de sesión mediante una ruta privada no anunciada públicamente, para ingresar a mi entorno de trabajo personal de forma protegida.
- **Como administrador del sistema**, quiero que mis contenidos y configuraciones se guarden directamente en el servidor cuando estoy autenticado, para mantener mi información unificada y respaldada entre múltiples dispositivos.
- **Como administrador del sistema**, quiero poder cerrar sesión de forma explícita desde la vista de Ajustes, para regresar con seguridad al modo local cuando termine de trabajar.
- **Como usuario no autenticado**, quiero continuar utilizando la aplicación normalmente en mi propio dispositivo de forma local y privada, sin que se requiera iniciar sesión ni se mezclen mis datos con los del servidor.

## 4. Criterios de aceptación

### Acceso a la autenticación privada
- **AC-1:** EL SISTEMA DEBE mantener la ruta de autenticación oculta de la navegación pública, sin incluir enlaces, botones ni menciones en la interfaz principal para usuarios anónimos.
- **AC-2:** CUANDO un usuario accede directamente a la dirección URL de autenticación, EL SISTEMA DEBE presentar un formulario de inicio de sesión con campos para usuario y contraseña.

### Validación de credenciales y control de sesión
- **AC-3:** CUANDO el usuario envía credenciales válidas en el formulario de inicio de sesión, EL SISTEMA DEBE establecer la sesión autenticada y redirigir al usuario al tablero principal.
- **AC-4:** SI el usuario envía credenciales incorrectas, ENTONCES EL SISTEMA DEBE rechazar el inicio de sesión y exhibir un mensaje de error claro sin especificar qué credencial falló.
- **AC-5:** SI un usuario ya autenticado intenta acceder nuevamente a la ruta de inicio de sesión, ENTONCES EL SISTEMA DEBE redirigirlo de inmediato al tablero principal sin requerir reingresar credenciales.

### Aislamiento de almacenamiento
- **AC-6:** MIENTRAS el usuario se encuentra con sesión autenticada, EL SISTEMA DEBE realizar todas las operaciones de consulta, creación, modificación y eliminación sobre el almacenamiento persistente del servidor, manteniendo los datos locales del navegador aislados.
- **AC-7:** MIENTRAS el usuario opera sin sesión activa, EL SISTEMA DEBE continuar funcionando con persistencia local en el dispositivo del usuario sin interactuar con los datos del servidor.

### Cierre de sesión
- **AC-8:** MIENTRAS el usuario se encuentra en modo autenticado, EL SISTEMA DEBE mostrar en la vista de Ajustes una opción identificada para cerrar sesión.
- **AC-9:** CUANDO el usuario autenticado confirma el cierre de sesión, EL SISTEMA DEBE invalidar la sesión en el servidor y devolver la interfaz al modo de almacenamiento local.

### Estilo visual y consistencia
- **AC-10:** EL SISTEMA DEBE aplicar en la vista de inicio de sesión la estética general monocromática, tipografía Fraunces e Inter, radios de contenedor y diseño adaptable a dispositivos móviles.

## 5. Casos límite

- **Intento de inicio de sesión con campos vacíos:** Si el usuario solicita ingresar sin completar el usuario o la contraseña, el sistema debe impedir el envío y señalar los campos obligatorios.
- **Sesión caducada durante la edición:** Si la sesión en el servidor expira mientras el usuario está trabajando, cualquier solicitud posterior debe informar el vencimiento y solicitar nueva autenticación.
- **Acceso concurrente de usuario anónimo en la misma máquina:** Al cerrar sesión, los datos mostrados en pantalla deben limpiarse de inmediato para no dejar expuesta información del servidor a usuarios locales.

## 6. Fuera de alcance

- Registro público o creación de múltiples usuarios (se trata de acceso para un único administrador).
- Recuperación de contraseña por correo electrónico o autenticación en dos pasos (2FA).
- Sincronización o fusión automática de datos locales previos hacia el servidor al iniciar sesión.

## 7. Preguntas abiertas

(Ninguna. Todos los puntos han sido clarificados con el usuario).
