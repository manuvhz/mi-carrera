import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const stages = [
  { id: 'childhood', label: 'Infancia y barrio', count: 70, min: 9, max: 12, rarity: [40, 21, 7, 2] },
  { id: 'academy', label: 'Formación juvenil', count: 85, min: 13, max: 15, rarity: [45, 25, 12, 3] },
  { id: 'debut', label: 'Debut profesional', count: 95, min: 16, max: 18, rarity: [50, 29, 13, 3] },
  { id: 'consolidation', label: 'Consolidación', count: 90, min: 19, max: 22, rarity: [45, 28, 13, 4] },
  { id: 'prime', label: 'Mejor etapa', count: 70, min: 23, max: 27, rarity: [34, 22, 11, 3] },
  { id: 'veteran', label: 'Madurez', count: 45, min: 28, max: 31, rarity: [22, 14, 7, 2] },
  { id: 'final-years', label: 'Últimos años', count: 30, min: 32, max: 36, rarity: [16, 8, 4, 2] },
  { id: 'retirement', label: 'Retiro y legado', count: 15, min: 35, max: 40, rarity: [8, 3, 3, 1] },
] as const

const characters = [
  'tu madre', 'tu padre', 'la profesora Emilia', 'el entrenador Salcedo', 'tu hermana mayor',
  'Nico, tu rival de infancia', 'la vecina que organiza el torneo', 'un cazatalentos de paso', 'tu capitán', 'la fisioterapeuta Lina',
  'el utilero del club', 'tu representante', 'una periodista local', 'el juvenil que ocupa tu puesto', 'la presidenta del barrio',
  'un compañero recién llegado', 'el técnico interino', 'tu mejor amigo', 'el director de la academia', 'la afición organizada',
  'un antiguo mentor', 'el médico del equipo', 'la directiva', 'el profesor de matemáticas', 'la entrenadora de la selección',
]

const places = [
  'la cancha agrietada del barrio', 'un patio escolar cubierto de lluvia', 'la terminal del último bus', 'el vestuario visitante', 'una pensión lejos de casa',
  'el campo auxiliar sin iluminación', 'la oficina del club', 'un torneo regional', 'la grada casi vacía', 'la clínica deportiva',
  'la plaza donde aprendiste a dominar el balón', 'el comedor de la academia', 'una concentración internacional', 'el túnel antes de una final', 'la radio comunitaria',
  'un entrenamiento a puerta cerrada', 'la sala de estudio', 'el aeropuerto de una ciudad desconocida', 'el banco de suplentes', 'la sede de la fundación',
  'el estadio de tu primer partido', 'la cancha reconstruida', 'la reunión familiar del domingo', 'un amistoso de pretemporada', 'la despedida de un compañero',
]

const conflicts = [
  'el transporte cuesta más de lo que la familia puede pagar',
  'una promesa antigua choca con la oportunidad de esta semana',
  'el equipo necesita que juegues en una posición que nunca has entrenado',
  'una molestia física aparece justo cuando por fin te observan',
  'dos personas que te ayudaron esperan decisiones incompatibles',
  'el club exige una respuesta antes de que puedas hablar con tu familia',
  'un error ajeno amenaza con caer sobre tu reputación',
  'la derrota ha dividido al grupo y nadie quiere dar el primer paso',
  'una oferta tentadora implica dejar atrás a quien creyó en ti',
  'el dinero solucionaría un problema urgente, pero reduce tus minutos',
  'una versión incompleta de la historia ya circula entre la afición',
  'el entrenador premia la obediencia mientras tú ves un riesgo táctico',
  'un compañero necesita ayuda para la misma prueba que tú quieres superar',
  'la familia prepara un plan distinto para tu futuro',
  'el cansancio comienza a afectar tus estudios y tus entrenamientos',
  'una lesión pasada vuelve a doler sin aparecer en los exámenes',
  'el capitán te pide guardar silencio sobre un problema del vestuario',
  'el barrio espera que representes causas que el club prefiere evitar',
  'un rival te ofrece una tregua que podría cambiar años de competencia',
  'la directiva mide tu valor en cifras que no cuentan toda la historia',
  'una decisión rápida puede salvar la temporada o romper la confianza',
  'la nueva generación cuestiona las costumbres que ayudaste a construir',
  'tu nombre abre una puerta, pero también desplaza a otra persona',
  'el partido más importante coincide con una fecha decisiva para tu hogar',
  'la oportunidad existe solo porque alguien más acaba de quedar fuera',
]

