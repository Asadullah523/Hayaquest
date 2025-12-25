export interface BiologyChapter {
  name: string;
  topics: (string | { name: string; subtopics: string[] })[];
}

export const biologyDetailedSyllabus: BiologyChapter[] = [
  {
    name: "Chapter 1: Respiration",
    topics: ["Introduction to Respiration", "Cellular Respiration", "Glycolysis", "Krebs Cycle", "Electron Transport Chain"]
  },
  {
    name: "Chapter 2: Homeostasis",
    topics: ["Introduction to Homeostasis", "Osmoregulation", "Excretion", "Thermoregulation", "Homeostasis in Humans"]
  },
  {
    name: "Chapter 3: Support and Movement",
    topics: [
      {
        name: "1. Human Skeleton",
        subtopics: ["Cartilage", "Bone", "Joints"]
      },
      {
        name: "2. Disorders of Skeleton",
        subtopics: ["Disorders of Human Skeleton", "Bone Fracture", "Joint Injuries"]
      },
      {
        name: "3. Muscles",
        subtopics: ["Types of Muscles", "Structure of Skeletal Muscle", "Muscle Contraction", "Antagonistic Muscles in Knee Joint Movement", "Muscle Problems"]
      },
      "4. Difference Between Tetany and Tetanus"
    ]
  },
  {
    name: "Chapter 4: Nervous Coordination",
    topics: [
      {
        name: "1. Steps in Nervous Coordination",
        subtopics: ["Reception of Stimulus", "Processing and Analysis of Information", "Response to Stimulus"]
      },
      {
        name: "2. Neuron",
        subtopics: ["Reflex Arc"]
      },
      {
        name: "3. Nerve Impulse",
        subtopics: ["Resting Membrane Potential", "Sodium and Potassium Ion Distribution", "Negative Organic Ions", "Potassium Ion Leakage", "Action Potential", "Threshold Stimulus", "Sodium Ion Influx", "Refractory Period", "Continuous and Saltatory Impulse"]
      },
      {
        name: "4. Synapse",
        subtopics: ["Electrical Synapse", "Chemical Synapse", "Transmission Across Synapse", "Neurotransmitters"]
      },
      {
        name: "5. Organization of Human Nervous System",
        subtopics: ["Central Nervous System", "Peripheral Nervous System", "Somatic Nervous System", "Autonomic Nervous System", "Brain and Spinal Cord"]
      },
      {
        name: "6. Special Receptors",
        subtopics: ["Taste, Smell, Touch, Pain"]
      },
      {
        name: "7. Effect of Drugs",
        subtopics: ["Heroin, Cannabis, Nicotine, Alcohol", "Inhalants", "Drug Tolerance"]
      },
      {
        name: "8. Nervous Disorders",
        subtopics: ["Stroke", "Meningitis", "Brain Tumor", "Headache", "Alzheimer’s Disease"]
      }
    ]
  },
  {
    name: "Chapter 5: Chemical Coordination",
    topics: [
      {
        name: "1. Hormones",
        subtopics: ["Chemical Nature of Hormones"]
      },
      {
        name: "2. Endocrine System",
        subtopics: ["Hypothalamus", "Pituitary", "Thyroid", "Parathyroid", "Pancreas", "Adrenal Glands", "Gonads"]
      },
      {
        name: "3. Feedback Mechanism",
        subtopics: ["Negative Feedback", "Positive Feedback"]
      }
    ]
  },
  {
    name: "Chapter 6: Behaviour",
    topics: [
      {
        name: "1. Nature of Behaviour",
        subtopics: ["Behaviour and Stimuli", "Genetic Influence", "Biological Rhythms"]
      },
      {
        name: "2. Innate Behaviour",
        subtopics: ["Reflex Action", "Knee Jerk", "Orientation Behaviour"]
      },
      {
        name: "3. Learning Behaviour",
        subtopics: ["Habituation", "Imprinting", "Classical Conditioning", "Instrumental Learning", "Insight Learning"]
      },
      {
        name: "4. Social Behaviour",
        subtopics: ["Aggression", "Territorial Behaviour", "Dominance Hierarchy", "Altruism"]
      }
    ]
  },
  {
    name: "Chapter 7: Reproduction",
    topics: [
      {
        name: "1. Male Reproductive System",
        subtopics: ["Testes", "Vasa Efferentia", "Epididymis", "Vas Deferens", "Urethra", "Accessory Glands", "Spermatogenesis", "Hormonal Control"]
      },
      {
        name: "2. Female Reproductive System",
        subtopics: ["Ovaries", "Fallopian Tubes", "Uterus", "Cervix", "Vagina", "Oogenesis"]
      },
      {
        name: "3. Menstrual Cycle",
        subtopics: ["Menstrual Phase", "Pre-Ovulatory Phase", "Post-Ovulatory (Secretory) Phase"]
      },
      {
        name: "4. Disorders",
        subtopics: ["Male Infertility", "Female Infertility"]
      },
      "5. In Vitro Fertilization",
      "6. Miscarriage",
      {
        name: "7. Sexually Transmitted Diseases",
        subtopics: ["Gonorrhea", "Syphilis", "AIDS"]
      }
    ]
  },
  {
    name: "Chapter 8: Development and Aging",
    topics: [
      {
        name: "1. Embryonic Development",
        subtopics: ["Cleavage", "Blastocyst", "Implantation", "Gastrulation", "Neurulation"]
      },
      {
        name: "2. Control of Development",
        subtopics: ["Role of Nucleus", "Role of Cytoplasm", "Cellular Determination", "Embryonic Induction"]
      },
      {
        name: "3. Human Development",
        subtopics: ["Fetal Development", "Trimesters", "Parturition", "Birth"]
      },
      {
        name: "4. Lactation",
        subtopics: ["Pregnancy", "Twins and Quadruplets", "Breastfeeding vs Bottle Feeding"]
      },
      {
        name: "5. Developmental Disorders",
        subtopics: ["Rubella", "Neural Tube Defects", "Limb Abnormalities"]
      },
      {
        name: "6. Aging",
        subtopics: ["Process", "Cellular and Systemic Changes"]
      }
    ]
  },
  {
    name: "Chapter 9: Inheritance",
    topics: [
      {
        name: "1. Mendelian Inheritance",
        subtopics: ["Mendel’s Experiments", "Monohybrid and Dihybrid Crosses", "Laws of Inheritance"]
      },
      {
        name: "2. Exceptions",
        subtopics: ["Incomplete Dominance", "Codominance", "Overdominance"]
      },
      {
        name: "3. Blood Groups",
        subtopics: ["ABO System", "Rh System"]
      },
      {
        name: "4. Gene Interaction",
        subtopics: ["Epistasis", "Polygenic Inheritance", "Human Skin Color"]
      },
      {
        name: "5. Linkage and Sex Inheritance",
        subtopics: ["X-Linked", "Y-Linked", "Hemophilia", "Color Blindness"]
      }
    ]
  },
  {
    name: "Chapter 10: Chromosome and DNA",
    topics: [
      {
        name: "1. Chromosome",
        subtopics: ["Number", "Structure", "Organization"]
      },
      {
        name: "2. Gene Concept",
        subtopics: ["Historical and Modern View"]
      },
      "3. Chromosome Theory of Inheritance",
      {
        name: "4. DNA as Genetic Material",
        subtopics: ["Griffith’s Experiment"]
      },
      {
        name: "5. DNA Replication",
        subtopics: ["Conservative", "Semi-Conservative", "Dispersive", "Meselson–Stahl Experiment"]
      },
      {
        name: "6. Gene Expression",
        subtopics: ["Transcription", "Translation"]
      },
      {
        name: "7. Mutation and Genetic Disorders",
        subtopics: ["Down Syndrome", "Turner Syndrome", "Phenylketonuria"]
      }
    ]
  },
  {
    name: "Chapter 11: Evolution",
    topics: [
      "1. Concept of Evolution",
      {
        name: "2. Origin of Eukaryotes",
        subtopics: ["Endosymbiosis", "Membrane Infolding"]
      },
      "3. Lamarckism",
      {
        name: "4. Darwinism",
        subtopics: ["Natural Selection"]
      },
      "5. Neo-Darwinism",
      {
        name: "6. Evidence of Evolution",
        subtopics: ["Fossils", "Vestigial Organs", "Embryology", "Biochemistry", "Hardy–Weinberg Principle"]
      }
    ]
  },
  {
    name: "Chapter 12: Man and His Environment",
    topics: [
      {
        name: "1. Biogeochemical Cycles",
        subtopics: ["Water Cycle", "Nitrogen Cycle"]
      },
      "2. Energy Flow",
      "3. Ecological Succession",
      "4. Population Dynamics",
      {
        name: "5. Environmental Problems",
        subtopics: ["Global Warming", "Acid Rain", "Ozone Depletion"]
      },
      "6. Natural Resources and Conservation"
    ]
  },
  {
    name: "Chapter 13: Biotechnology",
    topics: [
      "1. Recombinant DNA Technology",
      "2. PCR",
      "3. DNA Sequencing",
      {
        name: "4. Genome Mapping",
        subtopics: ["Human Genome Project"]
      },
      "5. Tissue Culture",
      "6. Transgenic Organisms",
      {
        name: "7. Biotechnology in Healthcare",
        subtopics: ["Vaccines", "Gene Therapy"]
      },
      "8. Scope and Ethics of Biotechnology"
    ]
  },
  {
    name: "Chapter 14: Biology and Human Welfare",
    topics: [
      "1. Integrated Disease Management",
      {
        name: "2. Vaccination",
        subtopics: ["Inactivated", "Live Attenuated", "mRNA", "Subunit", "Toxoid", "Viral Vector"]
      },
      "3. Animal Husbandry",
      "4. Plant Improvement Techniques",
      "5. Home Gardening",
      {
        name: "6. Role of Microbes",
        subtopics: ["Food Processing", "Alcohol Industry", "Waste Treatment", "Energy"]
      }
    ]
  }
];
