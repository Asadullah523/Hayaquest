import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImatTopic {
  id: string;
  name: string;
  isCompleted: boolean;
}

export interface ImatSubject {
  id: string;
  name: string;
  color: string;
  icon: string; // Using emojis for simplicity in this version, can be replaced with Lucide icon names if needed
  topics: ImatTopic[];
}

interface ImatState {
  subjects: ImatSubject[];
  
  addTopic: (subjectId: string, topicName: string) => void;
  toggleTopic: (subjectId: string, topicId: string) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  resetProgress: (subjectId: string) => void;
}

const DEFAULT_TOPICS_BIOLOGY = [
    "Plant Physiology", "Photosynthesis", "Light Reactions", "Calvin Cycle",
    "Plant Cell Wall Composition", "Plant Tissues", "Xylem", "Phloem",
    "Plant Reproduction Cycles", "Plant-Specific Cellular Structures",
    "Artificial Selection", "Modern Evolutionary Synthesis", "Genetic Basis of Evolution",
    "Natural vs Artificial Selection", "Environmental Influences on Evolution",
    "Comparative Anatomy of Animals", "Non-Human Animal Organ Systems",
    "Structural Differences Between Species", "Detailed Cellular and Genetic Maps",
    "Chromosomal and Genome Mapping", "Bioenergetics", "Fermentation Pathways",
    "Advanced Oxidation-Reduction Chains", "Ecological and Environmental Genetics",
    "Heredity and Environment Interaction"
];

const DEFAULT_TOPICS_CHEMISTRY = [
    "Oxides", "Hydroxides", "Salts", "Acids", "Transition Metals",
    "Advanced Periodic Table Theory", "Atomic Radius", "Electron Affinity",
    "Deep Periodic Trends", "Hydrolysis", "Buffer Equations",
    "Acid-Base Strength Curves", "pH Calculations", "Solutions and Colligative Properties",
    "Ethers", "Amines", "Esters", "Amides", "Alicyclic Hydrocarbons",
    "Reaction Mechanisms (SN1, SN2)", "Polymer Chemistry",
    "Advanced Chemical Equilibrium Calculations"
];

const DEFAULT_TOPICS_PHYSICS = [
    "Optics (Reflection, Refraction)", "Lenses and Mirrors", "Optical Instruments",
    "Thermodynamics (2nd Law, Entropy)", "Heat Engines", "Nuclear Binding Energy",
    "Fusion and Fission", "Nuclear Models", "Fluid Mechanics (Viscosity, Compressibility)",
    "Simple Harmonic Motion (Energy, Curves)", "Advanced Electromagnetism",
    "Alternating Current Theory", "Electromagnetic Spectrum"
];

const DEFAULT_TOPICS_MATH = [
    "Algebra", "Geometry", "Trigonometry", "Probability", "Statistics",
    "Functions", "Conic Sections", "Logarithms", "Coordinate Geometry"
];

const INITIAL_SUBJECTS: ImatSubject[] = [
    {
        id: 'biology',
        name: 'Biology',
        color: '#10b981', // Emerald 500
        icon: '🧬',
        topics: DEFAULT_TOPICS_BIOLOGY.map(name => ({ id: crypto.randomUUID(), name, isCompleted: false }))
    },
    {
        id: 'chemistry',
        name: 'Chemistry',
        color: '#3b82f6', // Blue 500
        icon: '🧪',
        topics: DEFAULT_TOPICS_CHEMISTRY.map(name => ({ id: crypto.randomUUID(), name, isCompleted: false }))
    },
    {
        id: 'physics',
        name: 'Physics',
        color: '#8b5cf6', // Violet 500
        icon: '⚛️',
        topics: DEFAULT_TOPICS_PHYSICS.map(name => ({ id: crypto.randomUUID(), name, isCompleted: false }))
    },
    {
        id: 'math',
        name: 'Mathematics',
        color: '#f59e0b', // Amber 500
        icon: '📐',
        topics: DEFAULT_TOPICS_MATH.map(name => ({ id: crypto.randomUUID(), name, isCompleted: false }))
    }
];

export const useImatStore = create<ImatState>()(
  persist(
    (set) => ({
      subjects: INITIAL_SUBJECTS,

      addTopic: (subjectId, topicName) => set((state) => ({
        subjects: state.subjects.map(subject => 
          subject.id === subjectId 
            ? { 
                ...subject, 
                topics: [
                  ...subject.topics, 
                  { id: crypto.randomUUID(), name: topicName, isCompleted: false }
                ] 
              }
            : subject
        )
      })),

      toggleTopic: (subjectId, topicId) => set((state) => ({
        subjects: state.subjects.map(subject => 
          subject.id === subjectId
            ? {
                ...subject,
                topics: subject.topics.map(topic => 
                  topic.id === topicId 
                    ? { ...topic, isCompleted: !topic.isCompleted }
                    : topic
                )
              }
            : subject
        )
      })),

      deleteTopic: (subjectId, topicId) => set((state) => ({
        subjects: state.subjects.map(subject => 
          subject.id === subjectId
            ? {
                ...subject,
                topics: subject.topics.filter(topic => topic.id !== topicId)
              }
            : subject
        )
      })),

      resetProgress: (subjectId) => set((state) => ({
        subjects: state.subjects.map(subject => 
          subject.id === subjectId
            ? {
                ...subject,
                topics: subject.topics.map(topic => ({ ...topic, isCompleted: false }))
              }
            : subject
        )
      })),
    }),
    {
      name: 'imat-storage',
    }
  )
);
