# Pasapalabras de Escritorio

Aplicación local para organizar y presentar concursos de Pasapalabras con varias ruletas, una por equipo.

![Animación de Pasapalabras](https://media.giphy.com/media/mGo8dkPOF6GLm/giphy.gif)

## Uso

1. Abre `index.html` en un navegador moderno.
2. Elige **Nuevo / Configurar Juego** para preparar una partida, **Cargar Juego Guardado** para continuar o **Importar Juego desde Archivo** para cargar preguntas desde un TXT.
3. En cada ruleta, selecciona una letra, lee la pregunta y usa los controles de respuesta.

La fuente Gochi Hand se descarga desde Google Fonts, por lo que requiere conexión a internet. El resto de la aplicación funciona localmente en el navegador.

## Formato TXT

Separa cada pregunta con una línea en blanco. Usa `MAQUETA` para indicar el conjunto y `RULETA` para el equipo. Completa cada bloque con `LETRA`, `PREGUNTA` y `RESPUESTA`; la cita es opcional.

```txt
MAQUETA: 2
RULETA: Equipo 1
LETRA: G
PREGUNTA: Animal doméstico que suele maullar
RESPUESTA: Gato
CITA: Génesis 1:1

MAQUETA: 2
RULETA: Equipo 2
LETRA: S
PREGUNTA: Lugar donde vivimos
RESPUESTA: Casa

MAQUETA: 3
RULETA: Equipo 1
LETRA: G
PREGUNTA: Gigante derrotado por David
RESPUESTA: Goliat

MAQUETA: 3
RULETA: Equipo 2
LETRA: S
PREGUNTA: Astro que vemos de noche
RESPUESTA: Estrellas
```

Al importar un TXT con varias maquetas, la aplicación permite elegir cuál cargar. Las letras pueden repetirse entre maquetas y equipos, pero no dentro del mismo equipo de una maqueta. Si se omite `MAQUETA`, se usa “Maqueta 1”.

La aplicación muestra **EMPIEZA POR** si la respuesta comienza con la letra y **CONTIENE** si la incluye en otra posición. Una letra puede repetirse entre equipos, pero no dentro de la misma ruleta.

`CITA:` y `CITA BÍBLICA:` son etiquetas opcionales equivalentes. Si incluyes una, la referencia se mantiene oculta hasta activar **Usar la Biblia**; entonces aparece en grande durante 60 segundos. El contador se puede pausar, reanudar o terminar antes para responder.

Las preguntas sorpresa de la letra W pueden marcarse con `PREGUNTA: SORPRESA: ...`; en ese caso, la respuesta no necesita contener W. En los demás bloques, la respuesta debe empezar o contener la letra indicada.

## Partidas guardadas

El progreso se guarda en el almacenamiento local del navegador. Solo está disponible en el mismo navegador y perfil donde se creó o cargó la partida.

## Contenido

- `MANUAL_DE_USUARIO_PASAPALABRAS.pdf`: manual de usuario.
- `Pasapalabras_formato_adaptado.txt`: un único archivo TXT con tres maquetas seleccionables al importar.
- `RULETA Equipo .txt`: archivo anterior de preguntas de ejemplo.
- `img/`, `css/`, `js/`: recursos y código de la aplicación.

## Licencia

Este repositorio no incluye una licencia. Hacerlo público permite consultar el contenido, pero no concede automáticamente permisos para reutilizarlo o distribuirlo.