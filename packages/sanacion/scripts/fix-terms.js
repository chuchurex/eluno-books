import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Step 1: Find all {term:...} in all chapter JSONs and normalize keys
const termRegex = /\{term:([^}]+)\}/g;

function normalizeKey(raw) {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''); // remove / and other chars
}

// Collect all unique terms and their normalized keys
const allTerms = new Map(); // normalizedKey -> Set of raw forms

for (const lang of ['en', 'es']) {
  const dir = path.join(root, 'i18n', lang, 'chapters');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let match;
    while ((match = termRegex.exec(content)) !== null) {
      const raw = match[1];
      const key = normalizeKey(raw);
      if (!allTerms.has(key)) allTerms.set(key, new Set());
      allTerms.get(key).add(raw);
    }
  }
}

console.log(`Found ${allTerms.size} unique normalized term keys\n`);

// Step 2: Replace all {term:raw} with {term:normalizedKey} in chapter JSONs
let totalReplacements = 0;
for (const lang of ['en', 'es']) {
  const dir = path.join(root, 'i18n', lang, 'chapters');
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let count = 0;
    const newContent = content.replace(termRegex, (full, raw) => {
      const key = normalizeKey(raw);
      if (raw !== key) {
        count++;
        return `{term:${key}}`;
      }
      return full;
    });
    if (count > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      totalReplacements += count;
      console.log(`  ${lang}/${file}: fixed ${count} term keys`);
    }
  }
}
console.log(`\nTotal replacements: ${totalReplacements}\n`);

// Step 3: Load existing glossaries
const enGlossary = JSON.parse(fs.readFileSync(path.join(root, 'i18n/en/glossary.json'), 'utf8'));
const esGlossary = JSON.parse(fs.readFileSync(path.join(root, 'i18n/es/glossary.json'), 'utf8'));

// Step 4: Find missing terms
const missingTerms = [];
for (const [key] of allTerms) {
  if (!enGlossary[key]) {
    missingTerms.push(key);
  }
}

console.log(`Existing glossary terms: ${Object.keys(enGlossary).length}`);
console.log(`Missing terms to add: ${missingTerms.length}`);
console.log('\nMissing terms:');
missingTerms.sort().forEach(t => console.log(`  - ${t}`));

