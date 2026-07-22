
export interface Resource {
  id: string;
  title: string;
  author?: string;
  category: 'Biology' | 'Chemistry' | 'Physics' | 'Math' | 'General' | 'Past Papers' | 'Logic';
  type: 'Book' | 'Notes' | 'Practice' | 'PDF' | 'Video' | 'Website';
  url?: string; // External link if available
  localPath?: string; // Path relative to public/resources/ if hosted locally
  thumbnail?: string;
  description?: string;
  isLocked?: boolean; // For premium/locked content if needed later
  isFeatured?: boolean; // For highlighted premium resources
  isPremium?: boolean;
}

export const imatResources: Resource[] = [
  {
    id: 'kpk-etea-papers',
    title: 'KPK & ETEA Papers',
    author: 'Premeth',
    category: 'Past Papers',
    type: 'Website',
    description: 'Regional KPK & ETEA examination papers and practice resources.',
    url: 'https://premeth.com/papers/regional_etea',
    isFeatured: true,
    isPremium: true,
  },
  {
    id: 'imat-past-papers-wau',
    title: 'IMAT Official Past Papers',
    author: 'WAU IMAT',
    category: 'Past Papers',
    type: 'Practice',
    description: 'Official IMAT past papers (PDFs). Practice real exam questions from previous years.',
    url: 'https://wauimat.com/imat-past-papers/',
  },
  {
    id: 'imat-2025-past-paper',
    title: 'IMAT 2025 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2025 IMAT examination paper.',
    localPath: '/resources/Imat-2025_Past_Paper.pdf'
  },
  {
    id: 'imat-2024-past-paper',
    title: 'IMAT 2024 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2024 IMAT examination paper.',
    localPath: '/resources/Imat-2024_Past_Paper.pdf'
  },
  {
    id: 'imat-2023-past-paper',
    title: 'IMAT 2023 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2023 IMAT examination paper.',
    localPath: '/resources/Imat-2023_Past_Paper.pdf'
  },
  {
    id: 'imat-2022-past-paper',
    title: 'IMAT 2022 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2022 IMAT examination paper.',
    localPath: '/resources/Imat-2022_Past_Paper.pdf'
  },
  {
    id: 'imat-2021-past-paper',
    title: 'IMAT 2021 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2021 IMAT examination paper.',
    localPath: '/resources/Imat-2021_Past_Paper.pdf'
  },
  {
    id: 'imat-2020-past-paper',
    title: 'IMAT 2020 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2020 IMAT examination paper.',
    localPath: '/resources/Imat_2020_Past_Paper.pdf'
  },
  {
    id: 'imat-2019-past-paper',
    title: 'IMAT 2019 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2019 IMAT examination paper.',
    localPath: '/resources/Imat_2019_Past_Paper.pdf'
  },
  {
    id: 'imat-2018-past-paper',
    title: 'IMAT 2018 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2018 IMAT examination paper.',
    localPath: '/resources/Imat_2018_Past_Paper.pdf'
  },
  {
    id: 'imat-2017-past-paper',
    title: 'IMAT 2017 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2017 IMAT examination paper.',
    localPath: '/resources/Imat_2017_Past_Paper.pdf'
  },
  {
    id: 'imat-2016-past-paper',
    title: 'IMAT 2016 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2016 IMAT examination paper.',
    localPath: '/resources/Imat_2016_Past_Paper.pdf'
  },
  {
    id: 'imat-2015-past-paper',
    title: 'IMAT 2015 Official Past Paper',
    author: 'Cambridge & MUR',
    category: 'Past Papers',
    type: 'PDF',
    description: 'Official 2015 IMAT examination paper.',
    localPath: '/resources/Imat_2015_Past_Paper.pdf'
  }
];
