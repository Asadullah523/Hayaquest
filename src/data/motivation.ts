export interface Story {
  id: string;
  title: string;
  text: string;
  author?: string;
  type: 'resilience' | 'discipline' | 'comeback' | 'focus';
}

export const motivationStories: Story[] = [
  // Comeback (Low streak/missed days)
  {
    id: 'c1',
    title: 'The Eraser',
    text: 'A mistake is not a failure. It is proof that you are trying. Pick up the eraser, fix it, and move on. The page is still yours to write.',
    type: 'comeback'
  },
  {
    id: 'c2',
    title: 'Day One or One Day',
    text: 'You can say "one day" I will start, or you can say "Day One" is today. The choice is always yours.',
    type: 'comeback'
  },
  {
    id: 'c3',
    title: 'The Bamboo',
    text: 'Chinese bamboo takes 5 years to grow its roots, barely seen above ground. Then, in 5 weeks, it grows 90 feet. Your "invisible" work is growing your roots. Be patient.',
    type: 'comeback'
  },
  
  // Discipline (High streak)
  {
    id: 'd1',
    title: 'Quiet Consistency',
    text: 'Motivation gets you going, but discipline keeps you growing. It is the quiet work appearing every day that builds empires.',
    type: 'discipline'
  },
  {
    id: 'd2',
    title: 'The Rock Cutter',
    text: 'Look at a stone cutter hammering away at his rock, perhaps a hundred times without as much as a crack showing in it. Yet at the hundred-and-first blow it will split in two, and I know it was not the last blow that did it, but all that had gone before.',
    author: 'Jacob Riis',
    type: 'discipline'
  },
  {
    id: 'd3',
    title: 'Winning the Morning',
    text: 'If you win the morning, you win the day. You have already proved to yourself that you are capable.',
    type: 'discipline'
  },

  // Resilience (General)
  {
    id: 'r1',
    title: 'Smooth Seas',
    text: 'Smooth seas never made a skilled sailor. The challenges you face today are training you for the storms you will conquer tomorrow.',
    type: 'resilience'
  },
  {
    id: 'r2',
    title: 'Not Yet',
    text: 'If you cannot do it, do not say "I can\'t." Say "I can\'t... yet." That one word adds infinite possibility.',
    type: 'resilience'
  },
  {
    id: 'r3',
    title: 'Diamond Pressure',
    text: 'No pressure, no diamonds. The stress you feel is just the universe testing the strength of the gem you are becoming.',
    type: 'resilience'
  },
  {
    id: 'r4',
    title: 'Embrace the Challenge',
    text: 'It is not the mountain we conquer, but ourselves.',
    author: 'Edmund Hillary',
    type: 'resilience'
  },
  {
    id: 'r5',
    title: 'Consistency is Key',
    text: 'Success is the sum of small efforts, repeated day in and day out.',
    author: 'Robert Collier',
    type: 'discipline'
  },
  {
    id: 'r6',
    title: 'Believe in Yourself',
    text: 'He who says he can and he who says he can\'t are both usually right.',
    author: 'Confucius',
    type: 'focus'
  },
  {
    id: 'r7',
    title: 'The Power of Now',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
    type: 'comeback'
  },
  {
    id: 'r8',
    title: 'Limitless Potential',
    text: 'Don\'t let yesterday take up too much of today.',
    author: 'Will Rogers',
    type: 'focus'
  },
  {
    id: 'r9',
    title: 'Keep Going',
    text: 'It does not matter how slowly you go as long as you do not stop.',
    author: 'Confucius',
    type: 'discipline'
  }
];

export const getRandomStory = (type?: Story['type']): Story => {
    const pool = type ? motivationStories.filter(s => s.type === type) : motivationStories;
    return pool[Math.floor(Math.random() * pool.length)];
};
