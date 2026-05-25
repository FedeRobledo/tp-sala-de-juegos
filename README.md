# Sala de Juegos - Programación IV UTN

Aplicación web desarrollada en Angular para el Trabajo Práctico de Programación IV.

El proyecto consiste en una sala de juegos con autenticación de usuarios, navegación protegida, juegos funcionales, guardado de resultados y chat en tiempo real. La aplicación tiene una identidad visual basada en una sala de juegos argentina, combinando estética moderna con referencias nacionales.

## Alumno

Federico Robledo

## Materia

Programación IV - UTN

## Tecnologías utilizadas

- Angular
- TypeScript
- HTML
- CSS
- Supabase
- Supabase Auth
- Supabase Database
- Supabase Realtime
- Git / GitHub
- Vercel

## Funcionalidades principales

### Navegación general

La aplicación cuenta con una navegación principal desde la cual se puede acceder a las secciones disponibles:

- Home
- Juegos
- Ahorcado Argentino
- Mayor o Menor
- Chat
- Resultados
- Quién soy

La navegación se adapta según el estado de sesión del usuario.

### Autenticación

Se implementó autenticación utilizando Supabase.

El usuario puede:

- Registrarse.
- Iniciar sesión.
- Cerrar sesión.
- Mantener una sesión activa.
- Acceder a secciones protegidas solamente si está autenticado.

Las pantallas de login y registro quedan disponibles únicamente para usuarios no autenticados.

### Guards

Se implementaron guards para proteger rutas privadas y evitar accesos incorrectos.

Rutas protegidas:

- `/juegos`
- `/juegos/ahorcado`
- `/juegos/mayor-menor`
- `/chat`
- `/resultados`

Si un usuario no autenticado intenta ingresar a una ruta protegida, es redirigido al login.

Si un usuario autenticado intenta ingresar a login o registro, es redirigido al home.

## Juegos implementados

### Ahorcado Argentino

Juego de ahorcado basado en palabras relacionadas con Argentina.

Características:

- Palabras vinculadas a cultura, historia y geografía argentina.
- Pistas para orientar al jugador.
- Botones para seleccionar letras.
- Control de errores.
- Finalización por victoria o derrota.
- Cálculo de puntaje.
- Medición de tiempo.
- Guardado del resultado en Supabase.

Al finalizar una partida, se guarda información como:

- Usuario.
- Juego.
- Puntaje.
- Tiempo.
- Si ganó o perdió.
- Palabra jugada.
- Letras seleccionadas.
- Cantidad de errores.

### Mayor o Menor

Juego de cartas basado en la baraja española.

Características:

- Carta actual visible.
- Elección entre mayor o menor.
- Revelado de la siguiente carta.
- Conteo de aciertos.
- Control de errores.
- Finalización por rondas o por errores.
- Cálculo de puntaje.
- Medición de tiempo.
- Guardado del resultado en Supabase.

Al finalizar una partida, se guarda información como:

- Usuario.
- Juego.
- Puntaje.
- Tiempo.
- Si ganó o perdió.
- Aciertos.
- Errores.
- Rondas jugadas.
- Última elección.
- Carta final.

## Pantalla de juegos

Se agregó una pantalla específica para listar los juegos disponibles.

Desde `/juegos` se puede acceder a:

- Ahorcado Argentino.
- Mayor o Menor.

También se muestran juegos próximos:

- Preguntados.
- Sonido o Símbolo.

Esta pantalla permite centralizar los accesos a los juegos actuales y futuros.

## Chat global

Se implementó una sala de chat para usuarios autenticados.

Características:

- Listado de mensajes.
- Envío de mensajes.
- Identificación del usuario que envía cada mensaje.
- Diferenciación visual entre mensajes propios y mensajes de otros usuarios.
- Persistencia de mensajes en Supabase.
- Actualización en tiempo real utilizando Supabase Realtime.

Para que el chat funcione en tiempo real, la tabla `chat_messages` fue agregada a la publicación `supabase_realtime`.

## Base de datos

Se utilizaron tablas en Supabase para guardar resultados y mensajes.

### Tabla `game_results`

Guarda los resultados de los juegos.

Campos principales:

- `id`
- `user_id`
- `user_email`
- `user_name`
- `game`
- `score`
- `time_seconds`
- `won`
- `details`
- `created_at`

### Tabla `chat_messages`

Guarda los mensajes del chat global.

Campos principales:

- `id`
- `user_id`
- `user_email`
- `user_name`
- `message`
- `created_at`

## Seguridad en Supabase

Se activó Row Level Security en las tablas utilizadas.

Políticas principales:

- Los usuarios autenticados pueden insertar sus propios resultados.
- Los usuarios autenticados pueden leer resultados.
- Los usuarios autenticados pueden insertar sus propios mensajes.
- Los usuarios autenticados pueden leer mensajes del chat.

## Evolución por sprint

### Sprint 1

En el primer sprint se trabajó sobre la base del proyecto.

Se incorporó:

- Estructura inicial de la aplicación.
- Navegación principal.
- Pantalla Home.
- Pantalla Quién soy.
- Conexión con la API de GitHub para mostrar información del alumno.
- Definición de la temática visual del proyecto.
- Primer deploy.

### Sprint 2

En el segundo sprint se incorporó autenticación.

Se incorporó:

- Configuración de Supabase.
- Registro de usuarios.
- Inicio de sesión.
- Cierre de sesión.
- Manejo de sesión activa.
- Guards de rutas.
- Navegación condicional según sesión.
- Ajustes visuales para login y registro.

### Sprint 3

En el tercer sprint se avanzó sobre la funcionalidad principal de la sala.

Se incorporó:

- Servicio de resultados de juegos.
- Juego Ahorcado Argentino.
- Guardado de resultados de Ahorcado.
- Juego Mayor o Menor.
- Guardado de resultados de Mayor o Menor.
- Chat global.
- Chat en tiempo real con Supabase Realtime.
- Pantalla de listado de juegos.
- Ajustes de navegación protegida.
- Estética final de Sala Argentina.

## Rutas principales

| Ruta | Descripción | Acceso |
|---|---|---|
| `/home` | Pantalla principal | Público |
| `/quien-soy` | Información del alumno | Público |
| `/login` | Inicio de sesión | Público sin sesión |
| `/register` | Registro de usuario | Público sin sesión |
| `/juegos` | Listado de juegos | Protegido |
| `/juegos/ahorcado` | Juego Ahorcado Argentino | Protegido |
| `/juegos/mayor-menor` | Juego Mayor o Menor | Protegido |
| `/chat` | Chat global | Protegido |
| `/resultados` | Resultados / ranking | Protegido |

## Instalación y ejecución local

Clonar el repositorio:

```bash
git clone <url-del-repositorio>