// Step 5: Generate glossary entries for missing terms
const termDefinitions = {
  // These are based on the Ra Material / Law of One terminology
  'acceptance': {
    en: { title: 'Acceptance', definition: 'The embrace of all experience without resistance or judgment. A key component of spiritual growth and healing.' },
    es: { title: 'Aceptación', definition: 'El abrazo de toda experiencia sin resistencia ni juicio. Un componente clave del crecimiento espiritual y la sanación.' }
  },
  'adept': {
    en: { title: 'Adept', definition: 'One who has progressed significantly along the spiritual path, capable of working with intelligent energy consciously and with discipline.' },
    es: { title: 'Adepto', definition: 'Quien ha progresado significativamente en el camino espiritual, capaz de trabajar con la energía inteligente de manera consciente y disciplinada.' }
  },
  'archetypical-mind': {
    en: { title: 'Archetypical Mind', definition: 'The deep structure of consciousness containing the fundamental patterns and archetypes that shape experience in third density.' },
    es: { title: 'Mente Arquetípica', definition: 'La estructura profunda de la conciencia que contiene los patrones y arquetipos fundamentales que dan forma a la experiencia en tercera densidad.' }
  },
  'balance': {
    en: { title: 'Balance', definition: 'The harmonious integration of all aspects of being. The state in which opposing forces are held in dynamic equilibrium.' },
    es: { title: 'Equilibrio', definition: 'La integración armoniosa de todos los aspectos del ser. El estado en el cual las fuerzas opuestas se mantienen en equilibrio dinámico.' }
  },
  'balancing': {
    en: { title: 'Balancing', definition: 'The practice of accepting and integrating both positive and negative experiences and emotions, allowing energy to flow freely through all centers.' },
    es: { title: 'Equilibrado', definition: 'La práctica de aceptar e integrar experiencias y emociones tanto positivas como negativas, permitiendo que la energía fluya libremente a través de todos los centros.' }
  },
  'blockage': {
    en: { title: 'Blockage', definition: 'An obstruction in the flow of energy through the energy centers, typically caused by unresolved emotional, mental, or spiritual issues.' },
    es: { title: 'Bloqueo', definition: 'Una obstrucción en el flujo de energía a través de los centros energéticos, típicamente causada por asuntos emocionales, mentales o espirituales sin resolver.' }
  },
  'blue-ray': {
    en: { title: 'Blue Ray', definition: 'The fifth energy center, associated with communication, honest expression, and the ability to share one\'s inner truth with others.' },
    es: { title: 'Rayo Azul', definition: 'El quinto centro energético, asociado con la comunicación, la expresión honesta y la capacidad de compartir la verdad interior con otros.' }
  },
  'buddha-body': {
    en: { title: 'Buddha Body', definition: 'The fully activated and balanced energy body, representing the state of complete spiritual realization and wholeness.' },
    es: { title: 'Cuerpo Búdico', definition: 'El cuerpo energético completamente activado y equilibrado, que representa el estado de realización espiritual completa y plenitud.' }
  },
  'chakra': {
    en: { title: 'Chakra', definition: 'An energy center within the subtle body. Seven primary chakras align along the spine, each governing specific aspects of physical, emotional, and spiritual experience.' },
    es: { title: 'Chakra', definition: 'Un centro energético dentro del cuerpo sutil. Siete chakras principales se alinean a lo largo de la columna vertebral, cada uno gobernando aspectos específicos de la experiencia física, emocional y espiritual.' }
  },
  'conscious-mind': {
    en: { title: 'Conscious Mind', definition: 'The surface layer of awareness that processes daily experience. In healing, it must learn to cooperate with the deeper layers of mind.' },
    es: { title: 'Mente Consciente', definition: 'La capa superficial de conciencia que procesa la experiencia diaria. En la sanación, debe aprender a cooperar con las capas más profundas de la mente.' }
  },
  'contemplation': {
    en: { title: 'Contemplation', definition: 'A practice of deep, sustained reflection on spiritual truths, allowing understanding to move from the intellectual to the experiential level.' },
    es: { title: 'Contemplación', definition: 'Una práctica de reflexión profunda y sostenida sobre verdades espirituales, permitiendo que la comprensión pase del nivel intelectual al experiencial.' }
  },
  'crystallized': {
    en: { title: 'Crystallized', definition: 'A state of refined spiritual clarity in which one\'s energy patterns have become stable, coherent, and capable of channeling intelligent energy.' },
    es: { title: 'Cristalizado', definition: 'Un estado de claridad espiritual refinada en el cual los patrones energéticos se han vuelto estables, coherentes y capaces de canalizar energía inteligente.' }
  },
  'crystallized-entity': {
    en: { title: 'Crystallized Entity', definition: 'A being whose energy body has achieved a high degree of crystallization, enabling it to serve as a clear channel for healing and spiritual work.' },
    es: { title: 'Entidad Cristalizada', definition: 'Un ser cuyo cuerpo energético ha alcanzado un alto grado de cristalización, permitiéndole servir como canal claro para la sanación y el trabajo espiritual.' }
  },
  'deep-mind': {
    en: { title: 'Deep Mind', definition: 'The vast, largely unconscious reservoir of wisdom, memory, and archetypal patterns that lies beneath ordinary awareness.' },
    es: { title: 'Mente Profunda', definition: 'El vasto reservorio, en gran parte inconsciente, de sabiduría, memoria y patrones arquetípicos que yace bajo la conciencia ordinaria.' }
  },
  'density': {
    en: { title: 'Density', definition: 'A level or dimension of consciousness evolution. Third density is the current human experience, characterized by the choice between service to others and service to self.' },
    es: { title: 'Densidad', definition: 'Un nivel o dimensión de evolución de la conciencia. La tercera densidad es la experiencia humana actual, caracterizada por la elección entre servicio a otros y servicio al yo.' }
  },
  'distortion': {
    en: { title: 'Distortion', definition: 'Any departure from undifferentiated unity. Not necessarily negative — all of creation is a distortion of the One Infinite Creator, including free will and love.' },
    es: { title: 'Distorsión', definition: 'Cualquier desviación de la unidad indiferenciada. No necesariamente negativa — toda la creación es una distorsión del Creador Infinito Único, incluyendo el libre albedrío y el amor.' }
  },
  'elitism': {
    en: { title: 'Elitism', definition: 'The spiritual pitfall of believing oneself superior due to advanced abilities or knowledge. A distortion that blocks the green-ray energy center.' },
    es: { title: 'Elitismo', definition: 'La trampa espiritual de creerse superior debido a habilidades o conocimientos avanzados. Una distorsión que bloquea el centro energético del rayo verde.' }
  },
  'energy-center': {
    en: { title: 'Energy Center', definition: 'A point in the energy body where spiritual, emotional, and physical energies converge. These centers process and distribute life force throughout the being.' },
    es: { title: 'Centro Energético', definition: 'Un punto en el cuerpo energético donde convergen las energías espirituales, emocionales y físicas. Estos centros procesan y distribuyen la fuerza vital a través del ser.' }
  },
  'experience': {
    en: { title: 'Experience', definition: 'The archetype of the active principle in consciousness, representing the dynamic process by which catalyst is processed and transformed into wisdom.' },
    es: { title: 'Experiencia', definition: 'El arquetipo del principio activo en la conciencia, que representa el proceso dinámico por el cual el catalizador se procesa y transforma en sabiduría.' }
  },
  'green-ray': {
    en: { title: 'Green Ray', definition: 'The fourth energy center, the heart chakra. Associated with unconditional love, compassion, and the gateway to higher spiritual development.' },
    es: { title: 'Rayo Verde', definition: 'El cuarto centro energético, el chakra del corazón. Asociado con el amor incondicional, la compasión y la puerta hacia el desarrollo espiritual superior.' }
  },
  'harvest': {
    en: { title: 'Harvest', definition: 'The transition point at the end of a density cycle where beings are evaluated for their readiness to progress to the next level of consciousness evolution.' },
    es: { title: 'Cosecha', definition: 'El punto de transición al final de un ciclo de densidad donde los seres son evaluados por su preparación para progresar al siguiente nivel de evolución de la conciencia.' }
  },
  'higher-self': {
    en: { title: 'Higher Self', definition: 'The aspect of one\'s total being that exists at the mid-sixth density level, serving as a guide and resource for the incarnate self.' },
    es: { title: 'Yo Superior', definition: 'El aspecto del ser total que existe en el nivel de la sexta densidad media, sirviendo como guía y recurso para el yo encarnado.' }
  },
  'indigo-ray': {
    en: { title: 'Indigo Ray', definition: 'The sixth energy center, associated with the third eye, intuition, and direct access to intelligent infinity. The gateway to the Creator\'s presence.' },
    es: { title: 'Rayo Índigo', definition: 'El sexto centro energético, asociado con el tercer ojo, la intuición y el acceso directo a la infinidad inteligente. La puerta a la presencia del Creador.' }
  },
  'infinite-creator': {
    en: { title: 'Infinite Creator', definition: 'The One Original Thought, the source of all that exists. The unity from which all creation emerges and to which all returns.' },
    es: { title: 'Creador Infinito', definition: 'El Pensamiento Original Único, la fuente de todo lo que existe. La unidad de la cual emerge toda la creación y a la cual todo retorna.' }
  },
  'initiation': {
    en: { title: 'Initiation', definition: 'A transformative experience or passage that marks a significant advancement in spiritual development and understanding.' },
    es: { title: 'Iniciación', definition: 'Una experiencia o pasaje transformador que marca un avance significativo en el desarrollo y la comprensión espiritual.' }
  },
  'inner-light': {
    en: { title: 'Inner Light', definition: 'The divine spark within each being, the presence of the Creator at the core of every consciousness. The light that enables healing from within.' },
    es: { title: 'Luz Interior', definition: 'La chispa divina dentro de cada ser, la presencia del Creador en el núcleo de toda conciencia. La luz que permite la sanación desde adentro.' }
  },
  'intelligent-energy': {
    en: { title: 'Intelligent Energy', definition: 'The creative force of the universe, the energy through which the Infinite Creator manifests all things. The dynamic aspect of intelligent infinity.' },
    es: { title: 'Energía Inteligente', definition: 'La fuerza creativa del universo, la energía a través de la cual el Creador Infinito manifiesta todas las cosas. El aspecto dinámico de la infinidad inteligente.' }
  },
  'intelligent-infinity': {
    en: { title: 'Intelligent Infinity', definition: 'The undifferentiated, absolute unity from which all creation arises. The state of infinite potential that precedes all manifestation.' },
    es: { title: 'Infinidad Inteligente', definition: 'La unidad indiferenciada y absoluta de la cual surge toda la creación. El estado de potencial infinito que precede a toda manifestación.' }
  },
  'intuition': {
    en: { title: 'Intuition', definition: 'Direct knowing that bypasses the analytical mind, arising from deeper levels of consciousness. A faculty that strengthens with spiritual practice.' },
    es: { title: 'Intuición', definition: 'Conocimiento directo que sobrepasa la mente analítica, surgiendo de niveles más profundos de conciencia. Una facultad que se fortalece con la práctica espiritual.' }
  },
  'light': {
    en: { title: 'Light', definition: 'The manifestation of intelligent energy in its most fundamental form. Both the medium and instrument of the Creator\'s creative power.' },
    es: { title: 'Luz', definition: 'La manifestación de la energía inteligente en su forma más fundamental. Tanto el medio como el instrumento del poder creativo del Creador.' }
  },
  'magical-personality': {
    en: { title: 'Magical Personality', definition: 'The higher self\'s direct expression through the incarnate being, accessed through disciplined spiritual practice and invocation.' },
    es: { title: 'Personalidad Mágica', definition: 'La expresión directa del yo superior a través del ser encarnado, accedida a través de la práctica espiritual disciplinada y la invocación.' }
  },
  'magical-working': {
    en: { title: 'Magical Working', definition: 'Conscious, intentional spiritual work that draws upon intelligent energy to create change in accordance with the will aligned with divine purpose.' },
    es: { title: 'Trabajo Mágico', definition: 'Trabajo espiritual consciente e intencional que recurre a la energía inteligente para crear cambio en concordancia con la voluntad alineada con el propósito divino.' }
  },
  'mind-complex': {
    en: { title: 'Mind Complex', definition: 'The totality of the mental aspect of a being, including conscious, subconscious, and superconscious layers of awareness.' },
    es: { title: 'Complejo Mental', definition: 'La totalidad del aspecto mental de un ser, incluyendo las capas consciente, subconsciente y superconsciente de la conciencia.' }
  },
  'mindbodyspirit-complex': {
    en: { title: 'Mind/Body/Spirit Complex', definition: 'The complete being as understood in spiritual terms — the integration of mental, physical, and spiritual aspects that together form the incarnate entity.' },
    es: { title: 'Complejo Mente/Cuerpo/Espíritu', definition: 'El ser completo como se entiende en términos espirituales — la integración de los aspectos mental, físico y espiritual que juntos forman la entidad encarnada.' }
  },
  'mindbodyspirit-complex-totality': {
    en: { title: 'Mind/Body/Spirit Complex Totality', definition: 'The complete self across all timelines, densities, and incarnations — the full expression of the soul\'s journey through creation.' },
    es: { title: 'Totalidad del Complejo Mente/Cuerpo/Espíritu', definition: 'El yo completo a través de todas las líneas temporales, densidades y encarnaciones — la expresión plena del viaje del alma a través de la creación.' }
  },
  'orange-ray': {
    en: { title: 'Orange Ray', definition: 'The second energy center, governing personal identity, individual expression, and one-to-one relationships.' },
    es: { title: 'Rayo Naranja', definition: 'El segundo centro energético, que gobierna la identidad personal, la expresión individual y las relaciones de uno a uno.' }
  },
  'pre-incarnative-programming': {
    en: { title: 'Pre-Incarnative Programming', definition: 'The lessons, relationships, and experiences chosen by the soul before incarnation as opportunities for growth and service.' },
    es: { title: 'Programación Pre-Encarnativa', definition: 'Las lecciones, relaciones y experiencias elegidas por el alma antes de la encarnación como oportunidades de crecimiento y servicio.' }
  },
  'pyramid': {
    en: { title: 'Pyramid', definition: 'A geometric form that concentrates and focuses spiritual energy. Used historically as a tool for healing and initiation.' },
    es: { title: 'Pirámide', definition: 'Una forma geométrica que concentra y enfoca la energía espiritual. Utilizada históricamente como herramienta para la sanación e iniciación.' }
  },
  'red-ray': {
    en: { title: 'Red Ray', definition: 'The first energy center, the foundation of the energy body. Associated with survival, physicality, and the basic life force.' },
    es: { title: 'Rayo Rojo', definition: 'El primer centro energético, el fundamento del cuerpo energético. Asociado con la supervivencia, la fisicalidad y la fuerza vital básica.' }
  },
  'spirit-complex': {
    en: { title: 'Spirit Complex', definition: 'The spiritual aspect of a being that connects it to the infinite and eternal. The channel through which divine energy enters the incarnate experience.' },
    es: { title: 'Complejo Espiritual', definition: 'El aspecto espiritual de un ser que lo conecta con lo infinito y eterno. El canal a través del cual la energía divina entra en la experiencia encarnada.' }
  },
  'subconscious': {
    en: { title: 'Subconscious', definition: 'The deeper layers of mind that store memories, process catalyst, and connect with the archetypical mind. A vast resource for healing and self-knowledge.' },
    es: { title: 'Subconsciente', definition: 'Las capas más profundas de la mente que almacenan memorias, procesan catalizador y conectan con la mente arquetípica. Un vasto recurso para la sanación y el autoconocimiento.' }
  },
  'unforgiveness': {
    en: { title: 'Unforgiveness', definition: 'The holding of resentment and grievance that blocks the flow of healing energy, particularly through the green-ray center.' },
    es: { title: 'Imperdonabilidad', definition: 'El aferrarse al resentimiento y al agravio que bloquea el flujo de energía sanadora, particularmente a través del centro del rayo verde.' }
  },
  'veil': {
    en: { title: 'Veil', definition: 'The forgetting that occurs at incarnation, separating conscious awareness from full knowledge of one\'s spiritual nature and pre-incarnative choices.' },
    es: { title: 'Velo', definition: 'El olvido que ocurre en la encarnación, separando la conciencia despierta del conocimiento pleno de la propia naturaleza espiritual y elecciones pre-encarnativas.' }
  },
  'violet-ray': {
    en: { title: 'Violet Ray', definition: 'The seventh energy center, the crown chakra. Represents the totality of the being and its relationship with the Infinite Creator.' },
    es: { title: 'Rayo Violeta', definition: 'El séptimo centro energético, el chakra de la corona. Representa la totalidad del ser y su relación con el Creador Infinito.' }
  },
  'visualization': {
    en: { title: 'Visualization', definition: 'The disciplined use of mental imagery as a spiritual tool for healing, transformation, and accessing deeper states of consciousness.' },
    es: { title: 'Visualización', definition: 'El uso disciplinado de la imaginería mental como herramienta espiritual para la sanación, transformación y acceso a estados más profundos de conciencia.' }
  },
  'wanderer': {
    en: { title: 'Wanderer', definition: 'A being from a higher density who has chosen to incarnate in third density to serve others, often at the cost of forgetting their true nature.' },
    es: { title: 'Errante', definition: 'Un ser de una densidad superior que ha elegido encarnar en tercera densidad para servir a otros, a menudo al costo de olvidar su verdadera naturaleza.' }
  },
  'wholeness': {
    en: { title: 'Wholeness', definition: 'The fundamental state of completeness that is the true nature of every being. Healing is the return to awareness of this inherent wholeness.' },
    es: { title: 'Plenitud', definition: 'El estado fundamental de completitud que es la verdadera naturaleza de todo ser. La sanación es el retorno a la conciencia de esta plenitud inherente.' }
  },
  'yellow-ray': {
    en: { title: 'Yellow Ray', definition: 'The third energy center, associated with social identity, group dynamics, and one\'s relationship with society and institutions.' },
    es: { title: 'Rayo Amarillo', definition: 'El tercer centro energético, asociado con la identidad social, las dinámicas de grupo y la relación con la sociedad e instituciones.' }
  },
};

