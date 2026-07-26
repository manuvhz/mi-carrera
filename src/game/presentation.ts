const STAGE_SUFFIXES = new Set([
  'Infancia y barrio', 'Formación juvenil', 'Primeros pasos', 'Consolidación',
  'Mejor etapa', 'Madurez', 'Últimos años', 'Retiro y legado',
])

export function presentEventTitle(title: string) {
  const separator = title.lastIndexOf(' — ')
  if (separator === -1) return title
  const suffix = title.slice(separator + 3).trim()
  return STAGE_SUFFIXES.has(suffix) ? title.slice(0, separator).trim() : title
}

export function presentEventDescription(description: string, title: string) {
  let presented = description
  for (const mention of titleMentions(title)) {
    presented = presented
      .replace(`Así comienza ${mention}.`, '')
      .replace(`Así comienza ${mention}`, '')
      .replace(`El episodio, que luego llamarán ${mention}, exige`, 'El episodio exige')
      .replaceAll(mention, 'esta situación')
  }
  presented = presented
    .replace('Desde esa noche, todos recuerdan el episodio como esta situación.', 'Desde esa noche, sabes que nadie olvidará lo que decidas.')
    .replace('Hay pocos minutos para decidir cómo quieres que termine esta situación.', 'Quedan pocos minutos para elegir.')
    .replace('Tu respuesta dará sentido al recuerdo de esta situación.', 'Lo que hagas marcará el resto de la temporada.')
    .replace('Todo queda suspendido alrededor de esta situación.', 'Nadie se mueve hasta escuchar tu respuesta.')
  return compactText(cleanSpanish(presented), 230, 2)
}

export function presentChoiceText(text: string, title: string) {
  let presented = text
  for (const mention of titleMentions(title)) presented = presented.replaceAll(mention, 'la situación')

  const compactRules: Array<[RegExp, string]> = [
    [/^Resolver la situación en privado con (.+)$/u, 'Hablar en privado con $1'],
    [/^Contar tu versión de la situación antes de que otros la definan$/u, 'Contar tu versión antes de que otros la definan'],
    [/^Contar lo ocurrido en la situación y pedir ayuda a (.+)$/u, 'Pedir ayuda a $1 y contar lo ocurrido'],
    [/^Escuchar a (.+) y acordar una salida para la situación$/u, 'Escuchar a $1 y buscar una salida juntos'],
    [/^Resolver la situación por tu cuenta antes de que cierre la oportunidad$/u, 'Actuar por tu cuenta antes de que cierre la oportunidad'],
    [/^Pedir tiempo para revisar la situación con la familia$/u, 'Pedir tiempo y hablarlo con la familia'],
    [/^Aceptar ahora y convertir la situación en una apuesta personal$/u, 'Aceptar ahora y apostar por ti'],
    [/^Seguir el plan acordado para atravesar la situación$/u, 'Seguir el plan acordado'],
    [/^Asumir a solas el costo de la situación$/u, 'Asumir el costo por tu cuenta'],
    [/^Guardar el problema y competir mientras la situación siga siendo posible$/u, 'Guardar el problema y seguir compitiendo'],
  ]
  for (const [pattern, replacement] of compactRules) presented = presented.replace(pattern, replacement)
  return compactText(cleanSpanish(presented), 78, 1)
}

export function presentChoiceHint(hint: string) {
  return compactText(cleanSpanish(hint), 86, 1)
}

export function presentEventResult(result: string, title: string) {
  let presented = result
  for (const mention of titleMentions(title)) presented = presented.replaceAll(mention, 'lo ocurrido')
  return compactText(cleanSpanish(presented), 205, 2)
}

function titleMentions(title: string) {
  return [`“${title}”`, `"${title}"`, `‘${title}’`]
}

function cleanSpanish(text: string) {
  const spaced = text
    .replace(/\s+/gu, ' ')
    .replace(/\s+([,.;:])/gu, '$1')
    .replace(/\ba el\b/giu, 'al')
    .replace(/\bde el\b/giu, 'del')
    .trim()
  return spaced.replace(/(^|[.!?]\s+)([a-záéíóúñ])/gu, (_, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`)
}

function compactText(text: string, maximum: number, sentences: number) {
  const selected = text.match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.slice(0, sentences).map((sentence) => sentence.trim()).join(' ').trim() ?? text
  if (selected.length <= maximum) return selected
  const clipped = selected.slice(0, maximum - 1).replace(/\s+\S*$/u, '').replace(/[,:;\s]+$/u, '')
  return `${clipped}…`
}
