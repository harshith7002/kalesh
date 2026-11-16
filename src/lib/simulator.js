import { pick, rand, shuffle, uid } from './utils'

const TOPICS = {
  money: /\b(ctc|lpa|salary|package|hike|appraisal|crores?|lakhs?|money|rent|emi|stipend|ipo|funding|rich|broke|tax|bonus|esops?)\b|₹/i,
  food: /biryani|dosa|idli|filter\s?(coffee|kaapi)|kaapi|\bchai\b|coffee|momos?|vada\s?pav|paneer|\bfood\b|sambar|butter chicken|maggi|pizza|pani\s?puri|golgappa|samosa|pulao/i,
  traffic: /traffic|silk\s?board|\borr\b|\bomr\b|metro|\bauto\b|uber|\bola\b|rapido|potholes?|commute|signal|\bjam\b|\bcab\b|local train|flyover/i,
  city: /chennai|bengaluru|bangalore|mumbai|bombay|delhi|gurgaon|gurugram|noida|hyderabad|kolkata|calcutta|pune/i,
  tech: /\bai\b|chatgpt|startup|coding|\bcode\b|developer|engineer|saas|layoffs?|leetcode|\bdsa\b|founder|\btech\b|software|\bgpt\b|\bllm\b|product manager|\bwfh\b|remote work|\bfaang\b/i,
  cricket: /cricket|kohli|dhoni|rohit|\bipl\b|\brcb\b|\bcsk\b|bcci|world cup|test match|bumrah|thala|wicket|\bt20\b/i,
  parents: /parents?|\bmom\b|\bdad\b|mummy|papa|amma|appa|sharma\s?ji|marriage|shaadi|relatives|rishta|arranged|\bbeta\b|in-?laws/i,
}

const CITY_NAMES = [
  [/chennai/i, 'Chennai'], [/bengaluru|bangalore/i, 'Bengaluru'], [/mumbai|bombay/i, 'Mumbai'],
  [/delhi|gurgaon|gurugram|noida/i, 'Delhi'], [/hyderabad/i, 'Hyderabad'], [/kolkata|calcutta/i, 'Kolkata'],
  [/pune/i, 'Pune'],
]

