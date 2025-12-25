// Additional 10 stories to append
export const newStories = [
{
  id: 'story-11',
  title: "Thomas Edison: 10,000 Ways That Won't Work",
  category: 'Motivational' as const,
  author: 'Historical Account',
  readingTime: '6 min',
  content: `Thomas Edison faced countless failures before achieving success with the electric light bulb. When asked how it felt to fail 10,000 times, he replied: "I have not failed. I have successfully discovered 10,000 ways that will not work."

This perspective defined Edison's approach. Where others saw failure, he saw learning. Each unsuccessful experiment taught him something valuable.

After testing thousands of materials, Edison discovered carbonized bamboo fiber could last over 1,200 hours. The electric light bulb was born, forever changing civilization.

Edison held 1,093 patents. He invented the phonograph, motion picture camera, and improved the telephone. Each required countless experiments and tireless persistence.

"Genius is one percent inspiration and ninety-nine percent perspiration," Edison said. His legacy teaches that failure is not the opposite of success—it is a stepping stone toward it.`,
  summary: "Thomas Edison's invention of the light bulb through 10,000 failed experiments teaches the power of persistence.",
  difficulty: 'medium' as const,
  difficultWords: ['tirelessly', 'carbonized', 'filament', 'innovation', 'persistence'],
  questions: [{
    id: 'q1',
    question: 'How did Edison respond to failing 10,000 times?',
    options: ['He gave up', 'He said he discovered 10,000 ways that do not work', 'He blamed others'],
    correctAnswer: 1
  }]
}
];
