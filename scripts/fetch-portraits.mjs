import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildData } from './build-data.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PHILOSOPHERS_DIR = path.join(ROOT_DIR, 'data', 'philosophers');
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
  'herbert-marcuse': 'Herbert_Marcuse',
  'jean-paul-sartre': 'Jean-Paul_Sartre',
  'simone-de-beauvoir': 'Simone_de_Beauvoir',
  'albert-camus': 'Albert_Camus',
  'emmanuel-levinas': 'Emmanuel_Levinas',
  'maurice-merleau-ponty': 'Maurice_Merleau-Ponty',
  'carl-schmitt': 'Carl_Schmitt',
  'ernst-cassirer': 'Ernst_Cassirer',
  'leo-strauss': 'Leo_Strauss',
  'hannah-arendt': 'Hannah_Arendt',
  'john-rawls': 'John_Rawls',
  'michel-foucault': 'Michel_Foucault',
  'jurgen-habermas': 'Jürgen_Habermas',
  'gilles-deleuze': 'Gilles_Deleuze',
  'jacques-derrida': 'Jacques_Derrida',
  'derek-parfit': 'Derek_Parfit',
  'ferdinand-de-saussure': 'Ferdinand_de_Saussure',
  'max-horkheimer': 'Max_Horkheimer',
  'jean-baudrillard': 'Jean_Baudrillard',
  'byung-chul-han': 'Byung-Chul_Han',
  'slavoj-zizek': 'Slavoj_Žižek',
  'alenka-zupancic': 'Alenka_Zupančič',
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
  'thomas-kuhn': 'Thomas_Kuhn',
  'al-farabi': 'Al-Farabi',
  'ibn-khaldun': 'Ibn_Khaldun',
  'elisabeth-of-bohemia': 'Elisabeth_of_the_Palatinate',
  'g-e-m-anscombe': 'G._E._M._Anscombe',
  'philippa-foot': 'Philippa_Foot',
  'frantz-fanon': 'Frantz_Fanon',
  // Africana & African Philosophy
  'ptahhotep': 'Ptahhotep',
  'zara-yaqob': 'Zera_Yacob',
  'anton-wilhelm-amo': 'Anton_Wilhelm_Amo',
  'aime-cesaire': 'Aimé_Césaire',
  'kwasi-wiredu': 'Kwasi_Wiredu',
  'achille-mbembe': 'Achille_Mbembe',
  // Latin American & Decolonial Philosophy
  'sor-juana': 'Sor_Juana_Inés_de_la_Cruz',
  'paulo-freire': 'Paulo_Freire',
  'enrique-dussel': 'Enrique_Dussel',
  'anibal-quijano': 'Aníbal_Quijano',
  'gloria-anzaldua': 'Gloria_E._Anzaldúa',
  // Asian Classical Heterodox & Kyoto School
  'mozi': 'Mozi',
  'xunzi': 'Xun_Kuang',
  'han-feizi': 'Han_Feizi',
  'mahavira': 'Mahavira',
  'dogen': 'Dōgen',
  'nishida-kitaro': 'Kitaro_Nishida',
  'b-r-ambedkar': 'B._R._Ambedkar',
  // Islamic Golden Age & Jewish Andalusian Philosophy
  'al-kindi': 'Al-Kindi',
  'ibn-gabirol': 'Solomon_ibn_Gabirol',
  'ibn-tufayl': 'Ibn_Tufayl',
  'suhrawardi': 'Shahab_al-Din_Yahya_ibn_Habash_Suhrawardi',
  'ibn-arabi': 'Ibn_Arabi',
  'hasdai-crescas': 'Hasdai_Crescas',
  'mulla-sadra': 'Mulla_Sadra',
  // Early Modern Women Philosophers
  'margaret-cavendish': 'Margaret_Cavendish,_Duchess_of_Newcastle-upon-Tyne',
  'anne-conway': 'Anne_Conway_(philosopher)',
  'mary-astell': 'Mary_Astell',
  'damaris-masham': 'Damaris_Cudworth_Masham',
  'catharine-cockburn': 'Catharine_Trotter_Cockburn',
  'emilie-du-chatelet': 'Émilie_du_Châtelet',
  // Indigenous American & First Nations Philosophy
  'nezahualcoyotl': 'Nezahualcoyotl',
  'felipe-guaman-poma': 'Felipe_Guamán_Poma_de_Ayala',
  'inca-garcilaso-de-la-vega': 'Inca_Garcilaso_de_la_Vega',
  'vine-deloria-jr': 'Vine_Deloria_Jr.',
  'robin-wall-kimmerer': 'Robin_Wall_Kimmerer',
  // Psychology
  'wilhelm-wundt': 'Wilhelm_Wundt',
  'sigmund-freud': 'Sigmund_Freud',
  'carl-jung': 'Carl_Jung',
  'ivan-pavlov': 'Ivan_Pavlov',
  'john-b-watson': 'John_B._Watson',
  'b-f-skinner': 'B._F._Skinner',
  'jean-piaget': 'Jean_Piaget',
  'lev-vygotsky': 'Lev_Vygotsky',
  'noam-chomsky': 'Noam_Chomsky',
  'carl-rogers': 'Carl_Rogers',
  'viktor-frankl': 'Viktor_Frankl',
  'daniel-kahneman': 'Daniel_Kahneman',
  'melanie-klein': 'Melanie_Klein',
  'anna-freud': 'Anna_Freud',
  'alfred-adler': 'Alfred_Adler',
  'erik-erikson': 'Erik_Erikson',
  'd-w-winnicott': 'Donald_Winnicott',
  'ronald-fairbairn': 'Ronald_Fairbairn',
  'john-bowlby': 'John_Bowlby',
  'stephen-mitchell': 'Stephen_A._Mitchell',
  'heinz-kohut': 'Heinz_Kohut',
  'jacques-lacan': 'Jacques_Lacan',
  'bruce-fink': 'Bruce_Fink',
  'juliet-mitchell': 'Juliet_Mitchell',
  'paul-ricoeur': 'Paul_Ric%C5%93ur',
  'heinrich-racker': 'Heinrich_Racker',
  'otto-kernberg': 'Otto_F._Kernberg',
  // Sociology
  'auguste-comte': 'Auguste_Comte',
  'emile-durkheim': 'Émile_Durkheim',
  'max-weber': 'Max_Weber',
  'georg-simmel': 'Georg_Simmel',
  'w-e-b-du-bois': 'W._E._B._Du_Bois',
  'george-h-mead': 'George_Herbert_Mead',
  'talcott-parsons': 'Talcott_Parsons',
  'erving-goffman': 'Erving_Goffman',
  'pierre-bourdieu': 'Pierre_Bourdieu',
  'anthony-giddens': 'Anthony_Giddens',
  'zygmunt-bauman': 'Zygmunt_Bauman',
  'ulrich-beck': 'Ulrich_Beck',
  // Phase 4 canon expansion
  'harriet-martineau': 'Harriet_Martineau',
  'jane-addams': 'Jane_Addams',
  'dorothy-smith': 'Dorothy_E._Smith',
  'patricia-hill-collins': 'Patricia_Hill_Collins',
  'judith-butler': 'Judith_Butler',
  'harriet-taylor-mill': 'Harriet_Taylor_Mill',
  'rosa-luxemburg': 'Rosa_Luxemburg',
  'ban-zhao': 'Ban_Zhao',
  'hildegard-of-bingen': 'Hildegard_of_Bingen',
  'christine-de-pizan': 'Christine_de_Pizan',
  'karen-horney': 'Karen_Horney',
  'edith-stein': 'Edith_Stein',
  'iris-murdoch': 'Iris_Murdoch',
  'martha-nussbaum': 'Martha_Nussbaum',
  // Phase 5 global women expansion
  'gargi-vachaknavi': 'Gargi_Vachaknavi',
  'akka-mahadevi': 'Akka_Mahadevi',
  'mirabai': 'Meera',
  'savitribai-phule': 'Savitribai_Phule',
  'pandita-ramabai': 'Pandita_Ramabai',
  'gayatri-chakravorty-spivak': 'Gayatri_Chakravorty_Spivak',
  'vandana-shiva': 'Vandana_Shiva',
  'chandra-talpade-mohanty': 'Chandra_Talpade_Mohanty',
  'murasaki-shikibu': 'Murasaki_Shikibu',
  'sei-shonagon': 'Sei_Shōnagon',
  'li-qingzhao': 'Li_Qingzhao',
  'qiu-jin': 'Qiu_Jin',
  'yosano-akiko': 'Akiko_Yosano',
  'he-yin-zhen': 'He-Yin_Zhen',
  'hiratsuka-raicho': 'Raichō_Hiratsuka',
  'ito-noe': 'Noe_Itō',
  'rabia-al-adawiyya': 'Rabia_of_Basra',
  'huda-shaarawi': "Huda_Sha'arawi",
  'nawal-el-saadawi': 'Nawal_El_Saadawi',
  'fatema-mernissi': 'Fatema_Mernissi',
  'leila-ahmed': 'Leila_Ahmed',
  'seyla-benhabib': 'Seyla_Benhabib',
  'amina-wadud': 'Amina_Wadud',
  'saba-mahmood': 'Saba_Mahmood',
  'funmilayo-ransome-kuti': 'Funmilayo_Ransome-Kuti',
  'mariama-ba': 'Mariama_Bâ',
  'wangari-maathai': 'Wangari_Maathai',
  'lelia-gonzalez': 'Lélia_Gonzalez',
  'maria-lugones': 'María_Lugones',
  'silvia-rivera-cusicanqui': 'Silvia_Rivera_Cusicanqui',
  'sueli-carneiro': 'Sueli_Carneiro',
  'rigoberta-menchu': 'Rigoberta_Menchú',
  'winona-laduke': 'Winona_LaDuke',
  // Phase 5B African, Latin American & Indigenous expansion
  'fatima-meer': 'Fatima_Meer',
  'bessie-head': 'Bessie_Head',
  'molara-ogundipe': 'Molara_Ogundipe',
  'valentin-yves-mudimbe': 'V._Y._Mudimbe',
  'ama-ata-aidoo': 'Ama_Ata_Aidoo',
  'steve-biko': 'Steve_Biko',
  'awa-thiam': 'Awa_Thiam',
  'oyeronke-oyewumi': 'Oyèrónkẹ́_Oyěwùmí',
  'amina-mama': 'Amina_Mama',
  'tsitsi-dangarembga': 'Tsitsi_Dangarembga',
  'sylvia-tamale': 'Sylvia_Tamale',
  'chimamanda-ngozi-adichie': 'Chimamanda_Ngozi_Adichie',
  'nadia-yala-kisukidi': 'Nadia_Yala_Kisukidi',
  'jose-carlos-mariategui': 'José_Carlos_Mariátegui',
  'rodolfo-kusch': 'Rodolfo_Kusch',
  'rosario-castellanos': 'Rosario_Castellanos',
  'graciela-hierro': 'Graciela_Hierro',
  'heleieth-saffioti': 'Heleieth_Saffioti',
  'julieta-kirkwood': 'Julieta_Kirkwood',
  'marilena-chaui': 'Marilena_de_Souza_Chaui',
  'virginia-vargas': 'Virginia_Vargas',
  'rita-segato': 'Rita_Laura_Segato',
  'francesca-gargallo': 'Francesca_Gargallo',
  'julieta-paredes': 'Julieta_Paredes',
  'yuderkys-espinosa-minoso': 'Yuderkys_Espinosa_Miñoso',
  'djamila-ribeiro': 'Djamila_Ribeiro',
  'zitkala-sa': 'Zitkala-Ša',
  'paula-gunn-allen': 'Paula_Gunn_Allen',
  'jeannette-armstrong': 'Jeannette_Armstrong',
  'haunani-kay-trask': 'Haunani-Kay_Trask',
  'linda-tuhiwai-smith': 'Linda_Tuhiwai_Smith',
  'lee-maracle': 'Lee_Maracle',
  'kim-tallbear': 'Kim_TallBear',
  'leanne-betasamosake-simpson': 'Leanne_Betasamosake_Simpson',
  'kyle-powys-whyte': 'Kyle_Powys_Whyte',
};

