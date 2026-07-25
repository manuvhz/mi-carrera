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
  return cleanSpacing(presented)
}

export function presentChoiceText(text: string, title: string) {
  let presented = text
  for (const mention of titleMentions(title)) presented = presented.replaceAll(mention, 'la situación')

  const compactRules: Array<[RegExp, string]> = [
    [/^Resolver la situación en privado con (.+)$/u, 'Hablar en privado con $1'],
    [/^Contar tu versión de la situación antes de que otros la definan$/u, 'Contar tu versión antes de que otros la definan'],
    [/^Escuchar a (.+) y acordar una salida para la situación$/u, 'Escuchar a $1 y buscar una salida juntos'],
    [/^Resolver la situación por tu cuenta antes de que cierre la oportunidad$/u, 'Actuar por tu cuenta antes de que cierre la oportunidad'],
    [/^Pedir tiempo para revisar la situación con la familia$/u, 'Pedir tiempo y hablarlo con la familia'],
    [/^Aceptar ahora y convertir la situación en una apuesta personal$/u, 'Aceptar ahora y apostar por ti'],
    [/^Seguir el plan acordado para atravesar la situación$/u, 'Seguir el plan acordado'],
    [/^Asumir a solas el costo de la situación$/u, 'Asumir el costo por tu cuenta'],
    [/^Guardar el problema y competir mientras la situación siga siendo posible$/u, 'Guardar el problema y seguir compitiendo'],
  ]
  for (const [pattern, replacement] of compactRules) presented = presented.replace(pattern, replacement)
  return cleanSpacing(presented).replace(/^Escuchar a el /u, 'Escuchar al ')
}

function titleMentions(title: string) {
  return [`“${title}”`, `"${title}"`, `‘${title}’`]
}

function cleanSpacing(text: string) {
  return text.replace(/\s+/gu, ' ').replace(/\s+([,.;:])/gu, '$1').trim()
}
