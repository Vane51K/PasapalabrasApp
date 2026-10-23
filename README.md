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
CITA: Génesis 1:1

RULETA: Equipo 2
LETRA: S
PREGUNTA: Astro que vemos de noche
RESPUESTA: Estrellas
```

La aplicación muestra **EMPIEZA POR** si la respuesta comienza con la letra y **CONTIENE** si la incluye en otra posición. Una letra puede repetirse entre equipos, pero no dentro de la misma ruleta.

`CITA:` y `CITA BÍBLICA:` son etiquetas opcionales equivalentes. Si incluyes una, la referencia se mantiene oculta hasta activar **Usar la Biblia**; entonces aparece en grande durante 60 segundos. El contador se puede pausar, reanudar o terminar antes para responder.

Las preguntas sorpresa de la letra W pueden marcarse con `PREGUNTA: SORPRESA: ...`; en ese caso, la respuesta no necesita contener W. En los demás bloques, la respuesta debe empezar o contener la letra indicada.

Los archivos `RULETA Equipo .txt`, `RULETA Maqueta 3.txt` y `RULETA Maqueta 4.txt` son tres partidas distintas. Importa un solo archivo por partida; cada uno contiene cinco ruletas/equipos con cinco preguntas cada uno.

## Partidas guardadas

El progreso se guarda en el almacenamiento local del navegador. Solo está disponible en el mismo navegador y perfil donde se creó o cargó la partida.

## Contenido

- `MANUAL_DE_USUARIO_PASAPALABRAS.pdf`: manual de usuario.
- `RULETA Equipo .txt`, `RULETA Maqueta 3.txt`, `RULETA Maqueta 4.txt`: tres maquetas de preguntas para importar por separado.
- `img/`, `css/`, `js/`: recursos y código de la aplicación.

## Licencia

Este repositorio no incluye una licencia. Hacerlo público permite consultar el contenido, pero no concede automáticamente permisos para reutilizarlo o distribuirlo.