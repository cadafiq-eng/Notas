# Bitácora IA — v3 (transcripción local)

## Instalación

Publica juntos index.html, sw.js, manifest.json, icon-192.png e icon-512.png en un servidor HTTPS (GitHub Pages). Para conservar las notas existentes, publica en el mismo dominio y ruta que la versión anterior y usa el mismo navegador. La base de datos (bitacoraIA, versión 2) no cambia: notas, carpetas y audios se conservan.

## Cambios respecto a v2

- Transcripción sin proveedor externo: Whisper se ejecuta en el propio navegador (transformers.js de Hugging Face). Sin clave de API, sin costo y sin enviar el audio a ningún servidor.
- Se eliminó OpenAI por completo (transcripción y resumen con GPT). La clave guardada en versiones anteriores se borra del dispositivo al abrir la app.
- Ajustes: tamaño del modelo (Tiny ~40 MB, Base ~80 MB recomendado, Small ~250 MB) e idioma (español, inglés, automático).
- La primera transcripción descarga el modelo elegido; queda en caché del navegador y después funciona sin conexión.
- Resúmenes y tareas de notas antiguas se siguen mostrando y exportando, pero ya no se generan.
- Descargas por nota: transcripción sola (.txt), nota completa (.txt), Markdown (.md), PDF y audio. Los .txt/.md llevan BOM UTF-8 para que acentos y ñ se vean bien en Bloc de notas.
- PDF generado con jsPDF (cdnjs), tamaño carta; requiere conexión la primera vez.
- Service worker v3: el HTML se sirve con red primero (las actualizaciones llegan sin borrar datos); no intercepta modelos ni librerías externas.

## Rendimiento esperado

- Computadora: Base transcribe más rápido que tiempo real en la mayoría de los equipos.
- Celular: usa Tiny o Base; puede tardar de 1 a 3 veces la duración del audio. Mantén la app visible durante la transcripción.
- Audios de más de 1 hora pueden agotar la memoria del navegador en celulares; divídelos.
- Precisión: Base/Small en español es buena para dictado y reuniones claras; con ruido o varias voces simultáneas baja. Tiny comete más errores.

## Grabación (sin cambios respecto a v2)

Respaldo de fragmentos cada 5 s en IndexedDB, recuperación al reabrir, Wake Lock, pausa/reanudar y descarga de rescate si falla el guardado. No se garantiza grabación continua con pantalla bloqueada en una app web.

## Pruebas pendientes en dispositivo

1. Abrir la app actualizada y confirmar que las notas previas siguen ahí.
2. Transcribir una nota corta con Base (primera vez: barra de descarga del modelo).
3. Repetir sin conexión para confirmar que el modelo quedó en caché.
4. Probar en iPhone (Safari) una grabación mp4 y un archivo importado mp3/m4a.
5. Descargar los cinco formatos y abrir el .txt en Bloc de notas y el PDF.
