# Sala de Juegos - Programación IV

Trabajo Práctico N°1 de la materia Programación IV - UTN Avellaneda.

La aplicación consiste en una Sala de Juegos desarrollada con Angular. El objetivo del proyecto es construir una plataforma donde los usuarios puedan registrarse, iniciar sesión y acceder a distintas secciones de juegos, chat y resultados, incorporando progresivamente nuevas funcionalidades en cada sprint.

## Alumno

- Nombre: Federico Robledo
- Materia: Programación IV
- Institución: UTN Avellaneda
- Repositorio: https://github.com/FedeRobledo/tp-sala-de-juegos
- Deploy: PEGAR_URL_DEL_DEPLOY

## Tecnologías utilizadas

- Angular
- TypeScript
- HTML
- CSS
- Supabase
- Git / GitHub
- Vercel

## Funcionalidades implementadas

### Sprint 1

En el Sprint 1 se realizó la base inicial de la aplicación.

Funcionalidades principales:

- Creación del proyecto Angular.
- Configuración inicial del repositorio.
- Deploy en Vercel.
- Creación de componentes principales:
  - Home / Bienvenida.
  - Login.
  - Registro.
  - Quién soy.
  - Not Found.
- Navegación inicial entre pantallas.
- Implementación de página "Quién soy".
- Consumo de la API pública de GitHub para mostrar datos del alumno.
- Incorporación de favicon propio.
- Definición y explicación inicial del juego propio.

### Sprint 2

En el Sprint 2 se incorporó autenticación real con Supabase y se mejoró la navegación general de la aplicación.

Funcionalidades principales:

- Rediseño visual general con estética gaming.
- Implementación de layout principal con menú lateral.
- Home condicional según estado de sesión.
- Login real con Supabase Auth mediante correo y contraseña.
- Registro real de usuarios con Supabase Auth.
- Guardado de datos del usuario en base de datos:
  - correo;
  - nombre;
  - apellido;
  - edad.
- La contraseña no se guarda en la base de datos.
- Inicio automático de sesión luego del registro.
- Redirección automática al Home después de login o registro exitoso.
- Manejo de errores en login y registro.
- Tres botones de inicio rápido para usuarios de prueba.
- Cierre de sesión.
- Visualización del usuario logueado en la interfaz.
- Guards de rutas:
  - protección de rutas privadas;
  - bloqueo de acceso a Login y Registro cuando el usuario ya está logueado.
- Rutas protegidas para secciones futuras:
  - Juegos.
  - Chat.
  - Resultados.
- Pantallas placeholder para funcionalidades de próximos sprints.

## Usuarios de prueba

La pantalla de Login incluye accesos rápidos para usuarios previamente registrados.

Usuarios utilizados para pruebas:

| Usuario | Email | Contraseña |
|---|---|---|
| Jugador 1 | jugador1.sala@gmail.com | 123456 |
| Jugador 2 | jugador2.sala@gmail.com | 123456 |
| Jugador 3 | jugador3.sala@gmail.com | 123456 |

> Nota: estos usuarios deben existir previamente en Supabase para que los botones de acceso rápido funcionen correctamente.

## Juego propio

El juego propio definido para la aplicación es **Sonido o Símbolo**.

La idea consiste en reconocer elementos relacionados con Argentina a partir de un sonido o de una imagen parcialmente oculta. En cada ronda, el jugador deberá elegir la respuesta correcta entre varias opciones.

El desempeño podrá medirse mediante:

- puntaje total;
- cantidad de aciertos;
- ayudas utilizadas;
- tiempo total de partida.

Esta funcionalidad será implementada en un sprint posterior.

## Instalación y ejecución local

Clonar el repositorio:

```bash
git clone https://github.com/FedeRobledo/tp-sala-de-juegos.git