const stakes = [
  'Tu respuesta puede cambiar la manera en que te ve tu familia.',
  'Lo que hagas quedará en la memoria del barrio durante años.',
  'El vestuario observará si tus palabras coinciden con tus actos.',
  'Nadie puede garantizar que la oportunidad vuelva a aparecer.',
  'La decisión afectará tanto tu progreso como una relación importante.',
  'Hay una salida segura, pero su costo solo se notará con el tiempo.',
  'El resultado deportivo importa menos que la confianza que está en juego.',
  'Elegir pronto ayuda al club; esperar protege tu futuro.',
  'La prensa conocerá una parte, pero no las razones completas.',
  'Esta vez, el talento no basta para resolver el problema.',
]

const titleA = ['La deuda', 'El último bus', 'La llamada', 'Los guayos', 'La lista', 'El vendaje', 'La promesa', 'El silencio', 'La puerta', 'El dorsal', 'La prueba', 'El regreso', 'La banca', 'La firma', 'El rumor', 'La cancha', 'La visita', 'El relevo', 'La distancia', 'El retrato', 'La tregua', 'El pasillo', 'La noche', 'El mensaje', 'La llave']
const titleB = ['que nadie vio', 'antes del amanecer', 'del otro vestuario', 'prestados', 'sin tu nombre', 'bajo la media', 'del domingo', 'en el autobús', 'entreabierta', 'sin dueño', 'bajo la lluvia', 'sin aplausos', 'más larga', 'a lápiz', 'de la grada', 'sin luces', 'inesperada', 'del capitán', 'hasta casa', 'en la pared', 'del viejo rival', 'de las decisiones', 'antes del partido', 'que llegó tarde', 'del barrio']
const titleQualifiers = ['junto a la familia', 'lejos de casa', 'cuando cambió el vestuario', 'que volvió años después']

const categoriesByStage: Record<string, string[]> = {
  childhood: ['familia', 'escuela', 'barrio', 'economía', 'amistad', 'torneo local', 'transporte', 'primer entrenador'],
  academy: ['academia', 'estudios', 'beca', 'disciplina', 'nutrición', 'competencia', 'familia', 'torneo juvenil'],
  debut: ['contrato', 'vestuario', 'primer sueldo', 'prensa', 'representante', 'titularidad', 'préstamo', 'afición'],
  consolidation: ['transferencia', 'renovación', 'selección', 'táctica', 'lesión', 'directiva', 'adaptación', 'rivalidad'],
  prime: ['final', 'capitanía', 'fama', 'patrocinio', 'selección', 'lealtad', 'vestuario', 'premio'],
  veteran: ['liderazgo', 'familia', 'lesión crónica', 'mentor', 'renovación', 'finanzas', 'selección', 'adaptación'],
  'final-years': ['regreso', 'legado', 'rol secundario', 'retiro', 'récord', 'familia', 'dorsal', 'último contrato'],
  retirement: ['epílogo', 'comunidad', 'academia', 'homenaje', 'familia', 'futuro', 'legado', 'despedida'],
}

const rarityNames = ['common', 'uncommon', 'rare', 'legendary'] as const
const riskLabels = ['Riesgo bajo', 'Riesgo moderado', 'Riesgo alto', 'Resultado impredecible'] as const
const statPaths = ['discipline', 'confidence', 'resilience', 'reputation', 'family', 'community', 'finances', 'technique', 'fitness', 'talent'] as const

