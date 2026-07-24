# Contribuir

1. Crea una rama corta desde `main`.
2. Mantén TypeScript estricto y no introduzcas dependencias de backend.
3. Conserva HashRouter y las rutas relativas compatibles con GitHub Pages.
4. Para contenido, sigue `CONTENT_GUIDE.md` y no superes 25 eventos por YAML.
5. Ejecuta:

```bash
npm run validate:content
npm run typecheck
npm test
npm run build
```

Todo cambio de formato de guardado requiere incrementar la versión, escribir una migración y añadir una prueba. Los cambios visuales deben verificarse en teclado, 360 px de ancho y con movimiento reducido.
