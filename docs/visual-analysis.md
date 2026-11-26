# Bonanza Studios — réplica local de referencia

Captura del frontend público de https://www.bonanza-studios.com/ (26/11/2026). Proyecto de análisis visual; no es el repositorio fuente de Next.js ni un backend de Bonanza.

## Ejecutar
```powershell
python serve.py
```
Abrir http://127.0.0.1:4173/. Solo loopback. Python 3.12, sin dependencias adicionales. Para actualizar la captura deliberadamente: obtener de nuevo reference.html y ejecutar python mirror.py. No se requiere internet para ejecutar la copia capturada. No publicar sin comprobar las licencias y permisos de los recursos originales.

## Estructura
- reference.html: HTML público original.
- site/index.html: réplica de la home, con el runtime cliente público de Next.js.
- site/_next/static/immutable/chunks: CSS modular y bundles compilados.
- site/_next/static/immutable/media, site/images, site/_optimized: recursos y variantes optimizadas.
- site/service, site/case-studies, site/resources, site/about-us, site/de: rutas adicionales capturadas.
- mirror.py: recolección de recursos estáticos públicos y manifiesto.
- serve.py: servidor local estático, sin proxy ni POST; CSP restringe conexiones, formularios y recursos externos.
- qa/: capturas y reportes de comparación; no se sirven por HTTP.

## Sistema visual observado
Space Grotesk variable 300–700, cuerpo 400, encabezados 500; mono del sistema.
Colores: black #050607, ink #0d1012, dark green #060a08, light green #141c18, sage #9aa59f, slate #5b6560, paper #eef0ec, mist #f6f8f7, orange #ff5a1f, cyan #2fd6ff, green #3ee08a.
Escala tipográfica base escritorio: h1 56, h2 48, h3 32, h4 24, cuerpo 16, cuerpo pequeño 14; reglas responsive originales.
Easing estándar cubic-bezier(.645,.045,.355,1), salida cubic-bezier(.16,1,.3,1), spring cubic-bezier(.68,-.55,.265,1.55).
Hero con palabras escalonadas de 800 ms, delays observados 400–690 ms; canvas animado y transición de opacidad de 800 ms. Header fijo de 72 px; dock inferior fijo; secciones sticky, animaciones de vista y scroll. Navegación flotante, megamenú con hover en escritorio y menú táctil en móvil, selector de idioma, tarjetas y CTA.
A 1920×1080 la altura inicial medida fue 34.671 px en ambas páginas; a 1280×720 fue 27.899 px inicialmente. La altura puede cambiar tras scroll o cambio de viewport.

## QA (umbral pixel diff 0.1; antialiasing excluido en motion)
| Resolución | Tramo | Muestras | Diferencia media | Peor |
|---|---|---:|---:|---:|
| 1280×720 | 0–5200 | 8 | 0.780% | 4.280% |
| 1280×720 | 5200–19200 | 12 | 0.611% | 4.773% |
| 1280×720 | 19200–footer | 8 | 0.780% | 3.358% |
| 390×844 | 0–2400 | 5 | 1.727% | 3.806% |
| 1920×1080 | 0–5200, repetición simultánea | 8 | 0.785% | 3.521% |

Todos los pares de los tramos anteriores se alinearon por posición de scroll. La primera captura estática válida de la home 1280×720 difirió 6.767%; la repetición de movimiento redujo las diferencias. La comparación no simultánea inicial de 1920×1080 mostró 53.997% de diferencia media, con visibilidad distinta; la repetición simultánea dio 0.785%. No equivalen a fidelidad exacta temporal ni a cobertura de cada píxel y momento. El móvil tuvo advertencia de visibilidad distinta. La captura individual 1920×1080 del local excedió el límite de 1 MB; se usó captura de movimiento.
Hover Services verificado en local: aparecen MVP Development, 2-Week Design Sprint, 90-Day Digital Acceleration y otros enlaces. Clic All Services lleva a /service. Botón móvil Open menu muestra Services, Case studies, Resources y Close menu. No se comparó hover del original porque la herramienta web no expone dicha acción. No se probó cada enlace o formulario. 
Assets: 573 de 576 entradas detectadas descargadas o cacheadas; las tres fallidas fueron URLs /media/ redundantes. Los tres archivos reales WOFF2 bajo /_next/static/immutable/media están verificados.
Los reportes de movimiento válidos están en qa/motion-diff-1280.lbmotion, qa/motion-diff-mid.lbmotion, qa/motion-diff-end.lbmotion, qa/motion-diff-mobile.lbmotion y qa/motion-diff-1920-repeat.lbmotion. El primer diff-1280.png no es comparable por posiciones distintas; usar diff-1280-top.png.

## Alcance y limitaciones
No es código fuente JSX/TSX mantenible: es una captura local de HTML, CSS y JavaScript compilado público. El backend, CMS, analítica y envío de formularios no se reproducen. Las páginas de detalle no capturadas devuelven una pantalla explícita de 404 local. No se ha publicado ni realizado commit. Los recursos de terceros pueden tener condiciones de licencia; verificar antes de reutilizar comercialmente.