type SceneContext = { title: string; char: string; place: string; conflict: string; stake: string; stage: string }
const sceneTemplates: Array<(context: SceneContext) => string> = [
  ({ place, char, conflict, stake, title }) => `${char} te espera en ${place} cuando el resto ya se ha marchado. Explica que ${conflict}. ${stake} Desde esa noche, todos recuerdan el episodio como “${title}”.`,
  ({ place, char, conflict, stake, title }) => `La noticia llega durante una jornada en ${place}: ${conflict}. ${char} conoce una salida, pero necesita saber qué estás dispuesto a ceder. ${stake} Así comienza “${title}”.`,
  ({ place, char, conflict, stake, title }) => `Nadie pensaba hablar del asunto en ${place}, hasta que ${char} rompe el silencio: ${conflict}. ${stake} La conversación que sigue convierte “${title}” en algo más importante que el resultado del fin de semana.`,
  ({ place, char, conflict, stake, title }) => `Al terminar la sesión en ${place}, encuentras a ${char} con una propuesta inesperada. El problema es que ${conflict}. ${stake} Tu respuesta dará sentido al recuerdo de “${title}”.`,
  ({ place, char, conflict, stake, title }) => `La rutina cambia al llegar a ${place}. Allí descubres junto a ${char} que ${conflict}. ${stake} Nadie levanta la voz, pero “${title}” puede dividir el antes y el después de esta temporada.`,
  ({ place, char, conflict, stake, title }) => `Una nota breve te cita en ${place}. ${char} va directo al asunto: ${conflict}. ${stake} Hay pocos minutos para decidir cómo quieres que termine “${title}”.`,
  ({ place, char, conflict, stake, title }) => `El entrenamiento debía ser normal en ${place}, pero ${char} pide detenerlo. Cuenta delante de todos que ${conflict}. ${stake} De pronto, “${title}” deja de ser un problema privado.`,
  ({ place, char, conflict, stake, title }) => `De camino a ${place}, ${char} admite que lleva semanas ocultando algo: ${conflict}. ${stake} El episodio, que luego llamarán “${title}”, exige una respuesta antes de llegar.`,
  ({ place, char, conflict, stake, title }) => `La puerta de ${place} está a punto de cerrarse cuando aparece ${char}. Te advierte que ${conflict}. ${stake} Aceptar esa realidad será el primer paso de “${title}”.`,
  ({ place, char, conflict, stake, title, stage }) => `En plena etapa de ${stage.toLowerCase()}, ${place} se convierte en escenario de una decisión incómoda. ${char} confirma que ${conflict}. ${stake} Todo queda suspendido alrededor de “${title}”.`,
]

