export interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    subject?: string;
}

export interface PastPaper {
    id: number;
    title: string;
    year: string;
    description: string;
    subjectId?: number;
    category: 'Official' | 'Practice';
    subject?: string;
    questions: Question[];
    durationMinutes: number;
    totalMarks: number;
}

export interface StudyMaterial {
    id: number;
    title: string;
    type: 'tip' | 'note' | 'formula';
    content: string;
    category: string;
}
