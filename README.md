# Mi Carrera

**Mi Carrera** es un simulador narrativo, original y offline-first sobre la vida completa de un futbolista. La historia empieza entre los 9 y los 12 años: antes de una academia, un contrato o un estadio. El origen, las relaciones y las decisiones antiguas modifican el camino hasta el retiro.

La aplicación es una SPA estática preparada para GitHub Pages. Combina una historia original con clubes reales de Argentina y las cinco grandes ligas europeas, bajo las condiciones documentadas en [ATTRIBUTIONS.md](ATTRIBUTIONS.md). Es un proyecto independiente y no está afiliado a los clubes ni a sus competiciones.

## Funciones incluidas

- creación de futbolista y tres modos de origen;
- exactamente 500 eventos YAML validados, distribuidos en 23 archivos;
- 120 pasos narrativos pertenecientes a 20 cadenas;
- selección ponderada reproducible por semilla;
- decisiones con efectos deportivos, psicológicos y relacionales;
- ficha deportiva visual inspirada en videojuegos de carrera;
- doce clubes argentinos y treinta clubes de Premier League, LALIGA, Serie A, Bundesliga y Ligue 1;
- mercado de fichajes determinista con ofertas según edad, nivel, producción y reputación;
- tres minijuegos interactivos por temporada: penales, reflejos y visión de pase;
- anuario de cierre con titular, premio, estadísticas, clasificación ficticia, logros, vínculos, rivalidad y economía;
- elección permanente de estilo de juego con bonificaciones diferenciadas;
- avance anual, estadísticas, línea de tiempo y epílogo;
- universo narrativo ficticio de 8 países y capa jugable real de 6 países, 6 rutas y 42 clubes;
- tres espacios de guardado IndexedDB con Dexie;
- importación y exportación JSON con validación Zod;
- PWA instalable, compatible con uso sin conexión;
- interfaz mobile first, navegación con teclado y movimiento reducido;
- publicación automática mediante GitHub Actions.

## Tecnologías

Vite, React, TypeScript estricto, Tailwind CSS, Zustand, Zod, Dexie, YAML, HashRouter, Vitest, Playwright y vite-plugin-pwa.

## Instalación

Requiere Node.js 22 LTS o posterior.

```bash
npm install
npm run dev
```

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Desarrollo local |
| `npm run validate:content` | Valida esquema, ids y conteos de los 500 eventos |
| `npm run typecheck` | Comprueba TypeScript estricto |
| `npm test` | Pruebas unitarias |
| `npm run test:e2e` | Flujos Playwright en escritorio y móvil |
| `npm run build` | Validación completa y compilación |
| `npm run simulate` | Simula 10.000 carreras |
| `npm run report:content` | Genera el inventario HTML |

## Arquitectura

```text
src/
  App.tsx                   interfaz y rutas
  content/events/           23 lotes YAML, máximo 25 eventos por archivo
  content/real-clubs.ts     clubes reales y metadatos de atribución
  content/world.ts          países, ligas, clubes y competiciones
  components/               ficha deportiva, selector y minijuegos
  game/                     tipos, esquemas y motor reproducible
  persistence/              base IndexedDB y slots
  stores/                   estado global Zustand
scripts/                    validación, simulación e informes
tests/e2e/                  flujos completos
.github/workflows/          publicación en Pages
```

`src/config.ts` centraliza el nombre y los parámetros generales. El contenido nunca vive dentro de componentes. `load-events.ts` incorpora los YAML durante la compilación y vuelve a validarlos en el navegador.

## Sistema narrativo

Cada evento define etapa, categoría, rango de edad, rareza, peso, etiquetas y entre dos y cuatro decisiones. La semilla, el historial y la edad filtran el catálogo. Una carrera muestra solo una parte del total; los eventos ya vistos no vuelven a aparecer.

Las decisiones aplican efectos limitados a rangos válidos y registran una entrada inmutable en la línea de tiempo. Las banderas permiten recordar consecuencias y ampliar cadenas futuras sin cambiar el formato de guardado.

Consulta [CONTENT_GUIDE.md](CONTENT_GUIDE.md), [EVENT_SCHEMA.md](EVENT_SCHEMA.md), [BALANCING_GUIDE.md](BALANCING_GUIDE.md) y [STORY_CHAINS.md](STORY_CHAINS.md).

## Guardado y PWA

Cada partida contiene una versión de formato. Zod valida importaciones antes de escribirlas en IndexedDB. Las preferencias pequeñas pueden guardarse en `localStorage`; una carrera nunca depende de cookies ni de un servidor. El service worker conserva la aplicación y el catálogo narrativo después de la primera carga.

## GitHub Pages

El workflow establece `VITE_BASE_PATH=/<repositorio>/`, ejecuta validadores, TypeScript, pruebas y build, y publica `dist` con las acciones oficiales.

1. En GitHub abre **Settings → Pages**.
2. Selecciona **GitHub Actions** como fuente.
3. Haz `push` a `main` o ejecuta el workflow manualmente.
4. Abre `https://USUARIO.github.io/mi-carrera/`.

Para un dominio personalizado, compila con `VITE_BASE_PATH=/`.

## Ampliaciones futuras

Autenticación, sincronización, rankings y retos globales deben implementarse detrás de interfaces opcionales. La carrera local seguirá siendo completa si esos servicios no están disponibles.

## Licencia y contribución

La historia, los personajes y el mundo narrativo son originales. Los nombres y escudos reales pertenecen a sus respectivos titulares; consulta [ATTRIBUTIONS.md](ATTRIBUTIONS.md). Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de añadir contenido.