const choiceFrames = [
  { aId: 'escuchar', a: (c: SceneContext) => `Escuchar a ${c.char} y acordar una salida para “${c.title}”`, aHint: 'Conserva la confianza, aunque cedes parte del control.', aResult: (c: SceneContext) => `En ${c.place}, la conversación encuentra un acuerdo imperfecto. ${c.char} recuerda que escuchaste antes de imponer tu respuesta; el costo llega pronto, pero la confianza sobrevive a “${c.title}”.`, bId: 'decidir', b: (c: SceneContext) => `Resolver “${c.title}” por tu cuenta antes de que cierre la oportunidad`, bHint: 'Ganas velocidad y autonomía; una relación queda bajo presión.', bResult: (c: SceneContext) => `Actúas antes de que alguien pueda detenerte. La oportunidad sigue viva, pero ${c.char} se entera después y el silencio en ${c.place} pesa más que el resultado inmediato.` },
  { aId: 'pedir-ayuda', a: (c: SceneContext) => `Contar lo ocurrido en “${c.title}” y pedir ayuda a la comunidad`, aHint: 'Reparte la carga, pero hace público un problema personal.', aResult: (c: SceneContext) => `La ayuda aparece de lugares inesperados. En ${c.place} varias personas aportan poco y juntas cambian el desenlace; ahora también sienten que tu historia les pertenece.`, bId: 'asumir-costo', b: (c: SceneContext) => `Asumir a solas el costo de “${c.title}”`, bHint: 'Protege la intimidad y demuestra autonomía, a cambio de energía.', bResult: (c: SceneContext) => `Resuelves lo urgente sin explicar cómo. ${c.char} admira tu determinación, aunque nota el cansancio que intentas esconder después de salir de ${c.place}.` },
  { aId: 'ser-honesto', a: (c: SceneContext) => `Decir toda la verdad sobre “${c.title}”, incluso si pierdes el lugar`, aHint: 'La transparencia protege tu futuro; la ocasión puede pasar.', aResult: (c: SceneContext) => `La reacción en ${c.place} es más fría de lo que esperabas, pero ${c.char} deja constancia de tu honestidad. La puerta no queda abierta del todo ni termina de cerrarse.`, bId: 'competir', b: (c: SceneContext) => `Guardar el problema y competir mientras “${c.title}” siga siendo posible`, bHint: 'Mantiene viva la ocasión, con un riesgo físico y emocional mayor.', bResult: (c: SceneContext) => `Nadie descubre lo que callaste y consigues estar presente. Sin embargo, al salir de ${c.place}, sabes que la decisión volverá a medirse cuando el cuerpo o la memoria pasen factura.` },
  { aId: 'respaldar', a: (c: SceneContext) => `Respaldar públicamente a ${c.char} durante “${c.title}”`, aHint: 'Fortalece una alianza y te expone ante quienes mandan.', aResult: (c: SceneContext) => `Tu voz cambia la reunión en ${c.place}. No todos están de acuerdo, pero ${c.char} deja de estar a solas y la relación adquiere una deuda nueva.`, bId: 'mantenerse-aparte', b: (c: SceneContext) => `Mantenerte al margen durante “${c.title}” y concentrarte en tu propio lugar`, bHint: 'Protege tus minutos; el vestuario puede leerlo como distancia.', bResult: (c: SceneContext) => `La discusión continúa sin ti. Conservas tu posición, aunque la próxima vez que cruzas a ${c.char} en ${c.place} queda claro que tu ausencia también fue una decisión.` },
  { aId: 'esperar', a: (c: SceneContext) => `Pedir tiempo para revisar “${c.title}” con la familia`, aHint: 'Reduce decisiones impulsivas, pero la oferta puede cambiar.', aResult: (c: SceneContext) => `La espera permite ver una condición que nadie había explicado. La propuesta pierde brillo, pero la conversación familiar evita que ${c.place} se convierta en un punto sin regreso.`, bId: 'aceptar', b: (c: SceneContext) => `Aceptar ahora y convertir “${c.title}” en una apuesta personal`, bHint: 'Asegura la oportunidad y aumenta el costo de adaptación.', bResult: (c: SceneContext) => `Das tu palabra antes de salir de ${c.place}. ${c.char} celebra la valentía, mientras tú entiendes que la parte difícil empieza cuando se apagan las felicitaciones.` },
  { aId: 'hablar-privado', a: (c: SceneContext) => `Resolver “${c.title}” en privado con ${c.char}`, aHint: 'Evita el ruido externo; otras personas no conocerán tu versión.', aResult: (c: SceneContext) => `La charla privada baja la tensión. No hay disculpas perfectas, pero ambos salen de ${c.place} con una versión compartida y el compromiso de sostenerla.`, bId: 'hacer-publico', b: (c: SceneContext) => `Contar tu versión de “${c.title}” antes de que otros la definan`, bHint: 'Recupera la narrativa y alimenta la atención pública.', bResult: (c: SceneContext) => `Tu mensaje cambia la conversación alrededor de ${c.place}. La afición entiende tus razones; ${c.char}, en cambio, lamenta haber conocido tu respuesta al mismo tiempo que todos.` },
  { aId: 'seguir-plan', a: (c: SceneContext) => `Seguir el plan acordado para atravesar “${c.title}”`, aHint: 'Construye disciplina y limita tu capacidad de improvisar.', aResult: (c: SceneContext) => `Cumples cada paso aunque el partido pida otra cosa. En ${c.place}, ${c.char} valora tu disciplina y anota también que renunciaste a una ocasión de cambiar el ritmo.`, bId: 'improvisar', b: (c: SceneContext) => `Cambiar el plan en el momento decisivo de “${c.title}”`, bHint: 'Puede mostrar creatividad o romper la confianza táctica.', bResult: (c: SceneContext) => `La improvisación sorprende a todos en ${c.place}. Abre un instante de ventaja, pero la mirada de ${c.char} deja la evaluación pendiente para después.` },
  { aId: 'ceder', a: (c: SceneContext) => `Ceder protagonismo para que el grupo resuelva “${c.title}”`, aHint: 'Refuerza al equipo y reduce tu visibilidad individual.', aResult: (c: SceneContext) => `Otra persona toma el centro de la escena y responde bien. Tu gesto pasa casi inadvertido fuera de ${c.place}, aunque ${c.char} entiende exactamente lo que entregaste.`, bId: 'liderar', b: (c: SceneContext) => `Ponerte al frente y cargar con el desenlace de “${c.title}”`, bHint: 'Aumenta tu influencia y hace tuyo cualquier fracaso.', bResult: (c: SceneContext) => `Das el primer paso y el grupo te sigue. Al terminar en ${c.place}, nadie duda de quién tomó la responsabilidad; el resultado futuro llevará tu nombre.` },
]

let globalIndex = 0
let chainOrdinal = 0
let specialRareOrdinal = 0
const inventory: unknown[] = []