const ARCHETYPES = [
  {
    name: 'Bengaluru Tech Bro',
    handles: ['@blr_10x_dev', '@Koramangala_CTO', '@StealthFounder_HSR'],
    lines: {
      money: [
        '45 LPA in Bengaluru is basically 12 LPA after rent, food delivery and therapy. Source: my Splitwise.',
        'Bro is flexing CTC without mentioning the ESOPs that vest in 2041.',
      ],
      food: [
        'I have replaced all meals with a protein shake and a standup call. Food is a legacy system.',
        'My cook left for a better offer. Even she has counter-offer culture now.',
      ],
      traffic: [
        'I built a SaaS, closed a pre-seed and got ghosted by a VC, all at one Silk Board signal.',
        'Just take calls from the cab like the rest of us. ORR is my co-working space.',
      ],
      city: [
        'Every city debate ends the same way: all of you move to Bengaluru and then complain about it.',
        '{city} is nice, but what is the weather-to-rent ratio? Asking for my relocation spreadsheet.',
      ],
      tech: [
        'We pivoted to AI last Tuesday. We were a dosa batter subscription. Valuation went up 4x.',
        'This could have been a GPT wrapper. Honestly, so could you.',
      ],
      cricket: [
        'RCB is the original startup: massive valuation, great branding, product-market fit pending since 2008.',
        'Watching the match on my second monitor during sprint planning. This is what agile means.',
      ],
      parents: [
        'My parents still tell relatives I "work in computers". I have stopped correcting them. It is accurate.',
        'Told dad I am a Staff Engineer. He asked when I will become permanent.',
      ],
      generic: [
        'Shipped a side project around this exact tweet over the weekend. 3 users. All me.',
        'Can we take this offline? I have a hard stop and a soft life.',
        'Strong opinion, weakly held. Like my notice period.',
      ],
    },
  },
  {
    name: 'LinkedIn B2B Hustle Coach',
    handles: ['@GrowthGuruGaurav', '@B2B_Bhaiya', '@HustleWithHitesh'],
    lines: {
      money: [
        'I rejected a 1 Cr offer to follow my passion. Today I earn 40 LPA in exposure. Agree? 👇',
        'CTC is temporary. Personal brand is forever. DM "RICH" for my free 47-page PDF.',
      ],
      food: [
        'My chaiwala taught me more about B2B sales than my MBA. Here are 7 lessons 🧵',
        'Biryani does not complain about being layered. Be like biryani. Trust the process.',
      ],
      traffic: [
        'Stuck in traffic for 2 hours. Others saw a jam. I saw 2 hours of podcast time. Mindset. 🚀',
        'The auto driver refused me 3 times. Rejection is redirection. Here is what it taught me about sales:',
      ],
      city: [
        'I moved to {city} with ₹500 and a dream. (And dad\'s flat. But mainly the dream.)',
        'Your city does not define you. Your morning routine does. I woke up at 4 AM to post this.',
      ],
      tech: [
        'AI will not take your job. A person using AI and posting about it daily on LinkedIn will.',
        'I asked ChatGPT to write this comment. It said "be authentic". So here I am. Authentically. 🙏',
      ],
      cricket: [
        'What a last-over finish teaches us about quarterly closures. A thread 🧵',
        'Champions are not made by scrolling. Anyway, here is my 90-minute webinar.',
      ],
      parents: [
        'My father never said "I love you". He said "did you eat?". That is leadership.',
        'Humbled to announce my mother finally understands what I do. (She does not. But she liked the post.)',
      ],
      generic: [
        'This tweet is a masterclass in storytelling. I have turned it into a carousel. No credit. 🙏',
        'Agree? Thoughts? Repost if this resonated with your network. ♻️',
        'I hired the person who tweeted this. Not really. But imagine the engagement.',
      ],
    },
  },
  {
    name: 'Regional Food Defender',
    handles: ['@BiryaniBouncer', '@Sambar_Sena', '@KolkataRollCall'],
    lines: {
      money: [
        'People will pay ₹450 for avocado toast and then bargain ₹5 with the dosa anna. Priorities.',
        'With that salary you can afford real ghee. No excuses now.',
      ],
      food: [
        'Whatever you ate, the version in my hometown is better and I will die on this hill.',
        'Biryani with elaichi is a jump scare, biryani with aloo is a blessing, and veg biryani is pulao. I do not make the rules.',
        'Calling it "filter coffee" is fine. Calling it "South Indian latte" is a punishable offence.',
      ],
      traffic: [
        'Only good thing about this traffic is the bajji stall at the signal. Respect the ecosystem.',
        'I once missed a flight for a plate of hot jalebi. No regrets. Flights come every hour.',
      ],
      city: [
        '{city} is a great city with one flaw: the food outside my specific 2 km radius of it.',
        'Do not rate a city until you have eaten at its ugliest, most crowded stall at 11 PM.',
      ],
      tech: [
        'AI can write code, but can it tell the tadka is ready by sound alone? Thought so.',
        'Your startup has a Chief Happiness Officer but no decent canteen sambar. Fix the fundamentals.',
      ],
      cricket: [
        'Stadium samosa at ₹120 is the real match-fixing.',
        'Match day rule: chai at the toss, pakoda in the powerplay, and nobody changes seats while we are winning.',
      ],
      parents: [
        'My amma does not measure ingredients, she measures vibes, and it still beats your cloud kitchen.',
        'Mom\'s "there is food at home" was the original subscription model.',
      ],
      generic: [
        'This tweet has the energy of someone who puts ketchup on dosa.',
        'I read this while eating curd rice and even the curd rice had more spice.',
        'Okay, but have you eaten today? Properly? With rice?',
      ],
    },
  },
  {
    name: 'Clueless WhatsApp Uncle',
    handles: ['@Sharma_Uncle_Official', '@RetdBankManager62', '@GoodMorning_Mohan'],
    lines: {
      money: [
        'In 1987 my first salary was ₹800 and I bought a scooter, a plot and fed a family of 9. You people have iPhone and no savings.',
        'Beta, put everything in FD. And one LIC. And tell nobody your salary. Not even here.',
      ],
      food: [
        'As per WhatsApp, eating curd after 7 PM is causing 90% of problems. Forwarded as received.',
        'Scientists abroad have declared Indian ghee best food in world. Kindly share in all groups. 🙏',
      ],
      traffic: [
        'In our time we went by cycle, 14 km, uphill both sides. No traffic. No complaining also.',
        'Leave at 5 AM. No traffic. I have been telling since 1994. Nobody listens.',
      ],
      city: [
        'Good morning 🌹🌞 All cities are good if character is good. Jai Hind.',
        '{city} was best in the 1970s. Now too much crowd and reels.',
      ],
      tech: [
        'Beta you are in computers, no? My printer is not working. Also how to send this photo as PDF.',
        'This AI-vAI is fine, but who will take government job? Pension is the real intelligence.',
      ],
      cricket: [
        'Today\'s players only do ads. In our time they faced fast bowling without helmet. WITHOUT HELMET.',
        'India lost because someone in your house was sitting in the wrong position. Simple.',
      ],
      parents: [
        'Listen to parents. They have seen life. Also when is marriage? Sharma ji\'s son is settled in Canada.',
        'At your age I had two kids, one scooter and zero anxiety. Think about it.',
      ],
      generic: [
        'Who is this? How did this come on my phone? Sunita, see what this boy is writing.',
        'Good morning 🌹🌹 Very nice thoughts. God bless. Please also see my nephew\'s biodata.',
        'Forwarded as received: this has been declared best tweet in the world. 🙏🇮🇳',
      ],
    },
  },
  {
    name: 'Cheeky Delivery Brand Account',
    handles: ['@Zwiggy_Cares', '@BlinkBasket_In', '@Dunzomato'],
    lines: {
      money: [
        'we saw the salary. we also saw 14 orders this week. the math is mathing 👀',
        'CTC up, cooking down. we are so proud of you bestie 🧡',
      ],
      food: [
        'say less. it is already out for delivery. our rider is also arguing about this in the lift.',
        'you tweeted this at mealtime with zero food at home. we know. we always know. 🛵',
      ],
      traffic: [
        'you are stuck in traffic. our delivery partner passed you twice. order something, he will wave 👋',
        '10 minute delivery. 2 hour commute. choose your fighter.',
      ],
      city: [
        'we deliver to {city} and to this comment section. both are very chaotic. 🫡',
        'every city thinks it is the best until it rains and you all order khichdi.',
      ],
      tech: [
        'our AI predicted you would tweet this. it also predicted maggi at 1:47 AM. see you then.',
        'devs be like "I will cook to save money" and then open the app while the build runs.',
      ],
      cricket: [
        'match day order summary: 0 salads. 41,000 biryanis. one guy ordered a single banana. we respect him.',
        'last over tension = 3x chips orders. please keep losing wickets, it is good for business 🙏',
      ],
      parents: [
        'mom said there is food at home. the food at home: one (1) lauki. we are here for you.',
        'ordered for your parents yet? no? they will never say it, but they want the gulab jamun.',
      ],
      generic: [
        'we do not know what this is about but have you eaten',
        'not us reading this in the middle of a delivery 💀',
        'this tweet is 30 minutes or free. it has been 31.',
      ],
    },
  },
]