// Step 6: Add missing terms to glossaries
let addedEN = 0, addedES = 0;
for (const key of missingTerms.sort()) {
  if (termDefinitions[key]) {
    enGlossary[key] = termDefinitions[key].en;
    esGlossary[key] = termDefinitions[key].es;
    addedEN++;
    addedES++;
    console.log(`  ✓ Added: ${key}`);
  } else {
    console.log(`  ✗ No definition for: ${key}`);
  }
}

// Sort glossary keys alphabetically
function sortGlossary(g) {
  const sorted = {};
  for (const k of Object.keys(g).sort()) {
    sorted[k] = g[k];
  }
  return sorted;
}

fs.writeFileSync(
  path.join(root, 'i18n/en/glossary.json'),
  JSON.stringify(sortGlossary(enGlossary), null, 2) + '\n',
  'utf8'
);
fs.writeFileSync(
  path.join(root, 'i18n/es/glossary.json'),
  JSON.stringify(sortGlossary(esGlossary), null, 2) + '\n',
  'utf8'
);

console.log(`\nAdded ${addedEN} terms to EN glossary, ${addedES} to ES glossary`);
console.log(`EN glossary now has ${Object.keys(enGlossary).length} terms`);
console.log(`ES glossary now has ${Object.keys(esGlossary).length} terms`);
