import type { Priority } from '../../types';

export interface SyllabusChapter {
  title: string;
  topics: string[];
}

export interface SyllabusSubject {
  name: string;
  color: string;
  priority: Priority;
  targetHoursPerWeek: number;
  topics?: string[];
  chapters?: SyllabusChapter[];
}

export const imatSyllabus: SyllabusSubject[] = [
  {
    name: "Biology",
    color: "#10b981",
    priority: "high",
    targetHoursPerWeek: 8,
    chapters: [
      {
        title: "1. The Chemistry of the Living",
        topics: [
          "The biological importance of weak interactions",
          "Organic molecules found in organisms and their respective functions",
          "The role of enzymes"
        ]
      },
      {
        title: "2. The Cell",
        topics: [
          "The cell as the basis of life",
          "Cell theory",
          "Cellular dimensions",
          "Prokaryotic and eukaryotic cells",
          "Animal cells",
          "Plant cells",
          "Viruses"
        ]
      },
      {
        title: "3. Cell Structure and Function",
        topics: [
          "Cell membrane - Structure",
          "Cell membrane - Functions",
          "Transport across the membrane",
          "Cellular structures and their specific functions"
        ]
      },
      {
        title: "4. Cell Cycle and Reproduction",
        topics: [
          "Cell cycle",
          "Cell reproduction - Mitosis",
          "Cell reproduction - Meiosis",
          "Chromosome kit",
          "Chromosome maps"
        ]
      },
      {
        title: "5. Reproduction and Heredity",
        topics: [
          "Life cycles",
          "Sexual reproduction",
          "Asexual reproduction"
        ]
      },
      {
        title: "6. Genetics",
        topics: [
          "Mendelian genetics - Mendel's laws",
          "Mendelian genetics - Applications of Mendel's laws",
          "Classical genetics - Chromosomal theory of inheritance",
          "Classical genetics - Patterns of inheritance",
          "Molecular genetics - Structure of DNA",
          "Molecular genetics - Duplication of DNA",
          "Molecular genetics - Genetic code",
          "Molecular genetics - Protein synthesis",
          "Molecular genetics - DNA of prokaryotes",
          "Molecular genetics - Structure of the eukaryotic chromosome",
          "Molecular genetics - Genes",
          "Molecular genetics - Regulation of gene expression",
          "Human genetics - Mono-factorial character transmission",
          "Human genetics - Polyfactorial character transmission",
          "Human genetics - Autosomal inherited diseases",
          "Human genetics - X-chromosome-related inherited diseases",
          "Mutations",
          "Natural selection",
          "Artificial selection",
          "Evolutionary theories",
          "Genetic basis of evolution",
          "Heredity and environment"
        ]
      },
      {
        title: "7. Biotechnology",
        topics: [
          "Recombinant DNA technology",
          "Applications of recombinant DNA technology"
        ]
      },
      {
        title: "8. Anatomy and Physiology",
        topics: [
          "Anatomy and physiology of animals and humans",
          "Animal tissues",
          "Human systems and apparatuses - Anatomy",
          "Human systems and apparatuses - Physiology",
          "Human systems and apparatuses - Interactions",
          "Homeostasis"
        ]
      },
      {
        title: "9. Bioenergetics",
        topics: [
          "ATP as the energy currency of cells",
          "Oxidation-reduction reactions in living organisms",
          "Energy processes - Photosynthesis",
          "Energy processes - Glycolysis",
          "Energy processes - Aerobic respiration",
          "Energy processes - Fermentation"
        ]
      }
    ]
  },
  {
    name: "Chemistry",
    color: "#3b82f6",
    priority: "high",
    targetHoursPerWeek: 6,
    chapters: [
      {
        title: "1. Constitution of Matter",
        topics: [
          "States of aggregation of matter",
          "Heterogeneous systems",
          "Homogeneous systems",
          "Compounds",
          "Elements"
        ]
      },
      {
        title: "2. Ideal Gas Laws",
        topics: [
          "Gas laws and relationships"
        ]
      },
      {
        title: "3. Atomic Structure",
        topics: [
          "Elementary particles",
          "Atomic number",
          "Mass number",
          "Isotopes",
          "Electronic structure of atoms of various elements"
        ]
      },
      {
        title: "4. Periodic System of Elements",
        topics: [
          "Groups and periods",
          "Transition elements",
          "Periodic properties - Atomic radius",
          "Periodic properties - Ionization potential",
          "Periodic properties - Electronic affinity",
          "Periodic properties - Metallic character",
          "Relationship between electronic structure and position",
          "Relationship between position in the periodic system and properties"
        ]
      },
      {
        title: "5. Chemical Bond",
        topics: [
          "Ionic bond",
          "Covalent bond",
          "Metallic bond",
          "Bond energy",
          "Polarity of bonds",
          "Electronegativity",
          "Intermolecular bonds"
        ]
      },
      {
        title: "6. Inorganic Chemistry",
        topics: [
          "Nomenclature of inorganic compounds",
          "Properties of Oxides",
          "Properties of Hydroxides",
          "Properties of Acids",
          "Properties of Salts"
        ]
      },
      {
        title: "7. Chemical Reactions and Stoichiometry",
        topics: [
          "Atomic mass",
          "Molecular mass",
          "Avogadro's number",
          "Mole concept and applications",
          "Elementary stoichiometric calculations",
          "Balancing simple reactions",
          "Types of chemical reactions"
        ]
      },
      {
        title: "8. Solutions",
        topics: [
          "Solvent properties of water",
          "Solubility",
          "Concentration of solutions - Main ways of expression"
        ]
      },
      {
        title: "9. Equilibria in Aqueous Solution",
        topics: [
          "Chemical equilibrium in aqueous solutions"
        ]
      },
      {
        title: "10. Chemical Kinetics and Catalysis",
        topics: [
          "Reaction kinetics and catalysis"
        ]
      },
      {
        title: "11. Oxidation and Reduction",
        topics: [
          "Oxidation number",
          "Oxidant",
          "Reductant",
          "Balancing simple redox reactions"
        ]
      },
      {
        title: "12. Acids and Bases",
        topics: [
          "Concept of acid and base",
          "Acidity, Neutrality, and Basicity of aqueous solutions",
          "pH",
          "Hydrolysis",
          "Buffer solutions"
        ]
      },
      {
        title: "13. Organic Chemistry",
        topics: [
          "Bonds between carbon atoms",
          "Crude formulas",
          "Structural formulas",
          "Isomerism",
          "Hydrocarbons - Aliphatic",
          "Hydrocarbons - Alicyclic",
          "Hydrocarbons - Aromatic",
          "Functional groups - Alcohols",
          "Functional groups - Ethers",
          "Functional groups - Amines",
          "Functional groups - Aldehydes",
          "Functional groups - Ketones",
          "Functional groups - Carboxylic acids",
          "Functional groups - Esters",
          "Functional groups - Amides",
          "Elements of nomenclature"
        ]
      }
    ]
  },
  {
    name: "Mathematics",
    color: "#a855f7",
    priority: "medium",
    targetHoursPerWeek: 4,
    chapters: [
      {
        title: "1. Number Sets and Algebra",
        topics: [
          "Natural numbers",
          "Integer numbers",
          "Rational numbers",
          "Real numbers",
          "Sorting and comparison",
          "Order of magnitude",
          "Scientific notation",
          "Operations and properties",
          "Proportions",
          "Percentages",
          "Powers with integer and rational exponents",
          "Radicals and properties",
          "Logarithms - Base 10",
          "Logarithms - Base e",
          "Hints of combinatorial calculus",
          "Algebraic expressions",
          "Polynomials",
          "Notable products",
          "n-th power of a binomial",
          "Factor decomposition of polynomials",
          "Algebraic fractions",
          "Algebraic equations - First degree",
          "Algebraic equations - Second degree",
          "Inequalities",
          "Systems of equations"
        ]
      },
      {
        title: "2. Functions",
        topics: [
          "Fundamentals of functions",
          "Graphical representation - Domain",
          "Graphical representation - Codomain",
          "Graphical representation - Sign study",
          "Graphical representation - Continuity",
          "Graphical representation - Maxima and minima",
          "Graphical representation - Increasing and decreasing behavior",
          "Elementary functions - Whole algebraic",
          "Elementary functions - Integer algebraic",
          "Elementary functions - Exponential",
          "Elementary functions - Logarithmic",
          "Elementary functions - Goniometric",
          "Compound functions",
          "Inverse functions",
          "Goniometric equations",
          "Goniometric inequalities"
        ]
      },
      {
        title: "3. Geometry",
        topics: [
          "Polygons and properties",
          "Circumference and circle",
          "Measurement of lengths",
          "Measurement of surfaces",
          "Measurement of volumes",
          "Isometries",
          "Similarities",
          "Equivalences in the plane",
          "Geometric places",
          "Angle measurement - Degrees",
          "Angle measurement - Radians",
          "Trigonometric functions - Sine",
          "Trigonometric functions - Cosine",
          "Trigonometric functions - Tangent",
          "Notable trigonometric values",
          "Trigonometric formulas",
          "Resolution of triangles",
          "Cartesian reference system",
          "Distance between two points",
          "Midpoint of a segment",
          "Equation of the line",
          "Parallelism and perpendicularity",
          "Distance of a point from a line",
          "Equations of circumference",
          "Equations of parabola",
          "Equations of hyperbola",
          "Equations of ellipse",
          "Representation in the Cartesian plane",
          "Pythagorean theorem",
          "Euclid's first theorem",
          "Euclid's second theorem"
        ]
      },
      {
        title: "4. Probability and Statistics",
        topics: [
          "Frequency distributions",
          "Graphical representations",
          "Random experiment",
          "Event",
          "Probability",
          "Frequency"
        ]
      }
    ]
  },
  {
    name: "Physics",
    color: "#f59e0b",
    priority: "medium",
    targetHoursPerWeek: 5,
    chapters: [
      {
        title: "1. Physical Quantities and Measurement",
        topics: [
          "Fundamental physical quantities",
          "Derived physical quantities",
          "Systems of units - International system",
          "Systems of units - Technical system",
          "Multiples and submultiples",
          "Scientific notation",
          "Unit conversions",
          "Scalar quantities",
          "Vector quantities",
          "Vector operations"
        ]
      },
      {
        title: "2. Kinematics",
        topics: [
          "Description of motion",
          "Velocity",
          "Angular velocity",
          "Acceleration",
          "Centripetal acceleration",
          "Uniform rectilinear motion",
          "Uniformly accelerated motion",
          "Uniform circular motion",
          "Harmonic motion"
        ]
      },
      {
        title: "3. Dynamics",
        topics: [
          "Force as interaction between bodies",
          "Forces as applied vectors",
          "Principle of inertia",
          "Mass",
          "Second principle of dynamics",
          "Types of forces - Weight force",
          "Types of forces - Elastic force",
          "Types of forces - Static friction",
          "Types of forces - Dynamic friction",
          "Action and reaction",
          "Third principle of dynamics",
          "Impulse",
          "Momentum",
          "Conservation of momentum",
          "Momentum of a force",
          "Angular momentum",
          "Work",
          "Kinetic energy",
          "Conservative forces",
          "Potential energy",
          "Conservation of mechanical energy",
          "Power"
        ]
      },
      {
        title: "4. Fluid Mechanics",
        topics: [
          "Density",
          "Compressibility",
          "Gases",
          "Liquids",
          "Hydrostatics - Pressure",
          "Hydrostatics - Pascal's principle",
          "Hydrostatics - Stevin's principle",
          "Hydrostatics - Archimedes' principle",
          "Fluid dynamics - One-dimensional motion",
          "Fluid dynamics - Flow",
          "Fluid dynamics - Flow rate",
          "Fluid dynamics - Continuity equation",
          "Ideal fluids",
          "Bernoulli's equation",
          "Viscous forces in real fluids"
        ]
      },
      {
        title: "5. Thermodynamics",
        topics: [
          "Equilibrium",
          "Temperature",
          "Thermometers",
          "Heat",
          "Calorimetry",
          "Heat propagation",
          "Heat capacity",
          "Specific heat",
          "Changes of state",
          "Latent heat",
          "Laws of perfect gases",
          "First principle of thermodynamics",
          "Second principle of thermodynamics"
        ]
      },
      {
        title: "6. Electricity and Electromagnetism",
        topics: [
          "Electric charges",
          "Coulomb's law",
          "Electric field",
          "Electric potential",
          "Equipotential surfaces",
          "Dielectric constant",
          "Capacitance",
          "Capacitors",
          "Electrostatic energy",
          "Capacitors in series and parallel",
          "Generators",
          "Electric voltage",
          "Electric current",
          "Resistivity",
          "Resistance",
          "Resistors",
          "Ohm's law",
          "Resistors in series and parallel",
          "Kirchhoff's principles",
          "Work",
          "Power",
          "Joule effect",
          "Direct current",
          "Alternating current",
          "Period",
          "Frequency",
          "Magnetic field of an electric current",
          "Forces on currents in a magnetic field",
          "Electromagnetic induction"
        ]
      }
    ]
  }
];
