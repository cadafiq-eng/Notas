# Bitácora IA — copia corregida

## Instalación

Publica juntos index.html, sw.js, manifest.json y los dos iconos en un servidor HTTPS. Para desarrollo se admite localhost. Abrir index.html directamente como archivo o desde la vista previa de Drive no ofrece un entorno válido para grabación/PWA.

No se modificó ningún archivo de Google Drive. Esta copia parte de los cinco archivos individuales de la carpeta; el ZIP de la carpeta es anterior a ellos. La base de datos conserva su nombre y migra de versión 1 a 2 sin borrar notas ni audio. Para conservar datos existentes, publica en el mismo origen y perfil de navegador. Otro dominio, puerto o navegador tendrá almacenamiento independiente.

Si sustituyes una instalación existente, termina las grabaciones, respalda tus datos y cierra todas las ventanas de la app antes de abrir la versión nueva. El nuevo service worker espera al cierre de los clientes para activarse. La versión original usaba activación inmediata y borraba cachés ajenas; se corrigieron ambas conductas.

## Cambios

- Grabación con selección de WebM/Opus, MP4 o Ogg según soporte real del navegador.
- Exclusión de inicios simultáneos mientras se concede permiso y bloqueo de un nuevo inicio durante el guardado.
- Entrega de audio solicitada cada cinco segundos y persistencia por fragmentos en IndexedDB. Recuperación al reabrir, orden correcto de fragmentos y protección contra duplicados de notas ya guardadas.
- Nota y audio final guardados en una única transacción. Los auxiliares de escritura esperan la confirmación de la transacción. Si falla el guardado final, se intenta descargar una copia de rescate y se mantienen los fragmentos persistidos.
- Contador basado en tiempo transcurrido, descontando pausas explícitas; no depende de contar ejecuciones del temporizador.
- Solicitud de mantener pantalla encendida, readquisición al volver a la app, aviso de interrupción del micrófono y cierre de sus pistas al terminar.
- Confirmación al descartar, indicación Pausar/Reanudar, protección al cerrar y acceso a una grabación activa desde el botón de nueva nota.
- Importación con manejo de errores, archivos vacíos y espera limitada de metadatos; duración infinita normalizada.
- Extensiones correctas en descarga y transcripción; rechazo local de transcripciones superiores a 25 MB.
- Validación de campos del resumen y protección si se elimina una nota durante una solicitud de IA.
- Liberación de la URL de audio al cambiar de detalle.
- Controles de al menos 44 px, foco visible, texto largo adaptable y campos móviles de 16 px para reducir zoom involuntario. Orientación libre en el manifiesto.
- Caché limitada a los archivos de la app; conserva otras cachés y no intercepta APIs externas.

## Pantalla apagada o bloqueada

No se garantiza grabación continua con pantalla bloqueada en una app web. Safari puede suspender el micrófono; Chrome en Android puede retrasar los eventos que entregan audio. La solicitud Wake Lock evita el apagado automático cuando está disponible y autorizada; no impide un bloqueo manual y puede ser revocada por el sistema.

El respaldo de cinco segundos es una solicitud al navegador, no una garantía de frecuencia. Solo puede recuperarse audio ya entregado y almacenado. Si el sistema cierra la app, puede perderse el último tramo. Una recuperación tras cierre abrupto puede estar incompleta o no ser reproducible dependiendo del contenedor. El contador expresa tiempo transcurrido sin pausas explícitas, no duración garantizada de sonido capturado.

Para sesiones importantes, mantén la app visible y escucha el archivo resultante. Si el requisito indispensable es continuar al bloquear, hace falta una implementación nativa con los permisos y servicios de audio en segundo plano de cada plataforma; esta entrega no incluye esa conversión.

Fuentes técnicas:
- https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/dataavailable_event
- https://developer.mozilla.org/en-US/docs/Web/API/WakeLock/request
- https://developer.mozilla.org/en-US/docs/Web/API/WakeLockSentinel

## Pruebas realizadas

Se ejecutaron pruebas automatizadas con Node.js 24 y un entorno simulado de navegador, micrófono y almacenamiento. Resultado: aprobado.

1. Doble inicio durante permiso pendiente: una sola instancia.
2. Selección de MP4 cuando es el formato soportado y solicitud de fragmentos de 5 s.
3. Salto de 65 s sin ejecutar temporizadores: contador correcto; pausa de 30 s excluida y reanudación de 5 s incluida.
4. Persistencia temporal, guardado final, MIME correcto, limpieza de borradores y liberación del micrófono.
5. Cancelación sin crear nota.
6. Recuperación ordenada de fragmentos y no duplicación de una nota existente.
7. Extensiones WAV y MP3.
8. Activación del service worker conserva cachés de otras aplicaciones y excluye APIs externas.
9. Sintaxis del código principal y service worker válida; manifiesto JSON válido y archivos de instalación presentes.

Estas pruebas verifican lógica con simulaciones. No constituyen pruebas de captura física, transacciones reales en un navegador, diseño visual, instalación PWA ni continuidad con bloqueo. No se hicieron llamadas de pago a OpenAI.

## Pruebas pendientes en dispositivos

En Safari/iPhone y Chrome/Android: grabar 30 s, pausar 10 s, reanudar y detener; escuchar el resultado. Repetir con bloqueo manual de 60 s, cambio de aplicación, llamada entrante y ahorro de batería. Comparar audio y contador. Cerrar abruptamente tras varios fragmentos y verificar recuperación/reproducción al reabrir. Probar micrófono denegado, almacenamiento lleno, modo sin conexión tras una primera carga, instalación PWA, vista estrecha y horizontal, importación WAV/MP3/MP4 y actualización con datos existentes.

## Límites conservados

El respaldo JSON existente contiene notas y carpetas, no audio ni claves; descarga los audios por separado. El almacenamiento local puede ser eliminado por el usuario o por el sistema; la solicitud de persistencia no obliga al navegador. La clave de OpenAI continúa almacenándose en localStorage como en el original: usa una clave personal restringida; para distribución multiusuario se necesita un servidor que gestione credenciales. No se incluye servidor ni modificación de ese despliegue. Las funciones de IA requieren conexión y saldo/permisos de la API.
