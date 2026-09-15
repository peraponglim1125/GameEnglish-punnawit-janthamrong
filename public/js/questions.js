/**
 * ENGLISH QUEST: MASTERY & TRIVIA - QUESTION BANK WITH SPECIAL SECRET BONUS STAGES
 * 3 Difficulty Tiers + 3 Golden Secret Bonus Stages (ข้อพิเศษ)
 */

const QUESTION_BANK = {
    basic: {
        id: 'basic',
        name: 'Basic',
        badgeName: '🌱 Level 1: Novice Adventurer',
        icon: '🌱',
        badgeColor: '#10b981',
        description: 'Essential vocabulary, contextual riddles, compound words, and A1-A2 foundations.',
        stages: [
            {
                stage: 1,
                title: 'Stage 1: Context Clue',
                type: 'context_clue',
                prompt: 'A quiet building or room where collections of books, newspapers, and digital resources are kept for reading and borrowing:',
                display: 'L _ B R _ R Y',
                answer: 'LIBRARY',
                alternatives: ['library', 'a library'],
                audioText: 'Library',
                hint: 'Starts with letter L. A book lover\'s favorite sanctuary 📚',
                explanation: 'Answer: LIBRARY — Originates from the Latin word "liber" meaning book.'
            },
            {
                stage: 2,
                title: 'Stage 2: English Riddle',
                type: 'riddle',
                prompt: '"I have a face and two hands, but no arms or legs. I tell you the time. What am I?"',
                display: 'C L _ _ K',
                answer: 'CLOCK',
                alternatives: ['clock', 'a clock', 'watch'],
                audioText: 'Clock',
                hint: 'A timekeeping device commonly mounted on walls or desks ⏰',
                explanation: 'Answer: CLOCK — The "face" refers to the dial, and the "hands" are the rotating pointers.'
            },
            {
                stage: 3,
                title: 'Stage 3: Word Scramble',
                type: 'unscramble',
                prompt: 'Unscramble these letters to form an adjective describing severe weather with gusty winds and thunder:\n[ T S R O M Y ]',
                display: 'T S R O M Y  ➔  ?',
                answer: 'STORMY',
                alternatives: ['stormy'],
                audioText: 'Stormy',
                hint: 'Begins with the letter S, derived from the noun "Storm" ⛈️',
                explanation: 'Answer: STORMY (adj.) — Characterized by strong winds, rain, lightning, or rough seas.'
            },
            {
                stage: 4,
                title: 'Stage 4: Irregular Past Tense',
                type: 'grammar_verb',
                prompt: 'Complete the sentence with the past simple (V.2) form of the verb "BUY":\n"Last weekend, my brother ________ a brand new bicycle."',
                display: 'buy  ➔  [ B _ _ _ _ T ]',
                answer: 'BOUGHT',
                alternatives: ['bought'],
                audioText: 'Last weekend my brother bought a brand new bicycle',
                hint: 'Rhymes with "caught" and starts with B 🚲',
                explanation: 'Answer: BOUGHT — Irregular verb forms: Buy ➔ Bought ➔ Bought.'
            },
            {
                stage: 5,
                title: 'Stage 5: Antonym in Context',
                type: 'antonym',
                prompt: 'Supply the antonym (opposite word) of "DANGEROUS":\n"Wearing a helmet makes riding a motorcycle much more ________."',
                display: 'Opposite of Dangerous: [ S _ _ E ]',
                answer: 'SAFE',
                alternatives: ['safe', 'safer'],
                audioText: 'Safe',
                hint: 'A four-letter word meaning free from risk or harm 🦺',
                explanation: 'Answer: SAFE — Directly opposite to dangerous, hazardous, or perilous.'
            },
            {
                stage: 6,
                title: 'Stage 6: Preposition of Movement',
                type: 'preposition',
                prompt: 'Choose the preposition indicating movement from one side of an enclosed space to the other:\n"The express train is traveling ________ the mountain tunnel."',
                display: 'traveling [ t _ _ _ _ _ h ] the tunnel',
                answer: 'THROUGH',
                alternatives: ['through'],
                audioText: 'The express train is traveling through the mountain tunnel',
                hint: 'Begins with "thr..." — entering at one end and exiting at the other 🚇',
                explanation: 'Answer: THROUGH — Used for movement within 3D spaces like tunnels, pipes, or forests.'
            },
            {
                stage: 7,
                title: 'Stage 7: Compound Word Formation',
                type: 'compound_word',
                prompt: 'Combine the word "SUN" with an eye accessory to form a compound noun:\nSUN + ________ = Protective tinted eyewear',
                display: 'SUN + [ ? ] = Protective Eyewear',
                answer: 'GLASSES',
                alternatives: ['glasses', 'sunglasses'],
                audioText: 'Sunglasses',
                hint: 'Optical lenses worn in frames over the eyes 🕶️',
                explanation: 'Answer: GLASSES — Sun + Glasses = Sunglasses.'
            },
            {
                stage: 8,
                title: 'Stage 8: Profession Detective',
                type: 'profession',
                prompt: 'A qualified professional who designs buildings, bridges, and oversees architectural planning:',
                display: 'A R C H _ T _ C T',
                answer: 'ARCHITECT',
                alternatives: ['architect', 'an architect'],
                audioText: 'Architect',
                hint: 'A mastermind who drafts blueprints for skyscrapers 🏛️',
                explanation: 'Answer: ARCHITECT — From Greek "arkhitekton" meaning master builder.'
            },
            {
                stage: 9,
                title: 'Stage 9: Everyday Dialogue',
                type: 'dialogue',
                prompt: 'Complete this standard polite social response:\nA: "Thank you so much for your assistance!"\nB: "You are ________!"',
                display: 'You are [ W _ L _ _ M E ] !',
                answer: 'WELCOME',
                alternatives: ['welcome', 'most welcome'],
                audioText: 'You are welcome',
                hint: 'Standard polite reply: "You\'re welcome" 😊',
                explanation: 'Answer: WELCOME — A courteous acknowledgment after being thanked.'
            },
            {
                stage: 10,
                title: 'Stage 10: 👑 Boss Stage: Spelling Mastery',
                type: 'boss_sentence',
                prompt: 'Find and type the correct spelling of the misspelled adjective in this sentence:\n"She designed the most beatiful art gallery in the city."',
                display: 'beatiful  ➔  Correct Spelling: [ ? ]',
                answer: 'BEAUTIFUL',
                alternatives: ['beautiful'],
                audioText: 'Beautiful',
                hint: 'Remember the sequence of three consecutive vowels: "e-a-u" ✨',
                explanation: 'Answer: BEAUTIFUL — Spelled B-E-A-U-T-I-F-U-L (contains the French root "beau").'
            },
            // ⭐ SPECIAL SECRET BONUS STAGE (ข้อพิเศษ)
            {
                stage: 11,
                title: 'Stage 11: ⭐ Golden Mystery Quest (SPECIAL BONUS)',
                type: 'special_bonus',
                isSpecial: true,
                prompt: '⭐ SPECIAL BONUS QUESTION ⭐\n"What comes once in a minute, twice in a moment, but never in a thousand years?"\n(Analyze the letters carefully!):',
                display: 'The Letter: [ ? ]',
                answer: 'M',
                alternatives: ['m', 'the letter m', 'letter m'],
                audioText: 'What comes once in a minute, twice in a moment, but never in a thousand years?',
                hint: 'Look at the spelling of the words "Minute", "MoMent", and "Thousand Years" 🔤',
                explanation: 'Answer: The Letter M — "Minute" has one M, "MoMent" has two Ms, and "thousand years" has no M!'
            }
        ]
    },

    intermediate: {
        id: 'intermediate',
        name: 'Intermediate',
        badgeName: '⚡ Level 2: Skill Specialist',
        icon: '⚡',
        badgeColor: '#06b6d4',
        description: 'Phrasal verbs, dependent prepositions, confusing word pairs, and B1-B2 grammar mastery.',
        stages: [
            {
                stage: 1,
                title: 'Stage 1: Confusing Word Pairs',
                type: 'word_choice',
                prompt: 'Choose between "AFFECT" (verb) and "EFFECT" (noun):\n"Chronic lack of sleep will negatively ________ your cognitive performance."',
                display: 'will negatively [ affect / effect ] your focus',
                answer: 'AFFECT',
                alternatives: ['affect'],
                audioText: 'Lack of sleep will negatively affect your cognitive performance',
                hint: 'Requires an action verb starting with the letter A',
                explanation: 'Answer: AFFECT (verb) — Means to influence or impact. ("Effect" is typically a noun).'
            },
            {
                stage: 2,
                title: 'Stage 2: Essential Phrasal Verb',
                type: 'phrasal_verb',
                prompt: 'Fill in the particle for the phrasal verb meaning "to admire or respect someone deeply":\n"Aspiring athletes always look ________ to Olympic champions."',
                display: 'look [ ? ] to (= admire / respect)',
                answer: 'UP',
                alternatives: ['up'],
                audioText: 'Aspiring athletes always look up to Olympic champions',
                hint: 'Opposite of "down" 🏆',
                explanation: 'Answer: UP — "Look up to someone" means to hold them in high esteem as a role model.'
            },
            {
                stage: 3,
                title: 'Stage 3: Dependent Preposition',
                type: 'collocation',
                prompt: 'Supply the exact preposition paired with "CAPABLE":\n"With diligent practice, you are fully capable ________ mastering fluent English."',
                display: 'capable [ ? ] mastering the language',
                answer: 'OF',
                alternatives: ['of'],
                audioText: 'You are fully capable of mastering fluent English',
                hint: 'A short two-letter preposition (of / at / in / to)',
                explanation: 'Answer: OF — Fixed collocation: Capable of + Gerund/Noun.'
            },
            {
                stage: 4,
                title: 'Stage 4: Modal of Past Deduction',
                type: 'grammar_modal',
                prompt: 'Select the modal expressing strong logical deduction about past evidence (~95% certainty):\n"The streets are soaking wet this morning. It ________ have rained heavily overnight."',
                display: 'It [ must / should / could ] have rained',
                answer: 'MUST',
                alternatives: ['must'],
                audioText: 'It must have rained heavily overnight',
                hint: 'Used when physical evidence proves a past event virtually certain 🌧️',
                explanation: 'Answer: MUST — "Must have + V.3" expresses near-certain deduction based on tangible clues.'
            },
            {
                stage: 5,
                title: 'Stage 5: Word Formation (Nominalization)',
                type: 'word_formation',
                prompt: 'Transform the verb "DECIDE" into its corresponding abstract noun:\n"Making an informed career ________ requires analytical thought."',
                display: 'decide (v.)  ➔  [ D _ _ _ S _ _ N ] (n.)',
                answer: 'DECISION',
                alternatives: ['decision'],
                audioText: 'Making an informed career decision requires analytical thought',
                hint: 'Ends with the suffix "-sion" 🎯',
                explanation: 'Answer: DECISION — The noun form of decide.'
            },
            {
                stage: 6,
                title: 'Stage 6: Conjunction of Contrast',
                type: 'connectors',
                prompt: 'Provide the single-word preposition/conjunction followed directly by a noun phrase:\n"________ the torrential rain, the championship match proceeded as scheduled."',
                display: '[ D _ _ _ _ T E ] the heavy rain, they played.',
                answer: 'DESPITE',
                alternatives: ['despite', 'in spite of'],
                audioText: 'Despite the torrential rain, the championship match proceeded',
                hint: 'Synonymous with "in spite of", starts with letter D',
                explanation: 'Answer: DESPITE — Takes a noun phrase without the preposition "of" (e.g., Despite the rain).'
            },
            {
                stage: 7,
                title: 'Stage 7: Idiomatic Grit',
                type: 'idiom',
                prompt: 'Fill in the missing word in the idiom meaning "to bravely face an inevitable hardship":\n"We just have to bite the ________ and push through this demanding quarter."',
                display: 'bite the [ B _ _ _ _ T ]',
                answer: 'BULLET',
                alternatives: ['bullet'],
                audioText: 'Bite the bullet',
                hint: 'A metallic ammunition projectile 💥',
                explanation: 'Answer: BULLET — "Bite the bullet" stems from soldiers biting on lead bullets during battlefield surgery.'
            },
            {
                stage: 8,
                title: 'Stage 8: Error Identification & Correction',
                type: 'error_spot',
                prompt: 'Identify the grammatical error and provide the correct non-plural form of "informations":\n"The research advisor provided us with invaluable informations."',
                display: 'informations  ➔  Correct form: [ ? ]',
                answer: 'INFORMATION',
                alternatives: ['information'],
                audioText: 'Invaluable information',
                hint: 'This word is an uncountable noun and cannot take a plural "-s"',
                explanation: 'Answer: INFORMATION — Uncountable noun in English; never takes "-s" (use "pieces of information" for counting).'
            },
            {
                stage: 9,
                title: 'Stage 9: Proverb Completion',
                type: 'proverb',
                prompt: 'Complete the famous proverb advising against agonizing over irreversible past mistakes:\n"There is no use crying over spilt ________."',
                display: 'crying over spilt [ M _ _ K ]',
                answer: 'MILK',
                alternatives: ['milk'],
                audioText: 'No use crying over spilt milk',
                hint: 'White nutrient-rich dairy beverage 🥛',
                explanation: 'Answer: MILK — "Don\'t cry over spilt milk" emphasizes moving forward instead of regretting past mishaps.'
            },
            {
                stage: 10,
                title: 'Stage 10: 👑 Boss Stage: Third Conditional',
                type: 'boss_grammar',
                prompt: 'Fill in the modal auxiliary for this hypothetical past condition:\n"If we had reviewed the telemetry data, we ________ have averted the system crash."',
                display: 'we [ w _ _ _ d ] have averted the crash',
                answer: 'WOULD',
                alternatives: ['would', 'could'],
                audioText: 'If we had reviewed the telemetry data, we would have averted the system crash',
                hint: 'Third conditional structure: If + had + V.3, S + would/could + have + V.3',
                explanation: 'Answer: WOULD — Expresses hypothetical past consequence contrary to historical reality.'
            },
            // ⭐ SPECIAL SECRET BONUS STAGE (ข้อพิเศษ)
            {
                stage: 11,
                title: 'Stage 11: ⭐ Mind-Bending Palindrome (SPECIAL BONUS)',
                type: 'special_bonus',
                isSpecial: true,
                prompt: '⭐ SPECIAL BONUS QUESTION ⭐\nA famous 5-letter English word for a high-speed nautical watercraft that is spelled exactly the same forwards and backwards (A Palindrome):\n"K _ Y _ K"',
                display: 'Palindrome Watercraft: [ K _ Y _ K ]',
                answer: 'KAYAK',
                alternatives: ['kayak', 'a kayak'],
                audioText: 'Kayak',
                hint: 'Paddle-driven light canoe, identical backwards and forwards 🛶',
                explanation: 'Answer: KAYAK — Spelled K-A-Y-A-K (a perfect palindrome reading the same in both directions).'
            }
        ]
    },

    advanced: {
        id: 'advanced',
        name: 'Advanced',
        badgeName: '🔥 Level 3: Grand Master',
        icon: '🔥',
        badgeColor: '#8b5cf6',
        description: 'Negative inversions, GRE/C2 lexis, subjunctive moods, stylistic devices & Latin legalisms.',
        stages: [
            {
                stage: 1,
                title: 'Stage 1: Negative Inversion',
                type: 'inversion',
                prompt: 'Supply the auxiliary verb required in this formal emphatic inversion:\n"Under no circumstances ________ employees permitted to disclose confidential encryption keys."',
                display: 'Under no circumstances [ are / do / will ] employees permitted',
                answer: 'ARE',
                alternatives: ['are'],
                audioText: 'Under no circumstances are employees permitted to disclose confidential encryption keys',
                hint: 'Inverts auxiliary verb before subject in passive voice: [ Auxiliary ] + subject + permitted',
                explanation: 'Answer: ARE — Inversion syntax: Negative adverbial + Auxiliary (are) + Subject + Past Participle.'
            },
            {
                stage: 2,
                title: 'Stage 2: Sophisticated Lexis (GRE / C2)',
                type: 'vocab_c2',
                prompt: 'An advanced adjective meaning "transitory, fleeting, or lasting for only a very brief moment":\n"Fame in the digital era can be remarkably ________."',
                display: 'E P H _ M _ R A L',
                answer: 'EPHEMERAL',
                alternatives: ['ephemeral', 'transitory'],
                audioText: 'Ephemeral',
                hint: 'Begins with Ephe... and ends with ...ral ⏳',
                explanation: 'Answer: EPHEMERAL — From Greek "ephemeros" meaning lasting only a single day.'
            },
            {
                stage: 3,
                title: 'Stage 3: Mandative Subjunctive',
                type: 'subjunctive',
                prompt: 'Supply the grammatically correct bare subjunctive form of the verb:\n"The ethics board insisted that the executive director ________ immediately from office."',
                display: 'insisted that the director [ resign / resigns / resigned ]',
                answer: 'RESIGN',
                alternatives: ['resign'],
                audioText: 'The ethics board insisted that the executive director resign immediately from office',
                hint: 'Mandative subjunctive requires the bare infinitive regardless of 3rd person singular subject',
                explanation: 'Answer: RESIGN — Verbs of demand/insistence require bare infinitive (no -s, no -ed) in formal American/British English.'
            },
            {
                stage: 4,
                title: 'Stage 4: Intellectual Idiom',
                type: 'advanced_idiom',
                prompt: 'Identify the noun in the idiom meaning "to advocate an opposing viewpoint purely for intellectual debate":\n"She didn\'t genuinely disagree; she was merely playing ________\'s advocate."',
                display: 'playing [ D _ _ _ L ]\'s advocate',
                answer: 'DEVIL',
                alternatives: ['devil', "devil's"],
                audioText: "Play devil's advocate",
                hint: 'A mythological demonic entity 😈',
                explanation: 'Answer: DEVIL — "Devil\'s advocate" originates from Catholic canonization trials (Advocatus Diaboli).'
            },
            {
                stage: 5,
                title: 'Stage 5: Conditional Inversion without "IF"',
                type: 'inverted_conditional',
                prompt: 'Supply the inverted auxiliary that replaces "IF" in this formal condition:\n"________ the expedition team anticipated the blizzard, they would have carried satellite transceivers."',
                display: '[ H _ D ] the team anticipated (= If the team had anticipated)',
                answer: 'HAD',
                alternatives: ['had'],
                audioText: 'Had the expedition team anticipated the blizzard, they would have carried satellite transceivers',
                hint: 'Inverts past perfect auxiliary: "Had + Subject + Past Participle"',
                explanation: 'Answer: HAD — Formal inversion replacing "If + Subject + had".'
            },
            {
                stage: 6,
                title: 'Stage 6: Nuance Vocabulary (C2)',
                type: 'nuance_vocab',
                prompt: 'A formal verb meaning "to make something bad, painful, or intense less severe" (Alleviate/Abate):\n"Central banks introduced monetary easing to ________ the impact of the recession."',
                display: 'M I T _ G _ T E',
                answer: 'MITIGATE',
                alternatives: ['mitigate'],
                audioText: 'Mitigate',
                hint: 'Begins with M and ends with -gate 🛡️',
                explanation: 'Answer: MITIGATE — To lessen the severity, harshness, or gravity of something.'
            },
            {
                stage: 7,
                title: 'Stage 7: Three-Part Phrasal Verb',
                type: 'complex_phrasal',
                prompt: 'Complete the three-part phrasal verb meaning "to abolish, eliminate, or discard":\n"Modern logistics software has allowed us to do away ________ manual paper ledgers."',
                display: 'do away [ ? ] (= abolish / eliminate)',
                answer: 'WITH',
                alternatives: ['with'],
                audioText: 'Do away with manual paper ledgers',
                hint: 'Do away + _____',
                explanation: 'Answer: WITH — "Do away with" means to get rid of, abolish, or discontinue.'
            },
            {
                stage: 8,
                title: 'Stage 8: Literary Device (Oxymoron)',
                type: 'oxymoron',
                prompt: 'Complete the classic paradoxical oxymoron describing an intense, overwhelming absence of sound:\n"When the verdict was announced, an uncanny, deafening ________ enveloped the courtroom."',
                display: 'a deafening [ S _ L _ _ C E ]',
                answer: 'SILENCE',
                alternatives: ['silence'],
                audioText: 'A deafening silence',
                hint: 'Opposite of noise or uproar 🤫',
                explanation: 'Answer: SILENCE — "Deafening silence" is an evocative oxymoron highlighting palpable, shocked quietness.'
            },
            {
                stage: 9,
                title: 'Stage 9: Adverbial Nuance Correction',
                type: 'advanced_error',
                prompt: 'Identify the error and replace "hardly" with the correct adverb meaning "with great diligence and effort":\n"She hardly prepared for the bar exam and passed with honors."',
                display: 'hardly (barely/scarcely)  ➔  Replace with: [ ? ] (rigorously/diligently)',
                answer: 'HARD',
                alternatives: ['hard'],
                audioText: 'She studied hard for the bar exam',
                hint: '"Hardly" is a negative adverb meaning "scarcely". The intended adverb is identical in form to the adjective.',
                explanation: 'Answer: HARD — "Hard" functions as both an adjective and an adverb (e.g., study hard). "Hardly" means "barely/almost not".'
            },
            {
                stage: 10,
                title: 'Stage 10: 👑 Grand Master Finale: Latin Jurisprudence',
                type: 'grand_boss',
                prompt: 'Complete the Latin loan phrase meaning "the existing state of affairs, especially regarding social or political issues":\n"Radical reformists sought to disrupt the entrenched status ________."',
                display: 'status [ Q _ _ ]',
                answer: 'QUO',
                alternatives: ['quo'],
                audioText: 'Status quo',
                hint: 'Three-letter Latin word starting with Q',
                explanation: 'Answer: QUO — "Status quo" translates literally from Latin as "the state in which".'
            },
            // ⭐ SPECIAL SECRET BONUS STAGE (ข้อพิเศษ)
            {
                stage: 11,
                title: 'Stage 11: ⭐ Grand Lexical Enigma (SPECIAL BONUS)',
                type: 'special_bonus',
                isSpecial: true,
                prompt: '⭐ SPECIAL BONUS QUESTION ⭐\nA legendary 11-letter word meaning "the occurrence of finding pleasant or valuable things by chance in a happy, unexpected way":\n"S _ R _ N D _ P _ T Y"',
                display: 'Unexpected Good Fortune: [ S _ R _ N D _ P _ T Y ]',
                answer: 'SERENDIPITY',
                alternatives: ['serendipity'],
                audioText: 'Serendipity',
                hint: 'Coined by Horace Walpole from the fairy tale "The Three Princes of Serendip" ✨',
                explanation: 'Answer: SERENDIPITY — Coined in 1754, meaning fortunate happenstance or pleasant accidental discovery.'
            }
        ]
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUESTION_BANK;
}
