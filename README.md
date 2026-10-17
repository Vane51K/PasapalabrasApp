# Pasapalabras de Escritorio

Aplicación local para organizar y presentar concursos de Pasapalabras con varias ruletas, una por equipo.

![Animación de Pasapalabras](https://media.giphy.com/media/mGo8dkPOF6GLm/giphy.gif)

## Uso

1. Abre `index.html` en un navegador moderno.
2. Elige **Nuevo / Configurar Juego** para preparar una partida, **Cargar Juego Guardado** para continuar o **Importar Juego desde Archivo** para cargar preguntas desde un TXT.
3. En cada ruleta, selecciona una letra, lee la pregunta y usa los controles de respuesta.

La fuente Gochi Hand se descarga desde Google Fonts, por lo que requiere conexión a internet. El resto de la aplicación funciona localmente en el navegador.

## Formato TXT

Separa cada pregunta con una línea en blanco. Usa `RULETA` para indicar el equipo, y `LETRA`, `PREGUNTA` y `RESPUESTA` para completar cada bloque:

```txt
RULETA: Equipo 1
LETRA: G
PREGUNTA: Animal doméstico que suele maullar
RESPUESTA: Gato

RULETA: Equipo 2
LETRA: S
PREGUNTA: Astro que vemos de noche
RESPUESTA: Estrellas
```

La aplicación muestra **EMPIEZA POR** si la respuesta comienza con la letra y **CONTIENE** si la incluye en otra posición. Una letra puede repetirse entre equipos, pero no dentro de la misma ruleta.

## Partidas guardadas

El progreso se guarda en el almacenamiento local del navegador. Solo está disponible en el mismo navegador y perfil donde se creó o cargó la partida.

## Contenido

- `MANUAL_DE_USUARIO_PASAPALABRAS.pdf`: manual de usuario.
- `RULETA Equipo .txt`: preguntas de ejemplo para importar.
- `img/`, `css/`, `js/`: recursos y código de la aplicación.

## Licencia

Este repositorio no incluye una licencia. Hacerlo público permite consultar el contenido, pero no concede automáticamente permisos para reutilizarlo o distribuirlo.