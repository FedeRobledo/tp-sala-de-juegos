# Sala Argentina de Juegos - Programación IV

Trabajo práctico desarrollado para la materia **Programación IV** de la Tecnicatura Universitaria en Programación.

La aplicación consiste en una sala de juegos web desarrollada con **Angular** y conectada a **Supabase** para autenticación, almacenamiento de resultados y chat en tiempo real.

El proyecto fue trabajado por sprints, utilizando ramas en GitHub y deploy en Vercel.

---

## Datos del alumno

- **Alumno:** Federico Robledo
- **Materia:** Programación IV
- **Institución:** UTN
- **Proyecto:** Sala de Juegos
- **Tecnologías principales:** Angular, TypeScript, Supabase, HTML y CSS

---

## Descripción general

La aplicación permite que un usuario se registre, inicie sesión y acceda a una sala con distintos juegos.  
Cada juego tiene reglas propias, condición de victoria o derrota, puntaje y guardado de resultados.

Además, la aplicación incluye:

- Login y registro de usuarios.
- Guards para proteger rutas privadas.
- Pantalla Home.
- Pantalla de Juegos.
- Chat global en tiempo real.
- Tabla de resultados por juego.
- Pantalla “Quién soy”.
- Página Not Found.
- Diseño responsive.
- Favicon personalizado.
- Modales y mensajes visuales en lugar de `alert()`.

---

## Funcionalidades principales

### Autenticación

La autenticación se realiza mediante Supabase.

El usuario puede:

- Registrarse con nombre, apellido, edad, email y contraseña.
- Iniciar sesión con email y contraseña.
- Usar accesos rápidos de prueba.
- Cerrar sesión.
- Acceder a las rutas privadas solo si está logueado.

---

## Juegos implementados

### Ahorcado

Juego clásico donde el usuario debe adivinar una palabra antes de quedarse sin intentos.

Características:

- Palabras relacionadas con la temática argentina.
- Letras seleccionables.
- Control de errores.
- Condición de victoria o derrota.
- Puntaje.
- Guardado del resultado en Supabase.

---

### Mayor o Menor

Juego de cartas donde el usuario debe adivinar si la siguiente carta será mayor o menor que la actual.

Características:

- Cartas visuales.
- Elección entre mayor o menor.
- Rondas sucesivas.
- Condición de victoria o derrota.
- Puntaje.
- Guardado del resultado en Supabase.

---

### Preguntados

Juego de preguntas y respuestas basado en datos obtenidos desde una API externa.

Características:

- Preguntas obtenidas desde Open Trivia DB.
- Opciones múltiples.
- Puntaje según respuestas correctas.
- Penalización simple por tiempo.
- Condición de victoria o derrota.
- Resumen final en modal.
- Guardado del resultado en Supabase.

---

### Sonido o Símbolo

Juego propio desarrollado para este trabajo práctico.

La idea del juego es reconocer elementos relacionados con Argentina a partir de una pista sonora y, si el jugador lo necesita, una ayuda visual.

Características:

- 5 rondas por partida.
- Audio real por cada ronda.
- El audio se reproduce durante un máximo de 5 segundos.
- Respuesta escrita por el usuario.
- Un solo intento por ronda.
- Ayuda visual opcional mediante símbolo o imagen.
- Si responde correctamente sin ayuda, obtiene 20 puntos.
- Si usa ayuda visual y responde correctamente, obtiene 10 puntos.
- Para ganar debe lograr al menos 3 respuestas correctas.
- Guarda puntaje, tiempo, aciertos, errores y ayudas utilizadas.

Ejemplos de elementos argentinos incluidos:

- Mate.
- Asado.
- Truco.
- Bandoneón.
- Bombo legüero.
- Hinchada.

---

## Resultados

La pantalla de resultados muestra una tabla por cada juego:

- Ahorcado.
- Mayor o Menor.
- Preguntados.
- Sonido o Símbolo.

Cada tabla muestra los mejores resultados, ordenados por mejor puntaje y menor tiempo.

Se decidió mostrar un Top 5 por juego para que la pantalla sea clara, simple y fácil de leer.

---

## Chat

La aplicación incluye un chat global para usuarios logueados.

Características:

- Mensajes visibles para todos los usuarios.
- Envío de mensajes con botón o tecla Enter.
- Identificación del usuario que envía cada mensaje.
- Diferenciación visual entre mensajes propios y ajenos.
- Actualización en tiempo real mediante Supabase Realtime.
- Limpieza de suscripción al salir del componente.

---

## Quién soy

La pantalla “Quién soy” muestra datos del alumno obtenidos desde GitHub.

También incluye una explicación del juego propio, sus reglas, sistema de puntaje y forma de medir el desempeño del jugador.

---

## Not Found

Se agregó una pantalla sencilla para rutas inexistentes.

Desde esa pantalla el usuario puede:

- Volver al inicio.
- Ir a la sección de juegos.

---

## Estructura general del proyecto

```txt
src/
├── app/
│   ├── components/
│   │   ├── ahorcado/
│   │   ├── chat/
│   │   ├── home/
│   │   ├── juegos/
│   │   ├── layout/
│   │   ├── login/
│   │   ├── mayor-menor/
│   │   ├── not-found/
│   │   ├── preguntados/
│   │   ├── quien-soy/
│   │   ├── register/
│   │   ├── resultados/
│   │   └── sonido-simbolo/
│   │
│   ├── guards/
│   │   └── auth-guard
│   │
│   ├── services/
│   │   ├── auth
│   │   ├── chat
│   │   ├── game-results
│   │   ├── github
│   │   ├── questions
│   │   └── supabase
│   │
│   ├── app.routes.ts
│   └── app.config.ts
│
└── public/
    ├── assets/
    │   ├── images/
    │   └── sounds/
    └── escarapela.ico