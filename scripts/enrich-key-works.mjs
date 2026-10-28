import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PHILOSOPHERS_PATH = path.join(__dirname, '..', 'data', 'philosophers.json');

const philosophers = JSON.parse(fs.readFileSync(PHILOSOPHERS_PATH, 'utf-8'));

// Canonical work metadata catalog
const WORK_METADATA = {
  "The Republic": {
    year: "-375 BCE",
    url: "https://standardebooks.org/ebooks/plato/the-republic/benjamin-jowett",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Republic_(Plato)",
    isbn: "978-0140455113",
    description: "Socratic dialogue on justice, the ideal city-state, the Allegory of the Cave, and the philosopher-king."
  },
  "Symposium": {
    year: "-385 BCE",
    url: "https://classics.mit.edu/Plato/symposium.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Symposium_(Plato)",
    isbn: "978-0872200760",
    description: "Dialogue exploring the nature and origin of Eros (love) and the ascent to the Form of Beauty."
  },
  "Phaedo": {
    year: "-360 BCE",
    url: "https://classics.mit.edu/Plato/phaedo.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Phaedo",
    isbn: "978-0199538935",
    description: "Recounts Socrates' final hours in prison, arguing for the immortality of the soul and the Theory of Forms."
  },
  "Timaeus": {
    year: "-360 BCE",
    url: "https://classics.mit.edu/Plato/timaeus.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Timaeus_(dialogue)",
    isbn: "978-0872204461",
    description: "Plato's speculative cosmology describing the Demiurge fashioning the cosmos according to eternal Forms."
  },
  "Meno": {
    year: "-380 BCE",
    url: "https://classics.mit.edu/Plato/meno.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Meno",
    isbn: "978-0872203525",
    description: "Investigates whether virtue can be taught, introducing the theory of recollection (anamnesis)."
  },
  "Nicomachean Ethics": {
    year: "-350 BCE",
    url: "https://classics.mit.edu/Aristotle/nicomachaen.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Nicomachean_Ethics",
    isbn: "978-0140449495",
    description: "Foundational treatise on virtue ethics, the Golden Mean, and human flourishing (eudaimonia)."
  },
  "Metaphysics": {
    year: "-350 BCE",
    url: "https://classics.mit.edu/Aristotle/metaphysics.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Metaphysics_(Aristotle)",
    isbn: "978-0140446197",
    description: "Inquiry into 'Being qua Being', substance, potentiality and actuality, and the Unmoved Mover."
  },
  "Politics": {
    year: "-350 BCE",
    url: "https://classics.mit.edu/Aristotle/politics.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Politics_(Aristotle)",
    isbn: "978-0199538737",
    description: "Examination of political constitutions, citizenship, and man as inherently a 'political animal'."
  },
  "De Anima": {
    year: "-350 BCE",
    url: "https://classics.mit.edu/Aristotle/soul.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/On_the_Soul",
    isbn: "978-0140444711",
    description: "Aristotle's psychology: the soul as the formal actuality of an organic physical body."
  },
  "Organon": {
    year: "-350 BCE",
    url: "https://en.wikipedia.org/wiki/Organon",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Organon",
    isbn: "978-0674993594",
    description: "The six treatises establishing categorical logic and the deductive syllogism."
  },
  "Letters from a Stoic (Epistulae Morales)": {
    year: "65 CE",
    url: "https://en.wikisource.org/wiki/Moral_letters_to_Lucilius",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Epistulae_Morales_ad_Lucilium",
    isbn: "978-0140442106",
    description: "124 letters advising Lucilius on practical Stoic wisdom, overcoming fear of death, and resilience."
  },
  "On the Shortness of Life": {
    year: "49 CE",
    url: "https://en.wikisource.org/wiki/On_the_shortness_of_life",
    wikipediaUrl: "https://en.wikipedia.org/wiki/De_Brevitate_Vitae_(Seneca)",
    isbn: "978-0143036326",
    description: "Essay asserting life is long if spent wisely, but short if squandered on frivolous ambition."
  },
  "On Anger": {
    year: "41 CE",
    url: "https://en.wikisource.org/wiki/Of_Anger",
    wikipediaUrl: "https://en.wikipedia.org/wiki/De_Ira",
    isbn: "978-0226748412",
    description: "Stoic psychological analysis of anger as temporary madness and how reason can extinguish it."
  },
  "Discourses": {
    year: "108 CE",
    url: "https://classics.mit.edu/Epictetus/discourses.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Discourses_of_Epictetus",
    isbn: "978-0199595181",
    description: "Informal lectures recorded by Arrian on Stoic ethics and the Dichotomy of Control."
  },
  "Enchiridion (Handbook)": {
    year: "125 CE",
    url: "https://classics.mit.edu/Epictetus/epicench.html",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Enchiridion_of_Epictetus",
    isbn: "978-0486433592",
    description: "Concise practical handbook of Stoic advice for mental tranquility and moral freedom."
  },
  "Meditations": {
    year: "175 CE",
    url: "https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Meditations",
    isbn: "978-0812968255",
    description: "Private spiritual journal of Roman Emperor Marcus Aurelius on duty, nature, and virtue."
  },
  "Confessions": {
    year: "397 CE",
    url: "https://www.gutenberg.org/ebooks/3296",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Confessions_(Augustine)",
    isbn: "978-0199537822",
    description: "Autobiographical spiritual journey, theology of grace, and famous analysis of the psychological nature of time."
  },
  "City of God": {
    year: "426 CE",
    url: "https://www.gutenberg.org/ebooks/45304",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_City_of_God",
    isbn: "978-0140448948",
    description: "Philosophy of history contrasting the heavenly City of God with the earthly City of Man after the sack of Rome."
  },
  "Summa Theologiae": {
    year: "1274 CE",
    url: "https://www.newadvent.org/summa/",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Summa_Theologiae",
    isbn: "978-0870610639",
    description: "Aquinas's masterwork of medieval scholasticism, containing the Five Ways to demonstrate God's existence."
  },
  "The Prince": {
    year: "1513 CE",
    url: "https://standardebooks.org/ebooks/niccolo-machiavelli/the-prince/w-k-marriott",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_Prince",
    isbn: "978-0140449150",
    description: "Realistic political treatise on statecraft, the balance of virtù and fortuna, and maintaining power."
  },
  "Leviathan": {
    year: "1651 CE",
    url: "https://www.gutenberg.org/ebooks/3207",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Leviathan_(Hobbes_book)",
    isbn: "978-0141439587",
    description: "Foundational political philosophy on the state of nature, the social contract, and the sovereign Leviathan."
  },
  "Meditations on First Philosophy": {
    year: "1641 CE",
    url: "https://www.gutenberg.org/ebooks/59",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Meditations_on_First_Philosophy",
    isbn: "978-0521558181",
    description: "Descartes' radical doubt, the Cogito, proof of God, and mind-body substance dualism."
  },
  "Discourse on the Method": {
    year: "1637 CE",
    url: "https://www.gutenberg.org/ebooks/59",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Discourse_on_the_Method",
    isbn: "978-0199540075",
    description: "Autobiographical treatise introducing Cartesian skepticism and the scientific method."
  },
  "Ethics (demonstrated in geometrical order)": {
    year: "1677 CE",
    url: "https://www.gutenberg.org/ebooks/3800",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Ethics_(Spinoza_book)",
    isbn: "978-0140435719",
    description: "Geometrical proof of pantheistic monism: God and Nature as one infinite substance (Deus Sive Natura)."
  },
  "Monadology": {
    year: "1714 CE",
    url: "https://en.wikisource.org/wiki/The_Monadology",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Monadology",
    isbn: "978-0872200623",
    description: "Leibniz's late metaphysical synthesis: reality composed of immaterial, perception-bearing monads in pre-established harmony."
  },
  "An Essay Concerning Human Understanding": {
    year: "1689 CE",
    url: "https://www.gutenberg.org/ebooks/10604",
    wikipediaUrl: "https://en.wikipedia.org/wiki/An_Essay_Concerning_Human_Understanding",
    isbn: "978-0140434828",
    description: "Argues against innate ideas; formulates the mind as a blank slate (tabula rasa) populated through sensation."
  },
  "Two Treatises of Government": {
    year: "1689 CE",
    url: "https://www.gutenberg.org/ebooks/7370",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Two_Treatises_of_Government",
    isbn: "978-0521357302",
    description: "Foundational theory of natural rights (life, liberty, property) and government by consent of the governed."
  },
  "A Treatise of Human Nature": {
    year: "1739 CE",
    url: "https://www.gutenberg.org/ebooks/4705",
    wikipediaUrl: "https://en.wikipedia.org/wiki/A_Treatise_of_Human_Nature",
    isbn: "978-0198751724",
    description: "Hume's empirical masterpiece investigating human knowledge, passions, morality, and the bundle theory of self."
  },
  "An Enquiry Concerning Human Understanding": {
    year: "1748 CE",
    url: "https://www.gutenberg.org/ebooks/9662",
    wikipediaUrl: "https://en.wikipedia.org/wiki/An_Enquiry_Concerning_Human_Understanding",
    isbn: "978-0199549900",
    description: "Refined presentation of Hume's epistemological skepticism, problem of induction, and critique of miracles."
  },
  "The Social Contract": {
    year: "1762 CE",
    url: "https://www.gutenberg.org/ebooks/46333",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_Social_Contract",
    isbn: "978-0140442014",
    description: "'Man is born free, and he is everywhere in chains.' Articulates legitimate sovereignty and the General Will."
  },
  "Candide": {
    year: "1759 CE",
    url: "https://standardebooks.org/ebooks/voltaire/candide",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Candide",
    isbn: "978-0140440041",
    description: "Satirical philosophical novella mocking Leibnizian theological optimism ('best of all possible worlds')."
  },
  "Critique of Pure Reason": {
    year: "1781 CE",
    url: "https://www.gutenberg.org/ebooks/4280",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Critique_of_Pure_Reason",
    isbn: "978-0521657297",
    description: "Copernican revolution in metaphysics: Transcendental Idealism, synthetic a priori judgments, and bounds of reason."
  },
  "Groundwork of the Metaphysics of Morals": {
    year: "1785 CE",
    url: "https://www.gutenberg.org/ebooks/5682",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Groundwork_of_the_Metaphysics_of_Morals",
    isbn: "978-0521626958",
    description: "Deontological ethics introducing the Categorical Imperative and the intrinsic dignity of persons."
  },
  "Critique of Practical Reason": {
    year: "1788 CE",
    url: "https://www.gutenberg.org/ebooks/5683",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Critique_of_Practical_Reason",
    isbn: "978-0521599658",
    description: "Kant's second critique, proving freedom, immortality of the soul, and God through moral necessity."
  },
  "Phenomenology of Spirit": {
    year: "1807 CE",
    url: "https://en.wikipedia.org/wiki/The_Phenomenology_of_Spirit",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_Phenomenology_of_Spirit",
    isbn: "978-0198245971",
    description: "Dialectical journey of consciousness toward Absolute Knowing, including the Master-Slave dialectic."
  },
  "The World as Will and Representation": {
    year: "1818 CE",
    url: "https://www.gutenberg.org/ebooks/38427",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_World_as_Will_and_Representation",
    isbn: "978-0486217611",
    description: "Post-Kantian masterpiece unveiling the thing-in-itself as blind, insatiable metaphysical Will."
  },
  "Fear and Trembling": {
    year: "1843 CE",
    url: "https://en.wikipedia.org/wiki/Fear_and_Trembling",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Fear_and_Trembling",
    isbn: "978-0140444490",
    description: "Kierkegaard's pseudonym Johannes de Silentio examines Abraham's sacrifice of Isaac and the leap of faith."
  },
  "Das Kapital": {
    year: "1867 CE",
    url: "https://www.marxists.org/archive/marx/works/1867-c1/",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Das_Kapital",
    isbn: "978-0140445688",
    description: "Critique of political economy, commodity fetishism, surplus value, and the mechanics of capitalist exploitation."
  },
  "Thus Spoke Zarathustra": {
    year: "1883 CE",
    url: "https://www.gutenberg.org/ebooks/1998",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Thus_Spoke_Zarathustra",
    isbn: "978-0140441185",
    description: "Philosophical poem proclaiming the Death of God, the Übermensch (Overman), and the Eternal Recurrence."
  },
  "Beyond Good and Evil": {
    year: "1886 CE",
    url: "https://www.gutenberg.org/ebooks/4363",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Beyond_Good_and_Evil",
    isbn: "978-0140449235",
    description: "Polemic against traditional dogmatic morality, introducing perspectivism and the Will to Power."
  },
  "On Liberty": {
    year: "1859 CE",
    url: "https://www.gutenberg.org/ebooks/34901",
    wikipediaUrl: "https://en.wikipedia.org/wiki/On_Liberty",
    isbn: "978-0140432077",
    description: "Classic liberal defense of individual autonomy, free speech, and the Harm Principle."
  },
  "Being and Time": {
    year: "1927 CE",
    url: "https://en.wikipedia.org/wiki/Being_and_Time",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Being_and_Time",
    isbn: "978-0631197706",
    description: "Heidegger's fundamental ontology: analyzing human existence as Dasein ('Being-in-the-world') oriented toward death."
  },
  "Being and Nothingness": {
    year: "1943 CE",
    url: "https://en.wikipedia.org/wiki/Being_and_Nothingness",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Being_and_Nothingness",
    isbn: "978-0671867805",
    description: "Sartre's existentialist magnum opus on radical freedom, consciousness as nothingness, and bad faith."
  },
  "The Second Sex": {
    year: "1949 CE",
    url: "https://en.wikipedia.org/wiki/The_Second_Sex",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_Second_Sex",
    isbn: "978-0307277787",
    description: "Foundational feminist philosophy: 'One is not born, but rather becomes, a woman.' Analysis of feminine otherness."
  },
  "The Myth of Sisyphus": {
    year: "1942 CE",
    url: "https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus",
    wikipediaUrl: "https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus",
    isbn: "978-0679733737",
    description: "Camus's philosophical essay on the absurd: 'One must imagine Sisyphus happy.'"
  },
  "Tractatus Logico-Philosophicus": {
    year: "1921 CE",
    url: "https://www.gutenberg.org/ebooks/5740",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Tractatus_Logico-Philosophicus",
    isbn: "978-0415254083",
    description: "Logical picture theory of language: 'Whereof one cannot speak, thereof one must be silent.'"
  },
  "Philosophical Investigations": {
    year: "1953 CE",
    url: "https://en.wikipedia.org/wiki/Philosophical_Investigations",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Philosophical_Investigations",
    isbn: "978-1405159289",
    description: "Later Wittgenstein: rejecting formal picture theory for ordinary language games and forms of life."
  },
  "Discipline and Punish": {
    year: "1975 CE",
    url: "https://en.wikipedia.org/wiki/Discipline_and_Punish",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Discipline_and_Punish",
    isbn: "978-0679752554",
    description: "Foucault's genealogy of modern penal institutions, panopticism, and the birth of disciplinary power."
  },
  "A Theory of Justice": {
    year: "1971 CE",
    url: "https://en.wikipedia.org/wiki/A_Theory_of_Justice",
    wikipediaUrl: "https://en.wikipedia.org/wiki/A_Theory_of_Justice",
    isbn: "978-0674000780",
    description: "Revitalized political philosophy with 'justice as fairness' chosen behind the veil of ignorance."
  },
  "The Burnout Society": {
    year: "2010 CE",
    url: "https://en.wikipedia.org/wiki/Byung-Chul_Han",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Byung-Chul_Han",
    isbn: "978-0804795098",
    description: "Contemporary critique of the neoliberal achievement society where freedom transforms into compulsive self-exploitation."
  },
  "Superintelligence: Paths, Dangers, Strategies": {
    year: "2014 CE",
    url: "https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies",
    wikipediaUrl: "https://en.wikipedia.org/wiki/Superintelligence:_Paths,_Dangers,_Strategies",
    isbn: "978-0199678112",
    description: "Foundational treatise on existential risk, artificial general intelligence trajectory, and value alignment."
  }
};

for (const p of philosophers) {
  const enrichedWorks = [];
  for (const item of p.keyWorks) {
    const rawTitle = typeof item === 'string' ? item : item.title;
    if (WORK_METADATA[rawTitle]) {
      enrichedWorks.push({
        title: rawTitle,
        ...WORK_METADATA[rawTitle]
      });
    } else {
      // Create clean fallback with Wikipedia link
      const encodedTitle = encodeURIComponent(rawTitle);
      enrichedWorks.push({
        title: rawTitle,
        year: p.birthYear ? (p.birthYear < 0 ? `${Math.abs(p.birthYear)} BCE` : `${p.birthYear} CE`) : undefined,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTitle}`,
        wikipediaUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodedTitle}`,
        isbn: undefined,
        description: `Major work by ${p.name}.`
      });
    }
  }
  p.keyWorks = enrichedWorks;
}

fs.writeFileSync(PHILOSOPHERS_PATH, JSON.stringify(philosophers, null, 2), 'utf-8');
console.log(`Successfully enriched keyWorks in ${PHILOSOPHERS_PATH}`);
