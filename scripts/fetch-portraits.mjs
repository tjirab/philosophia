import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PHILOSOPHERS_PATH = path.join(ROOT_DIR, 'data', 'philosophers.json');
const PORTRAITS_DIR = path.join(ROOT_DIR, 'public', 'portraits');

const WIKI_TITLES = {
  'socrates': 'Socrates',
  'plato': 'Plato',
  'aristotle': 'Aristotle',
  'thales': 'Thales_of_Miletus',
  'anaximander': 'Anaximander',
  'heraclitus': 'Heraclitus',
  'parmenides': 'Parmenides',
  'democritus': 'Democritus',
  'zeno-of-elea': 'Zeno_of_Elea',
  'epicurus': 'Epicurus',
  'seneca': 'Seneca_the_Younger',
  'epictetus': 'Epictetus',
  'marcus-aurelius': 'Marcus_Aurelius',
  'pyrrho': 'Pyrrho',
  'plotinus': 'Plotinus',
  'augustine': 'Augustine_of_Hippo',
  'boethius': 'Boethius',
  'avicenna': 'Avicenna',
  'al-ghazali': 'Al-Ghazali',
  'moses-maimonides': 'Maimonides',
  'averroes': 'Averroes',
  'thomas-aquinas': 'Thomas_Aquinas',
  'anselm-of-canterbury': 'Anselm_of_Canterbury',
  'william-of-ockham': 'William_of_Ockham',
  'machiavelli': 'Niccolò_Machiavelli',
  'francis-bacon': 'Francis_Bacon',
  'thomas-hobbes': 'Thomas_Hobbes',
  'rene-descartes': 'René_Descartes',
  'baruch-spinoza': 'Baruch_Spinoza',
  'gottfried-leibniz': 'Gottfried_Wilhelm_Leibniz',
  'john-locke': 'John_Locke',
  'george-berkeley': 'George_Berkeley',
  'voltaire': 'Voltaire',
  'montesquieu': 'Montesquieu',
  'david-hume': 'David_Hume',
  'jean-jacques-rousseau': 'Jean-Jacques_Rousseau',
  'adam-smith': 'Adam_Smith',
  'jeremy-bentham': 'Jeremy_Bentham',
  'mary-wollstonecraft': 'Mary_Wollstonecraft',
  'immanuel-kant': 'Immanuel_Kant',
  'johann-gottlieb-fichte': 'Johann_Gottlieb_Fichte',
  'friedrich-schelling': 'Friedrich_Wilhelm_Joseph_Schelling',
  'gwf-hegel': 'Georg_Wilhelm_Friedrich_Hegel',
  'arthur-schopenhauer': 'Arthur_Schopenhauer',
  'soren-kierkegaard': 'Søren_Kierkegaard',
  'ludwig-feuerbach': 'Ludwig_Feuerbach',
  'karl-marx': 'Karl_Marx',
  'john-stuart-mill': 'John_Stuart_Mill',
  'charles-sanders-peirce': 'Charles_Sanders_Peirce',
  'william-james': 'William_James',
  'friedrich-nietzsche': 'Friedrich_Nietzsche',
  'gottlob-frege': 'Gottlob_Frege',
  'edmund-husserl': 'Edmund_Husserl',
  'bertrand-russell': 'Bertrand_Russell',
  'karl-popper': 'Karl_Popper',
  'martin-heidegger': 'Martin_Heidegger',
  'ludwig-wittgenstein': 'Ludwig_Wittgenstein',
  'theodor-adorno': 'Theodor_W._Adorno',
  'jean-paul-sartre': 'Jean-Paul_Sartre',
  'simone-de-beauvoir': 'Simone_de_Beauvoir',
  'albert-camus': 'Albert_Camus',
  'emmanuel-levinas': 'Emmanuel_Levinas',
  'maurice-merleau-ponty': 'Maurice_Merleau-Ponty',
  'hannah-arendt': 'Hannah_Arendt',
  'john-rawls': 'John_Rawls',
  'michel-foucault': 'Michel_Foucault',
  'jurgen-habermas': 'Jürgen_Habermas',
  'gilles-deleuze': 'Gilles_Deleuze',
  'jacques-derrida': 'Jacques_Derrida',
  'derek-parfit': 'Derek_Parfit',
  'byung-chul-han': 'Byung-Chul_Han',
  'nick-bostrom': 'Nick_Bostrom',
  'laozi': 'Laozi',
  'confucius': 'Confucius',
  'mencius': 'Mencius',
  'zhuangzi': 'Zhuangzi',
  'siddhartha-gautama': 'Gautama_Buddha',
  'nagarjuna': 'Nagarjuna',
  'adi-shankara': 'Adi_Shankara',
  'michel-de-montaigne': 'Michel_de_Montaigne',
  'blaise-pascal': 'Blaise_Pascal',
};

async function fetchPortraits() {
  fs.mkdirSync(PORTRAITS_DIR, { recursive: true });
  const philosophers = JSON.parse(fs.readFileSync(PHILOSOPHERS_PATH, 'utf-8'));

  const userAgent = 'PhilosophiaKnowledgeGraph/1.0 (https://github.com/tjirab/philosophia; contact@philosophia.local)';

  let successCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < philosophers.length; i++) {
    const phil = philosophers[i];
    const wikiTitle = WIKI_TITLES[phil.id] || phil.name.replace(/\s+/g, '_');
    const localFileName = `${phil.id}.jpg`;
    const localFilePath = path.join(PORTRAITS_DIR, localFileName);
    const publicUrl = `/portraits/${localFileName}`;

    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 5000) {
      phil.imageUrl = publicUrl;
      successCount++;
      continue;
    }

    try {
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
      const res = await fetch(summaryUrl, {
        headers: { 'User-Agent': userAgent },
      });

      if (!res.ok) {
        console.warn(`[WARN] Failed summary for ${phil.name} (${wikiTitle}): HTTP ${res.status}`);
        skippedCount++;
        continue;
      }

      const data = await res.json();
      const thumbUrl = data.thumbnail?.source || data.originalimage?.source;

      if (!thumbUrl) {
        console.warn(`[WARN] No thumbnail found for ${phil.name} (${wikiTitle})`);
        skippedCount++;
        continue;
      }

      // Download the image buffer
      const imgRes = await fetch(thumbUrl, {
        headers: { 'User-Agent': userAgent },
      });

      if (!imgRes.ok) {
        console.warn(`[WARN] Failed downloading image for ${phil.name}: HTTP ${imgRes.status}`);
        skippedCount++;
        continue;
      }

      const buffer = Buffer.from(await imgRes.arrayBuffer());
      if (buffer.length > 2000) {
        fs.writeFileSync(localFilePath, buffer);
        phil.imageUrl = publicUrl;
        successCount++;
        console.log(`[${i + 1}/${philosophers.length}] Saved portrait for ${phil.name} (${Math.round(buffer.length / 1024)} KB)`);
      } else {
        console.warn(`[WARN] Image buffer too small for ${phil.name} (${buffer.length} bytes)`);
        skippedCount++;
      }
    } catch (err) {
      console.error(`[ERROR] Processing ${phil.name}:`, err.message);
      skippedCount++;
    }

    // Rate-limiting delay for polite API access
    await new Promise((r) => setTimeout(r, 80));
  }

  fs.writeFileSync(PHILOSOPHERS_PATH, JSON.stringify(philosophers, null, 2) + '\n', 'utf-8');
  console.log(`\n🎉 Portrait ingestion complete! Success: ${successCount}, Skipped/Missing: ${skippedCount}`);
}

fetchPortraits();
