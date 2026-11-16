import { uid } from './utils'

// [city, handle, content, kadaks, forwards, minutesAgo, replies]
// reply: [handle, city, content, kadaks, children?]
const SEED = [
  ['Chennai', '@FilterKaapi_Purist',
    "Paid ₹280 for a 'South Indian pour-over' at a cafe in Nungambakkam. It was filter kaapi. In a glass. Without the davara. I want to speak to the manager of civilisation.",
    412, 0, 14, [
      ['@Mylapore_Maami', 'Chennai', 'The davara is 60% of the taste. This is not opinion, this is thermodynamics.', 188],
      ['@HSR_Founder', 'Bengaluru', 'In Bengaluru this is ₹420 and comes with a story about the farmer.', 97, [
        ['@FilterKaapi_Purist', 'Chennai', 'The farmer is also paying ₹420. That is the story.', 64],
      ]],
    ]],
  ['Chennai', '@OMR_Survivor',
    'OMR traffic update: I left office when my son was in LKG. He has now cleared JEE Mains.',
    893, 31, 52, [
      ['@Sholinganallur_Sage', 'Chennai', 'Congratulations to him. Which toll plaza was the convocation?', 240],
      ['@SilkBoard_Monk', 'Bengaluru', 'Rookie numbers. We measure commutes in governments.', 311],
    ]],
  ['Chennai', '@Potheri_NightOwl',
    "Chennai has exactly three seasons: hot, hotter, and 'why is Velachery a lake again'.",
    534, 0, 95, [
      ['@Velachery_Boatman', 'Chennai', 'It is not a lake. It is a seasonal water-facing property. Rent went up.', 276],
    ]],
  ['Chennai', '@Marina_Philosopher',
    'Unpopular opinion: idli is just a steamed excuse to drink sambar.',
    61, 0, 130, [
      ['@Paati_Protection_Squad', 'Chennai', 'Delete this before my paati sees it. She has a ladle and no fear.', 402],
      ['@Sambar_Sena', 'Chennai', 'Correct opinion, wrong tone. Apologise to the idli.', 58],
    ]],
  ['Bengaluru', '@Koramangala_Refugee',
    "Landlord wants 10 months deposit, a LinkedIn profile check, and 'preferably IIT/IIM'. Sir, I am renting a 1BHK, not raising a Series A.",
    1204, 44, 23, [
      ['@Indiranagar_Intern', 'Bengaluru', 'Mine asked for my GitHub. He left a code review.', 517],
      ['@Dadar_Commuter', 'Mumbai', '10 months deposit? In Mumbai that is just the brokerage.', 203],
    ]],
  ['Bengaluru', '@SilkBoard_Monk',
    'Silk Board is not a junction. It is a lifestyle, a meditation retreat, and for some of us, a permanent address.',
    778, 27, 71, [
      ['@ORR_Pilgrim', 'Bengaluru', 'I have received Aadhaar mail at that signal.', 344],
    ]],
  ['Bengaluru', '@HSR_Founder',
    "Quit my 45 LPA job to build an AI startup. We are pre-revenue, pre-product and pre-idea, but the vibes are post-money.",
    95, 0, 160, [
      ['@Bandra_Critic', 'Mumbai', 'So, unemployed. But with a pitch deck.', 689],
      ['@GrowthGuruGaurav', 'Bengaluru', 'This is the kind of courage my 47-page PDF talks about. DM "VIBES".', 22],
    ]],
  ['Bengaluru', '@Indiranagar_Intern',
    "Auto anna quoted ₹350 for 2 km. I said 'meter?' and he laughed so hard two other autos came over to listen.",
    1560, 62, 8, [
      ['@Jayanagar_Uncle', 'Bengaluru', 'Meter is a heritage structure now. Look, do not touch.', 421],
      ['@OMR_Survivor', 'Chennai', 'In Chennai he would not have laughed. He would have simply left. With dignity.', 380],
    ]],
  ['Mumbai', '@Dadar_Commuter',
    'Got a window seat on the 8:47 Virar fast. Not telling my family yet, do not want to jinx it.',
    2011, 80, 34, [
      ['@Borivali_Believer', 'Mumbai', 'Screenshot or it did not happen. Also blink twice if you are being held there.', 602],
      ['@Gurgaon_Survivor', 'Delhi NCR', 'What is a window seat? We only have window AQI.', 149],
    ]],
  ['Mumbai', '@VadaPav_Loyalist',
    "Mumbai rent: ₹65,000 for a 1BHK where the kitchen, the bedroom and my existential crisis share one room. 'Sea view' means you can see a man who can see the sea.",
    947, 0, 110, [
      ['@Powai_Paying_Guest', 'Mumbai', 'My broker called a pigeon net "balcony access".', 455],
    ]],
  ['Mumbai', '@Bandra_Critic',
    "Vada pav is ₹15 of pure happiness and no ₹900 'deconstructed potato slider' will ever change that.",
    1320, 51, 180, [
      ['@Momo_Supremacist', 'Delhi NCR', 'Respectfully, it is a burger that gave up on its dreams.', 44],
      ['@VadaPav_Loyalist', 'Mumbai', 'And the dry garlic chutney is the hero nobody thanks.', 290],
    ]],
  ['Mumbai', '@Monsoon_Warrior',
    'Mumbai rains, day 1: "so romantic". Day 4: wading to Andheri station holding my laptop over my head like baby Simba.',
    688, 0, 240, [
      ['@Dadar_Commuter', 'Mumbai', 'And office still sends "hope everyone is safe, standup at 10".', 512],
    ]],
  ['Delhi NCR', '@SouthDelhi_Overthinker',
    "AQI is 480 and my neighbour is still doing his morning walk 'for health'. Uncle, that is 22 cigarettes with extra steps.",
    1105, 38, 19, [
      ['@Lodhi_Garden_Uncle', 'Delhi NCR', 'In our time AQI was also there. We simply did not measure. Problem solved.', 398],
      ['@Marina_Philosopher', 'Chennai', 'Come to Chennai. Our air is clean. It is just 94% water.', 266],
    ]],
  ['Delhi NCR', '@Gurgaon_Survivor',
    'Gurgaon after 20 minutes of rain: Venice, except everyone owns a Fortuner and nobody owns a boat.',
    1433, 57, 66, [
      ['@CyberHub_Castaway', 'Delhi NCR', 'My cab driver cancelled and sent a lifeguard emoji.', 371],
    ]],
  ['Delhi NCR', '@Momo_Supremacist',
    "Delhi momos beat every other city's momos. This is not an opinion, it is a constitutional fact.",
    120, 0, 205, [
      ['@Park_Street_Purist', 'Kolkata', 'Bro thinks mayonnaise is a chutney. Petition dismissed.', 733],
      ['@Lajpat_Loyalist', 'Delhi NCR', 'The red chutney alone deserves a Padma Shri.', 101],
    ]],
]

export function buildSeed() {
  const now = Date.now()
  const posts = []
  const replies = []

  const addReplies = (postId, list, parentId, baseTime) => {
    list.forEach(([handle, city, content, kadaks, children], i) => {
      const id = uid()
      const created = baseTime + (i + 1) * 90_000
      replies.push({
        id,
        post_id: postId,
        parent_reply_id: parentId,
        handle,
        city,
        content,
        kadaks,
        is_ratio: false,
        archetype: null,
        created_at: new Date(Math.min(created, now - 5_000)).toISOString(),
      })
      if (children) addReplies(postId, children, id, created)
    })
  }

  SEED.forEach(([city, handle, content, kadaks, forwards, minsAgo, thread]) => {
    const id = uid()
    const created = now - minsAgo * 60_000
    posts.push({
      id,
      handle,
      city,
      content,
      kadaks,
      forwards,
      is_simulated: false,
      ratio_score: null,
      created_at: new Date(created).toISOString(),
    })
    addReplies(id, thread, null, created)
  })

  return { posts, replies }
}