for (const stage of stages) {
  const stageEvents = []
  for (let index = 0; index < stage.count; index += 1) {
    const rarityIndex = index < stage.rarity[0] ? 0 : index < stage.rarity[0] + stage.rarity[1] ? 1 : index < stage.rarity[0] + stage.rarity[1] + stage.rarity[2] ? 2 : 3
    const char = characters[(globalIndex * 7 + index) % characters.length]
    const place = places[(globalIndex * 11 + index * 3) % places.length]
    const conflict = conflicts[(globalIndex * 13 + index * 5) % conflicts.length]
    const stake = stakes[(globalIndex + index * 3) % stakes.length]
    const category = categoriesByStage[stage.id][index % categoriesByStage[stage.id].length]
    const ageSpan = stage.max - stage.min + 1
    const ageMin = stage.min + (index % ageSpan)
    const chained = globalIndex % 4 === 0 && chainOrdinal < 120
    const chainId = chained ? `cadena-${String(Math.floor(chainOrdinal / 6) + 1).padStart(2, '0')}` : undefined
    if (chained) chainOrdinal += 1
    const id = `${stage.id}-${String(index + 1).padStart(3, '0')}`
    const title = `${titleA[(globalIndex + index) % titleA.length]} ${titleB[(globalIndex * 3 + index) % titleB.length]} ${titleQualifiers[Math.floor(index / 25)]} — ${stage.label}`
    const specialRare = !chained && stage.id !== 'retirement' && globalIndex % 10 === 1 && specialRareOrdinal < 35
    if (specialRare) specialRareOrdinal += 1
    const narrativeTag = stage.id === 'retirement' ? 'retirement' : chained ? 'narrative-chain' : specialRare ? 'special-rare' : 'independent'
    const firstStat = statPaths[(globalIndex + index) % statPaths.length]
    const secondStat = statPaths[(globalIndex + index + 3) % statPaths.length]
    const thirdStat = statPaths[(globalIndex + index + 6) % statPaths.length]
    const context = { title, char, place, conflict, stake, stage: stage.label }
    const choiceFrame = choiceFrames[globalIndex % choiceFrames.length]
    const event = {
      id,
      title,
      description: sceneTemplates[globalIndex % sceneTemplates.length](context),
      stage: stage.id,
      category,
      tags: [category, stage.id, narrativeTag],
      rarity: rarityNames[rarityIndex],
      ageMin,
      ageMax: stage.max,
      baseWeight: [10, 6, 3, 1][rarityIndex],
      oncePerCareer: true,
      ...(chainId ? { chainId } : {}),
      choices: [
        {
          id: choiceFrame.aId,
          text: choiceFrame.a(context),
          riskLabel: riskLabels[(globalIndex + 1) % riskLabels.length],
          visibleHint: choiceFrame.aHint,
          effects: [{ path: firstStat, operation: 'add', value: 3 }, { path: secondStat, operation: 'add', value: -1 }],
          result: choiceFrame.aResult(context),
          flagsToAdd: [`${id}-${choiceFrame.aId}`],
        },
        {
          id: choiceFrame.bId,
          text: choiceFrame.b(context),
          riskLabel: riskLabels[(globalIndex + 2) % riskLabels.length],
          visibleHint: choiceFrame.bHint,
          effects: [{ path: thirdStat, operation: 'add', value: 4 }, { path: firstStat, operation: 'add', value: -2 }],
          result: choiceFrame.bResult(context),
          flagsToAdd: [`${id}-${choiceFrame.bId}`],
        },
      ],
    }
    stageEvents.push(event)
    inventory.push({ id, stage: stage.id, category, age: `${ageMin}-${stage.max}`, rarity: event.rarity, chainId: chainId ?? null, origin: globalIndex % 6 === 0 ? 'variable' : null, summary: conflict, validation: 'valid' })
    globalIndex += 1
  }

  for (let batch = 0; batch < stageEvents.length; batch += 25) {
    const number = Math.floor(batch / 25) + 1
    const path = join(root, 'src', 'content', 'events', stage.id, `${stage.id}-${String(number).padStart(2, '0')}.yaml`)
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, YAML.stringify({ events: stageEvents.slice(batch, batch + 25) }, { lineWidth: 0 }), 'utf8')
  }
}

await writeFile(join(root, 'src', 'content', 'inventory.json'), JSON.stringify(inventory, null, 2), 'utf8')
console.log(`Contenido generado: ${globalIndex} eventos, ${chainOrdinal} encadenados y ${specialRareOrdinal} especiales.`)
