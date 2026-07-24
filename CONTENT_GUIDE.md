# Guía de contenido

Los eventos viven en `src/content/events/<etapa>/`. Cada YAML contiene una raíz `events` y un máximo de 25 elementos. El catálogo se valida antes de cada build.

## Flujo para añadir o editar

1. Elige la etapa y un lote con espacio.
2. Escribe una escena concreta: lugar, personaje, tensión y algo que pueda perderse.
3. Añade entre dos y cuatro decisiones sin una opción obviamente correcta.
4. Explica el riesgo sin mostrar porcentajes.
5. Ejecuta `npm run validate:content`, `npm test` y `npm run simulate`.
6. Revisa `outputs/content-report.html` con `npm run report:content`.

No se aceptan clubes reales, texto de otros videojuegos, marcas, decisiones moralizantes ni escenas que solo digan “entrenaste y mejoraste”. Los efectos deben expresar un costo junto con la ganancia.

## Distribución obligatoria

| Etapa | Cantidad |
| --- | ---: |
| Infancia | 70 |
| Academia | 85 |
| Debut | 95 |
| Consolidación | 90 |
| Mejor etapa | 70 |
| Madurez | 45 |
| Últimos años | 30 |
| Retiro | 15 |

Rarezas: 260 comunes, 150 poco comunes, 70 raras y 20 legendarias.