const HOT_TAKE = /unpopular|hot take|overrated|underrated|better than|worst|best|>|nobody|everyone|always|never|!{2,}/i

function verdictFor(score, ratioed) {
  if (ratioed && score >= 75) return { label: 'ABSOLUTELY COOKED 💀', tone: 'danger', line: 'The mob has screenshots. Consider a new burner handle.' }
  if (ratioed) return { label: "RATIO'D 💀", tone: 'danger', line: 'A reply out-Kadak\'d you. The replies own this tweet now.' }
  if (score >= 35) return { label: 'DANGEROUSLY CLOSE', tone: 'gold', line: 'You survived, but one uncle with good WiFi could finish this.' }
  return { label: 'SURVIVED THE MOB', tone: 'safe', line: 'The replies tried. Your take stands. Suspiciously well.' }
}

export function detectTopics(text) {
  return Object.keys(TOPICS).filter((t) => TOPICS[t].test(text))
}

export function simulateMob(text, userCity) {
  const topics = detectTopics(text)
  const mentioned = CITY_NAMES.find(([re]) => re.test(text))?.[1]
  const city = mentioned || (userCity && userCity !== 'All India' ? userCity.replace(' NCR', '') : 'your city')

  // Each archetype gets a queue: topic-matched lines first, generic filler after.
  const queues = shuffle(ARCHETYPES).map((a) => ({
    archetype: a,
    lines: [...shuffle(topics.flatMap((t) => a.lines[t])), ...shuffle(a.lines.generic)],
    handles: shuffle(a.handles),
    used: 0,
  }))

  const target = 10 + rand(3) // 10 to 12 replies
  const spice = HOT_TAKE.test(text) ? 1.5 : 1
  const postKadaks = 20 + rand(380)
  const replies = []

  for (let round = 0; replies.length < target && round < 6; round++) {
    for (const q of queues) {
      if (replies.length >= target) break
      const line = q.lines[round]
      if (!line) continue
      replies.push({
        id: uid(),
        handle: q.handles[q.used++ % q.handles.length],
        archetype: q.archetype.name,
        content: line.replaceAll('{city}', city),
        kadaks: Math.max(1, Math.floor(postKadaks * (0.04 + Math.random() ** 2 * 1.5 * spice))),
      })
    }
  }

  const top = Math.max(...replies.map((r) => r.kadaks))
  const score = Math.round((100 * top) / (top + postKadaks))

  const ratioed = top > postKadaks

  return {
    runId: uid(),
    topics: topics.length ? topics : ['general chaos'],
    postKadaks,
    replies: shuffle(replies),
    score,
    ratioed,
    verdict: verdictFor(score, ratioed),
    openingLine: pick([
      'The timeline has noticed you.',
      'Notifications: 99+. None of them kind.',
      'Someone just quote-tweeted this into a family WhatsApp group.',
    ]),
  }
}
