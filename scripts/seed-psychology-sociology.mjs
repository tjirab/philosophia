import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const PHILOSOPHERS_DIR = path.join(DATA_DIR, 'philosophers');
const CONCEPTS_DIR = path.join(DATA_DIR, 'concepts');
const EDGES_DIR = path.join(DATA_DIR, 'edges');

const THINKERS = [
  // Psychology Thinkers
  {
    id: 'wilhelm-wundt',
    name: 'Wilhelm Wundt',
    birthYear: 1832,
    deathYear: 1920,
    eraId: 'nineteenth-century',
    traditionId: 'experimental-psychology',
    domains: ['psychology', 'philosophy'],
    primaryDomain: 'psychology',
    shortBio: 'Founding father of modern experimental psychology; established the first formal psychological research laboratory at Leipzig in 1879.',
    centralQuestion: 'How can the immediate contents of conscious experience and psychological apperception be systematically analyzed and measured?',
    keyWorks: [
      {
        title: 'Principles of Physiological Psychology',
        year: '1874 CE',
        url: 'https://en.wikipedia.org/wiki/Principles_of_Physiological_Psychology',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Principles_of_Physiological_Psychology',
        description: 'Seminal textbook establishing psychology as an independent laboratory discipline.'
      },
      {
        title: 'Outlines of Psychology',
        year: '1896 CE',
        url: 'https://en.wikipedia.org/wiki/Wilhelm_Wundt',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Wilhelm_Wundt',
        description: 'Systematic overview of psychical processes, apperception, and voluntarism.'
      }
    ],
    sepSlug: 'wilhelm-wundt',
    externalRefs: { sep: 'wilhelm-wundt', wikipedia: 'Wilhelm_Wundt' },
    importanceScore: 92,
    imageUrl: '/portraits/wilhelm-wundt.jpg'
  },
  {
    id: 'sigmund-freud',
    name: 'Sigmund Freud',
    birthYear: 1856,
    deathYear: 1939,
    eraId: 'twentieth-century',
    traditionId: 'psychoanalysis',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'Austrian neurologist and founder of psychoanalysis; pioneered theories of the dynamic unconscious, infantile sexuality, repression, and dream analysis.',
    centralQuestion: 'How do repressed instinctual drives in the unconscious manifest in neuroses, dreams, culture, and the discontents of civilization?',
    keyWorks: [
      {
        title: 'The Interpretation of Dreams',
        year: '1899 CE',
        url: 'https://en.wikipedia.org/wiki/The_Interpretation_of_Dreams',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Interpretation_of_Dreams',
        description: 'Foundational psychoanalytic text introducing dream censorship and wish-fulfillment.'
      },
      {
        title: 'The Ego and the Id',
        year: '1923 CE',
        url: 'https://en.wikipedia.org/wiki/The_Ego_and_the_Id',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Ego_and_the_Id',
        description: 'Introduces the structural model of the psyche: id, ego, and super-ego.'
      },
      {
        title: 'Civilization and Its Discontents',
        year: '1930 CE',
        url: 'https://en.wikipedia.org/wiki/Civilization_and_Its_Discontents',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Civilization_and_Its_Discontents',
        description: 'Analyzes the fundamental clash between instinctual desires and societal sublimation.'
      }
    ],
    sepSlug: 'freud',
    externalRefs: { sep: 'freud', wikipedia: 'Sigmund_Freud' },
    importanceScore: 98,
    imageUrl: '/portraits/sigmund-freud.jpg'
  },
  {
    id: 'carl-jung',
    name: 'Carl Gustav Jung',
    birthYear: 1875,
    deathYear: 1961,
    eraId: 'twentieth-century',
    traditionId: 'psychoanalysis',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'Swiss psychiatrist and founder of analytical psychology; introduced archetypes, the collective unconscious, extraversion/introversion, and psychological individuation.',
    centralQuestion: 'What universal mythological archetypes and symbolic contents reside within the transpersonal collective unconscious?',
    keyWorks: [
      {
        title: 'Psychological Types',
        year: '1921 CE',
        url: 'https://en.wikipedia.org/wiki/Psychological_Types',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Psychological_Types',
        description: 'Proposes personality dimensions of introversion, extraversion, and cognitive functions.'
      },
      {
        title: 'The Archetypes and the Collective Unconscious',
        year: '1959 CE',
        url: 'https://en.wikipedia.org/wiki/The_Archetypes_and_the_Collective_Unconscious',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Archetypes_and_the_Collective_Unconscious',
        description: 'Explores primal universal motifs shaping human dreams, myth, and culture.'
      }
    ],
    sepSlug: 'jung',
    externalRefs: { sep: 'jung', wikipedia: 'Carl_Jung' },
    importanceScore: 92,
    imageUrl: '/portraits/carl-jung.jpg'
  },
  {
    id: 'ivan-pavlov',
    name: 'Ivan Pavlov',
    birthYear: 1849,
    deathYear: 1936,
    eraId: 'nineteenth-century',
    traditionId: 'behaviorism',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'Russian physiologist who discovered classical conditioning through his landmark salivation experiments with dogs, laying the bedrock for scientific behaviorism.',
    centralQuestion: 'How can physiological and autonomic reflexes be systematically conditioned through neutral stimulus association?',
    keyWorks: [
      {
        title: 'Conditioned Reflexes',
        year: '1927 CE',
        url: 'https://en.wikipedia.org/wiki/Conditioned_reflex',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Conditioned_reflex',
        description: 'Definitive physiological investigation of cortical associative reflexes.'
      }
    ],
    sepSlug: 'behaviorism',
    externalRefs: { sep: 'behaviorism', wikipedia: 'Ivan_Pavlov' },
    importanceScore: 90,
    imageUrl: '/portraits/ivan-pavlov.jpg'
  },
  {
    id: 'john-b-watson',
    name: 'John B. Watson',
    birthYear: 1878,
    deathYear: 1958,
    eraId: 'twentieth-century',
    traditionId: 'behaviorism',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'American psychologist who codified behaviorism as a purely objective, natural science of observable stimulus-response contingencies, rejecting introspection.',
    centralQuestion: 'Can psychology become a purely objective natural science by studying overt behavior and abandoning the pseudo-concept of consciousness?',
    keyWorks: [
      {
        title: 'Psychology as the Behaviorist Views It',
        year: '1913 CE',
        url: 'https://en.wikipedia.org/wiki/Psychology_as_the_Behaviorist_Views_It',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Psychology_as_the_Behaviorist_Views_It',
        description: 'Known as the Behaviorist Manifesto, launching the behaviorist movement in America.'
      },
      {
        title: 'Behaviorism',
        year: '1924 CE',
        url: 'https://en.wikipedia.org/wiki/John_B._Watson',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/John_B._Watson',
        description: 'Popular synthesis of environmental conditioning and child habit training.'
      }
    ],
    sepSlug: 'behaviorism',
    externalRefs: { sep: 'behaviorism', wikipedia: 'John_B._Watson' },
    importanceScore: 88,
    imageUrl: '/portraits/john-b-watson.jpg'
  },
  {
    id: 'b-f-skinner',
    name: 'B.F. Skinner',
    birthYear: 1904,
    deathYear: 1990,
    eraId: 'twentieth-century',
    traditionId: 'behaviorism',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'Pioneered radical behaviorism, operant conditioning, and reinforcement schedules; argued free will is an illusion and behavior is governed by environmental consequences.',
    centralQuestion: 'How do schedules of operant reinforcement select and shape complex human behavior without invoking autonomous inner agency?',
    keyWorks: [
      {
        title: 'The Behavior of Organisms',
        year: '1938 CE',
        url: 'https://en.wikipedia.org/wiki/The_Behavior_of_Organisms',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Behavior_of_Organisms',
        description: 'Establishes operant conditioning through experimental analysis of behavior.'
      },
      {
        title: 'Science and Human Behavior',
        year: '1953 CE',
        url: 'https://en.wikipedia.org/wiki/Science_and_Human_Behavior',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Science_and_Human_Behavior',
        description: 'Extends radical behaviorism to government, education, religion, and culture.'
      },
      {
        title: 'Beyond Freedom and Dignity',
        year: '1971 CE',
        url: 'https://en.wikipedia.org/wiki/Beyond_Freedom_and_Dignity',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Beyond_Freedom_and_Dignity',
        description: 'Critiques traditional concepts of autonomous human dignity in favor of behavioral technology.'
      }
    ],
    sepSlug: 'behaviorism',
    externalRefs: { sep: 'behaviorism', wikipedia: 'B._F._Skinner' },
    importanceScore: 94,
    imageUrl: '/portraits/b-f-skinner.jpg'
  },
  {
    id: 'jean-piaget',
    name: 'Jean Piaget',
    birthYear: 1896,
    deathYear: 1980,
    eraId: 'twentieth-century',
    traditionId: 'genetic-epistemology',
    domains: ['psychology', 'philosophy'],
    primaryDomain: 'psychology',
    shortBio: 'Swiss psychologist and philosopher of knowledge who pioneered genetic epistemology; formulated the developmental stages of cognitive schemas in children.',
    centralQuestion: 'How does the child construct mental models of reality, space, causality, and logical operations through assimilation and accommodation?',
    keyWorks: [
      {
        title: 'The Origins of Intelligence in Children',
        year: '1952 CE',
        url: 'https://en.wikipedia.org/wiki/Jean_Piaget',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Jean_Piaget',
        description: 'Detailed analysis of sensorimotor intelligence and early childhood cognitive structures.'
      },
      {
        title: 'Genetic Epistemology',
        year: '1970 CE',
        url: 'https://en.wikipedia.org/wiki/Genetic_epistemology',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Genetic_epistemology',
        description: 'Philosophical synthesis of how scientific reasoning develops biologically.'
      }
    ],
    sepSlug: 'piaget',
    externalRefs: { sep: 'piaget', wikipedia: 'Jean_Piaget' },
    importanceScore: 93,
    imageUrl: '/portraits/jean-piaget.jpg'
  },
  {
    id: 'lev-vygotsky',
    name: 'Lev Vygotsky',
    birthYear: 1896,
    deathYear: 1934,
    eraId: 'twentieth-century',
    traditionId: 'genetic-epistemology',
    domains: ['psychology', 'sociology'],
    primaryDomain: 'psychology',
    shortBio: 'Soviet psychologist who founded cultural-historical psychology; formulated the zone of proximal development and the social origin of inner speech and thought.',
    centralQuestion: 'How do cultural tools, language mediation, and social interaction internalize into higher psychological functions?',
    keyWorks: [
      {
        title: 'Thought and Language',
        year: '1934 CE',
        url: 'https://en.wikipedia.org/wiki/Thought_and_Language',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Thought_and_Language',
        description: 'Landmark investigation into the dialectical relationship of speech and cognition.'
      },
      {
        title: 'Mind in Society',
        year: '1978 CE',
        url: 'https://en.wikipedia.org/wiki/Lev_Vygotsky',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Lev_Vygotsky',
        description: 'Introduces the zone of proximal development and cultural tool mediation.'
      }
    ],
    sepSlug: 'vygotsky',
    externalRefs: { sep: 'vygotsky', wikipedia: 'Lev_Vygotsky' },
    importanceScore: 90,
    imageUrl: '/portraits/lev-vygotsky.jpg'
  },
  {
    id: 'noam-chomsky',
    name: 'Noam Chomsky',
    birthYear: 1928,
    deathYear: undefined,
    eraId: 'contemporary',
    traditionId: 'cognitive-revolution',
    domains: ['philosophy', 'psychology'],
    primaryDomain: 'psychology',
    shortBio: 'Linguist, cognitive scientist, and philosopher; sparked the Cognitive Revolution with his critique of Skinnerian behaviorism and his theory of universal innate grammar.',
    centralQuestion: 'What innate biological structures of the human mind make the rapid and creative acquisition of language possible from impoverished sensory input?',
    keyWorks: [
      {
        title: 'Syntactic Structures',
        year: '1957 CE',
        url: 'https://en.wikipedia.org/wiki/Syntactic_Structures',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Syntactic_Structures',
        description: 'Revolutionized theoretical linguistics with transformational generative grammar.'
      },
      {
        title: 'Review of B. F. Skinner\'s Verbal Behavior',
        year: '1959 CE',
        url: 'https://en.wikipedia.org/wiki/A_Review_of_B._F._Skinner%27s_Verbal_Behavior',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/A_Review_of_B._F._Skinner%27s_Verbal_Behavior',
        description: 'Decisive critique initiating the Cognitive Revolution.'
      },
      {
        title: 'Language and Mind',
        year: '1968 CE',
        url: 'https://en.wikipedia.org/wiki/Language_and_Mind',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Language_and_Mind',
        description: 'Connects linguistic competence to philosophical rationalism and innate mental architecture.'
      }
    ],
    sepSlug: 'chomsky',
    externalRefs: { sep: 'chomsky', wikipedia: 'Noam_Chomsky' },
    importanceScore: 96,
    imageUrl: '/portraits/noam-chomsky.jpg'
  },
  {
    id: 'carl-rogers',
    name: 'Carl Rogers',
    birthYear: 1902,
    deathYear: 1987,
    eraId: 'twentieth-century',
    traditionId: 'humanistic-psychology',
    domains: ['psychology'],
    primaryDomain: 'psychology',
    shortBio: 'American psychologist and founder of person-centered humanistic therapy; highlighted unconditional positive regard, empathy, and the self-actualizing tendency.',
    centralQuestion: 'Under what interpersonal conditions does a person\'s organic drive toward self-actualization and personal growth naturally flourish?',
    keyWorks: [
      {
        title: 'Client-Centered Therapy',
        year: '1951 CE',
        url: 'https://en.wikipedia.org/wiki/Person-centered_therapy',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Person-centered_therapy',
        description: 'Establishes the non-directive, empathic therapeutic relationship.'
      },
      {
        title: 'On Becoming a Person',
        year: '1961 CE',
        url: 'https://en.wikipedia.org/wiki/On_Becoming_a_Person',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/On_Becoming_a_Person',
        description: 'Classic articulation of humanistic psychology and the fully functioning person.'
      }
    ],
    sepSlug: 'phenomenology',
    externalRefs: { sep: 'phenomenology', wikipedia: 'Carl_Rogers' },
    importanceScore: 89,
    imageUrl: '/portraits/carl-rogers.jpg'
  },
  {
    id: 'viktor-frankl',
    name: 'Viktor Frankl',
    birthYear: 1905,
    deathYear: 1997,
    eraId: 'twentieth-century',
    traditionId: 'humanistic-psychology',
    domains: ['psychology', 'philosophy'],
    primaryDomain: 'psychology',
    shortBio: 'Austrian neurologist, psychiatrist, and Holocaust survivor; founded logotherapy rooted in the human will to meaning and spiritual resilience.',
    centralQuestion: 'How can human beings discover meaning and retain spiritual freedom even amid unavoidable suffering and existential despair?',
    keyWorks: [
      {
        title: 'Man\'s Search for Meaning',
        year: '1946 CE',
        url: 'https://en.wikipedia.org/wiki/Man%27s_Search_for_Meaning',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Man%27s_Search_for_Meaning',
        description: 'Chronicles survival in concentration camps and formulates logotherapy.'
      },
      {
        title: 'The Doctor and the Soul',
        year: '1955 CE',
        url: 'https://en.wikipedia.org/wiki/The_Doctor_and_the_Soul',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Doctor_and_the_Soul',
        description: 'Comprehensive philosophical exposition of existential psychotherapy.'
      }
    ],
    sepSlug: 'existentialism',
    externalRefs: { sep: 'existentialism', wikipedia: 'Viktor_Frankl' },
    importanceScore: 91,
    imageUrl: '/portraits/viktor-frankl.jpg'
  },
  {
    id: 'daniel-kahneman',
    name: 'Daniel Kahneman',
    birthYear: 1934,
    deathYear: 2024,
    eraId: 'contemporary',
    traditionId: 'behavioral-economics',
    domains: ['psychology', 'philosophy'],
    primaryDomain: 'psychology',
    shortBio: 'Nobel laureate psychologist who integrated psychological insights into economic science; demonstrated systematic human cognitive biases, heuristics, and prospect theory.',
    centralQuestion: 'How do fast, intuitive heuristics (System 1) and deliberate reasoning (System 2) systematically diverge from normative rationality?',
    keyWorks: [
      {
        title: 'Judgment Under Uncertainty: Heuristics and Biases',
        year: '1982 CE',
        url: 'https://en.wikipedia.org/wiki/Judgment_under_Uncertainty:_Heuristics_and_Biases',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Judgment_under_Uncertainty:_Heuristics_and_Biases',
        description: 'Seminal collection mapping availability, representativeness, and anchoring heuristics.'
      },
      {
        title: 'Thinking, Fast and Slow',
        year: '2011 CE',
        url: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow',
        description: 'Comprehensive synthesis of two-system cognitive architecture and decision theory.'
      }
    ],
    sepSlug: 'rationality-normative-utility',
    externalRefs: { sep: 'rationality-normative-utility', wikipedia: 'Daniel_Kahneman' },
    importanceScore: 94,
    imageUrl: '/portraits/daniel-kahneman.jpg'
  },

  // Sociology Thinkers
  {
    id: 'auguste-comte',
    name: 'Auguste Comte',
    birthYear: 1798,
    deathYear: 1857,
    eraId: 'nineteenth-century',
    traditionId: 'positivism-sociology',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'French philosopher who coined the term \'sociology\' and established positivism; proposed the Law of the Three Stages of intellectual development.',
    centralQuestion: 'What immutable scientific laws govern social statics and social dynamics across historical epochs?',
    keyWorks: [
      {
        title: 'The Course in Positive Philosophy',
        year: '1830 CE',
        url: 'https://en.wikipedia.org/wiki/The_Course_in_Positive_Philosophy',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Course_in_Positive_Philosophy',
        description: 'Foundational treatise articulating the positive hierarchy of sciences and sociology.'
      },
      {
        title: 'A General View of Positivism',
        year: '1848 CE',
        url: 'https://en.wikipedia.org/wiki/Auguste_Comte',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Auguste_Comte',
        description: 'Formulates moral reorganization of society around empirical scientific observation.'
      }
    ],
    sepSlug: 'comte',
    externalRefs: { sep: 'comte', wikipedia: 'Auguste_Comte' },
    importanceScore: 93,
    imageUrl: '/portraits/auguste-comte.jpg'
  },
  {
    id: 'emile-durkheim',
    name: 'Émile Durkheim',
    birthYear: 1858,
    deathYear: 1917,
    eraId: 'nineteenth-century',
    traditionId: 'structural-functionalism',
    domains: ['sociology'],
    primaryDomain: 'sociology',
    shortBio: 'Principal architect of modern social science and academic sociology; established social facts as sui generis realities and investigated mechanical/organic solidarity and anomie.',
    centralQuestion: 'How do external, coercive social facts and collective moral conscience maintain societal integration in an individualistic modern world?',
    keyWorks: [
      {
        title: 'The Division of Labour in Society',
        year: '1893 CE',
        url: 'https://en.wikipedia.org/wiki/The_Division_of_Labour_in_Society',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Division_of_Labour_in_Society',
        description: 'Contrast between mechanical solidarity and modern organic division of labor.'
      },
      {
        title: 'The Rules of Sociological Method',
        year: '1895 CE',
        url: 'https://en.wikipedia.org/wiki/The_Rules_of_Sociological_Method',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Rules_of_Sociological_Method',
        description: 'Defines sociological methodology: treat social facts as things.'
      },
      {
        title: 'Suicide: A Study in Sociology',
        year: '1897 CE',
        url: 'https://en.wikipedia.org/wiki/Suicide_(Durkheim_book)',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Suicide_(Durkheim_book)',
        description: 'Pioneering statistical study showing social integration rates govern individual suicide.'
      }
    ],
    sepSlug: 'durkheim',
    externalRefs: { sep: 'durkheim', wikipedia: 'Émile_Durkheim' },
    importanceScore: 97,
    imageUrl: '/portraits/emile-durkheim.jpg'
  },
  {
    id: 'max-weber',
    name: 'Max Weber',
    birthYear: 1864,
    deathYear: 1920,
    eraId: 'twentieth-century',
    traditionId: 'interpretive-sociology',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'German sociologist and political economist; formulated interpretive sociology (Verstehen), the Protestant Ethic thesis, ideal types, and the \'iron cage\' of rationalization.',
    centralQuestion: 'How did Western rationalization, religious asceticism, and bureaucratic disenchantment trap modern humanity inside an iron cage of formal order?',
    keyWorks: [
      {
        title: 'The Protestant Ethic and the Spirit of Capitalism',
        year: '1905 CE',
        url: 'https://en.wikipedia.org/wiki/The_Protestant_Ethic_and_the_Spirit_of_Capitalism',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Protestant_Ethic_and_the_Spirit_of_Capitalism',
        description: 'Seminal thesis connecting Calvinist inner-worldly asceticism to capitalist rational enterprise.'
      },
      {
        title: 'Economy and Society',
        year: '1922 CE',
        url: 'https://en.wikipedia.org/wiki/Economy_and_Society',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Economy_and_Society',
        description: 'Monumental sociological treatise covering types of authority, law, religion, and bureaucracy.'
      }
    ],
    sepSlug: 'weber',
    externalRefs: { sep: 'weber', wikipedia: 'Max_Weber' },
    importanceScore: 98,
    imageUrl: '/portraits/max-weber.jpg'
  },
  {
    id: 'georg-simmel',
    name: 'Georg Simmel',
    birthYear: 1858,
    deathYear: 1918,
    eraId: 'nineteenth-century',
    traditionId: 'formal-sociology',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'German sociologist and neo-Kantian philosopher; pioneered formal sociology, social geometry (dyads, triads), analysis of the stranger, and the psychology of the metropolis.',
    centralQuestion: 'How does the intensification of nervous stimulation in modern metropolitan money economies transform the individual\'s inner mental life?',
    keyWorks: [
      {
        title: 'The Philosophy of Money',
        year: '1900 CE',
        url: 'https://en.wikipedia.org/wiki/The_Philosophy_of_Money',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Philosophy_of_Money',
        description: 'Philosophical and sociological analysis of economic exchange and alienation.'
      },
      {
        title: 'The Metropolis and Mental Life',
        year: '1903 CE',
        url: 'https://en.wikipedia.org/wiki/The_Metropolis_and_Mental_Life',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Metropolis_and_Mental_Life',
        description: 'Classic essay on urban blase attitude and sensory overload in modern cities.'
      }
    ],
    sepSlug: 'simmel',
    externalRefs: { sep: 'simmel', wikipedia: 'Georg_Simmel' },
    importanceScore: 91,
    imageUrl: '/portraits/georg-simmel.jpg'
  },
  {
    id: 'w-e-b-du-bois',
    name: 'W.E.B. Du Bois',
    birthYear: 1868,
    deathYear: 1963,
    eraId: 'twentieth-century',
    traditionId: 'critical-race-sociology',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'American sociologist, historian, and civil rights leader; pioneered empirical urban sociology, the color line problem, and the concept of double consciousness.',
    centralQuestion: 'What does it mean to gaze at one\'s soul through the veil of a world that looks on in amused contempt and pity?',
    keyWorks: [
      {
        title: 'The Philadelphia Negro',
        year: '1899 CE',
        url: 'https://en.wikipedia.org/wiki/The_Philadelphia_Negro',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Philadelphia_Negro',
        description: 'First scientific empirical sociological case study of an African American urban community.'
      },
      {
        title: 'The Souls of Black Folk',
        year: '1903 CE',
        url: 'https://en.wikipedia.org/wiki/The_Souls_of_Black_Folk',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Souls_of_Black_Folk',
        description: 'Seminal essays introducing the veil and double consciousness in American racial life.'
      }
    ],
    sepSlug: 'dubois',
    externalRefs: { sep: 'dubois', wikipedia: 'W._E._B._Du_Bois' },
    importanceScore: 95,
    imageUrl: '/portraits/w-e-b-du-bois.jpg'
  },
  {
    id: 'george-h-mead',
    name: 'George Herbert Mead',
    birthYear: 1863,
    deathYear: 1931,
    eraId: 'twentieth-century',
    traditionId: 'symbolic-interactionism',
    domains: ['sociology', 'psychology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'American philosopher and social psychologist; father of symbolic interactionism; theorized the social emergence of the \'I\' and the \'Me\' through role-taking.',
    centralQuestion: 'How does individual self-consciousness emerge out of social communication and language gestures in the community?',
    keyWorks: [
      {
        title: 'Mind, Self, and Society',
        year: '1934 CE',
        url: 'https://en.wikipedia.org/wiki/Mind,_Self,_and_Society',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Mind,_Self,_and_Society',
        description: 'Foundational text of symbolic interactionism, role taking, and the generalized other.'
      }
    ],
    sepSlug: 'mead-gh',
    externalRefs: { sep: 'mead-gh', wikipedia: 'George_Herbert_Mead' },
    importanceScore: 92,
    imageUrl: '/portraits/george-h-mead.jpg'
  },
  {
    id: 'talcott-parsons',
    name: 'Talcott Parsons',
    birthYear: 1902,
    deathYear: 1979,
    eraId: 'twentieth-century',
    traditionId: 'structural-functionalism',
    domains: ['sociology'],
    primaryDomain: 'sociology',
    shortBio: 'American sociologist who synthesized Weber, Durkheim, and Pareto into the Action Frame of Reference and the grand AGIL structural-functionalist system.',
    centralQuestion: 'What functional prerequisites must a social action system satisfy to maintain equilibrium and institutional order?',
    keyWorks: [
      {
        title: 'The Structure of Social Action',
        year: '1937 CE',
        url: 'https://en.wikipedia.org/wiki/The_Structure_of_Social_Action',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Structure_of_Social_Action',
        description: 'Major synthesis of classical European sociology establishing structural functionalism.'
      },
      {
        title: 'The Social System',
        year: '1951 CE',
        url: 'https://en.wikipedia.org/wiki/Talcott_Parsons',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Talcott_Parsons',
        description: 'Articulates the comprehensive functional requirements of social equilibrium.'
      }
    ],
    sepSlug: 'functionalism',
    externalRefs: { sep: 'functionalism', wikipedia: 'Talcott_Parsons' },
    importanceScore: 90,
    imageUrl: '/portraits/talcott-parsons.jpg'
  },
  {
    id: 'erving-goffman',
    name: 'Erving Goffman',
    birthYear: 1922,
    deathYear: 1982,
    eraId: 'twentieth-century',
    traditionId: 'symbolic-interactionism',
    domains: ['sociology', 'psychology'],
    primaryDomain: 'sociology',
    shortBio: 'Canadian-American sociologist who developed dramaturgical analysis; analyzed social life as theatrical performances, impression management, stigma, and total institutions.',
    centralQuestion: 'How do human actors stage manage impressions, navigate social rituals, and protect face in the micro-encounters of everyday life?',
    keyWorks: [
      {
        title: 'The Presentation of Self in Everyday Life',
        year: '1956 CE',
        url: 'https://en.wikipedia.org/wiki/The_Presentation_of_Self_in_Everyday_Life',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Presentation_of_Self_in_Everyday_Life',
        description: 'Groundbreaking dramaturgical analysis of social interaction as theatrical performance.'
      },
      {
        title: 'Asylums',
        year: '1961 CE',
        url: 'https://en.wikipedia.org/wiki/Asylums_(book)',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Asylums_(book)',
        description: 'Classic sociological analysis of total institutions and mortification of the self.'
      },
      {
        title: 'Stigma',
        year: '1963 CE',
        url: 'https://en.wikipedia.org/wiki/Stigma_(book)',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Stigma_(book)',
        description: 'Exploration of spoiled identity and management of social information.'
      }
    ],
    sepSlug: 'identity-politics',
    externalRefs: { sep: 'identity-politics', wikipedia: 'Erving_Goffman' },
    importanceScore: 94,
    imageUrl: '/portraits/erving-goffman.jpg'
  },
  {
    id: 'pierre-bourdieu',
    name: 'Pierre Bourdieu',
    birthYear: 1930,
    deathYear: 2002,
    eraId: 'contemporary',
    traditionId: 'genetic-structuralism',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'French sociologist and public intellectual; formulated habitus, cultural capital, social fields, and symbolic violence to explain how social hierarchies reproduce.',
    centralQuestion: 'How do unconscious bodily dispositions (habitus) and unequal cultural capital reproduce class domination without conscious coercion?',
    keyWorks: [
      {
        title: 'Outline of a Theory of Practice',
        year: '1972 CE',
        url: 'https://en.wikipedia.org/wiki/Pierre_Bourdieu',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Pierre_Bourdieu',
        description: 'Develops habitus and practical sense in opposition to both objectivism and subjectivism.'
      },
      {
        title: 'Distinction: A Social Critique of the Judgement of Taste',
        year: '1979 CE',
        url: 'https://en.wikipedia.org/wiki/Distinction_(book)',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Distinction_(book)',
        description: 'Voted one of the 20th century\'s most important sociological works on cultural taste.'
      }
    ],
    sepSlug: 'bourdieu',
    externalRefs: { sep: 'bourdieu', wikipedia: 'Pierre_Bourdieu' },
    importanceScore: 95,
    imageUrl: '/portraits/pierre-bourdieu.jpg'
  },
  {
    id: 'anthony-giddens',
    name: 'Anthony Giddens',
    birthYear: 1938,
    deathYear: undefined,
    eraId: 'contemporary',
    traditionId: 'contemporary-sociology',
    domains: ['sociology'],
    primaryDomain: 'sociology',
    shortBio: 'British sociologist known for his theory of structuration reconciling agency and structure, the Third Way political philosophy, and analysis of reflexive modernity.',
    centralQuestion: 'How do human agents simultaneously produce, reproduce, and transform the very social structures that constrain them?',
    keyWorks: [
      {
        title: 'The Constitution of Society',
        year: '1984 CE',
        url: 'https://en.wikipedia.org/wiki/The_Constitution_of_Society',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Constitution_of_Society',
        description: 'Comprehensive statement of structuration theory and the duality of structure.'
      },
      {
        title: 'The Consequences of Modernity',
        year: '1990 CE',
        url: 'https://en.wikipedia.org/wiki/The_Consequences_of_Modernity',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/The_Consequences_of_Modernity',
        description: 'Analyzes high modernity as a runaway engine of disembedding mechanisms and risk.'
      }
    ],
    sepSlug: 'critical-theory',
    externalRefs: { sep: 'critical-theory', wikipedia: 'Anthony_Giddens' },
    importanceScore: 89,
    imageUrl: '/portraits/anthony-giddens.jpg'
  },
  {
    id: 'zygmunt-bauman',
    name: 'Zygmunt Bauman',
    birthYear: 1925,
    deathYear: 2017,
    eraId: 'contemporary',
    traditionId: 'contemporary-sociology',
    domains: ['sociology', 'philosophy'],
    primaryDomain: 'sociology',
    shortBio: 'Polish-British sociologist and philosopher; theorized \'liquid modernity\' where human bonds, institutions, and identities dissolve into precarious and fleeting forms.',
    centralQuestion: 'How does the fluid, precarious nature of consumerist liquid modernity dissolve lasting human solidarity and moral commitment?',
    keyWorks: [
      {
        title: 'Modernity and the Holocaust',
        year: '1989 CE',
        url: 'https://en.wikipedia.org/wiki/Modernity_and_the_Holocaust',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Modernity_and_the_Holocaust',
        description: 'Argues the Holocaust was not a breakdown of modernity, but a product of bureaucratic rationalization.'
      },
      {
        title: 'Liquid Modernity',
        year: '2000 CE',
        url: 'https://en.wikipedia.org/wiki/Zygmunt_Bauman',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Zygmunt_Bauman',
        description: 'Diagnoses the shift from hardware-solid modernity to software-liquid consumption.'
      }
    ],
    sepSlug: 'postmodernism',
    externalRefs: { sep: 'postmodernism', wikipedia: 'Zygmunt_Bauman' },
    importanceScore: 91,
    imageUrl: '/portraits/zygmunt-bauman.jpg'
  },
  {
    id: 'ulrich-beck',
    name: 'Ulrich Beck',
    birthYear: 1944,
    deathYear: 2015,
    eraId: 'contemporary',
    traditionId: 'contemporary-sociology',
    domains: ['sociology'],
    primaryDomain: 'sociology',
    shortBio: 'German sociologist who coined the concept of the \'Risk Society\'; analyzed how modern industrial modernization manufactures unprecedented global hazards and reflexive anxieties.',
    centralQuestion: 'How does modern society manage the catastrophic technological, ecological, and economic risks generated by its own triumphant modernization?',
    keyWorks: [
      {
        title: 'Risk Society: Towards a New Modernity',
        year: '1986 CE',
        url: 'https://en.wikipedia.org/wiki/Risk_Society',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Risk_Society',
        description: 'Landmark sociological diagnosis of how wealth distribution shifts to risk distribution.'
      },
      {
        title: 'World at Risk',
        year: '2007 CE',
        url: 'https://en.wikipedia.org/wiki/Ulrich_Beck',
        wikipediaUrl: 'https://en.wikipedia.org/wiki/Ulrich_Beck',
        description: 'Extends risk society theory to global terrorism, financial crises, and climate breakdown.'
      }
    ],
    sepSlug: 'risk',
    externalRefs: { sep: 'risk', wikipedia: 'Ulrich_Beck' },
    importanceScore: 90,
    imageUrl: '/portraits/ulrich-beck.jpg'
  }
];

const CONCEPTS = [
  // Psychology Concepts
  {
    id: 'unconscious-psychoanalysis',
    title: 'Dynamic Unconscious',
    branch: 'psychoanalytic',
    eraId: 'twentieth-century',
    introducedBy: 'sigmund-freud',
    domainId: 'psychology',
    summary: 'The realm of repressed instinctual drives, memories, and desires inaccessible to conscious awareness yet dictating human thoughts, neuroses, and creative sublimations.',
    sepSlug: 'freud'
  },
  {
    id: 'collective-unconscious',
    title: 'Collective Unconscious & Archetypes',
    branch: 'psychoanalytic',
    eraId: 'twentieth-century',
    introducedBy: 'carl-jung',
    domainId: 'psychology',
    summary: 'A layer of the unconscious mind shared among all human beings, consisting of universal instinctual symbols, mythic motifs, and ancestral psychological archetypes.',
    sepSlug: 'jung'
  },
  {
    id: 'classical-conditioning',
    title: 'Classical Conditioning',
    branch: 'behavioral',
    eraId: 'nineteenth-century',
    introducedBy: 'ivan-pavlov',
    domainId: 'psychology',
    summary: 'A learning process in which a biologically potent stimulus is paired with a previously neutral stimulus to elicit an involuntary conditioned physiological response.',
    sepSlug: 'behaviorism'
  },
  {
    id: 'operant-conditioning',
    title: 'Operant Conditioning & Schedules',
    branch: 'behavioral',
    eraId: 'twentieth-century',
    introducedBy: 'b-f-skinner',
    domainId: 'psychology',
    summary: 'The systematic modification of voluntary behavior through schedules of positive reinforcement, negative reinforcement, and extinction.',
    sepSlug: 'behaviorism'
  },
  {
    id: 'genetic-epistemology',
    title: 'Cognitive Schemas & Equilibration',
    branch: 'cognitive',
    eraId: 'twentieth-century',
    introducedBy: 'jean-piaget',
    domainId: 'psychology',
    summary: 'The developmental construction of mental schemas through assimilation, accommodation, and cognitive stages from sensorimotor to formal operational reasoning.',
    sepSlug: 'piaget'
  },
  {
    id: 'zone-of-proximal-development',
    title: 'Zone of Proximal Development',
    branch: 'cognitive',
    eraId: 'twentieth-century',
    introducedBy: 'lev-vygotsky',
    domainId: 'psychology',
    summary: 'The psychological distance between what a learner can achieve independently and what they can accomplish under adult guidance or peer collaboration.',
    sepSlug: 'vygotsky'
  },
  {
    id: 'generative-grammar',
    title: 'Innate Generative Grammar',
    branch: 'cognitive',
    eraId: 'contemporary',
    introducedBy: 'noam-chomsky',
    domainId: 'psychology',
    summary: 'The biological language acquisition faculty in the human brain that generates infinite linguistic expressions using innate, recursive syntactic rules.',
    sepSlug: 'chomsky'
  },
  {
    id: 'system-1-and-system-2',
    title: 'System 1 & System 2 Heuristics',
    branch: 'cognitive',
    eraId: 'contemporary',
    introducedBy: 'daniel-kahneman',
    domainId: 'psychology',
    summary: 'A dual-process psychological model distinguishing fast, automatic, emotional heuristics (System 1) from slow, effortful, deliberative calculation (System 2).',
    sepSlug: 'rationality-normative-utility'
  },

  // Sociology Concepts
  {
    id: 'law-of-three-stages',
    title: 'Law of the Three Stages',
    branch: 'social-theory',
    eraId: 'nineteenth-century',
    introducedBy: 'auguste-comte',
    domainId: 'sociology',
    summary: 'Comtean developmental law holding that human knowledge and society progress progressively through theological, metaphysical, and positive scientific stages.',
    sepSlug: 'comte'
  },
  {
    id: 'social-facts',
    title: 'Social Facts (Sui Generis)',
    branch: 'structural-functionalism',
    eraId: 'nineteenth-century',
    introducedBy: 'emile-durkheim',
    domainId: 'sociology',
    summary: 'Ways of acting, thinking, and feeling that exist external to the individual, endowed with coercive power to control human behavior independent of individual will.',
    sepSlug: 'durkheim'
  },
  {
    id: 'iron-cage-rationalization',
    title: 'The Iron Cage of Rationality',
    branch: 'social-theory',
    eraId: 'twentieth-century',
    introducedBy: 'max-weber',
    domainId: 'sociology',
    summary: 'The bureaucratization and technocratic rationalization of modern social life, trapping individuals in a rigid, disenchanted system of economic and legal efficiency.',
    sepSlug: 'weber'
  },
  {
    id: 'the-stranger-simmel',
    title: 'The Sociological Stranger',
    branch: 'social-theory',
    eraId: 'nineteenth-century',
    introducedBy: 'georg-simmel',
    domainId: 'sociology',
    summary: 'A unique social position defined by simultaneous near-ness and far-ness: an organic member of the group who remains spatially present yet structurally detached.',
    sepSlug: 'simmel'
  },
  {
    id: 'double-consciousness',
    title: 'Double Consciousness & The Veil',
    branch: 'critical-sociology',
    eraId: 'twentieth-century',
    introducedBy: 'w-e-b-du-bois',
    domainId: 'sociology',
    summary: 'The psychological sensation of constantly viewing one\'s self through the eyes of an antagonistic, racist society; living divided between two warring ideals.',
    sepSlug: 'dubois'
  },
  {
    id: 'generalized-other',
    title: 'The Generalized Other',
    branch: 'symbolic-interactionism',
    eraId: 'twentieth-century',
    introducedBy: 'george-h-mead',
    domainId: 'sociology',
    summary: 'The internalized collective attitude and normative standards of the broader social community, enabling reflective self-consciousness and coordinated moral action.',
    sepSlug: 'mead-gh'
  },
  {
    id: 'dramaturgy-goffman',
    title: 'Dramaturgical Self & Face-Work',
    branch: 'symbolic-interactionism',
    eraId: 'twentieth-century',
    introducedBy: 'erving-goffman',
    domainId: 'sociology',
    summary: 'The sociological perspective viewing social interaction as theatrical performance, complete with frontstage performances, backstage preparations, and face-saving rituals.',
    sepSlug: 'identity-politics'
  },
  {
    id: 'habitus-bourdieu',
    title: 'Habitus & Cultural Capital',
    branch: 'social-theory',
    eraId: 'contemporary',
    introducedBy: 'pierre-bourdieu',
    domainId: 'sociology',
    summary: 'Embodied, durable cognitive structures and bodily dispositions shaped by social class background that unconsciously reproduce social hierarchies and taste distinctions.',
    sepSlug: 'bourdieu'
  },
  {
    id: 'liquid-modernity',
    title: 'Liquid Modernity',
    branch: 'social-theory',
    eraId: 'contemporary',
    introducedBy: 'zygmunt-bauman',
    domainId: 'sociology',
    summary: 'The condition of contemporary late modernity where long-term social institutions, employment bonds, and personal relationships melt into temporary, consumerist arrangements.',
    sepSlug: 'postmodernism'
  },
  {
    id: 'risk-society',
    title: 'The Global Risk Society',
    branch: 'social-theory',
    eraId: 'contemporary',
    introducedBy: 'ulrich-beck',
    domainId: 'sociology',
    summary: 'A stage of reflexive modernization where social and political life revolves around distributing and mitigating manufactured, borderless ecological and technological hazards.',
    sepSlug: 'risk'
  }
];

// Edges grouped by new thinker / concept
const EDGES = {
  'wilhelm-wundt': [
    { source: 'gottfried-leibniz', target: 'wilhelm-wundt', type: 'DEVELOPED', label: 'Developed Leibnizian active apperception into experimental introspective psychology' },
    { source: 'immanuel-kant', target: 'wilhelm-wundt', type: 'DEVELOPED', label: 'Grounded psychological voluntarism in Kantian transcendental forms of consciousness' },
    { source: 'wilhelm-wundt', target: 'william-james', type: 'CRITIQUED', label: 'James rejected Wundtian structural elements in favor of a continuous stream of consciousness' },
    { source: 'wilhelm-wundt', target: 'jean-piaget', type: 'DEVELOPED', label: 'Transmitted experimental laboratory inquiry into cognitive operations' }
  ],
  'sigmund-freud': [
    { source: 'arthur-schopenhauer', target: 'sigmund-freud', type: 'INFLUENCED', label: 'Schopenhauer\'s blind, striving Will provided the philosophical blueprint for the unconscious id' },
    { source: 'friedrich-nietzsche', target: 'sigmund-freud', type: 'INFLUENCED', label: 'Nietzschean insights into repression, sublimation, and unconscious drives directly shaped psychoanalysis' },
    { source: 'sigmund-freud', target: 'carl-jung', type: 'INFLUENCED', label: 'Freud mentored Jung and established psychoanalytic theory before their theoretical split' },
    { source: 'sigmund-freud', target: 'unconscious-psychoanalysis', type: 'DEVELOPED', label: 'Formulated the dynamic unconscious and structural model of id, ego, and super-ego' },
    { source: 'sigmund-freud', target: 'theodor-adorno', type: 'INFLUENCED', label: 'Freudian psychoanalysis formed the clinical bedrock for Frankfurt School authoritarian personality research' },
    { source: 'sigmund-freud', target: 'michel-foucault', type: 'CRITIQUED', label: 'Foucault dismantled the repressive hypothesis and psychoanalytic confession techniques in History of Sexuality' },
    { source: 'sigmund-freud', target: 'alenka-zupancic', type: 'DEVELOPED', label: 'Lacanian and Freudian psychoanalysis applied to philosophical ethics and comedic aesthetics' }
  ],
  'carl-jung': [
    { source: 'carl-jung', target: 'collective-unconscious', type: 'DEVELOPED', label: 'Theorized the transpersonal storehouse of universal archetypes and mythic symbols' },
    { source: 'carl-jung', target: 'carl-rogers', type: 'DEVELOPED', label: 'Influenced humanistic concepts of self-realization, shadow work, and personal integration' }
  ],
  'ivan-pavlov': [
    { source: 'rene-descartes', target: 'ivan-pavlov', type: 'DEVELOPED', label: 'Materialized the Cartesian reflex arc into empirical neuro-physiological conditioning' },
    { source: 'ivan-pavlov', target: 'classical-conditioning', type: 'DEVELOPED', label: 'Formulated classical stimulus-response conditioning through salivary reflex experiments' },
    { source: 'ivan-pavlov', target: 'john-b-watson', type: 'INFLUENCED', label: 'Provided the physiological and experimental foundation for American behaviorism' }
  ],
  'john-b-watson': [
    { source: 'john-locke', target: 'john-b-watson', type: 'DEVELOPED', label: 'Radicalized the tabula rasa empirical postulate into observable behavioral conditioning' },
    { source: 'john-b-watson', target: 'b-f-skinner', type: 'DEVELOPED', label: 'Watson\'s methodological behaviorism paved the way for Skinner\'s operant behaviorism' }
  ],
  'b-f-skinner': [
    { source: 'b-f-skinner', target: 'operant-conditioning', type: 'DEVELOPED', label: 'Formalized operant reinforcement schedules and behavioral technology' },
    { source: 'b-f-skinner', target: 'noam-chomsky', type: 'CRITIQUED', label: 'Chomsky\'s 1959 review of Verbal Behavior dismantled radical behaviorist accounts of language' }
  ],
  'jean-piaget': [
    { source: 'immanuel-kant', target: 'jean-piaget', type: 'DEVELOPED', label: 'Kantian categories of space, time, and causality operationalized into developmental stages' },
    { source: 'jean-piaget', target: 'genetic-epistemology', type: 'DEVELOPED', label: 'Formulated the developmental construction of cognitive schemas from infancy to adulthood' },
    { source: 'jean-piaget', target: 'lev-vygotsky', type: 'CRITIQUED', label: 'Vygotsky challenged Piaget\'s individualist egocentric speech model with social mediation' }
  ],
  'lev-vygotsky': [
    { source: 'karl-marx', target: 'lev-vygotsky', type: 'DEVELOPED', label: 'Applied Marxist historical materialism to tool-mediated psychological development and cultural practice' },
    { source: 'lev-vygotsky', target: 'zone-of-proximal-development', type: 'DEVELOPED', label: 'Introduced scaffolding and the zone of proximal development in educational psychology' },
    { source: 'lev-vygotsky', target: 'george-h-mead', type: 'SYNTHESIZED', label: 'Converged on the social origin of thought and the internalization of linguistic gestures' }
  ],
  'noam-chomsky': [
    { source: 'rene-descartes', target: 'noam-chomsky', type: 'DEVELOPED', label: 'Reconnected modern cognitive science with Cartesian rationalism and innate mental faculties' },
    { source: 'noam-chomsky', target: 'generative-grammar', type: 'DEVELOPED', label: 'Formulated universal generative grammar and recursive syntactic mental structures' },
    { source: 'noam-chomsky', target: 'daniel-kahneman', type: 'SYNTHESIZED', label: 'Contributed foundational cognitive architecture models to the Cognitive Revolution' }
  ],
  'carl-rogers': [
    { source: 'soren-kierkegaard', target: 'carl-rogers', type: 'INFLUENCED', label: 'Kierkegaard\'s phenomenology of authentic self-becoming inspired person-centered humanistic therapy' },
    { source: 'carl-rogers', target: 'viktor-frankl', type: 'SYNTHESIZED', label: 'Shared humanistic commitment to human agency, self-determination, and personal dignity' }
  ],
  'viktor-frankl': [
    { source: 'friedrich-nietzsche', target: 'viktor-frankl', type: 'INFLUENCED', label: 'Adopted Nietzsche\'s maxim: He who has a why to live can bear almost any how' },
    { source: 'martin-heidegger', target: 'viktor-frankl', type: 'SYNTHESIZED', label: 'Integrated existential Dasein and thrownness into clinical logotherapy' }
  ],
  'daniel-kahneman': [
    { source: 'david-hume', target: 'daniel-kahneman', type: 'DEVELOPED', label: 'Vindicated Humean skepticism regarding human inductive rationality through empirical heuristics' },
    { source: 'daniel-kahneman', target: 'system-1-and-system-2', type: 'DEVELOPED', label: 'Codified dual-process theory and cognitive heuristics in decision science' },
    { source: 'daniel-kahneman', target: 'nick-bostrom', type: 'INFLUENCED', label: 'Cognitive bias research informed probability calibration and existential risk methodology' }
  ],

  // Sociology Edges
  'auguste-comte': [
    { source: 'francis-bacon', target: 'auguste-comte', type: 'DEVELOPED', label: 'Applied Baconian scientific empiricism to the systemic study of human society' },
    { source: 'auguste-comte', target: 'law-of-three-stages', type: 'DEVELOPED', label: 'Formulated the theological, metaphysical, and positive stages of civilizational development' },
    { source: 'auguste-comte', target: 'john-stuart-mill', type: 'INFLUENCED', label: 'Mill engaged with and critiqued Comte\'s positivism in formulating his own sociological logic' },
    { source: 'auguste-comte', target: 'emile-durkheim', type: 'DEVELOPED', label: 'Durkheim transformed Comtean positivist sociology into institutional academic research' }
  ],
  'emile-durkheim': [
    { source: 'jean-jacques-rousseau', target: 'emile-durkheim', type: 'DEVELOPED', label: 'Rousseau\'s general will evolved into Durkheim\'s collective conscience and moral solidarity' },
    { source: 'emile-durkheim', target: 'social-facts', type: 'DEVELOPED', label: 'Defined sociology as the empirical study of external, coercive social facts' },
    { source: 'emile-durkheim', target: 'talcott-parsons', type: 'DEVELOPED', label: 'Formed the central theoretical pillar for Parsonian structural functionalism' }
  ],
  'max-weber': [
    { source: 'immanuel-kant', target: 'max-weber', type: 'DEVELOPED', label: 'Applied neo-Kantian methodological distinctions between natural sciences and cultural understanding' },
    { source: 'karl-marx', target: 'max-weber', type: 'CRITIQUED', label: 'Contested Marx\'s materialist determinism by demonstrating how religious ideas drive capitalist development' },
    { source: 'friedrich-nietzsche', target: 'max-weber', type: 'INFLUENCED', label: 'Nietzschean critique of asceticism and modern disenchantment deeply shaped Weberian rationalization' },
    { source: 'max-weber', target: 'iron-cage-rationalization', type: 'DEVELOPED', label: 'Articulated how bureaucratic rationalization imprisons modern society in an iron cage' },
    { source: 'max-weber', target: 'theodor-adorno', type: 'INFLUENCED', label: 'Weberian instrumental rationality merged with Marxist critique in Dialectic of Enlightenment' },
    { source: 'max-weber', target: 'jurgen-habermas', type: 'DEVELOPED', label: 'Habermas reconstructed Weberian rationalization theory in Theory of Communicative Action' }
  ],
  'georg-simmel': [
    { source: 'immanuel-kant', target: 'georg-simmel', type: 'DEVELOPED', label: 'Applied Kantian transcendental forms to the geometries of human sociation' },
    { source: 'georg-simmel', target: 'the-stranger-simmel', type: 'DEVELOPED', label: 'Formulated the sociological archetype of the stranger and spatial boundary mechanics' },
    { source: 'georg-simmel', target: 'george-h-mead', type: 'INFLUENCED', label: 'Simmel\'s interactionist sociology deeply influenced Mead and the Chicago School' },
    { source: 'georg-simmel', target: 'erving-goffman', type: 'DEVELOPED', label: 'Simmel\'s microsociological essays provided the direct inspiration for Goffman\'s interaction order' }
  ],
  'w-e-b-du-bois': [
    { source: 'william-james', target: 'w-e-b-du-bois', type: 'INFLUENCED', label: 'Studied under William James at Harvard, adopting pragmatic empirical methods and psychology of self' },
    { source: 'max-weber', target: 'w-e-b-du-bois', type: 'SYNTHESIZED', label: 'Weber celebrated Du Bois\'s empirical research and published his pioneering work on race in Germany' },
    { source: 'w-e-b-du-bois', target: 'double-consciousness', type: 'DEVELOPED', label: 'Formulated double consciousness as the internal psychic split of marginalized subjects' }
  ],
  'george-h-mead': [
    { source: 'william-james', target: 'george-h-mead', type: 'DEVELOPED', label: 'Transformed Jamesian pragmatism and stream of consciousness into social interactionist psychology' },
    { source: 'george-h-mead', target: 'generalized-other', type: 'DEVELOPED', label: 'Theorized how role-taking and the generalized other construct self-consciousness' },
    { source: 'george-h-mead', target: 'erving-goffman', type: 'DEVELOPED', label: 'Goffman developed Mead\'s social self into dramaturgical impression management' },
    { source: 'george-h-mead', target: 'jurgen-habermas', type: 'DEVELOPED', label: 'Habermas integrated Mead\'s communicative gestures into the theory of communicative action' }
  ],
  'talcott-parsons': [
    { source: 'max-weber', target: 'talcott-parsons', type: 'DEVELOPED', label: 'Parsons translated Weber into English and systematized the voluntaristic theory of action' },
    { source: 'talcott-parsons', target: 'anthony-giddens', type: 'CRITIQUED', label: 'Giddens formulated structuration theory specifically to overcome Parsons\' functionalist determinism' },
    { source: 'talcott-parsons', target: 'jurgen-habermas', type: 'SYNTHESIZED', label: 'Habermas synthesized Parsonian system equilibrium with phenomenological lifeworld theory' }
  ],
  'erving-goffman': [
    { source: 'erving-goffman', target: 'dramaturgy-goffman', type: 'DEVELOPED', label: 'Theorized social behavior through theatrical staging, frontstage performances, and face preservation' },
    { source: 'erving-goffman', target: 'pierre-bourdieu', type: 'SYNTHESIZED', label: 'Goffman\'s microsociological rituals complemented Bourdieu\'s embodied habitus' }
  ],
  'pierre-bourdieu': [
    { source: 'karl-marx', target: 'pierre-bourdieu', type: 'DEVELOPED', label: 'Expanded economic capital into cultural, social, and symbolic forms of capital' },
    { source: 'maurice-merleau-ponty', target: 'pierre-bourdieu', type: 'DEVELOPED', label: 'Merleau-Ponty\'s bodily intentionality provided the phenomenological grounding for habitus' },
    { source: 'pierre-bourdieu', target: 'habitus-bourdieu', type: 'DEVELOPED', label: 'Formulated habitus and social field theory to explain the reproduction of class hierarchy' },
    { source: 'pierre-bourdieu', target: 'michel-foucault', type: 'SYNTHESIZED', label: 'Shared deep critique of institutional disciplinary power, bodily norms, and symbolic domination' }
  ],
  'anthony-giddens': [
    { source: 'anthony-giddens', target: 'ulrich-beck', type: 'SYNTHESIZED', label: 'Collaborated on the sociological theory of reflexive modernization in contemporary risk society' }
  ],
  'zygmunt-bauman': [
    { source: 'theodor-adorno', target: 'zygmunt-bauman', type: 'INFLUENCED', label: 'Adorno\'s critique of bureaucratic instrumental rationality informed Modernity and the Holocaust' },
    { source: 'zygmunt-bauman', target: 'liquid-modernity', type: 'DEVELOPED', label: 'Diagnosed the liquefaction of modern institutions, employment securities, and human commitments' },
    { source: 'zygmunt-bauman', target: 'byung-chul-han', type: 'INFLUENCED', label: 'Bauman\'s analysis of liquid consumerism directly links to Han\'s burnout and achievement society' }
  ],
  'ulrich-beck': [
    { source: 'ulrich-beck', target: 'risk-society', type: 'DEVELOPED', label: 'Theorized how modernization reflexively produces catastrophic ecological and technological risks' },
    { source: 'ulrich-beck', target: 'nick-bostrom', type: 'SYNTHESIZED', label: 'Sociological risk theory connects directly to philosophical study of existential risk' }
  ]
};

// 1. Write Thinkers
console.log('Writing Thinkers...');
for (const thinker of THINKERS) {
  const filePath = path.join(PHILOSOPHERS_DIR, `${thinker.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(thinker, null, 2) + '\n', 'utf-8');
  console.log(`  + Wrote ${thinker.id}.json`);
}

// 2. Write Concepts
console.log('\nWriting Concepts...');
for (const concept of CONCEPTS) {
  const filePath = path.join(CONCEPTS_DIR, `${concept.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(concept, null, 2) + '\n', 'utf-8');
  console.log(`  + Wrote ${concept.id}.json`);
}

// 3. Write Edges
console.log('\nWriting Edges...');
for (const [key, edgeList] of Object.entries(EDGES)) {
  const normalizedEdges = edgeList.map((e) => ({
    ...e,
    strength: typeof e.strength === 'number' ? e.strength : 85,
  }));
  const filePath = path.join(EDGES_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(normalizedEdges, null, 2) + '\n', 'utf-8');
  console.log(`  + Wrote edges/${key}.json (${normalizedEdges.length} edges)`);
}

console.log('\n✅ Seed script execution complete.');
