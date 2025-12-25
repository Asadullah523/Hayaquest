import type { Priority } from '../../types';

export interface SyllabusSubject {
  name: string;
  color: string;
  priority: Priority;
  targetHoursPerWeek: number;
  topics: string[];
}

export const mdcatSyllabus: SyllabusSubject[] = [
  {
    name: "Biology",
    color: "#4ADE80",
    priority: "high",
    targetHoursPerWeek: 10,
    topics: [
      "1. Cell Biology: Cell Structure and Function",
      "1. Cell Biology: Biological Molecules",
      "1. Cell Biology: Enzymes",
      "2. Bioenergetics: Principles of Bioenergetics",
      "2. Bioenergetics: Photosynthesis",
      "2. Bioenergetics: Cellular Respiration",
      "3. Diversity: Acellular life (Viruses)",
      "3. Diversity: Prokaryotes and Protists/Fungi",
      "3. Diversity: Diversity among Plants and Animals",
      "4. Life Processes: Animals and Plants processes",
      "4. Life Processes: Reproduction, Support, Movement",
      "4. Life Processes: Coordination and Control",
      "5. Continuity: Evolution and Genetics"
    ]
  },
  {
    name: "Chemistry",
    color: "#60A5FA",
    priority: "high",
    targetHoursPerWeek: 8,
    topics: [
      "1. Physical: Fundamental Concepts and Atomic Structure",
      "1. Physical: Gases, Liquids, and Solids",
      "1. Physical: Chemical Equilibrium and Kinetics",
      "1. Physical: Thermo-chemistry and Energetics",
      "1. Physical: Electrochemistry and Chemical Bonding",
      "2. Inorganic: s and p Block Elements",
      "2. Inorganic: Transition Elements",
      "3. Organic: Fundamental Principles",
      "3. Organic: Chemistry of Hydrocarbons",
      "3. Organic: Alkyl Halides, Alcohols, Phenols",
      "3. Organic: Aldehydes, Ketones, Carboxylic Acids",
      "3. Organic: Macromolecules"
    ]
  },
  {
    name: "Physics",
    color: "#FBBF24",
    priority: "medium",
    targetHoursPerWeek: 8,
    topics: [
      "1. Mechanics: Measurements and Motion/Force",
      "1. Mechanics: Work, Energy, Power, and Circular Motion",
      "2. Waves: Oscillations, Waves, and Light",
      "3. Heat: Heat and Thermodynamics",
      "4. Electricity: Electrostatics and Current Electricity",
      "4. Electricity: Electromagnetism and Induction",
      "5. Modern: Deformation of Solids and Electronics",
      "5. Modern: Modern and Nuclear Physics"
    ]
  },
  {
    name: "Logical Reasoning",
    color: "#A78BFA",
    priority: "low",
    targetHoursPerWeek: 3,
    topics: [
      "Critical Thinking",
      "Letter and Symbol Series",
      "Logical Deduction",
      "Logical Problems",
      "Course of Action",
      "Cause and Effect"
    ]
  }
];
