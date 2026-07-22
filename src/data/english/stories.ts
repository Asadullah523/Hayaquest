import type { Story } from '../../types/english';

export const storiesData: Story[] = [
  // Original Stories (1-5)
  {
    id: 'story-1',
    title: 'The Ephemeral Glory',
    category: 'Moral',
    author: 'Ancient Parable',
    readingTime: '5 min',
    content: `In a kingdom far away, there lived a king who was known for his benevolent nature. However, he was often troubled by the ephemeral nature of his power. "One day," he thought, "all this will be gone."

He decided to seek the advice of a pragmatic sage who lived in the mountains. The journey was long, and signs of the sage's ubiquitous influence were everywhere—small shrines dedicated to wisdom dotted the landscape.

When the king finally met the sage, he asked, "How can I make my legacy last forever?"

The sage smiled and said, "Nothing lasts forever, your majesty. But you can mitigate the fear of oblivion by doing good deeds that will be remembered long after you are gone."

The king realized that true power wasn't in ruling forever, but in leaving a lasting impact on his people.`,
    summary: 'A king seeks advice from a sage about the fleeting nature of power and learns that good deeds are the key to a lasting legacy.',
    difficulty: 'medium',
    difficultWords: ['benevolent', 'ephemeral', 'pragmatic', 'ubiquitous', 'mitigate'],
    questions: [
      {
        id: 'q1',
        question: 'Why was the king troubled?',
        options: [
          'He had no heirs.',
          'He was worried about the short-lived nature of his power.',
          'His kingdom was under attack.',
          'He was sick.'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What advice did the sage give?',
        options: [
          'Build a huge statue.',
          'Conquer more lands.',
          'Do good deeds to be remembered.',
          'Drink a potion of immortality.'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-2',
    title: 'The Elephant Rope',
    category: 'Motivational',
    author: 'Unknown',
    readingTime: '3 min',
    content: `As a man was passing the elephants, he suddenly stopped, confused by the fact that these huge creatures were being held by only a small rope tied to their front leg. No chains, no cages. It was obvious that the elephants could, at anytime, break away from their bonds but for some reason, they did not.

He saw a trainer nearby and asked why these animals just stood there and made no attempt to get away. "Well," trainer said, "when they are very young and much smaller we use the same size rope to tie them and, at that age, it's enough to hold them. As they grow up, they are conditioned to believe they cannot break away. They believe the rope can still hold them, so they never try to break free."

The man was amazed. These animals could at any time break free from their bonds but because they believed they couldn't, they were stuck right where they were.

Like the elephants, how many of us go through life hanging onto a belief that we cannot do something, simply because we failed at it once before?`,
    summary: 'A powerful story about how our beliefs shape our limitations.',
    difficulty: 'easy',
    difficultWords: ['conditioned', 'bonds', 'obvious', 'attempt'],
    questions: [
        {
            id: 'q1',
            question: 'Why didn\'t the elephants break the rope?',
            options: [
                'The rope was too strong.',
                'They were trained to love the rope.',
                'They were conditioned to believe they couldn\'t.',
                'They were tired.'
            ],
            correctAnswer: 2
        }
    ]
  },
  {
    id: 'story-3',
    title: 'The Obstacle in Our Path',
    category: 'Motivational',
    author: 'Ancient Tale',
    readingTime: '4 min',
    content: `In ancient times, a king had a boulder placed on a roadway. Then he hid himself and watched to see if anyone would remove the huge rock. Some of the king's wealthiest merchants and courtiers came by and simply walked around it. Many loudly blamed the king for not keeping the roads clear, but none did anything about getting the big stone out of the way.

Then a peasant came along carrying a load of vegetables. On approaching the boulder, the peasant laid down his burden and tried to move the stone to the side of the road. After much pushing and straining, he finally succeeded. After the peasant picked up his load of vegetables, he noticed a purse lying in the road where the boulder had been.

The purse contained many gold coins and a note from the king indicating that the gold was for the person who removed the boulder from the roadway. The peasant learned what many others never understand.

Every obstacle presents an opportunity to improve our condition.`,
    summary: 'A lesson on how obstacles can be disguised opportunities.',
    difficulty: 'medium',
    difficultWords: ['obstacle', 'courtiers', 'burden', 'straining', 'indicating'],
    questions: [
        {
            id: 'q1',
            question: 'What did the peasant find under the boulder?',
            options: [
                'A snake.',
                'More rocks.',
                'A purse of gold coins.',
                'A map.'
            ],
            correctAnswer: 2
        }
    ]
  },
  {
    id: 'story-4',
    title: 'Thinking Out of the Box',
    category: 'Motivational',
    author: 'Creative Thinking',
    readingTime: '4 min',
    content: `In a small Italian town, hundreds of years ago, a small business owner owed a large sum of money to a loan-shark. The loan-shark was a very old, unattractive looking guy that just so happened to fancy the business owner's daughter.

He decided to offer the businessman a deal that would completely wipe out the debt he owed him. However, the catch was that we would only wipe out the debt if he could marry the businessman's daughter. Needless to say, this proposal was met with a look of disgust.

The loan-shark said that he would place two pebbles into a bag, one white and one black. The daughter would then have to reach into the bag and pick out a pebble. If it was black, the debt would be wiped, but the loan-shark would then marry her. If it was white, the debt would also be wiped, but the daughter wouldn't have to marry the loan-shark.

Standing on a pebble-strewn path in the businessman's garden, the loan-shark bent over and picked up two pebbles. Whilst he was picking them up, the daughter noticed that he'd picked up two black pebbles and placed them both into the bag. He then asked the daughter to reach into the bag and pick one.

The daughter naturally had three choices as to what she could have done:
1. Refuse to pick a pebble from the bag.
2. Take both pebbles out of the bag and expose the loan-shark for cheating.
3. Pick a pebble from the bag fully well knowing it was black and sacrifice herself for her father's freedom.

She drew out a pebble from the bag, and before looking at it 'accidentally' dropped it into the midst of the other pebbles. She said to the loan-shark; "Oh, how clumsy of me. Never mind, if you look into the bag for the one that is left, you will be able to tell which pebble I picked."

The pebble left in the bag is obviously black, and seeing as the loan-shark didn't want to be exposed, he had to play along as if the pebble the daughter dropped was white, and clear her father's debt.`,
    summary: 'A story about creative problem solving and turning a difficult situation to your advantage.',
    difficulty: 'hard',
    difficultWords: ['attractive', 'proposal', 'disgust', 'sacrifice', 'clumsy'],
    questions: [
        {
            id: 'q1',
            question: 'How did the daughter win?',
            options: [
                'She fought the loan-shark.',
                'She picked the white pebble.',
                'She used the loan-shark\'s trick against him.',
                'She ran away.'
            ],
            correctAnswer: 2
        }
    ]
  },
  {
     id: 'story-5',
     title: 'The Starfish Story',
     category: 'Motivational',
     author: 'Loren Eiseley',
     readingTime: '2 min',
     content: `Once upon a time, there was an old man who used to go to the ocean to do his writing. He had a habit of walking on the beach every morning before he began his work. Early one morning, he was walking along the shore after a big storm had passed and noticed that thousands of starfish had been washed up on the shore.

Walking a little farther, he saw a boy named Asad who was walking slowly and stooping to pick something up and throw it back into the ocean.

He called out to the boy, "Good morning! May I ask what it is that I am doing?"

The boy paused, looked up, and replied "Throwing starfish into the ocean. The tide has washed them up onto the beach and they can't return to the sea by themselves," the youth replied. "When the sun gets high, they will die, unless I throw them back into the water."

The old man replied, "But there must be tens of thousands of starfish on this beach. I'm afraid you won't really be able to make much of an difference."

The boy bent down, picked up yet another starfish and threw it as far as he could into the ocean. Then he turned, smiled and said, "It made a difference to that one!"`,
     summary: 'A reminder that every small act of kindness matters.',
     difficulty: 'easy',
     difficultWords: ['stooping', 'tide', 'difference'],
     questions: [
         {
             id: 'q1',
             question: 'What was the boy doing?',
             options: [
                 'Writing a book.',
                 'Collecting shells.',
                 'Saving starfish.',
                 'Playing in the sand.'
             ],
             correctAnswer: 2
         }
     ]
  },
  
  // NEW EXPANDED STORIES (6-25) - 20 Additional Stories
  {
    id: 'story-6',
    title: 'Nelson Mandela: The Power of Forgiveness',
    category: 'Motivational',
    author: 'Historical Account',
    readingTime: '7 min',
    content: `Nelson Mandela spent 27 years in prison for fighting against apartheid in South Africa. During those years, he was subjected to harsh treatment, forced labor, and separation from his family. Many expected him to emerge filled with hatred and a desire for revenge.

However, when Mandela was finally released in 1990, the world witnessed something extraordinary. Instead of seeking vengeance against those who had imprisoned him, he chose the path of forgiveness and reconciliation. He understood that holding onto anger would only perpetuate the cycle of violence that had plagued his nation.

As South Africa's first Black president, Mandela made it his mission to unite a deeply divided country. He invited his former prison guards to his inauguration. He reached out to the white minority who had supported apartheid, showing them that there was a place for everyone in the new South Africa.

One of his most powerful gestures came during the 1995 Rugby World Cup. Rugby had long been seen as a white man's sport in South Africa, a symbol of apartheid. When the South African team reached the final, Mandela wore the team's jersey—the same green and gold that had once represented oppression to many Black South Africans. His appearance electrified the stadium and the nation.

Mandela's philosophy was simple yet profound: "Resentment is like drinking poison and then hoping it will kill your enemies." He knew that true freedom could only come through forgiveness. By choosing to forgive, he freed not only himself but an entire nation from the chains of hatred.

His legacy teaches us that forgiveness is not weakness—it is perhaps the greatest strength a human being can possess. It requires courage to forgive those who have wronged us, but it is through forgiveness that we find true peace and open the door to genuine transformation.`,
    summary: 'The story of how Nelson Mandela chose forgiveness over revenge, transforming South Africa and teaching the world about the power of reconciliation.',
    difficulty: 'medium',
    difficultWords: ['apartheid', 'reconciliation', 'vengeance', 'perpetuate', 'profound', 'resentment'],
    questions: [
      {
        id: 'q1',
        question: 'How long did Mandela spend in prison?',
        options: ['17 years', '27 years', '37 years', '7 years'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What did Mandela compare resentment to?',
        options: ['A heavy burden', 'Drinking poison', 'A dark cloud', 'A locked door'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-7',
    title: 'Malala: The Girl Who Stood Up for Education',
    category: 'Motivational',
    author: 'Contemporary Hero',
    readingTime: '6 min',
    content: `In the Swat Valley of Pakistan, a young girl named Malala Yousafzai discovered her voice at an age when most children are just learning to read. Born in 1997, Malala grew up in a region where the Taliban had begun restricting girls' education, eventually banning it altogether.

Malala's father ran a school, and he had always encouraged her to speak her mind. When she was just eleven years old, she began writing a blog for the BBC under a pseudonym, describing life under Taliban rule and her passion for education. "How dare the Taliban take away my basic right to education?" she wrote with a courage that belied her years.

Her blog gained international attention, and soon Malala was giving interviews and speeches advocating for girls' education. The Taliban issued threats, but Malala refused to be silenced. "I want to serve the people," she said. "And I want every girl, every child, to be educated."

On October 9, 2012, the unthinkable happened. As Malala rode the bus home from school, a Taliban gunman boarded and shot her in the head. The attack shocked the world. Malala was airlifted to Britain for emergency surgery. The bullet had barely missed her brain.

But even death could not silence Malala's message. After months of recovery, she emerged stronger and more determined than ever. On her 16th birthday, she addressed the United Nations: "One child, one teacher, one book, and one pen can change the world."

Malala became the youngest person ever to receive the Nobel Peace Prize at age 17. She continued her education at Oxford University while running the Malala Fund, which advocates for girls' education worldwide. Today, she has helped thousands of girls access education in countries where it had been denied to them.

Malala's story teaches us that one person's courage can inspire millions. She showed that even in the face of violence and oppression, the human spirit's desire for knowledge and freedom cannot be extinguished. Her pen proved mightier than any weapon.`,
    summary: 'Malala Yousafzai\'s courageous fight for girls\' education despite facing violence, becoming the youngest Nobel Prize laureate.',
    difficulty: 'medium',
    difficultWords: ['pseudonym', 'advocating', 'belied', 'extinguished', 'oppression'],
    questions: [
      {
        id: 'q1',
        question: 'At what age did Malala receive the Nobel Peace Prize?',
        options: ['16', '17', '18', '19'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What did Malala say can change the world?',
        options: ['Money and power', 'One child, one teacher, one book, one pen', 'Technology', 'Political leaders'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-8',
    title: 'The Bamboo Tree Lesson',
    category: 'Moral',
    author: 'Asian Wisdom',
    readingTime: '5 min',
    content: `A young farmer planted bamboo seeds with great hope and excitement. Every day, he would water the seeds, fertilize the soil, and wait for the bamboo to sprout. Days turned into weeks, and weeks into months, but nothing appeared above the ground. His neighbors mocked him for wasting his time on barren land.

After one year of daily watering and care, there was still no sign of growth. The farmer's friends advised him to plant something else, something that would show results. But the farmer's grandfather had taught him about the bamboo, so he persisted. Two years passed. Still nothing. Three years, four years—the farmer continued his daily routine without seeing any visible results.

Many people in the village called him a fool. "Why do you water nothing?" they asked. "There's nothing there! You're wasting your precious time and resources." But the farmer had faith in what he could not see. He trusted the process.

Then, in the fifth year, something miraculous happened. A tiny shoot emerged from the soil. And once it began growing, it didn't stop. Within six weeks, the bamboo tree grew ninety feet tall! The farmer's patience and persistence had paid off spectacularly.

What the villagers didn't understand was that during those first four years, the bamboo was developing an extensive root system underground—a foundation strong enough to support its rapid growth. The tree was growing; it just couldn't be seen.

The farmer's harvest was abundant, and his bamboo grove became famous throughout the region. People traveled from distant villages to see the incredible bamboo forest that had seemed to appear overnight.

This story teaches us a profound lesson about success and growth. Sometimes our efforts don't show immediate results, and we may feel like we're working for nothing. Friends and family might question our dedication. But just like the bamboo, we may be developing deep roots—building knowledge, character, and strength that will support our eventual success.

The question is not whether you will succeed, but whether you have the patience and faith to keep watering your dreams even when you see no evidence of progress. True growth often happens beneath the surface, invisible to others and sometimes even to ourselves. Trust the process, stay committed to your goals, and remember: the bamboo doesn't grow 90 feet in six weeks—it grows 90 feet in five years and six weeks.`,
    summary: 'A farmer\'s patient cultivation of bamboo teaches the value of persistence and trusting the process even when results aren\'t immediately visible.',
    difficulty: 'medium',
    difficultWords: ['barren', 'persisted', 'miraculous', 'extensive', 'abundant', 'profound'],
    questions: [
      {
        id: 'q1',
        question: 'How long did it take for the bamboo to sprout?',
        options: ['1 year', '3 years', '5 years', '6 weeks'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What was developing during the first four years?',
        options: ['Leaves', 'Flowers', 'Root system', 'Seeds'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-9',
    title: 'Stephen Hawking: The Mind That Defied Limits',
    category: 'Motivational',
    author: 'Scientific Biography',
    readingTime: '6 min',
    content: `At age 21, Stephen Hawking was a brilliant physics student at Cambridge University with his whole life ahead of him. Then came the devastating diagnosis: amyotrophic lateral sclerosis (ALS), a progressive disease that would gradually paralyze his entire body. Doctors gave him two years to live.

For most people, such a diagnosis would have meant the end of their dreams. But Stephen Hawking was not most people. He made a conscious decision: he would not let his failing body imprison his brilliant mind. "My expectations were reduced to zero when I was 21," he later said. "Everything since then has been a bonus."

As the disease progressed, Hawking lost the ability to walk, to write, and eventually to speak. But he refused to stop working. He continued his groundbreaking research into black holes and the nature of the universe. When he could no longer write equations by hand, he performed complex calculations in his head. When he lost his voice, he learned to communicate through a computerized speech system, which became his iconic voice.

Despite being confined to a wheelchair and able to move only a few facial muscles, Hawking became one of the most renowned scientists of our time. He wrote "A Brief History of Time," a book that made complex physics accessible to millions of readers worldwide. The book stayed on the bestseller list for 237 weeks.

Hawking's contributions to science were revolutionary. He proved that black holes emit radiation, now known as "Hawking radiation." He helped advance our understanding of the Big Bang and the nature of time itself. He received countless honors, including being appointed to the prestigious position of Lucasian Professor of Mathematics at Cambridge—a chair once held by Isaac Newton.

But perhaps his greatest contribution wasn't his scientific discoveries—it was the inspiration he provided to millions. He showed the world that physical limitations need not limit the human spirit or the power of the mind. He traveled the world giving lectures, appeared on television shows, and lived life with humor and grace.

When asked about his disability, Hawking said, "However difficult life may seem, there is always something you can do and succeed at. It matters that you don't just give up." He survived for 55 years after his diagnosis, dying in 2018 at age 76—more than five decades longer than anyone had expected.

Stephen Hawking's life reminds us that our greatest limitations are often the ones we impose on ourselves. His body may have been imprisoned, but his mind soared through the cosmos, unlocking secrets of the universe. He proved that determination, curiosity, and the refusal to accept defeat can overcome almost any obstacle.`,
    summary: 'Stephen Hawking\'s extraordinary journey from a devastating ALS diagnosis to becoming one of history\'s greatest scientists, proving that the mind knows no physical bounds.',
    difficulty: 'hard',
    difficultWords: ['amyotrophic', 'devastating', 'paralyze', 'prestigious', 'renowned', 'revolutionary'],
    questions: [
      {
        id: 'q1',
        question: 'How old was Hawking when he was diagnosed with ALS?',
        options: ['18', '21', '25', '30'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What prestigious position did Hawking hold at Cambridge?',
        options: ['Dean of Physics', 'Lucasian Professor of Mathematics', 'President', 'Chancellor'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-10',
    title: 'The Two Wolves Within',
    category: 'Moral',
    author: 'Native American Wisdom',
    readingTime: '4 min',
    content: `An old Cherokee grandfather was teaching his grandson about life. "A fight is going on inside me," he said to the boy. "It is a terrible fight between two wolves."

"One wolf is evil—he is anger, envy, sorrow, regret, greed, arrogance, self-pity, guilt, resentment, inferiority, lies, false pride, superiority, and ego."

He continued, "The other wolf is good—he is joy, peace, love, hope, serenity, humility, kindness, benevolence, empathy, generosity, truth, compassion, and faith. The same fight is going on inside you, my boy, and inside every other person too."

The grandson thought about this for a minute and then asked his grandfather, "Which wolf will win?"

The old Cherokee simply replied, "The one you feed."

This ancient wisdom carries profound truth. Every day, we face choices that feed one wolf or the other. When someone cuts us off in traffic, we can feed the wolf of anger or the wolf of patience and understanding. When we see someone else succeed, we can feed the wolf of envy or the wolf of genuine happiness for them.

Consider your daily habits. What are you feeding? When you wake up, do you immediately check social media and compare yourself to others, feeding the wolf of envy? Or do you take a moment of gratitude, feeding the wolf of peace and contentment?

When you make a mistake, do you berate yourself with harsh words, feeding the wolf of self-pity and guilt? Or do you show yourself compassion and see it as a learning opportunity, feeding the wolf of growth and humility?

The wolves are always there, always hungry, always ready to fight. But here's the beautiful truth: you have the power to choose which one grows stronger. You make that choice with every thought you think, every word you speak, and every action you take.

If you want more peace in your life, feed the peaceful wolf. If you want more love, feed the loving wolf. The wolf you feed is the wolf that will dominate your life, influence your decisions, and ultimately shape your destiny.

So ask yourself today: Which wolf am I feeding? And more importantly: Which wolf do I want to win?`,
    summary: 'A Cherokee teaching about the battle between good and evil within us, and the power we have to choose which force grows stronger.',
    difficulty: 'easy',
    difficultWords: ['arrogance', 'benevolence', 'serenity', 'empathy', 'profound', 'berate'],
    questions: [
      {
        id: 'q1',
        question: 'According to the grandfather, which wolf will win?',
        options: ['The evil wolf', 'The good wolf', 'The one you feed', 'Neither'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What does feeding the wolves represent?',
        options: ['Actual food', 'Our choices and actions', 'Our dreams', 'Our memories'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-11',
    title: "Thomas Edison: 10,000 Ways That Won't Work",
    category: 'Motivational',
    author: 'Historical Account',
    readingTime: '6 min',
    content: `Thomas Edison, one of the greatest inventors in history, faced countless failures before achieving success. When working on the electric light bulb, he conducted thousands of experiments that did not work. His assistants became discouraged, but Edison remained optimistic.\n\nWhen a reporter asked him, "How does it feel to have failed 10,000 times?" Edison replied with a smile, "I have not failed. I have successfully discovered 10,000 ways that will not work."\n\nThis perspective defined Edison's approach to innovation. Where others saw failure, he saw learning opportunities. Each unsuccessful experiment taught him something valuable, bringing him closer to the solution.\n\nThe breakthrough finally came. After testing thousands of materials for the filament, Edison discovered that carbonized bamboo fiber could last for over 1,200 hours. The electric light bulb was born, forever changing human civilization.\n\nEdison's genius was not in avoiding failure but in refusing to be defeated by it. He understood that innovation required patience, persistence, and the willingness to learn from every setback. His famous quote captures this perfectly: "Genius is one percent inspiration and ninety-nine percent perspiration."`,
    summary: "Thomas Edison's invention of the light bulb through 10,000 failed experiments teaches the power of persistence and reframing failure as learning.",
    difficulty: 'medium',
    difficultWords: ['innovation', 'persistence', 'perspiration', 'filament', 'setback'],
    questions: [
      {
        id: 'q1',
        question: 'How did Edison respond when asked about failing 10,000 times?',
        options: [
          'He admitted he was discouraged',
          'He said he discovered 10,000 ways that do not work',
          'He gave up on the project',
          'He blamed his assistants'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What material did Edison finally use for the light bulb filament?',
        options: ['Metal wire', 'Carbonized bamboo fiber', 'Glass', 'Plastic'],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-12',
    title: 'The Butterfly Struggle',
    category: 'Moral',
    author: 'Nature Parable',
    readingTime: '4 min',
    content: `A man found a cocoon of a butterfly. One day, a small opening appeared. He sat and watched the butterfly for several hours as it struggled to force its body through that little hole.\n\nThen it seemed to stop making any progress. It appeared as if it had gotten as far as it could, and it could go no further. So the man decided to help the butterfly. He took a pair of scissors and snipped off the remaining bit of the cocoon.\n\nThe butterfly then emerged easily. But it had a swollen body and small, shriveled wings. The man continued to watch the butterfly because he expected that, at any moment, the wings would enlarge and expand to support the body, which would contract in time.\n\nNeither happened! In fact, the butterfly spent the rest of its life crawling around with a swollen body and shriveled wings. It never was able to fly.\n\nWhat the man, in his kindness and haste, did not understand was that the restricting cocoon and the struggle required for the butterfly to get through the tiny opening were nature's way of forcing fluid from the body of the butterfly into its wings. This process prepared it for flight once it achieved its freedom from the cocoon.\n\nSometimes struggles are exactly what we need in our lives. If nature allowed us to go through our lives without any obstacles, it would cripple us. We would not be as strong as what we could have been. We could never fly.`,
    summary: 'A parable about a butterfly struggling to emerge from its cocoon teaches that our struggles are necessary for our growth and strength.',
    difficulty: 'easy',
    difficultWords: ['cocoon', 'shriveled', 'haste', 'restricting', 'cripple'],
    questions: [
      {
        id: 'q1',
        question: 'Why could the butterfly never fly?',
        options: [
          'It was sick',
          'The man helped it too much, preventing necessary struggle',
          'It was too old',
          'The cocoon was damaged'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What was the purpose of the butterfly\'s struggle?',
        options: [
          'To waste time',
          'To force fluid into its wings for flight',
          'To break the cocoon',
          'To attract attention'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-13',
    title: 'Abraham Lincoln: From Failure to Presidency',
    category: 'Motivational',
    author: 'American History',
    readingTime: '6 min',
    content: `Abraham Lincoln is remembered as one of America's greatest presidents, but his path to the White House was paved with failure and rejection.\n\nBorn in a one-room log cabin in Kentucky in 1809, Lincoln grew up in poverty. His mother died when he was nine. He had less than one year of formal schooling. Yet he educated himself by reading every book he could borrow.\n\nLincoln's early career was marked by repeated setbacks. At 23, he failed in business. At 26, his sweetheart died, sending him into deep depression. At 27, he had a nervous breakdown. At 29, he was defeated for Speaker of the Illinois House of Representatives.\n\nHe continued trying. At 34, he ran for Congress and lost. At 46, he ran for the Senate and lost. At 47, he ran for Vice President and lost. At 49, he ran for Senate again and lost again.\n\nAt age 51, Abraham Lincoln was elected the 16th President of the United States. He preserved the Union, abolished slavery, and strengthened the federal government during the nation's greatest crisis.\n\nWhat made Lincoln great was not that he avoided failure, but that he never let failure define him. He understood that defeat was temporary, but giving up was permanent. Each loss taught him something. Each rejection strengthened his resolve.`,
    summary: 'Abraham Lincoln\'s journey from numerous failures to becoming one of America\'s greatest presidents demonstrates the power of persistence.',
    difficulty: 'medium',
    difficultWords: ['poverty', 'setback', 'depression', 'abolished', 'resolve'],
    questions: [
      {
        id: 'q1',
        question: 'At what age was Lincoln elected President?',
        options: ['46', '49', '51', '54'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What was Lincoln\'s perspective on failure?',
        options: [
          'He avoided it',
          'He let it define him',
          'He learned from it and never gave up',
          'He ignored it'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-14',
    title: 'The Cracked Pot',
    category: 'Moral',
    author: 'Ancient Wisdom',
    readingTime: '5 min',
    content: `An elderly woman had two large pots, each hung on opposite ends of a pole which she carried across her neck. One pot was perfect and always delivered a full portion of water. The other had a crack in it, and by the time she reached home, it was only half full.\n\nFor two years this went on daily, with the woman bringing home only one and a half pots of water. The perfect pot was proud of its accomplishments. But the poor cracked pot was ashamed of its imperfection.\n\nOne day, the cracked pot spoke to the woman. "I am ashamed of myself because this crack causes water to leak out all the way back to your house."\n\nThe old woman smiled. "Did you notice that there are flowers on your side of the path, but not on the other pot's side? That is because I have always known about your flaw, so I planted flower seeds on your side. Every day while we walk back, you water them."\n\n"For two years I have been able to pick these beautiful flowers to decorate the table. Without you being just the way you are, there would not be this beauty."\n\nEach of us has our own unique flaws. We are all cracked pots in some way. But it is the cracks and flaws that make our lives together so interesting and rewarding.`,
    summary: 'A cracked pot learns that its flaw created beauty, teaching us that our imperfections can be our greatest strengths.',
    difficulty: 'easy',
    difficultWords: ['imperfection', 'flaw', 'rewarding', 'ashamed'],
    questions: [
      {
        id: 'q1',
        question: 'What grew on the cracked pot\'s side of the path?',
        options: ['Weeds', 'Flowers', 'Trees', 'Grass'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What is the lesson of the story?',
        options: [
          'Perfect things are better',
          'Flaws make us worthless',
          'Our imperfections can create unique value',
          'We should hide our weaknesses'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-15',
    title: 'J.K. Rowling: From Welfare to Wizardry',
    category: 'Motivational',
    author: 'Literary Biography',
    readingTime: '7 min',
    content: `Before Harry Potter became a global phenomenon, J.K. Rowling was a single mother living on welfare. She was clinically depressed, broke, and considered herself a failure.\n\nThe idea for Harry Potter came to her during a delayed train journey in 1990. For the next five years, she plotted the entire series, writing in cafes while her baby daughter slept beside her. Rowling's life during this time was incredibly difficult. She had no job and was raising her daughter alone on government assistance.\n\nWhen she finally finished the manuscript for the first book, she sent it to twelve different publishers. All twelve rejected it. Finally, a small publisher agreed to publish it—but only because the chairman's eight-year-old daughter loved the first chapter.\n\nHarry Potter became the best-selling book series in history, with over 500 million copies sold worldwide. Rowling became the first author to earn a billion dollars from writing.\n\nRowling's success story is about refusing to give up on your dreams even when every rational person would tell you to. She later said, "Rock bottom became the solid foundation on which I rebuilt my life." Her failure freed her to focus on what truly mattered.`,
    summary: 'J.K. Rowling\'s transformation from poverty and rejection to creating Harry Potter shows how perseverance and belief can turn failure into phenomenal success.',
    difficulty: 'medium',
    difficultWords: ['phenomenon', 'manuscript', 'perseverance', 'foundation', 'poverty'],
    questions: [
      {
        id: 'q1',
        question: 'How many publishers rejected Harry Potter before it was accepted?',
        options: ['5', '8', '12', '20'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What did Rowling say rock bottom became?',
        options: [
          'Her worst nightmare',
          'The solid foundation for her life',
          'A permanent state',
          'A learning experience'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-16',
    title: 'Rosa Parks: The Courage to Sit',
    category: 'Motivational',
    author: 'Civil Rights History',
    readingTime: '6 min',
    content: `On December 1, 1955, in Montgomery, Alabama, a seamstress named Rosa Parks boarded a bus to go home after a long day of work. At that time, buses were segregated, and Black passengers were required to sit in the back. When the front section filled up, the bus driver ordered Parks to give up her seat to a white passenger.\n\nRosa Parks refused. She wasn't physically tired; she was "tired of giving in." Her quiet act of defiance led to her arrest, but it also sparked a revolution. Her courage ignited the Montgomery Bus Boycott, which lasted 381 days and eventually led to the Supreme Court ruling that segregated buses were unconstitutional.\n\nParks' act proved that one person's courage can change the world. She became known as the "Mother of the Freedom Movement." Her legacy teaches us that standing up for what is right (or in her case, sitting down) is the first step toward justice.`,
    summary: 'Rosa Parks\' refusal to give up her bus seat sparked the Montgomery Bus Boycott and became a pivotal moment in the Civil Rights Movement.',
    difficulty: 'medium',
    difficultWords: ['segregated', 'defiance', 'unconstitutional', 'boycott', 'justice'],
    questions: [
      {
        id: 'q1',
        question: 'What event did Rosa Parks\' arrest spark?',
        options: ['A new law', 'The Montgomery Bus Boycott', 'A political election', 'A city strike'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'How long did the boycott last?',
        options: ['100 days', '250 days', '381 days', 'One year'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-17',
    title: 'Nick Vujicic: No Limits',
    category: 'Motivational',
    author: 'Inspirational Biography',
    readingTime: '5 min',
    content: `Nick Vujicic was born with tetra-amelia syndrome, a rare disorder characterized by the absence of arms and legs. Growing up, he faced immense physical and emotional challenges. He struggled with depression and loneliness, wondering why he was different from everyone else.\n\nHowever, Nick decided that his circumstances would not define his life. He learned to do things most people take for granted, like brushing his teeth, swimming, and even surfing, using his "little chicken drumstick" (his small foot). \n\nToday, Nick is a world-renowned motivational speaker, traveling the globe to share his message of hope and resilience. He has spoken to millions, encouraging them to find their purpose regardless of their difficulties. He says, "If you can't get a miracle, become one." Nick's life is a testament to the fact that the only limits we have are the ones we place on ourselves.`,
    summary: 'Born without limbs, Nick Vujicic overcame depression and physical barriers to become a global motivational speaker, proving that determination knows no bounds.',
    difficulty: 'medium',
    difficultWords: ['tetra-amelia', 'loneliness', 'resilience', 'testament', 'renowned'],
    questions: [
      {
        id: 'q1',
        question: 'What is Nick Vujicic\'s profession today?',
        options: ['Surfer', 'Doctor', 'Motivational speaker', 'Teacher'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What does Nick say if you can\'t get a miracle?',
        options: ['Give up', 'Ask again', 'Become one', 'Wait for one'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-18',
    title: 'The Stonecutter\'s Wish',
    category: 'Moral',
    author: 'Japanese Folk Tale',
    readingTime: '6 min',
    content: `Once there was a stonecutter who was dissatisfied with his life. One day, he saw a powerful king pass by and wished he could be as powerful. A spirit heard him and turned him into a king. He was happy until he noticed the sun could dry up the land despite his power. He wished to be the sun.\n\nHe became the sun, but then a cloud covered his rays. He wished to be a cloud. As a cloud, he rained down on the earth, but he found a great rock that would not move. He wished to be the rock.\n\nAs a rock, he felt strong and unshakeable. But then he felt the strike of a chisel. He looked down and saw a stonecutter working at his base. He realized then that the stonecutter was the most powerful of all, for he could shape the very earth itself. He wished to be himself again, and at last, he was content.`,
    summary: 'A stonecutter who wishes to be more powerful entities eventually realizes that his original self held a unique power all along, teaching the value of contentment.',
    difficulty: 'easy',
    difficultWords: ['dissatisfied', 'unshakeable', 'chisel', 'entities', 'contentment'],
    questions: [
      {
        id: 'q1',
        question: 'What did the stonecutter wish to be after being a cloud?',
        options: ['A king', 'The sun', 'A rock', 'The wind'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What made the rock feel weak?',
        options: ['The sun', 'The rain', 'A stonecutter with a chisel', 'The wind'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-19',
    title: 'The Farmer and the Well',
    category: 'Moral',
    author: 'Indian Folk Tale',
    readingTime: '5 min',
    content: `A farmer bought a well from his neighbor. The next day, when he went to draw water, the neighbor wouldn't let him. "I sold you the well, not the water," the neighbor claimed. The farmer, confused and upset, went to the local judge for help.\n\nThe judge called the neighbor and asked, "Why are you preventing the farmer from using the water?" The neighbor repeated his claim. The judge smiled and said, "Since you sold the well but not the water, you have no right to keep your water in his well. You must either pay rent to the farmer for keeping your water in his well or remove all the water immediately."\n\nRealizing he had been outsmarted, the neighbor apologized and allowed the farmer to use the water. The story teaches us that cheating others of their rights will eventually lead to one's own downfall and that honesty is always the best path.`,
    summary: 'A clever judge resolves a dispute between a farmer and his greedy neighbor, teaching that cheating doesn\'t pay and honesty is essential.',
    difficulty: 'easy',
    difficultWords: ['preventing', 'confused', 'outsmarted', 'immediately', 'honesty'],
    questions: [
      {
        id: 'q1',
        question: 'What was the neighbor\'s argument?',
        options: [
          'The well was broken',
          'He only sold the well, not the water',
          'The farmer didn\'t pay',
          'The water was poisoned'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What was the judge\'s clever solution?',
        options: [
          'Make the farmer pay more',
          'Tell the neighbor to keep the water in a bottle',
          'The neighbor must pay rent for keeping water in the sold well',
          'The neighbor must give back the money'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-20',
    title: 'The Golden Touch of King Midas',
    category: 'Moral',
    author: 'Greek Mythology',
    readingTime: '6 min',
    content: `Long ago, King Midas was a wealthy man, but he was never satisfied. He wished that everything he touched would turn into gold. A god granted his wish. At first, Midas was thrilled. He touched his palace walls, his furniture, and his garden—all turned into beautiful, gleaming gold.\n\nBut his joy soon turned to despair. When he tried to eat, his bread turned into gold. When he tried to drink, the wine turned into liquid gold. Even his beloved daughter, when she ran to hug him, turned into a cold, golden statue.\n\nHorrified, Midas begged the god to take back the gift. He realized that the things he truly valued—love, family, and even a simple meal—were worth far more than all the gold in the world. He was told to wash in a specific river to lose the touch. He did so, and his daughter and his world returned to normal. Midas lived the rest of his life as a humble and grateful man.`,
    summary: 'King Midas learns a hard lesson about greed when his wish for a golden touch turns even his food and his daughter into gold.',
    difficulty: 'medium',
    difficultWords: ['satisfied', 'despair', 'beloved', 'horrified', 'humble'],
    questions: [
      {
        id: 'q1',
        question: 'Why did Midas become unhappy with his golden touch?',
        options: [
          'It wasn\'t real gold',
          'He couldn\'t eat, drink, or hug his daughter',
          'He ran out of things to touch',
          'Someone stole his gold'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What did Midas realize in the end?',
        options: [
          'Gold is everything',
          'He needed more power',
          'Simple things like love and food are more valuable than gold',
          'He should have wished for something else'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-21',
    title: 'Muhammad Ali: Float Like a Butterfly',
    category: 'Motivational',
    author: 'Sports Biography',
    readingTime: '6 min',
    content: `Muhammad Ali was more than just a boxer; he was a global icon of confidence and conviction. Born Cassius Clay, he started boxing at age 12 after his bicycle was stolen. He famously told the police officer he wanted to "whop" the thief. That officer became his first coach.\n\nAli's style was unique: "Float like a butterfly, sting like a bee." He moved with the grace of a dancer but hit with incredible power. He became the heavyweight champion of the world at just 22 years old. But Ali's greatest battles were fought outside the ring. \n\nHe stood up for his religious beliefs and racial justice, even when it cost him his boxing license and years of his career. He never wavered. He returned to the ring years later to win the title again, proving his resilience. Ali taught the world that "Impossible is not a fact. It’s an opinion." His legacy is one of courage, self-belief, and standing for what you believe in, no matter the cost.`,
    summary: 'Muhammad Ali\'s journey from a stolen bike to a global boxing legend and civil rights icon teaches the power of self-belief and conviction.',
    difficulty: 'medium',
    difficultWords: ['conviction', 'unique', 'wavered', 'resilience', 'opinion'],
    questions: [
      {
        id: 'q1',
        question: 'What started Ali\'s boxing journey?',
        options: ['A bet', 'A stolen bicycle', 'A family tradition', 'A school fight'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What was Ali\'s famous saying about the impossible?',
        options: [
          'It is a fact',
          'It is an opinion',
          'It is a challenge',
          'It is for others'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-22',
    title: 'Helen Keller: Triumph Over Disability',
    category: 'Motivational',
    author: 'Historical Biography',
    readingTime: '7 min',
    content: `When Helen Keller was 19 months old, a severe illness left her both blind and deaf. For years, she lived in a world of silence and darkness, unable to communicate except through simple signs. Her world changed when Anne Sullivan, a teacher, came into her life.\n\nAnne taught Helen by spelling words into her hand. The breakthrough happened at a water pump, where Helen realized that the cold liquid on one hand was represented by the letters W-A-T-E-R spelled into the other. From that moment, her mind was unlocked.\n\nHelen Keller didn't just learn to communicate; she became a world-renowned author, activist, and lecturer. She was the first deaf-blind person to earn a Bachelor of Arts degree. She traveled the world advocating for people with disabilities and for women's rights. Her life remains one of the most powerful examples of the human spirit's ability to overcome any obstacle. She once said, "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence."`,
    summary: 'Despite being blind and deaf from a young age, Helen Keller overcame immense barriers to become an influential author and activist, inspiring millions.',
    difficulty: 'hard',
    difficultWords: ['communicate', 'breakthrough', 'renowned', 'advocating', 'optimism'],
    questions: [
      {
        id: 'q1',
        question: 'Who was Helen Keller\'s teacher?',
        options: ['Alexander Graham Bell', 'Anne Sullivan', 'Her mother', 'A local doctor'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What word was the breakthrough for Helen?',
        options: ['Mother', 'Food', 'Water', 'Teacher'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-23',
    title: 'Elon Musk: Dream Big, Fail Bigger',
    category: 'Modern',
    author: 'Contemporary Profile',
    readingTime: '7 min',
    content: `Elon Musk is known for his ambitious goals to revolutionize transport and colonize Mars. But his path has been filled with near-disasters. When he started SpaceX, the first three rocket launches failed completely. The company was on the brink of bankruptcy.\n\nAt the same time, Tesla was also struggling to survive. Musk put his last remaining money into his companies, risking everything. He famously said, "Failure is an option here. If things are not failing, you are not innovating enough."\n\nThe fourth SpaceX launch was finally successful, securing the company's future. Today, SpaceX is a leader in space exploration, and Tesla has transformed the automotive industry. Musk's story is one of high-stakes risk, visionary thinking, and the persistence to pursue goals that many deemed impossible. He proves that even the most complex problems can be solved with enough determination and a willingness to learn from failure.`,
    summary: 'From the brink of bankruptcy with SpaceX and Tesla to leading global innovation, Elon Musk\'s story highlights the importance of risk-taking and perseverance.',
    difficulty: 'medium',
    difficultWords: ['revolutionize', 'colonize', 'bankruptcy', 'innovating', 'visionary'],
    questions: [
      {
        id: 'q1',
        question: 'How many rocket launches failed for SpaceX initially?',
        options: ['None', 'One', 'Three', 'Five'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What is Musk\'s view on failure?',
        options: [
          'It should be avoided',
          'It is an option for innovation',
          'It is a sign of weakness',
          'It is permanent'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-24',
    title: 'The Wise Old Tree',
    category: 'Moral',
    author: 'Nature Allegory',
    readingTime: '5 min',
    content: `In a vast forest stood a massive, old oak tree and a young, slender reed. The oak tree was proud of its strength and would often mock the reed for its frail appearance. "Look at me," the oak would boast. "I stand tall even in the strongest winds, while you bend at the slightest breeze."\n\nOne day, a terrible storm swept through the forest. The wind blew with unprecedented force. The oak tree, refusing to yield, stood rigid against the gale. Its roots, though deep, could not withstand the pressure, and with a loud crash, the great oak was uprooted and fell to the ground.\n\nThe reed, however, bent low with the wind, allowing the storm's energy to pass over it. When the storm subsided, the reed stood up once more, unharmed. The oak's pride had been its downfall, while the reed's flexibility was its survival. The story teaches us that rigid pride often breaks, while humility and adaptability allow us to weather the greatest storms of life.`,
    summary: 'A proud oak tree and a flexible reed face a storm. The oak is uprooted because it refuses to bend, while the reed survives by adapting, teaching the value of humility.',
    difficulty: 'easy',
    difficultWords: ['massive', 'frail', 'unprecedented', 'subsided', 'adaptability'],
    questions: [
      {
        id: 'q1',
        question: 'Why did the oak tree fall?',
        options: [
          'Its roots were shallow',
          'It was too old',
          'It refused to bend and stood rigid against the wind',
          'It was struck by lightning'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What is the lesson of the story?',
        options: [
          'Strength is everything',
          'Pride is more important than survival',
          'Flexibility and humility allow us to survive challenges',
          'Older trees are always weaker'
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-25',
    title: 'The Monk and the Scorpion',
    category: 'Moral',
    author: 'Ancient Wisdom',
    readingTime: '4 min',
    content: `A monk was sitting by a river when he saw a scorpion struggling in the water. Knowing scorpions cannot swim, the monk reached out to save it. As soon as he touched it, the scorpion stung him. The monk flinched in pain but tried again. Again, the scorpion stung him.\n\nA passerby saw this and shouted, "Why do you keep trying to save it? Don't you see it will just keep stinging you?"\n\nThe monk replied calmly, "It is the nature of the scorpion to sting. It is my nature to save. Why should I let its nature change mine?" He then used a leaf to pull the scorpion from the water and set it safely on the bank.\n\nThis story reminds us that we should remain true to our own values and kindness, regardless of the actions of others. We should not allow the negativity or harmful nature of others to change who we are or how we choose to treat the world. Our character is defined by our own choices, not by the reactions of those around us.`,
    summary: 'A monk persistently tries to save a stinging scorpion, explains that he won\'t let the scorpion\'s nature change his own nature of kindness.',
    difficulty: 'medium',
    difficultWords: ['struggling', 'flinched', 'nature', 'negativity', 'regardless'],
    questions: [
      {
        id: 'q1',
        question: 'Why did the monk continue to save the scorpion despite being stung?',
        options: [
          'He didn\'t feel pain',
          'He wanted to prove he was strong',
          'He wouldn\'t let the scorpion\'s nature change his own kind nature',
          'He was forced to by a passerby'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'What did the monk eventually use to save the scorpion?',
        options: ['His hand', 'A stick', 'A leaf', 'A net'],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 'story-26',
    title: 'The Gift of the Magi',
    category: 'Classic',
    author: 'O. Henry',
    readingTime: '8 min',
    content: `One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas.

There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.

Della finished her cry and attended to her cheeks with the powder rag. She stood by the window and looked out dully at a gray cat walking a gray fence in a gray backyard. Tomorrow would be Christmas Day, and she had only $1.87 with which to buy Jim a present. She had been saving every penny she could for months, with this result. Twenty dollars a week doesn't go far. Expenses had been greater than she had calculated. They always are. Only $1.87 to buy a present for Jim. Her Jim. Many a happy hour she had spent planning for something nice for him. Something fine and rare and sterling—something just a little bit near to being worthy of the honor of being owned by Jim.

There were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim's gold watch that had been his father's and his grandfather's. The other was Della's hair.

Della's beautiful hair fell about her rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet.

On went her old brown jacket; on went her old brown hat. With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.`,
    summary: 'A young husband and wife sacrifice their most prized possessions to buy each other Christmas gifts, proving that their love is the greatest gift of all.',
    difficulty: 'hard',
    difficultWords: ['imputation', 'parsimony', 'instigates', 'predominating', 'subsiding', 'scrutiny', 'cascade'],
    questions: [
      {
        id: 'q1',
        question: 'How much money did Della have initially?',
        options: ['$1.87', '$10.00', '$20.00', '$5.00'],
        correctAnswer: 0
      },
      {
        id: 'q2',
        question: 'What were the couple\'s two most prized possessions?',
        options: [
          'A car and a house',
          'Jim\'s gold watch and Della\'s hair',
          'A painting and a ring',
          'A dog and a cat'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 'story-27',
    title: 'The Last Leaf',
    category: 'Classic',
    author: 'O. Henry',
    readingTime: '10 min',
    content: `In a small district west of Washington Square the streets have run crazy and broken themselves into small strips called "places." These "places" make strange angles and curves. One street crosses itself a time or two. An artist once discovered a valuable possibility in this street. Suppose a collector with a bill for paints, paper and canvas should, in traversing this route, suddenly meet himself coming back, without a cent having been paid on account!

So, to quaint old Greenwich Village the art people soon came prowling, hunting for north windows and eighteenth-century gables and Dutch attics and low rents. Then they imported some pewter mugs and a chafing dish or two from Sixth Avenue, and became a "colony."

At the top of a squatty, three-story brick Sue and Johnsy had their studio. "Johnsy" was familiar for Joanna. One was from Maine; the other from California. They had met at the table d'hôte of an Eighth Street "Delmonico's," and found their tastes in art, chicory salad and bishop sleeves so congenial that the joint studio resulted.

That was in May. In November a cold, unseen stranger, whom the doctors called Pneumonia, stalked about the colony, touching one here and there with his icy fingers. Over on the east side this ravager strode boldly, smiting his victims by scores, but his feet trod slowly through the maze of the narrow and moss-grown "places."

Mr. Pneumonia was not what you would call a chivalric old gentleman. A mite of a little woman with blood thinned by California zephyrs was hardly fair game for the red-fisted, short-breathed old duffer. But Johnsy he smote; and she lay, scarcely moving, on her painted iron bedstead, looking through the small Dutch window-panes at the blank side of the next brick house.

One morning the busy doctor invited Sue into the hallway with a shaggy, gray eyebrow.
"She has one chance in—let us say, ten," he said, as he shook down the mercury in his clinical thermometer. "And that chance is for her to want to live. This way people have of lining-up on the side of the undertaker makes the entire pharmacopoeia look silly. Your little lady has made up her mind that she's not going to get well. Has she anything on her mind?"

"She—she wanted to paint the Bay of Naples some day," said Sue.

"Paint?—bosh! Has she anything on her mind worth thinking about twice—a man for instance?"

"A man?" said Sue, with a jew's-harp twang in her voice. "Is a man worth—but, no, doctor; there is nothing of the kind."

"I will do all that science, so far as it may filter through my efforts, can accomplish. But whenever my patient begins to count the carriages in her funeral procession I subtract 50 per cent from the curative power of medicines."

After the doctor had gone Sue went into the workroom and cried a Japanese napkin to a pulp. Then she swaggered into Johnsy's room with her drawing board, whistling jazz.

Johnsy lay, scarcely making a ripple under the bedclothes, with her face toward the window. Sue stopped whistling, thinking she was asleep.

She arranged her board and began a pen-and-ink drawing to illustrate a magazine story. Young artists must pave their way to Art by drawing pictures for magazine stories that young authors write to pave their way to Literature.

As Sue was sketching a pair of elegant horseshow riding trousers and a monocle of the figure of the hero, an Idaho cowboy, she heard a low sound, several times repeated. She went quickly to the bedside.

Johnsy's eyes were open wide. She was looking out the window and counting—counting backward.

"Twelve," she said, and a little later "eleven"; and then "ten," and "nine"; and then "eight" and "seven", almost together.

Sue looked solicitously out of the window. What was there to count? There was only a bare, dreary yard to be seen, and the blank side of the brick house twenty feet away. An old, old ivy vine, gnarled and decayed at the roots, climbed half way up the brick wall. The cold breath of autumn had stricken its leaves from the vine until its skeleton branches clung, almost bare, to the crumbling bricks.

"What is it, dear?" asked Sue.

"Six," said Johnsy, in almost a whisper. "They're falling faster now. Three days ago there were almost a hundred. It made my head ache to count them. But now it's easy. There goes another one. There are only five left now."

"Five what, dear? Tell your Sudie."

"Leaves. On the ivy vine. When the last one falls I must go, too. I've known that for three days. Didn't the doctor tell you?"`,
    summary: 'A sick artist loses her will to live, believing she will die when the last leaf falls from the vine outside her window, but a masterpiece of hope saves her.',
    difficulty: 'hard',
    difficultWords: ['pneumonia', 'chivalric', 'zephyrs', 'pharmacopoeia', 'solicitously', 'gnarled'],
    questions: [
      {
        id: 'q1',
        question: 'What did Johnsy believe would happen when the last leaf fell?',
        options: ['She would get better', 'Winter would begin', 'She would die', 'The doctor would come'],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'Where did the girls live?',
        options: ['Washington Square', 'Greenwich Village', 'Times Square', 'Central Park'],
        correctAnswer: 1
      }
    ]
  },
   {
    id: 'story-28',
    title: 'The Happy Prince',
    category: 'Classic',
    author: 'Oscar Wilde',
    readingTime: '9 min',
    content: `High above the city, on a tall column, stood the statue of the Happy Prince. He was gilded all over with thin leaves of fine gold, for eyes he had two bright sapphires, and a large red ruby glowed on his sword-hilt.

He was very much admired indeed. "He is as beautiful as a weathercock," remarked one of the Town Councillors who wished to gain a reputation for having artistic tastes; "only not quite so useful," he added, fearing lest people should think him unpractical, which he really was not.

"Why can't you be like the Happy Prince?" asked a sensible mother of her little boy who was crying for the moon. "The Happy Prince never dreams of crying for anything."

"I am glad there is some one in the world who is quite happy," muttered a disappointed man as he gazed at the wonderful statue.

"He looks just like an angel," said the Charity Children as they came out of the cathedral in their bright scarlet cloaks and their clean white pinafores.

"How do you know?" said the Mathematical Master, "you have never seen one."

"Ah! but we have, in our dreams," answered the children; and the Mathematical Master frowned and looked very severe, for he did not approve of children dreaming.

One night there flew over the city a little Swallow. His friends had gone away to Egypt six weeks before, but he had stayed behind, for he was in love with the most beautiful Reed. He had met her early in the spring as he was flying down the river after a big yellow moth, and had been so attracted by her slender waist that he had stopped to talk to her.

"Shall I love you?" said the Swallow, who liked to come to the point at once, and the Reed made him a low bow. So he flew round and round her, touching the water with his wings, and making silver ripples. This was his courtship, and it lasted all through the summer.

"It is a ridiculous attachment," twittered the other Swallows; "she has no money, and far too many relations;" and indeed the river was quite full of Reeds. Then, when the autumn came they all flew away.

After they had gone he felt lonely, and began to tire of his lady-love. "She has no conversation," he said, "and I am afraid that she is a coquette, for she is always flirting with the wind." And certainly, whenever the wind blew, the Reed made the most graceful curtseys. "I admit that she is domestic," he continued, "but I love travelling, and my wife, consequently, should love travelling also."

"Will you come away with me?" he said finally to her; but the Reed shook her head, she was so attached to her home.

"You have been trifling with me," he cried. "I am off to the Pyramids. Good-bye!" and he flew away.

All day long he flew, and at night-time he arrived at the city. "Where shall I put up?" he said; "I hope the town has made preparations."

Then he saw the statue on the tall column.

"I will put up there," he cried; "it is a fine position, with plenty of fresh air." So he alighted just between the feet of the Happy Prince.

"I have a golden bedroom," he said softly to himself as he looked round, and he prepared to go to sleep; but just as he was putting his head under his wing a large drop of water fell on him. "What a curious thing!" he cried; "there is not a single cloud in the sky, the stars are quite clear and bright, and yet it is raining. The climate in the north of Europe is really dreadful. The Reed used to like the rain, but that was merely her selfishness."

Then another drop fell.`,
    summary: 'A statue and a swallow strike up an unlikely friendship and perform acts of charity for the suffering people of the city.',
    difficulty: 'medium',
    difficultWords: ['gilded', 'sapphires', 'ruby', 'weathercock', 'coquette', 'courtship'],
    questions: [
      {
        id: 'q1',
        question: 'What was the Happy Prince covered with?',
        options: ['Silver leaves', 'Fine gold leaves', 'Paint', 'Bronze'],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'Why did the Swallow stay behind initially?',
        options: ['He was injured', 'He was in love with a Reed', 'He lost his way', 'He wanted to see the city'],
        correctAnswer: 1
      }
    ]
  }
];
