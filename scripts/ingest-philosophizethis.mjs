import { XMLParser } from 'fast-xml-parser';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MEDIA_FILE = path.join(ROOT_DIR, 'data', 'media.json');

const RSS_URL = 'https://philosophizethis.libsyn.com/rss';

// Mapping rules: keywords in title/description -> canonical philosopher IDs
const PHILOSOPHER_MATCHERS = [
  { id: 'thales', patterns: [/\bthales\b/i] },
  { id: 'anaximander', patterns: [/\banaximander\b/i] },
  { id: 'heraclitus', patterns: [/\bheraclitus\b/i] },
  { id: 'parmenides', patterns: [/\bparmenides\b/i] },
  { id: 'democritus', patterns: [/\bdemocritus\b/i, /\batomism\b/i] },
  { id: 'socrates', patterns: [/\bsocrates\b/i, /\bsocratic\b/i] },
  { id: 'plato', patterns: [/\bplato\b/i, /\bplatonism\b/i, /\brepublic\b/i] },
  { id: 'aristotle', patterns: [/\baristotle\b/i, /\baristotelian\b/i, /\bnicomachean\b/i] },
  { id: 'epicurus', patterns: [/\bepicurus\b/i, /\bepicurean\b/i] },
  { id: 'seneca', patterns: [/\bseneca\b/i] },
  { id: 'epictetus', patterns: [/\bepictetus\b/i] },
  { id: 'marcus-aurelius', patterns: [/\bmarcus aurelius\b/i, /\bmeditations\b/i] },
  { id: 'pyrrho', patterns: [/\bpyrrho\b/i, /\bskepticism\b/i] },
  { id: 'plotinus', patterns: [/\bplotinus\b/i, /\bneoplatonism\b/i] },
  { id: 'augustine', patterns: [/\baugustine\b/i] },
  { id: 'avicenna', patterns: [/\bavicenna\b/i, /\bibn sina\b/i] },
  { id: 'averroes', patterns: [/\baverroes\b/i, /\bibn rushd\b/i] },
  { id: 'thomas-aquinas', patterns: [/\baquinas\b/i, /\bthomas aquinas\b/i] },
  { id: 'william-of-ockham', patterns: [/\bockham\b/i, /\bockham's razor\b/i] },
  { id: 'machiavelli', patterns: [/\bmachiavelli\b/i, /\bthe prince\b/i] },
  { id: 'francis-bacon', patterns: [/\bfrancis bacon\b/i] },
  { id: 'thomas-hobbes', patterns: [/\bhobbes\b/i, /\bleviathan\b/i] },
  { id: 'rene-descartes', patterns: [/\bdescartes\b/i, /\bcartesian\b/i] },
  { id: 'baruch-spinoza', patterns: [/\bspinoza\b/i] },
  { id: 'gottfried-leibniz', patterns: [/\bleibniz\b/i, /\bmonad\b/i] },
  { id: 'john-locke', patterns: [/\blocke\b/i, /\btabula rasa\b/i] },
  { id: 'george-berkeley', patterns: [/\bberkeley\b/i, /\bimmaterialism\b/i] },
  { id: 'david-hume', patterns: [/\bhume\b/i] },
  { id: 'adam-smith', patterns: [/\badam smith\b/i, /\bwealth of nations\b/i] },
  { id: 'jean-jacques-rousseau', patterns: [/\brousseau\b/i, /\bsocial contract\b/i] },
  { id: 'voltaire', patterns: [/\bvoltaire\b/i] },
  { id: 'immanuel-kant', patterns: [/\bkant\b/i, /\bkantian\b/i, /\bcategorical imperative\b/i] },
  { id: 'gwf-hegel', patterns: [/\bhegel\b/i, /\bhegelian\b/i, /\bdialectic\b/i] },
  { id: 'arthur-schopenhauer', patterns: [/\bschopenhauer\b/i] },
  { id: 'soren-kierkegaard', patterns: [/\bkierkegaard\b/i] },
  { id: 'karl-marx', patterns: [/\bmarx\b/i, /\bmarxism\b/i, /\bcommunist manifesto\b/i] },
  { id: 'friedrich-nietzsche', patterns: [/\bnietzsche\b/i, /\bzarat\b/i, /\bwill to power\b/i] },
  { id: 'john-stuart-mill', patterns: [/\butilitarianism\b/i, /\bjohn stuart mill\b/i, /\bj\.s\. mill\b/i, /\bjeremy bentham\b/i] },
  { id: 'william-james', patterns: [/\bpragmatism\b/i, /\bwilliam james\b/i, /\bcharles sanders peirce\b/i] },
  { id: 'edmund-husserl', patterns: [/\bhusserl\b/i, /\bphenomenology\b/i] },
  { id: 'martin-heidegger', patterns: [/\bheidegger\b/i, /\bdasein\b/i] },
  { id: 'jean-paul-sartre', patterns: [/\bsartre\b/i, /\bexistentialism is a humanism\b/i] },
  { id: 'simone-de-beauvoir', patterns: [/\bbeauvoir\b/i, /\bthe second sex\b/i] },
  { id: 'albert-camus', patterns: [/\bcamus\b/i, /\bsisyphus\b/i, /\bthe myth of sisyphus\b/i] },
  { id: 'ludwig-wittgenstein', patterns: [/\bwittgenstein\b/i, /\btractatus\b/i, /\blanguage game\b/i] },
  { id: 'bertrand-russell', patterns: [/\brussell\b/i, /\bprincipia\b/i] },
  { id: 'karl-popper', patterns: [/\bpopper\b/i, /\bfalsifi\b/i] },
  { id: 'ferdinand-de-saussure', patterns: [/\bsaussure\b/i, /\bsemiotics\b/i, /\bstructuralism\b/i] },
  { id: 'theodor-adorno', patterns: [/\badorno\b/i, /\bfrankfurt school\b/i] },
  { id: 'max-horkheimer', patterns: [/\bhorkheimer\b/i, /\beclipse of reason\b/i, /\bdialectic of enlightenment\b/i] },
  { id: 'michel-foucault', patterns: [/\bfoucault\b/i, /\bpanopticon\b/i, /\bdiscipline and punish\b/i] },
  { id: 'jacques-derrida', patterns: [/\bderrida\b/i, /\bdeconstruction\b/i] },
  { id: 'gilles-deleuze', patterns: [/\bdeleuze\b/i, /\brhizome\b/i] },
  { id: 'hannah-arendt', patterns: [/\barendt\b/i, /\bbanality of evil\b/i] },
  { id: 'john-rawls', patterns: [/\brawls\b/i, /\bveil of ignorance\b/i] },
  { id: 'byung-chul-han', patterns: [/\bbyung-chul han\b/i, /\bbyung chul han\b/i, /\bburnout society\b/i] },
  { id: 'jean-baudrillard', patterns: [/\bbaudrillard\b/i, /\bsimulacr\b/i, /\bhyperreal\b/i] },
  { id: 'nick-bostrom', patterns: [/\bbostrom\b/i, /\bsimulation argument\b/i] },
  { id: 'zeno-of-elea', patterns: [/\bzeno\b/i, /\bachilles and the tortoise\b/i] },
  { id: 'confucius', patterns: [/\bconfucius\b/i, /\bconfucianism\b/i, /\bkongzi\b/i, /\banalects\b/i] },
  { id: 'zhuangzi', patterns: [/\bzhuangzi\b/i, /\bchuang tzu\b/i, /\bchuang-tzu\b/i] },
  { id: 'anselm-of-canterbury', patterns: [/\banselm\b/i] },
  { id: 'al-ghazali', patterns: [/\bal-ghazali\b/i, /\bal ghazali\b/i, /\bghazali\b/i] },
  { id: 'moses-maimonides', patterns: [/\bmaimonides\b/i, /\bguide for the perplexed\b/i] },
  { id: 'michel-de-montaigne', patterns: [/\bmontaigne\b/i] },
  { id: 'blaise-pascal', patterns: [/\bpascal\b/i, /\bpens[eé]es\b/i] },
  { id: 'johann-gottlieb-fichte', patterns: [/\bfichte\b/i] },
  { id: 'friedrich-schelling', patterns: [/\bschelling\b/i] },
  { id: 'charles-sanders-peirce', patterns: [/\bpeirce\b/i] },
  { id: 'gottlob-frege', patterns: [/\bfrege\b/i] },
  { id: 'maurice-merleau-ponty', patterns: [/\bmerleau-ponty\b/i, /\bmerleau ponty\b/i] },
  { id: 'jurgen-habermas', patterns: [/\bhabermas\b/i] },
  { id: 'emmanuel-levinas', patterns: [/\blevinas\b/i] },
  { id: 'derek-parfit', patterns: [/\bparfit\b/i] },
  { id: 'boethius', patterns: [/\bboethius\b/i, /\bconsolation of philosophy\b/i] },
  { id: 'montesquieu', patterns: [/\bmontesquieu\b/i, /\bspirit of the laws\b/i] },
  { id: 'ludwig-feuerbach', patterns: [/\bfeuerbach\b/i] },
  { id: 'siddhartha-gautama', patterns: [/\bbuddha\b/i, /\bbuddhism\b/i, /\bsiddhartha\b/i] },
  { id: 'nagarjuna', patterns: [/\bnagarjuna\b/i, /\bmadhyamaka\b/i, /\bmiddle way\b/i, /\bsunyata\b/i] },
  { id: 'adi-shankara', patterns: [/\bshankara\b/i, /\badvaita\b/i, /\bvedanta\b/i] }
];

async function ingestRSS() {
  console.log(`Fetching Philosophize This! RSS from ${RSS_URL}...`);
  const response = await fetch(RSS_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PhilosophyGraph/1.0)' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  const data = parser.parse(xmlText);
  const items = data?.rss?.channel?.item || [];

  console.log(`Found ${items.length} episodes in RSS feed.`);

  const mediaItems = [];
  const processedTitles = new Set();

  for (const item of items) {
    const rawTitle = item.title || '';
    if (processedTitles.has(rawTitle)) continue;
    processedTitles.add(rawTitle);

    const epMatch = rawTitle.match(/Episode\s*#?(\d+)/i);
    const episodeNumber = epMatch ? parseInt(epMatch[1], 10) : undefined;
    const cleanTitle = rawTitle.replace(/Episode\s*#?\d+\s*(\.\.\.|\-)?\s*/i, '').trim();

    const audioUrl = item.enclosure?.['@_url'] || '';
    const link = item.link || (audioUrl || '');
    const pubDate = item.pubDate || '';
    
    // Clean description: strip HTML tags
    const rawDesc = item.description || item['itunes:summary'] || '';
    const cleanSummary = rawDesc.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 300);

    const searchContext = `${rawTitle} ${cleanSummary}`;

    // Find matching philosophers
    for (const matcher of PHILOSOPHER_MATCHERS) {
      const isMatch = matcher.patterns.some(p => p.test(searchContext));
      if (isMatch) {
        mediaItems.push({
          id: `pt-ep-${episodeNumber || Math.abs(hashCode(rawTitle))}-${matcher.id}`,
          targetId: matcher.id,
          type: 'podcast',
          title: `Philosophize This! ${rawTitle}`,
          url: link,
          audioUrl: audioUrl,
          creator: 'Stephen West',
          episodeNumber: episodeNumber,
          duration: item['itunes:duration'] ? String(item['itunes:duration']) : undefined,
        });
      }
    }
  }

  console.log(`Mapped ${mediaItems.length} podcast items to philosophers.`);

  // Load existing media file if present to preserve manual curated resources
  let existingMedia = [];
  if (fs.existsSync(MEDIA_FILE)) {
    try {
      const content = fs.readFileSync(MEDIA_FILE, 'utf-8');
      existingMedia = JSON.parse(content);
    } catch {
      existingMedia = [];
    }
  }

  // Filter out older auto-generated podcast items, keep curated books/videos/SEP links
  const curatedNonPodcasts = existingMedia.filter(m => m.type !== 'podcast');
  const merged = [...curatedNonPodcasts, ...mediaItems];

  fs.writeFileSync(MEDIA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`Successfully updated ${MEDIA_FILE} (Total media items: ${merged.length})`);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

ingestRSS().catch(err => {
  console.error('Error during RSS ingestion:', err);
  process.exit(1);
});
