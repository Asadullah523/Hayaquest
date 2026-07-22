export interface Quote {
    text: string;
    author: string;
}

export const heroQuotes: Quote[] = [
    // Islamic & Spiritual
    { text: "Read! In the name of your Lord who created.", author: "Quran 96:1" },
    { text: "My Lord, increase me in knowledge.", author: "Quran 20:114" },
    { text: "And that there is not for man except that [good] for which he strives.", author: "Quran 53:39" },
    { text: "Verily, with hardship comes ease.", author: "Quran 94:6" },
    { text: "God does not burden a soul beyond that it can bear.", author: "Quran 2:286" },
    { text: "Seek knowledge from the cradle to the grave.", author: "Prophet Muhammad (PBUH)" },
    { text: "The scholar's ink is more sacred than the blood of martyrs.", author: "Prophet Muhammad (PBUH)" },
    { text: "He who goes forth in search of knowledge is in the way of Allah till he returns.", author: "Prophet Muhammad (PBUH)" },
    { text: "Knowledge is the life of the mind.", author: "Hazrat Ali (RA)" },
    { text: "A moment of patience in a moment of anger saves you a hundred moments of regret.", author: "Hazrat Ali (RA)" },
    { text: "Trust in Allah, but tie your camel.", author: "Prophet Muhammad (PBUH)" },
    { text: "The best of you are those who learn the Quran and teach it.", author: "Prophet Muhammad (PBUH)" },
    { text: "Do good, for Allah loves the doers of good.", author: "Quran 2:195" },
    { text: "Patience is a pillar of faith.", author: "Umar ibn Al-Khattab (RA)" },
    { text: "Take account of yourselves before you are taken to account.", author: "Umar ibn Al-Khattab (RA)" },

    // Medical & Science
    { text: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
    { text: "The art of medicine consists of amusing the patient while nature cures the disease.", author: "Voltaire" },
    { text: "Observation, Reason, Human Understanding, Courage; these make the physician.", author: "Martin H. Fischer" },
    { text: "Medicine is a science of uncertainty and an art of probability.", author: "William Osler" },
    { text: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "William Osler" },
    { text: "Cure sometimes, treat often, comfort always.", author: "Hippocrates" },
    { text: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates" },
    { text: "To save a life is to save all of humanity.", author: "Quran 5:32" },
    { text: "Only the disciplined ones in life are free. If you are undisciplined, you are a slave to your moods and passions.", author: "Eliud Kipchoge" },
    { text: "Diagnosis is not the end, but the beginning of practice.", author: "Martin H. Fischer" },

    // Determination & Hard Work
    { text: "It is not the mountains ahead to climb that wear you out; it is the pebble in your shoe.", author: "Muhammad Ali" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", author: "Muhammad Ali" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
    { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
    { text: "The difference between who you are and who you want to be is what you do.", author: "Unknown" },
    { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "The slight edge is about repeating simple daily disciplines.", author: "Jeff Olson" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
    { text: "Focus on the process, not the outcome.", author: "Unknown" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },

    // Focus & Wisdom via Stoicism etc
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "Review your day. What did you learn? What can you improve?", author: "Stoic Practice" },
    { text: "The mind that is anxious about future events is miserable.", author: "Seneca" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "You become what you study.", author: "Unknown" },
    { text: "Deep work is the ability to master hard things quickly.", author: "Cal Newport" },
    { text: "Simplify. Focus. Execute.", author: "Jocko Willink" },
    { text: "If you don't sacrifice for what you want, what you want becomes the sacrifice.", author: "Unknown" },
    { text: "A river cuts through rock, not because of its power, but because of its persistence.", author: "Jim Watkins" },

    // More Study Specific
    { text: "Study while others are sleeping; work while others are loafing; prepare while others are playing; and dream while others are wishing.", author: "William Arthur Ward" },
    { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
    { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Procrastination is the thief of time.", author: "Edward Young" },
    { text: "Excellence is not a skill, it's an attitude.", author: "Ralph Marston" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Everything comes to him who waits—provided he works while he waits.", author: "Woodrow Wilson" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "There is no substitute for hard work.", author: "Thomas Edison" },
    { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
    { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
    { text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.", author: "Brian Herbert" },
    
    // Additional Fillers to reach 100
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
    { text: "Do something today that your future self will thank you for.", author: "Unknown" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
    { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "A year from now you came wish you had started today.", author: "Karen Lamb" },
    { text: "Knowledge has to be improved, challenged, and increased constantly, or it vanishes.", author: "Peter Drucker" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Suffer the pain of discipline or suffer the pain of regret.", author: "Unknown" },
    { text: "The dictionary is the only place where success comes before work.", author: "Vidal Sassoon" },
    { text: "Whatever you are, be a good one.", author: "Abraham Lincoln" },
    { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
    { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
    { text: "Impossible is just an opinion.", author: "Paulo Coelho" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { text: "Great things never came from comfort zones.", author: "Unknown" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown" },
    { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do it now. Sometimes 'later' becomes 'never'.", author: "Unknown" },
    { text: "One day or day one. You decide.", author: "Unknown" },
    { text: "Building a better you is a daily process.", author: "Unknown" },
    { text: "Be stronger than your excuses.", author: "Unknown" },
    { text: "Self-discipline is the magic power that makes you virtually unstoppable.", author: "Dan Kennedy" },
    { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
    { text: "Don't wish for it. Work for it.", author: "Unknown" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
    { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
];

/**
 * Returns a quote based on the current hour since epoch.
 * This rotates through the entire list of 100 quotes, changing every hour.
 */
export const getHourlyQuote = (): Quote => {
    // Get total hours since Unix Epoch
    const totalHours = Math.floor(Date.now() / (1000 * 60 * 60));
    // Use modulo to cycle through all quotes
    const index = totalHours % heroQuotes.length;
    return heroQuotes[index];
};