const CUSTOM_IMAGE_URLS = {
  'nezahualcoyotl': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/NezahualcoyotlGardenTADF.JPG/330px-NezahualcoyotlGardenTADF.JPG',
  'molara-ogundipe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Molara_Ogundipe-Leslie.jpg/500px-Molara_Ogundipe-Leslie.jpg',
  'nadia-yala-kisukidi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nadia_Yala_Kisukidi.jpg/500px-Nadia_Yala_Kisukidi.jpg',
  'graciela-hierro': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Graciela-hierro.jpg',
  'julieta-kirkwood': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/JULIETA_KIRKWOOD_Mesa_de_trabajo_1_copia.png/500px-JULIETA_KIRKWOOD_Mesa_de_trabajo_1_copia.png',
  'yuderkys-espinosa-minoso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Yuderkys_Espinosa_Mi%C3%B1oso%2C_ps%C3%ADcologa%2C_activista%2C_pedagoga._Feminista_decolonial_y_antiracista.png/500px-Yuderkys_Espinosa_Mi%C3%B1oso%2C_ps%C3%ADcologa%2C_activista%2C_pedagoga._Feminista_decolonial_y_antiracista.png',
  'rodolfo-kusch': 'https://upload.wikimedia.org/wikipedia/commons/5/52/RodolfoKusch.jpg',
  'jeannette-armstrong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Jeannette_Armstrong.jpg/500px-Jeannette_Armstrong.jpg',
  'leanne-betasamosake-simpson': 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Leanne_Betasamosake_Simpson_au_La_Vitrola.jpg',
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
      let thumbUrl = CUSTOM_IMAGE_URLS[phil.id];
      if (!thumbUrl) {
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
        thumbUrl = data.thumbnail?.source || data.originalimage?.source;
      }

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

        // Persist to individual modular philosopher file
        const modularPhilPath = path.join(PHILOSOPHERS_DIR, `${phil.id}.json`);
        if (fs.existsSync(modularPhilPath)) {
          const modularData = JSON.parse(fs.readFileSync(modularPhilPath, 'utf-8'));
          modularData.imageUrl = publicUrl;
          fs.writeFileSync(modularPhilPath, JSON.stringify(modularData, null, 2) + '\n', 'utf-8');
        }

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

  // Rebuild the compiled dataset
  buildData();
  console.log(`\n🎉 Portrait ingestion complete! Success: ${successCount}, Skipped/Missing: ${skippedCount}`);
}

fetchPortraits();
