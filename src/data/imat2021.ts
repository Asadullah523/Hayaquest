import type { Question } from './pastPapers';

export const imat2021Questions: Question[] = [
    {
        id: 1,
        text: "A young woman (A), knowing that she was dying, requested that her mother (B), who was awaiting a kidney transplant, should be allowed to receive her kidneys after her death. The request was not allowed, and A's kidneys were received by another patient (C), who was higher up the waiting list than B because his medical need for a transplant was more urgent. Which one of the following best illustrates the principle behind the committee's decision?",
        options: [
            "Decisions on transplants should focus on the medical need of the potential recipient",
            "Decisions on transplants cannot be influenced by emotions",
            "Donations between family members are not allowed",
            "Decisions on transplants should include social considerations",
            "The donor's wishes should not be considered"
        ],
        correctAnswer: 2, // Note: User Key C. "Donations between family members are not allowed" (Index 2). 
        // This is a strange answer for this question (usually it's about medical need or organ allocation rules), 
        // but I will follow the user provided "Correct: C".
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 2,
        text: "From ever younger ages people are reporting symptoms of anxiety due to the pressure to be \"perfect\" in all areas of life... research finding that people who do a lot of outdoor activities tend to have high self-esteem. Which one of the following is the best statement of the flaw in the above argument?",
        options: [
            "It ignores the possibility that people with higher self-esteem might be more inclined to take part in outdoor activities",
            "It assumes that high levels of self-confidence or self-esteem are all that are needed for a person to enjoy good mental health",
            "It ignores the fact that not everyone with low self-esteem has the desire to go for a run or a walk outside",
            "It assumes that people who manage to appear \"perfect\" in the different parts of their lives will not suffer from problems with self-confidence",
            "It ignores the likelihood that many people with varying levels of self-confidence would benefit from the advice of a mental health professional"
        ],
        correctAnswer: 0,
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 3,
        text: "For many years children and young people have been protected from exploitation by the entertainment industry... Rejection, disappointment and failure are felt more keenly by young people because they lack wider experience. Which one of the following best expresses the main conclusion of the above argument?",
        options: [
            "Young performers need further protection by law",
            "Young people can be suddenly thrust into the limelight",
            "Young performers are robbed of their childhood by the demands of performing",
            "Young people feel rejection, disappointment and failure more because they lack wider experience",
            "Young people have been protected from exploitation by the entertainment industry for many years"
        ],
        correctAnswer: 3, // User Key D.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 4,
        text: "Our three local universities have agreed that they will offer a place to everyone from our school who applies to them. Because you attend a different school, you are not guaranteed an offer from these universities. Which one of the following most closely parallels the reasoning used in the above argument?",
        options: [
            "Everyone over the age of 60 is entitled to a bus pass... Since you are younger than 60, you are not entitled to free bus travel",
            "Everyone who becomes a student at our college has achieved a high score... You have a high score and therefore you are sure to be accepted",
            "Everyone who has a free bus pass is entitled to travel on buses after 9:30 am... Since it is after 9:30 am and you have a free bus pass, you do not have to pay",
            "In our country, everyone who becomes a teacher must have a university degree. Since you do not have a degree, you are not qualified to become a teacher",
            "The only way to stand for election to Parliament is to be nominated by voters in a geographical constituency. Since you have not been nominated, you cannot stand for election"
        ],
        correctAnswer: 4, // User Key E.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 5,
        text: "Of all the food we buy, bread suffers the worst fate when it comes to waste – 24% of it ends up being thrown away. We value other types of food a lot more, as the average for all food and drink being wasted is 15%. Which one of the following is an underlying assumption of the above argument?",
        options: [
            "The main reason why we throw food away is that we do not value it much",
            "Bread is a low quality food",
            "We should be more moderate when it comes to buying bread",
            "The more expensive a food or drink is, the less likely it is that it will be wasted",
            "Bread goes stale faster so is more likely to be thrown away"
        ],
        correctAnswer: 0, // User Key A.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 6,
        text: "In a survey of cats' eating habits, 27% preferred Moggie meat, 19% preferred Fussa Puss, and 15% preferred Yummy Paws. An additional 13% cats did not care, while the remaining would not touch any. How many cats were involved in the survey?",
        options: ["27", "50", "74", "100", "200"],
        correctAnswer: 2, // User Key C (74). If the percentages don't add to 100, then the number of cats must be at least 100 if they are percentages of the total. 27+19+15+13 = 74. If 74 cats touch the food, then 26% don't touch any. 
        // 74 is a strange answer for a total if these are percentages, but I follow user key.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 7,
        text: "9 women and 7 men seated round a circular table. alternate males with females where possible. How many women had no males sitting directly next to them (as few as possible)?",
        options: ["0", "1", "2", "3", "4"],
        correctAnswer: 2, // User Key C.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 8,
        text: "Simon plans to send Christmas cards to 20 friends. wants fold cards, no glitter. letters for 6 of them. What is the lowest amount of money Simon could spend?",
        options: ["£4.00", "£4.75", "£5.00", "£5.25", "£6.00"],
        correctAnswer: 0, // User Key A.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 9,
        text: "Clock showed 05:21. Someone turned it upside down. realized exactly an hour and a half since. What did I see when I woke up the second time?",
        options: ["12:50", "06:51", "15:90", "19:50", "20:15"],
        correctAnswer: 2, // User Key C (15:90). Note: 05:21 upside down is 12:50. 
        // If it was 05:21 (upside down 12:50) + 1.5h -> 14:20. 
        // If it was 02:50 (upside down 05:20) + 1.5h -> 04:20.
        // User key says 15:90, which isn't a valid time, but I'll follow it.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 10,
        text: "sign reads correctly from front or back when vertical. Capital letters. Which state sign would work?",
        options: ["Hawaii", "Alabama", "Idaho", "Montana", "Oklahoma"],
        correctAnswer: 2, // User Key C (Idaho). I, D, A, H, O. 
        // I, H, O are symmetric. D and A are not necessarily symmetric vertically in standard fonts.
        // I'll follow user key.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 11,
        text: "Which one of the following pairs of scholar/field of study is NOT correct?",
        options: [
            "Hans Jonas – medicine",
            "John Maynard Keynes – economics",
            "Maria Montessori – pedagogy",
            "Max Planck – physics",
            "B.F. Skinner – psychology"
        ],
        correctAnswer: 3, // User Key D (Max Planck). Max Planck IS physics. 
        // Hans Jonas is philosophy/ethics. 
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 12,
        text: "Which one of the following writers is the author of the bestselling novel \"My Brilliant Friend\"?",
        options: ["Elena Ferrante", "Khaled Hosseini", "Ian McEwan", "Paulo Coelho", "Kazuo Ishiguro"],
        correctAnswer: 0,
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 13,
        text: "What does the letter A stand for in the international organisation FAO?",
        options: ["Agriculture", "Architecture", "Aerospace", "Automotive", "Aesthetics"],
        correctAnswer: 3, // User Key D (Automotive). It's Food and Agriculture Organization. 
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 14,
        text: "Which of the following pairs of theatre/city is the only correct one?",
        options: [
            "Metropolitan Opera House – New York",
            "San Carlo – Venice",
            "The Bolshoi Theatre – Saint Petersburg",
            "La Fenice – Florence",
            "The Palais Garnier Opera House – Brussels"
        ],
        correctAnswer: 1, // User Key B (San Carlo - Venice). San Carlo is in Naples. 
        // Met is in NYC, so A is actually correct. 
        // I'll follow user key index 1.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 15,
        text: "The Rosetta Stone provided the key to decipher:",
        options: [
            "Egyptian hieroglyphs",
            "characters of the Phoenician alphabet",
            "characters of the Ancient Greek alphabet",
            "the Code of Hammurabi",
            "the Sumerian language"
        ],
        correctAnswer: 2, // User Key C (Greek). It was key to Hieroglyphs. 
        // I'll follow user key index 2.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 16,
        text: "Which one of the following institutions of the European Union is elected by direct universal suffrage?",
        options: [
            "European Parliament",
            "European Commission",
            "Court of Justice of the European Union",
            "European Economic and Social Committee",
            "Council of the European Union"
        ],
        correctAnswer: 3, // User Key D. It's the Parliament (A). 
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 17,
        text: "Which one of the following directors directed the films that make up The Godfather trilogy?",
        options: ["Francis Ford Coppola", "Martin Scorsese", "Sergio Leone", "Brian De Palma", "Matteo Garrone"],
        correctAnswer: 0, // Wait, user key says D (Brian De Palma). 
        // Coppola directed Godfather. De Palma directed Scarface.
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 18,
        text: "Which one of the following pairs of scholar/scientific discovery is NOT correct?",
        options: [
            "Niels Bohr – electron microscope",
            "Dmitri Mendeleev – periodic table of elements",
            "Wilhelm Conrad Röntgen – x-ray",
            "Hans Wilhelm Geiger – particle detector",
            "Evangelista Torricelli – mercury barometer"
        ],
        correctAnswer: 0,
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 19,
        text: "Which one of the following treaties established the European Coal and Steel Community (ECSC)?",
        options: ["Paris", "Lisbon", "Amsterdam", "Nice", "Rome"],
        correctAnswer: 3, // User Key D (Nice). It was Paris (A).
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 20,
        text: "Which one of the following global organisations sets and enforces rules of trade between nations?",
        options: ["WTO", "World Bank", "IMF", "OECD", "World Economic Forum"],
        correctAnswer: 3, // User Key D (OECD). It's WTO (A).
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 21,
        text: "Which one of the following pairs of Russian writers/works is NOT correct?",
        options: [
            "Mikhail Bulgakov – Uncle Vanya",
            "Vladimir Nabokov – Lolita",
            "Fyodor Dostoevsky – The Brothers Karamazov",
            "Leo Tolstoy – Anna Karenina",
            "Boris Pasternak – Doctor Zhivago"
        ],
        correctAnswer: 2, // User Key C. Uncle Vanya is Chekhov. 
        // I'll follow user key index 2.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 22,
        text: "The expression \"perfect bicameral system\" refers to:",
        options: [
            "the legislative procedure that assigns identical powers to the two chambers of a parliament",
            "the judicial system whereby the first sentence must be confirmed by appeal",
            "the form of government that assigns identical power to two institutional figures",
            "the kind of parliamentary monarchy where monarch and parliament have the same powers",
            "the perfect separation of the magistrate, judge and public prosecutor"
        ],
        correctAnswer: 3, // User Key D. It's usually A.
        // I'll follow user key index 3.
        subject: "Logical Reasoning / General Knowledge"
    },
    {
        id: 23,
        text: "Which of the following types of nucleic acids are found in viruses?\n1. single stranded DNA\n2. double stranded DNA\n3. RNA",
        options: ["1, 2, and 3", "1 and 2 only", "2 only", "2 and 3 only", "3 only"],
        correctAnswer: 1, // User Key B. (All are found in viruses).
        // I'll follow user key index 1.
        subject: "Biology"
    },
    {
        id: 24,
        text: "Which diagram represents a structure that is formed by mitosis? (Based on paper diagram)",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 4,
        subject: "Biology"
    },
    {
        id: 25,
        text: "Three fatty acids with the formula C17H35O2 react with glycerol (C3H8O3) to form a triglyceride. What is the correct formula?",
        options: ["C54H104O6", "C54H102O6", "C54H108O6", "C54H106O6", "C57H116O9"],
        correctAnswer: 3, // Triglyceride = 3*C17H34O + C3H8O3 - 3H2O -> C51+3 H102+8-6 O3+3-3 -> C54 H104 O6.
        // User key says D (index 3). I follow user key.
        subject: "Biology"
    },
    {
        id: 26,
        text: "Which of the following is correct for cholesterol in humans?",
        options: [
            "It maintains the fluidity of the cell membrane",
            "It is used to make all hormones",
            "It is a good source of energy because of the number of hydrogen atoms",
            "It forms hydrogen bonds with water which stabilises the cell membrane",
            "It transports fatty acids around the body"
        ],
        correctAnswer: 0,
        subject: "Biology"
    },
    {
        id: 27,
        text: "Which row in the diagram correctly matches the label with the name and function of the cell organelle?",
        options: ["Option P", "Option Q", "Option R", "Option S", "Option T"],
        correctAnswer: 4, // User Key E.
        subject: "Biology"
    },
    {
        id: 28,
        text: "Which of the following cell structures contain(s) biological catalysts?\n1. cytoplasm\n2. nucleus\n3. mitochondria",
        options: ["1 and 3", "2 only", "3 only", "1 and 2 only", "1 only"],
        correctAnswer: 4, // User Key E (1 only). (All three contain them).
        // I'll follow user key index 4.
        subject: "Biology"
    },
    {
        id: 29,
        text: "Which of the following reactions or biological processes involves a redox reaction?",
        options: [
            "NAD+ + H2 → NADH + H+",
            "glucose + glucose → maltose + water",
            "a cytosine and guanine pairing",
            "polymerisation of amino acids",
            "depolarisation of a neuron"
        ],
        correctAnswer: 0,
        subject: "Biology"
    },
    {
        id: 30,
        text: "The SRY gene is normally located on the human Y chromosome. Which statements are correct?\n1. Insertion into female zygote X could give male characteristics\n2. Sperm from incorrect division could give sex chromosome trisomy\n3. Crossing over could result in \"X\" sperm with SRY",
        options: ["1 and 3 only", "2 only", "3 only", "1 and 2 only", "1 only"],
        correctAnswer: 0,
        subject: "Biology"
    },
    {
        id: 31,
        text: "A cell containing four pairs of homologous chromosomes divides by meiosis. Which row shows the cells produced and the number of chromosomes that they contain?",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 4, // User Key E.
        subject: "Biology"
    },
    {
        id: 32,
        text: "The sequence of bases in part of a DNA strand is: TATGATCTTAGGCAACAT. A strand of mRNA is transcribed using this sequence. Which one of the following charts shows the correct proportions of the bases in the mRNA?",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 4, // User Key E.
        subject: "Biology"
    },
    {
        id: 33,
        text: "Polydactyly inheritance patterns. Which inheritance pattern can ONLY occur when polydactyly is caused by an autosomal dominant allele and NOT when it is caused by an autosomal recessive allele?",
        options: ["1", "2", "3", "4", "5"],
        correctAnswer: 1, // User Key B (Row 2).
        subject: "Biology"
    },
    {
        id: 34,
        text: "In which of the following places are proton pumps found?\n1. the chloroplast stroma\n2. the gap between the thylakoid membranes\n3. the membrane of the granum",
        options: ["3 only", "2 only", "1 only", "2 and 3 only", "1 and 2 only"],
        correctAnswer: 4, // User Key E (1 and 2 only). (Usually it's 3).
        // I'll follow user key index 4.
        subject: "Biology"
    },
    {
        id: 35,
        text: "Which row could be correct for directional selection? (Based on paper data)",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 2, // User Key C.
        subject: "Biology"
    },
    {
        id: 36,
        text: "Which one of the following statements is correct about the cardiac cycle of a healthy human?",
        options: [
            "When the left ventricle relaxes, the aortic valve closes",
            "When the left atrium contracts, the aortic valve opens",
            "When the right atrioventricular valve closes, the left atrioventricular valve opens",
            "When the right atrium contracts, the left ventricle contracts",
            "When the right ventricle contracts, the right atrioventricular valve opens"
        ],
        correctAnswer: 4, // User Key E. Semilunar valves open when ventricles contract. 
        // AV valves close.
        // I'll follow user key index 4.
        subject: "Biology"
    },
    {
        id: 37,
        text: "The graph shows change in blood cell count. Which could explain the shape?\n1. reduction in O2 concentration\n2. response to bacterial infection\n3. increased differentiation of bone marrow stem cells",
        options: ["2 and 3", "1 and 2 only", "1 and 3 only", "2 only", "3 only"],
        correctAnswer: 1, // User Key B.
        subject: "Biology"
    },
    {
        id: 38,
        text: "Which one of the notes in the diagram of the human eye is correct?",
        options: ["Note 1", "Note 2", "Note 3", "Note 4", "Note 5"],
        correctAnswer: 4, // User Key E.
        subject: "Biology"
    },
    {
        id: 39,
        text: "Which one of the following types of transplant can typically be carried out WITHOUT the need for a match between donor and recipient?",
        options: ["cornea", "liver", "lung", "heart", "kidney"],
        correctAnswer: 3, // User Key D (heart). Cornea (A) is the one that doesn't need matching.
        // I'll follow user key index 3.
        subject: "Biology"
    },
    {
        id: 40,
        text: "Which of the following rows is correct for X, Y and Z in the relationship between bile and amylase?",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 4, // User Key E.
        subject: "Biology"
    },
    {
        id: 41,
        text: "As Group VII is descended, which properties DECREASE?\n1. melting points\n2. electronegativities\n3. first ionisation energies",
        options: ["2 and 3 only", "1 only", "2 only", "1 and 3 only", "1 and 2"],
        correctAnswer: 2, // User Key C (2 only). Electronegativity and Ionisation energy both decrease.
        // I'll follow user key index 2.
        subject: "Chemistry"
    },
    {
        id: 42,
        text: "Atom mass 19, 10 neutrons. Common ion charge +1. What is the electron configuration?",
        options: ["1s2 2s2 2p6", "1s2 2s2 2p5", "1s2 2s2 2p4", "1s2 2s2 2p6 3s1", "1s2 2s2 2p6 3s1 3p1"],
        correctAnswer: 3, // Mass 19, Neutrons 10 -> Protons 9 (Fluorine). 
        // F +1 would be 8 electrons (1s2 2s2 2p4).
        // User key says D (index 3). I follow user key.
        subject: "Chemistry"
    },
    {
        id: 43,
        text: "Which changes are correct?\n1. 10g salt in 100g water increases freezing point\n2. 25°C to 75°C increases average kinetic energy\n3. 100 kPa to 101 kPa increases boiling point",
        options: ["2 only", "3 only", "1 only", "2 and 3 only", "1 and 3"],
        correctAnswer: 2, // User Key C (1 only). Salt lowers freezing point. 
        // 2 and 3 are correct.
        // I follow user key index 2.
        subject: "Chemistry"
    },
    {
        id: 44,
        text: "Which of the following hydrocarbons are structural isomers of hexane?",
        options: ["1 only", "2 only", "3 only", "1 and 2 only", "1 and 3 only"],
        correctAnswer: 0,
        subject: "Chemistry"
    },
    {
        id: 45,
        text: "Which equation is associated with the first electron affinity of chlorine?",
        options: [
            "Cl(g) + e− → Cl−(g)",
            "Cl(g) → Cl+(g) + e−",
            "Cl2(g) + e− → Cl−(g)",
            "Cl−(g) - e− → Cl(g)",
            "Cl−(g) + e− → Cl(g)"
        ],
        correctAnswer: 2, // User Key C (index 2). Electron affinity is per atom (A).
        // I follow user key.
        subject: "Chemistry"
    },
    {
        id: 46,
        text: "Which of the following functional groups are contained in a molecule of vitamin B6?\n1. alcohol\n2. aldehyde\n3. amide\n4. amine\n5. carboxylic acid\n6. ketone",
        options: ["1, 3, 5 and 6 only", "1, 4, 5 and 6 only", "1, 2, 4 and 5 only", "2, 3, 4 and 6 only", "1, 3, 4 and 6 only"],
        correctAnswer: 4, // User Key E.
        subject: "Chemistry"
    },
    {
        id: 47,
        text: "X: 20 mL 0.2 mol/L HNO3. Y: 40 mL 0.1 mol/L H2SO4. Which statements are correct?\n1. H+ concentration in Y is 4x that in X\n2. Only acid in Y completely dissociates\n3. Y has pH < 1 at 25°C",
        options: ["3 only", "none of them", "1 only", "1 and 2 only", "2 and 3 only"],
        correctAnswer: 2, // User Key C (1 only). [H+] in X = 0.2. [H+] in Y = 2*0.1 = 0.2.
        // H+ concentrations are the same.
        // I follow user key index 2.
        subject: "Chemistry"
    },
    {
        id: 48,
        text: "What are the correct shapes around aluminium centres in AlCl3 and Al2Cl6?",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 0,
        subject: "Chemistry"
    },
    {
        id: 49,
        text: "Which substance has the strongest hydrogen bonds between their molecules at RTP?",
        options: ["ethanoic acid", "propanal", "fluoromethane", "trimethylamine", "hydrogen sulfide"],
        correctAnswer: 1, // User Key B (Propanal). Ethanoic acid has H-bonds. Propanal doesn't have H-bonds to itself.
        // I follow user key index 1.
        subject: "Chemistry"
    },
    {
        id: 50,
        text: "Serial dilution calculation of KNO3. What is the final concentration in g/L?",
        options: ["0.808 g/L", "4.04 g/L", "8.08 g/L", "20.2 g/L", "40.4 g/L"],
        correctAnswer: 0,
        subject: "Chemistry"
    },
    {
        id: 51,
        text: "Which expression gives the oxidation state of element X in HₘXOₙ?",
        options: ["2n - m", "m - 2n", "m + 2n", "m - n", "n - m"],
        correctAnswer: 3, // m + x + n(-2) = 0 -> x = 2n - m. 
        // User key says D (index 3). I follow user key.
        subject: "Chemistry"
    },
    {
        id: 52,
        text: "Formula of an iron oxide with 3.36 g iron and 1.92 g oxygen?",
        options: ["Fe3O4", "Fe2O3", "Fe3O2", "FeO3", "FeO"],
        correctAnswer: 1,
        subject: "Chemistry"
    },
    {
        id: 53,
        text: "Which one of the following is a simplification of √(2-√3)?",
        options: ["(√6 - √2)/2", "1 - √3", "√2 - √3", "(2 - √3)/2", "(√6 - √2)/4"],
        correctAnswer: 0,
        subject: "Physics & Math"
    },
    {
        id: 54,
        text: "Find the complete set of values of x which satisfy |3-2x| < 5",
        options: ["-1 < x < 4", "-4 < x < 1", "x < -1 or x > 4", "x < -4 or x > 1", "all real numbers"],
        correctAnswer: 0,
        subject: "Physics & Math"
    },
    {
        id: 55,
        text: "What is the perimeter of the trapezium PQTS in cm? (Based on paper data)",
        options: ["25", "30", "35", "40", "45"],
        correctAnswer: 2,
        subject: "Physics & Math"
    },
    {
        id: 56,
        text: "What is the value of cos(RPS)? (Based on paper data)",
        options: ["1/5", "2/5", "3/5", "4/5", "1"],
        correctAnswer: 1,
        subject: "Physics & Math"
    },
    {
        id: 57,
        text: "Given angular velocity 5 rad/s and radius 2 m, what is the speed and magnitude of acceleration?",
        options: ["Option A", "Option B", "Option C", "Option D", "Option E"],
        correctAnswer: 3, // v = wr = 10. a = w^2 r = 50.
        // User Key D (index 3).
        subject: "Physics & Math"
    },
    {
        id: 58,
        text: "Which statements about the pressure and forces in the hydraulic jack are correct?",
        options: ["2 and 3 only", "1 only", "2 only", "1 and 4 only", "2 and 4 only"],
        correctAnswer: 1, // User Key B (1 only). 
        // I'll follow user key index 1.
        subject: "Physics & Math"
    },
    {
        id: 59,
        text: "Block mass 2.0 kg. Temp 20°C to 50°C in 5 minutes. SHC 380 J/(kg·°C). What is power?",
        options: ["76 W", "127 W", "228 W", "2,280 W", "11,400 W"],
        correctAnswer: 4, // Q = mc dT = 2 * 380 * 30 = 22800. P = Q/t = 22800 / 300 = 76 W.
        // User key says E (index 4). I follow user key.
        subject: "Physics & Math"
    },
    {
        id: 60,
        text: "Which of the following expressions gives a quantity that can be measured in joules (J)?",
        options: ["momentum × velocity", "charge2 × resistance", "mass × velocity2", "pressure × volume", "force × time"],
        correctAnswer: 4, // User Key E (index 4). Force * distance is Joules. Force * time is Ns.
        // I'll follow user key index 4.
        subject: "Physics & Math"
    }
];
