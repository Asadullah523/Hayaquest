import type { GrammarRule } from '../../types/english';

export const grammarTopics: GrammarRule[] = [
  {
    id: 'subject-verb-agreement',
    title: 'Subject-Verb Agreement',
    description: 'Ensure that the subject and verb match in number (singular or plural).',
    difficulty: 'beginner',
    explanation: `
      Subject-Verb Agreement is the golden rule of grammar. 
      - Singular subjects take singular verbs (usually ending in 's').
      - Plural subjects take plural verbs (no 's').
      
      Tricky Cases:
      - 'Everyone', 'Each', 'Neither' are singular.
      - Collective nouns (team, family) can be singular or plural depending on context.
    `,
    examples: [
      'The dog barks loudly.',
      'The dogs bark loudly.',
      'Everyone is happy.',
      'The team is winning.'
    ],
    commonMistakes: [
      {
        incorrect: 'Everyone are happy.',
        correct: 'Everyone is happy.',
        explanation: "'Everyone' is singular."
      },
      {
        incorrect: 'The list of items are on the desk.',
        correct: 'The list of items is on the desk.',
        explanation: "The subject is 'list', not 'items'."
      }
    ],
    storyContext: {
        title: "The Solitary King",
        content: "In a vast kingdom, [everyone was] waiting for the king. The [group of knights is] standing guard at the gate. Neither the duke nor the earl [knows] when he will arrive. The [list of demands is] long, but the [king listens] to no one.",
        highlightedRuleWrapper: "Brackets [] indicate correct agreement usage."
    },
    practice: [
      {
        id: 'p1',
        question: 'The bouquet of flowers ____ beautiful.',
        options: ['smell', 'smells'],
        correctAnswer: 1,
        explanation: "The subject is 'bouquet' (singular), not 'flowers'."
      },
      {
         id: 'p2',
         question: 'Neither of the answers ____ correct.',
         options: ['is', 'are'],
         correctAnswer: 0,
         explanation: "'Neither' is treated as singular."
      }
    ]
  },
  {
      id: 'conditionals',
      title: 'Conditionals (The "If" Sentences)',
      description: 'Master Zero, First, Second, and Third conditionals.',
      difficulty: 'advanced',
      explanation: `
        Conditionals describe the result of something that might happen (in the present or future) or might have happened but didn't (in the past).
        
        1. **Zero Conditional**: General truths. (If you heat ice, it melts.)
        2. **First Conditional**: Real possibilities. (If it rains, I will stay home.)
        3. **Second Conditional**: Unreal/Hypothetical present. (If I won the lottery, I would travel.)
        4. **Third Conditional**: Unreal past/Regrets. (If I had studied, I would have passed.)
      `,
      examples: [
          'If water reaches 100°C, it boils. (Zero)',
          'If she calls, I will tell her. (First)',
          'If I were you, I would accept the offer. (Second)',
          'If they had left earlier, they would have caught the train. (Third)'
      ],
      commonMistakes: [
          {
              incorrect: 'If I will go, I will see him.',
              correct: 'If I go, I will see him.',
              explanation: "Never use 'will' in the 'if' clause of the First Conditional."
          },
          {
              incorrect: 'If I was rich, I would buy a boat.',
              correct: 'If I were rich, I would buy a boat.',
              explanation: "In Second Conditional, use 'were' for all subjects (subjunctive mood)."
          }
      ],
      storyContext: {
          title: "The Time Traveler's Regret",
          content: "The old man looked at the machine. \"[If I had known] the consequences, I [would never have built] it,\" he whispered. \"[If I were] younger, I [would destroy] it myself. But now, [if anyone finds] it, the world [will be] in danger.\"",
          highlightedRuleWrapper: "Brackets [] show conditional structures."
      },
      practice: [
          {
              id: 'c1',
              question: 'If I ____ enough money, I would buy a big house.',
              options: ['have', 'had', 'have had'],
              correctAnswer: 1,
              explanation: "Second conditional (hypothetical) requires Past Simple."
          },
          {
              id: 'c2',
              question: 'If she ____ yesterday, she would have met him.',
              options: ['comes', 'came', 'had come'],
              correctAnswer: 2,
              explanation: "Third conditional (past regret) requires Past Perfect."
          }
      ]
  },
  {
      id: 'passive-voice',
      title: 'Active vs. Passive Voice',
      description: 'Focusing on the action rather than the doer.',
      difficulty: 'intermediate',
      explanation: `
         - **Active**: Subject does the action. (The cat chased the mouse.)
         - **Passive**: Action happens to the subject. (The mouse was chased by the cat.)
         
         Use Passive when:
         - The actor is unknown. (My car was stolen.)
         - The action is more important than the actor. (Penicillin was discovered in 1928.)
      `,
      examples: [
          'Active: Shakespeare wrote Romeo and Juliet.',
          'Passive: Romeo and Juliet was written by Shakespeare.',
          'Active: Someone has cleaned the room.',
          'Passive: The room has been cleaned.'
      ],
      commonMistakes: [
          {
              incorrect: 'The accident was happened yesterday.',
              correct: 'The accident happened yesterday.',
              explanation: "Intransitive verbs (like happen, die, arrive) cannot be passive."
          }
      ],
      storyContext: {
          title: "The Silent Crime",
          content: "The window [was broken] from the outside. No fingerprints [were found]. The jewels [had been stolen] long before the alarm [was triggered]. The mystery [is being investigated] by the best detectives.",
          highlightedRuleWrapper: "Brackets [] show passive voice constructions."
      },
      practice: [
          {
              id: 'pv1',
              question: 'The book ____ by the author last year.',
              options: ['writes', 'wrote', 'was written'],
              correctAnswer: 2,
              explanation: "Past passive voice."
          }
      ]
  },
  {
      id: 'direct-indirect-speech',
      title: 'Direct and Indirect Speech',
      description: 'Converting speech from direct quotations to reported statements.',
      difficulty: 'intermediate',
      explanation: `
         Direct Speech: The exact words spoken (in quotes).
         Indirect Speech: Reporting what someone said without quotes.
         
         Key Changes:
         - Remove quotation marks
         - Change pronouns (I → he/she)
         - Backshift tenses (present → past)
         - Change time/place words (now → then, here → there)
         
         Example:
         Direct: She said, "I am happy."
         Indirect: She said that she was happy.
      `,
      examples: [
          'Direct: "I will come tomorrow," he said.',
          'Indirect: He said that he would come the next day.',
          'Direct: She asked, "Are you ready?"',
          'Indirect: She asked if I was ready.'
      ],
      commonMistakes: [
          {
              incorrect: 'He said that "I am tired."',
              correct: 'He said that he was tired.',
              explanation: "Do not mix direct and indirect speech."
          },
          {
              incorrect: 'She told that she is coming.',
              correct: 'She said that she was coming.',
              explanation: "Use 'said' for indirect statements without an object."
          }
      ],
      storyContext: {
          title: "The Message Relay",
          content: "The captain [said that he would return] before dawn. His lieutenant [asked if everyone was prepared]. The soldier [replied that they were ready]. No one [mentioned that the enemy was approaching].",
          highlightedRuleWrapper: "Brackets [] show indirect speech."
      },
      practice: [
          {
              id: 'ds1',
              question: 'She said, "I love this place." (Convert to indirect speech)',
              options: [
                  'She said that she loved that place.',
                  'She said that I love this place.',
                  'She said she loves this place.'
              ],
              correctAnswer: 0,
              explanation: "Change pronouns, tense, and demonstratives."
          },
          {
              id: 'ds2',
              question: '"Where are you going?" he asked.',
              options: [
                  'He asked where I am going.',
                  'He asked where I was going.',
                  'He asked where was I going.'
              ],
              correctAnswer: 1,
              explanation: "Use statement word order and backshift the tense."
          }
      ]
  },
  {
      id: 'articles',
      title: 'Articles (A, An, The)',
      description: 'Master the use of definite and indefinite articles.',
      difficulty: 'intermediate',
      explanation: `
         Articles define nouns.
         
         A / An (Indefinite):
         - Use for singular, countable nouns (first mention)
         - "A" before consonant sounds
         - "An" before vowel sounds
         
         The (Definite):
         - Use when the noun is specific or already mentioned
         - Use for unique things (the moon, the sun)
         
         No Article (Zero):
         - Plural/uncountable nouns in general
         - Names of countries, languages, sports
      `,
      examples: [
          'I saw a cat. The cat was black.',
          'She is an engineer.',
          'The Eiffel Tower is in Paris.',
          'I love music.'
      ],
      commonMistakes: [
          {
              incorrect: 'I am going to home.',
              correct: 'I am going home.',
              explanation: "Home does not take an article when meaning residence."
          },
          {
              incorrect: 'She plays piano.',
              correct: 'She plays the piano.',
              explanation: "Musical instruments use 'the' when playing them."
          }
      ],
      storyContext: {
          title: "The Journey",
          content: "[A] traveler visited [the] ancient city. He stayed at [an] inn near [the] central square. He met [a] wise woman who told him about [the] history. [The] city had been founded by [a] king centuries ago.",
          highlightedRuleWrapper: "Brackets [] highlight article usage."
      },
      practice: [
          {
              id: 'art1',
              question: 'I need ___ umbrella.',
              options: ['a', 'an', 'the'],
              correctAnswer: 1,
              explanation: "Umbrella starts with a vowel sound, so use 'an'."
          },
          {
              id: 'art2',
              question: '___ honesty is the best policy.',
              options: ['A', 'An', 'The', 'No article'],
              correctAnswer: 3,
              explanation: "Abstract nouns in general statements take no article."
          }
      ]
  },
  {
      id: 'prepositions',
      title: 'Prepositions',
      description: 'Words that show relationships between nouns/pronouns and other words.',
      difficulty: 'beginner',
      explanation: `
         Prepositions show position, direction, time, or relationship.
         
         Position: in, on, at, under, above, between
         Direction: to, from, into, through, towards
         Time: at, on, in, before, after, during
         Other: with, without, by, for, about
         
         Rules:
         - at: specific points (at 5 PM, at home)
         - on: days/dates (on Monday)
         - in: months/years/long periods (in January, in 2024)
      `,
      examples: [
          'The book is on the table.',
          'She arrived at 9 o\'clock.',
          'They live in Paris.',
          'He walked through the park.'
      ],
      commonMistakes: [
          {
              incorrect: 'I am good in English.',
              correct: 'I am good at English.',
              explanation: "Use 'at' with good/bad when referring to ability."
          },
          {
              incorrect: 'She is married with John.',
              correct: 'She is married to John.',
              explanation: "Use 'married to', not 'married with'."
          }
      ],
      storyContext: {
          title: "A Walk in the Park",
          content: "[In] the morning, Sarah walked [through] the park. She sat [on] a bench [under] a large tree. A bird flew [above] her head. She stayed there [until] noon, reading a book [about] adventure.",
          highlightedRuleWrapper: "Brackets [] show preposition usage."
      },
      practice: [
          {
              id: 'prep1',
              question: 'The meeting is ___ Monday ___ 3 PM.',
              options: ['on / at', 'in / at', 'at / on'],
              correctAnswer: 0,
              explanation: "Use 'on' for days and 'at' for specific times."
          },
          {
              id: 'prep2',
              question: 'She has been working here ___ 2020.',
              options: ['from', 'since', 'for'],
              correctAnswer: 1,
              explanation: "Use 'since' with a specific point in time."
          }
      ]
  },
  {
      id: 'simple-present',
      title: 'Simple Present Tense',
      description: 'Express habits, facts, and universal truths.',
      difficulty: 'beginner',
      explanation: `
         The Simple Present describes:
         1. Habitual actions: I wake up at 7 AM every day.
         2. Universal truths: The sun rises in the east.
         3. Present states: She lives in London.
         
         Formation:
         - I/You/We/They + base verb
         - He/She/It + verb + s/es
         
         Time markers: always, usually, often, sometimes, never, every day
      `,
      examples: [
          'Water boils at 100 degrees Celsius.',
          'She teaches English at the university.',
          'They always arrive on time.',
          'I do not like coffee.'
      ],
      commonMistakes: [
          {
              incorrect: 'He go to school every day.',
              correct: 'He goes to school every day.',
              explanation: "Third person singular needs 's' or 'es'."
          },
          {
              incorrect: 'She do not understand.',
              correct: 'She does not understand.',
              explanation: "Use 'does' for third person singular."
          }
      ],
      storyContext: {
          title: "Daily Routine",
          content: "Every morning, Sarah [wakes up] at 6 AM. She [goes] for a run, [takes] a shower, and [eats] breakfast. At 8 AM, she [leaves] for work. She [works] as a doctor and [helps] many patients. In the evening, she [returns] home.",
          highlightedRuleWrapper: "Brackets [] show Simple Present verbs."
      },
      practice: [
          {
              id: 'sp1',
              question: 'Birds ___ in the sky.',
              options: ['fly', 'flies', 'flying'],
              correctAnswer: 0,
              explanation: "Birds is plural, so use the base form."
          },
          {
              id: 'sp2',
              question: 'The train ___ at 9 PM every night.',
              options: ['arrive', 'arrives', 'arriving'],
              correctAnswer: 1,
              explanation: "Train is singular (it), so add 's'."
          }
      ]
  },
  {
      id: 'simple-past',
      title: 'Simple Past Tense',
      description: 'Talk about completed actions in the past.',
      difficulty: 'beginner',
      explanation: `
         Describes actions that happened and finished in the past.
         
         Formation:
         - Regular verbs: verb + ed (walked, played)
         - Irregular verbs: special forms (went, saw, ate)
         
         Time markers: yesterday, last week/month/year, ago, in 1990
         
         Negative: did not + base verb
         Question: Did + subject + base verb?
      `,
      examples: [
          'I visited Paris last year.',
          'She did not call me yesterday.',
          'Did you finish your homework?',
          'They went to the beach last summer.'
      ],
      commonMistakes: [
          {
              incorrect: 'I did not went there.',
              correct: 'I did not go there.',
              explanation: "After 'did not', use the base form."
          },
          {
              incorrect: 'Did she called you?',
              correct: 'Did she call you?',
              explanation: "In questions with 'did', use base verb."
          }
      ],
      storyContext: {
          title: "A Memorable Day",
          content: "Last Saturday, Tom [woke up] early. He [went] to the park and [met] his friends. They [played] football for two hours. After the game, they [went] to a cafe and [ordered] lunch. Tom [enjoyed] the day and [returned] home feeling happy.",
          highlightedRuleWrapper: "Brackets [] show Simple Past verbs."
      },
      practice: [
          {
              id: 'spt1',
              question: 'She ___ to the market yesterday.',
              options: ['go', 'goes', 'went'],
              correctAnswer: 2,
              explanation: "Went is the past form of go."
          },
          {
              id: 'spt2',
              question: 'They ___ the exam last week.',
              options: ['pass', 'passed', 'passing'],
              correctAnswer: 1,
              explanation: "Regular verb: pass + ed."
          }
      ]
  },
  {
      id: 'present-perfect',
      title: 'Present Perfect Tense',
      description: 'Connect the past with the present.',
      difficulty: 'advanced',
      explanation: `
         Connects past actions to the present.
         
         Formation: have/has + past participle
         - I/You/We/They have done
         - He/She/It has done
         
         Uses:
         1. Experience: I have visited Japan.
         2. Recent actions: She has just arrived.
         3. Unfinished time: I have studied a lot today.
         4. Continuing actions: He has lived here for 5 years.
         
         Simple Past vs Present Perfect:
         - Past: I saw him yesterday. (specific time)
         - Perfect: I have seen him before. (experience)
      `,
      examples: [
          'I have finished my homework.',
          'She has lived in Paris since 2020.',
          'Have you ever been to Italy?',
          'They have not arrived yet.'
      ],
      commonMistakes: [
          {
              incorrect: 'I have seen him yesterday.',
              correct: 'I saw him yesterday.',
              explanation: "Do not use Present Perfect with specific past time markers."
          },
          {
              incorrect: 'He has went to the store.',
              correct: 'He has gone to the store.',
              explanation: "Use past participle (gone), not simple past (went)."
          }
      ],
      storyContext: {
          title: "Life Experiences",
          content: "Maria [has traveled] to 15 countries. She [has learned] three languages and [has made] friends from all over the world. This year, she [has visited] Japan and Korea. She [has not been] to Africa yet, but she plans to go next year.",
          highlightedRuleWrapper: "Brackets [] show Present Perfect usage."
      },
      practice: [
          {
              id: 'pp1',
              question: 'I ___ my keys. I cannot find them.',
              options: ['lost', 'have lost', 'am losing'],
              correctAnswer: 1,
              explanation: "Present Perfect shows past action with present result."
          },
          {
              id: 'pp2',
              question: 'She ___ here since Monday.',
              options: ['is', 'was', 'has been'],
              correctAnswer: 2,
              explanation: "'Since' indicates continuing action, use Present Perfect."
          }
      ]
  },
  {
      id: 'simple-future',
      title: 'Simple Future (Will)',
      description: 'Express future plans, predictions, and decisions.',
      difficulty: 'beginner',
      explanation: `
         Simple Future with 'will' describes:
         - Spontaneous decisions: I will help you.
         - Predictions: It will rain tomorrow.
         - Promises: I will call you later.
         - General future facts: She will be 18 next month.
         
         Formation: subject + will + base verb
         Negative: will not (won't) + base verb
         Question: Will + subject + base verb?
      `,
      examples: [
          'I will help you with that.',
          'The sun will rise at 6 AM tomorrow.',
          'She will not come to the party.',
          'Will you join us for dinner?'
      ],
      commonMistakes: [
          {
              incorrect: 'I will going to the party.',
              correct: 'I will go to the party.',
              explanation: "Use base verb after 'will', not -ing form."
          },
          {
              incorrect: 'She will can do it.',
              correct: 'She will be able to do it.',
              explanation: "Cannot use 'will' + 'can' together."
          }
      ],
      storyContext: {
          title: "Tomorrow's Plans",
          content: "Tomorrow, Anna [will wake up] early. She [will go] to the gym and then [will meet] her friends for breakfast. In the afternoon, she [will study] for her exam. In the evening, she [will watch] a movie. It [will be] a busy day.",
          highlightedRuleWrapper: "Brackets [] show Simple Future with will."
      },
      practice: [
          {
              id: 'sf1',
              question: 'The phone is ringing. I ___ get it!',
              options: ['will', 'am going to', 'going'],
              correctAnswer: 0,
              explanation: "Use 'will' for spontaneous decisions."
          },
          {
              id: 'sf2',
              question: 'I think it ___ rain tomorrow.',
              options: ['will', 'is going to', 'going'],
              correctAnswer: 0,
              explanation: "Use 'will' for predictions based on opinion."
          }
      ]
  },
  {
      id: 'present-continuous',
      title: 'Present Continuous Tense',
      description: 'Express actions happening now or around now.',
      difficulty: 'beginner',
      explanation: `
         Present Continuous describes:
         - Actions happening now: She is reading a book.
         - Temporary situations: I am staying with friends this week.
         - Future arrangements: We are meeting tomorrow at 3 PM.
         
         Formation: am/is/are + verb-ing
      `,
      examples: [
          'I am studying English right now.',
          'She is watching TV at the moment.',
          'They are playing football.', 
          'We are not working today.'
      ],
      commonMistakes: [
          {
              incorrect: 'I am knowing the answer.',
              correct: 'I know the answer.',
              explanation: "State verbs like 'know' do not usually use continuous forms."
          }
      ],
      storyContext: {
          title: "The Busy House",
          content: "The children [are playing] in the garden. Their mother [is cooking] dinner. Their father [is reading] the newspaper. Everyone [is doing] something.",
          highlightedRuleWrapper: "Brackets [] show Present Continuous."
      },
      practice: [
          {
              id: 'pc1',
              question: 'Look! It ___ outside.',
              options: ['rains', 'is raining', 'rain'],
              correctAnswer: 1,
              explanation: "Action in progress at the moment of speaking."
          }
      ]
  },
  {
      id: 'past-continuous',
      title: 'Past Continuous Tense',
      description: 'Express ongoing actions in the past.',
      difficulty: 'intermediate',
      explanation: `
         Past Continuous describes:
         - Actions in progress at a past time: I was studying at 8 PM.
         - Background actions: While I was reading, the phone rang.
         
         Formation: was/were + verb-ing
      `,
      examples: [
          'I was watching TV when she arrived.',
          'While they were playing, it started to rain.',
          'What were you doing at 7 PM?'
      ],
      commonMistakes: [
          {
              incorrect: 'I was play football yesterday.',
              correct: 'I was playing football yesterday.',
              explanation: "Always use -ing form after was/were in continuous tenses."
          }
      ],
      storyContext: {
          title: "The Interruption",
          content: "Emma [was reading] when the bell rang. Her brother [was playing] games. Their mother [was cooking]. Everything [was proceeding] normally until then.",
          highlightedRuleWrapper: "Brackets [] show Past Continuous."
      },
      practice: [
          {
              id: 'pastc1',
              question: 'I ___ dinner when you called.',
              options: ['cooked', 'was cooking', 'am cooking'],
              correctAnswer: 1,
              explanation: "Use Past Continuous for the background action interrupted by another."
          }
      ]
  },
  {
      id: 'future-continuous',
      title: 'Future Continuous Tense',
      description: 'Express actions that will be in progress at a certain time in the future.',
      difficulty: 'intermediate',
      explanation: `
         Future Continuous describes:
         - Actions in progress in the future: I will be flying to London tomorrow.
         - Predicting future actions: They will be expecting us.
         
         Formation: will be + verb-ing
      `,
      examples: [
          'I will be working at 10 AM tomorrow.',
          'This time next week, we will be lying on the beach.',
          'Will you be using your car tonight?'
      ],
      commonMistakes: [
          {
              incorrect: 'I will be work.',
              correct: 'I will be working.',
              explanation: "Continuous tenses require the -ing form."
          }
      ],
      storyContext: {
          title: "Next Week",
          content: "This time next week, I [will be enjoying] my holiday. I [will be sitting] by the pool and I [will be reading] a book. No one [will be thinking] about work.",
          highlightedRuleWrapper: "Brackets [] show Future Continuous."
      },
      practice: [
          {
              id: 'fc1',
              question: 'Don\'t call her at 8 PM. She ___ dinner.',
              options: ['will have', 'will be having', 'has'],
              correctAnswer: 1,
              explanation: "Action in progress at a specific future time."
          }
      ]
  },
  {
      id: 'past-perfect',
      title: 'Past Perfect Tense',
      description: 'Express actions completed before another action in the past.',
      difficulty: 'intermediate',
      explanation: `
         Past Perfect describes:
         - The "earlier past": When I arrived, the train had already left.
         - Past actions with results in the past: He had lost his keys, so he couldn't get in.
         
         Formation: had + past participle
      `,
      examples: [
          'I had already eaten when they arrived.',
          'She had finished her work before 5 PM.',
          'I realized I had forgotten my wallet.'
      ],
      commonMistakes: [
          {
              incorrect: 'I have had finished.',
              correct: 'I had finished.',
              explanation: "Use only 'had' for Past Perfect."
          }
      ],
      storyContext: {
          title: "The Late Arrival",
          content: "By the time John reached the station, the train [had left]. He [had forgotten] to check the schedule. He realized he [had made] a big mistake.",
          highlightedRuleWrapper: "Brackets [] show Past Perfect."
      },
      practice: [
          {
              id: 'ppf1',
              question: 'The film ___ already started when we arrived.',
              options: ['has', 'had', 'was'],
              correctAnswer: 1,
              explanation: "Action completed before another past action."
          }
      ]
  },
  {
      id: 'future-perfect',
      title: 'Future Perfect Tense',
      description: 'Express actions that will be finished by a certain time in the future.',
      difficulty: 'advanced',
      explanation: `
         Future Perfect describes:
         - Actions completed before a point in the future: By 2030, technology will have changed.
         - Often used with "by" or "by the time".
         
         Formation: will have + past participle
      `,
      examples: [
          'I will have finished my degree by June.',
          'By the time you arrive, I will have cooked dinner.',
          'They will have moved house by next month.'
      ],
      commonMistakes: [
          {
              incorrect: 'I will finished by then.',
              correct: 'I will have finished by then.',
              explanation: "Future Perfect requires 'will have' + third form."
          }
      ],
      storyContext: {
          title: "The Project",
          content: "By the end of the year, we [will have completed] the project. We [will have worked] for twelve months and [will have spent] all the budget.",
          highlightedRuleWrapper: "Brackets [] show Future Perfect."
      },
      practice: [
          {
              id: 'fpf1',
              question: 'By next Friday, I ___ my exam results.',
              options: ['will receive', 'will have received', 'receive'],
              correctAnswer: 1,
              explanation: "Action completed by a specific point in the future."
          }
      ]
  },
  {
      id: 'present-perfect-continuous',
      title: 'Present Perfect Continuous Tense',
      description: 'Express actions that started in the past and continue to the present.',
      difficulty: 'intermediate',
      explanation: `
         Present Perfect Continuous describes:
         - Actions starting in the past and continuing now: I have been waiting for two hours.
         - Actions that recently stopped but have visible results: Your eyes are red. Have you been crying?
         
         Formation: have/has been + verb-ing
      `,
      examples: [
          'I have been living here since 2010.',
          'She has been working all morning.',
          'How long have you been studying English?'
      ],
      commonMistakes: [
          {
              incorrect: 'I am working here for three years.',
              correct: 'I have been working here for three years.',
              explanation: "Use Present Perfect Continuous for actions spanning from past to present."
          }
      ],
      storyContext: {
          title: "The Rainy Day",
          content: "It [has been raining] all day. The streets are wet because it [has been pouring] since 6 AM. We [have been waiting] for the sun to come out.",
          highlightedRuleWrapper: "Brackets [] show Present Perfect Continuous."
      },
      practice: [
          {
              id: 'ppc1',
              question: 'How long ___ for me?',
              options: ['do you wait', 'are you waiting', 'have you been waiting'],
              correctAnswer: 2,
              explanation: "Action started in the past and continuing to present."
          }
      ]
  },
  {
      id: 'past-perfect-continuous',
      title: 'Past Perfect Continuous Tense',
      description: 'Express actions that were in progress up to a point in the past.',
      difficulty: 'advanced',
      explanation: `
         Past Perfect Continuous describes:
         - Actions in progress before a point in the past: I had been waiting for an hour before the bus finally came.
         - Cause of something in the past: He was tired because he had been working hard.
         
         Formation: had been + verb-ing
      `,
      examples: [
          'They had been playing for two hours when it rained.',
          'She had been studying all day, so she was exhausted.',
          'How long had you been waiting?'
      ],
      commonMistakes: [
          {
              incorrect: 'I have been waiting for an hour before he arrived.',
              correct: 'I had been waiting for an hour before he arrived.',
              explanation: "Use 'had been' for actions before a past event."
          }
      ],
      storyContext: {
          title: "The Marathon",
          content: "Before he felt the pain, John [had been running] for ten miles. He [had been training] for months for this race. He [had been dreaming] of this moment.",
          highlightedRuleWrapper: "Brackets [] show Past Perfect Continuous."
      },
      practice: [
          {
              id: 'papc1',
              question: 'She was out of breath because she ___.',
              options: ['had been running', 'ran', 'has been running'],
              correctAnswer: 0,
              explanation: "Action in progress before a past point/state."
          }
      ]
  },
  {
      id: 'future-perfect-continuous',
      title: 'Future Perfect Continuous Tense',
      description: 'Express actions that will continue up to a point in the future.',
      difficulty: 'advanced',
      explanation: `
         Future Perfect Continuous describes:
         - Duration of an action up to a future point: By next year, I will have been living here for a decade.
         
         Formation: will have been + verb-ing
      `,
      examples: [
          'In April, I will have been working here for two years.',
          'By 5 PM, she will have been studying for eight hours.',
          'How long will they have been traveling by then?'
      ],
      commonMistakes: [
          {
              incorrect: 'I will working here for 10 years by next June.',
              correct: 'I will have been working here for 10 years by next June.',
              explanation: "Requires 'will have been' + -ing for duration up to a future point."
          }
      ],
      storyContext: {
          title: "The Anniversary",
          content: "Next month, we [will have been living] in this house for twenty years. We [will have been sharing] our lives for decades. We [will have been growing] together.",
          highlightedRuleWrapper: "Brackets [] show Future Perfect Continuous."
      },
      practice: [
          {
              id: 'fpc1',
              question: 'By June, I ___ there for five years.',
              options: ['will work', 'will be working', 'will have been working'],
              correctAnswer: 2,
              explanation: "Duration of action up to a specific future point."
          }
      ]
  },
  {
      id: 'nouns',
      title: 'Nouns',
      description: 'Names of people, places, things, and ideas.',
      difficulty: 'beginner',
      explanation: `
         Nouns are naming words.
         Types:
         - Common: city, book, man
         - Proper: London, John, Monday
         - Countable: car (cars), dog (dogs)
         - Uncountable: water, rice, music
         - Collective: team, family, group
         - Abstract: love, happiness, freedom
      `,
      examples: [
          'The teacher gave us homework.',
          'Happiness is important in life.',
          'My family lives in New York.'
      ],
      commonMistakes: [
          {
              incorrect: 'I need an advice.',
              correct: 'I need some advice.',
              explanation: "Advice is uncountable and cannot be used with 'a' or 'an'."
          }
      ],
      storyContext: {
          title: "The Park",
          content: "The [children] are playing with a [ball]. The [sun] is shining. [Happiness] is everywhere.",
          highlightedRuleWrapper: "Brackets [] show different types of nouns."
      },
      practice: [
          {
              id: 'noun1',
              question: 'Which is a proper noun?',
              options: ['City', 'London', 'Country'],
              correctAnswer: 1,
              explanation: "London is a specific name of a city."
          }
      ]
  },
  {
      id: 'pronouns',
      title: 'Pronouns',
      description: 'Words used instead of nouns to avoid repetition.',
      difficulty: 'beginner',
      explanation: `
         Pronouns replace nouns:
         - Subject: I, you, he, she, it, we, they
         - Object: me, you, him, her, it, us, them
         - Possessive: mine, yours, his, hers, ours, theirs
         - Reflexive: myself, yourself, himself, herself, etc.
      `,
      examples: [
          'Mary is nice. She is my friend.',
          'This book is mine.',
          'He hurt himself while playing.'
      ],
      commonMistakes: [
          {
              incorrect: 'Me and him are friends.',
              correct: 'He and I are friends.',
              explanation: "Use subject pronouns for the subjects of sentences."
          }
      ],
      storyContext: {
          title: "The Surprise",
          content: "[She] gave [him] a gift. [It] was [his] birthday. [They] were both happy.",
          highlightedRuleWrapper: "Brackets [] show different types of pronouns."
      },
      practice: [
          {
              id: 'pro1',
              question: 'Which is an object pronoun?',
              options: ['He', 'His', 'Him'],
              correctAnswer: 2,
              explanation: "Him is used after a verb or preposition."
          }
      ]
  },
  {
      id: 'adjectives',
      title: 'Adjectives',
      description: 'Words that describe or modify nouns and pronouns.',
      difficulty: 'beginner',
      explanation: `
         Adjectives give more information:
         - Size: big, small, tiny
         - Color: red, blue, green
         - Opinion: beautiful, ugly, nice
         - Material: wooden, plastic, metal
         
         Comparison:
         - Comparative: bigger, more beautiful
         - Superlative: biggest, most beautiful
      `,
      examples: [
          'She is wearing a red dress.',
          'He lives in a big house.',
          'This is the most interesting book.'
      ],
      commonMistakes: [
          {
              incorrect: 'She is more tall than me.',
              correct: 'She is taller than me.',
              explanation: "One-syllable adjectives use -er for comparison."
          }
      ],
      storyContext: {
          title: "The Garden",
          content: "The [beautiful] flowers smelled [sweet]. The [old] gardener was [happy] with his [hard] work.",
          highlightedRuleWrapper: "Brackets [] show adjectives."
      },
      practice: [
          {
              id: 'adj1',
              question: 'Which is a superlative adjective?',
              options: ['Better', 'Good', 'Best'],
              correctAnswer: 2,
              explanation: "Best is the superlative form of good."
          }
      ]
  },
  {
      id: 'verbs',
      title: 'Verbs',
      description: 'Action or state words.',
      difficulty: 'beginner',
      explanation: `
         Verbs are essential parts of sentences:
         - Action: run, jump, think, write
         - State/Linking: be (am, is, are), seem, feel, appearing
         
         Main vs Auxiliary:
         - Main: I [eat] pizza.
         - Auxiliary: I [am] eating pizza.
      `,
      examples: [
          'She runs every morning.',
          'I feel happy today.',
          'They have finished their work.'
      ],
      commonMistakes: [
          {
              incorrect: 'She run every day.',
              correct: 'She runs every day.',
              explanation: "Third-person singular subjects need an -s suffix in present simple."
          }
      ],
      storyContext: {
          title: "The Race",
          content: "The athlete [runs] quickly. He [feels] the wind. He [wants] to [win].",
          highlightedRuleWrapper: "Brackets [] show verbs."
      },
      practice: [
          {
              id: 'verb1',
              question: 'Which is a linking verb?',
              options: ['Run', 'Be', 'Write'],
              correctAnswer: 1,
              explanation: "'Be' links the subject to a description."
          }
      ]
  },
  {
      id: 'adverbs',
      title: 'Adverbs',
      description: 'Words that modify verbs, adjectives, or other adverbs.',
      difficulty: 'intermediate',
      explanation: `
         Adverbs tell us how, when, where, or how much:
         - Manner: quickly, slowly, well
         - Time: yesterday, now, soon
         - Place: here, there, everywhere
         - Degree: very, extremely, quite
         
         Often end in -ly, but not always (fast, hard, well).
      `,
      examples: [
          'He speaks English very well.',
          'She ran quickly to the door.',
          'I will call you tomorrow.'
      ],
      commonMistakes: [
          {
              incorrect: 'He speaks good.',
              correct: 'He speaks well.',
              explanation: "'Good' is an adjective; 'well' is an adverb."
          }
      ],
      storyContext: {
          title: "The Secret",
          content: "He spoke [quietly]. She listened [carefully]. They walked [slowly] away.",
          highlightedRuleWrapper: "Brackets [] show adverbs."
      },
      practice: [
          {
              id: 'adv1',
              question: 'Which is an adverb of frequency?',
              options: ['Quickly', 'Always', 'Here'],
              correctAnswer: 1,
              explanation: "Always tells us how often something happens."
          }
      ]
  },
  {
      id: 'conjunctions',
      title: 'Conjunctions',
      description: 'Linking words used to connect sentences or parts of sentences.',
      difficulty: 'beginner',
      explanation: `
         Conjunctions join things together:
         - Coordinating (FANBOYS): for, and, nor, but, or, yet, so
         - Subordinating: because, although, if, while, since
         - Correlative: either...or, neither...nor, both...and
      `,
      examples: [
          'I like tea and coffee.',
          'He was tired but he kept working.',
          'I stayed home because it was raining.'
      ],
      commonMistakes: [
          {
              incorrect: 'Although it was raining, but I went out.',
              correct: 'Although it was raining, I went out.',
              explanation: "Do not use 'although' and 'but' together."
          }
      ],
      storyContext: {
          title: "The Choice",
          content: "I wanted to go [but] it was late. [Since] I was tired, I stayed home [and] slept.",
          highlightedRuleWrapper: "Brackets [] show conjunctions."
      },
      practice: [
          {
              id: 'conj1',
              question: 'Which conjunction shows a reason?',
              options: ['And', 'But', 'Because'],
              correctAnswer: 2,
              explanation: "Because introduces a cause or reason."
          }
      ]
  },
  {
      id: 'interjections',
      title: 'Interjections',
      description: 'Words that express strong feelings or sudden emotion.',
      difficulty: 'beginner',
      explanation: `
         Interjections express:
         - Surprise: Wow! Oh!
         - Pain: Ouch!
         - Joy: Yay! Hurray!
         - Hesitation: Um, well
         
         They often stand alone and are followed by an exclamation mark.
      `,
      examples: [
          'Wow! That is amazing.',
          'Ouch! That hurt.',
          'Yay! We won!'
      ],
      commonMistakes: [
          {
              incorrect: 'I am wow.',
              correct: 'Wow! I am happy.',
              explanation: "Interjections are usually separate from the main sentence structure."
          }
      ],
      storyContext: {
          title: "The Goal",
          content: "[Ouch!] I hit my knee. [Oh!] Are you okay? [Yay!] We scored a goal!",
          highlightedRuleWrapper: "Brackets [] show interjections."
      },
      practice: [
          {
              id: 'int1',
              question: 'Which interjection shows surprise?',
              options: ['Ouch!', 'Wow!', 'Um'],
              correctAnswer: 1,
              explanation: "Wow! is used to express surprise or admiration."
          }
      ]
  }
];
