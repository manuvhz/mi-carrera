# Esquema de eventos

El esquema canónico está en `src/game/schemas.ts`. Ejemplo reducido real:

```yaml
events:
  - id: childhood-001
    title: La deuda que nadie vio
    description: En la cancha agrietada del barrio, tu madre explica el costo del viaje...
    stage: childhood
    category: familia
    tags: [familia, childhood]
    rarity: common
    ageMin: 9
    ageMax: 12
    baseWeight: 10
    oncePerCareer: true
    chainId: cadena-01
    choices:
      - id: dialogar
        text: Hablar con tu madre y construir una solución compartida
        riskLabel: Riesgo moderado
        visibleHint: Protege la relación, aunque puede costarte tiempo.
        effects:
          - { path: discipline, operation: add, value: 3 }
        result: La conversación cambia el tono de los días siguientes...
```

Las rutas de efecto aceptadas se enumeran en `statEffectSchema`. `add`, `set` y `multiply` se aplican mediante una única función y los atributos de escala quedan entre 0 y 100.
