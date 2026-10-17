import { Question } from '../types/game';

export const INITIAL_QUESTIONS: Question[] = [
  // ==========================================
  // TRUTH - FUNNY
  // ==========================================
  {
    id: 't-fun-1',
    type: 'truth',
    category: 'funny',
    difficulty: 'easy',
    text: "What is the weirdest food combination you secretly enjoy?",
    isActive: true,
  },
  {
    id: 't-fun-2',
    type: 'truth',
    category: 'funny',
    difficulty: 'easy',
    text: "If animals could talk, which one do you think would be the rudest?",
    isActive: true,
  },
  {
    id: 't-fun-3',
    type: 'truth',
    category: 'funny',
    difficulty: 'medium',
    text: "Have you ever waved back at someone who was actually waving at someone behind you?",
    isActive: true,
  },
  {
    id: 't-fun-4',
    type: 'truth',
    category: 'funny',
    difficulty: 'medium',
    text: "What is the silliest lie you told that someone actually believed?",
    isActive: true,
  },
  {
    id: 't-fun-5',
    type: 'truth',
    category: 'funny',
    difficulty: 'spicy',
    text: "What's the most ridiculous thing you've ever done to impress someone you liked?",
    isActive: true,
  },
  {
    id: 't-fun-6',
    type: 'truth',
    category: 'funny',
    difficulty: 'easy',
    text: "If you were arrested with no explanation, what would your friends assume you did?",
    isActive: true,
  },
  {
    id: 't-fun-7',
    type: 'truth',
    category: 'funny',
    difficulty: 'medium',
    text: "What is the most useless superpower you can think of that you would still want?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - FRIENDSHIP
  // ==========================================
  {
    id: 't-fri-1',
    type: 'truth',
    category: 'friendship',
    difficulty: 'easy',
    text: "Which player in this room gives the best advice?",
    isActive: true,
  },
  {
    id: 't-fri-2',
    type: 'truth',
    category: 'friendship',
    difficulty: 'medium',
    text: "If all players here were in a zombie apocalypse, who would survive the longest?",
    isActive: true,
  },
  {
    id: 't-fri-3',
    type: 'truth',
    category: 'friendship',
    difficulty: 'medium',
    text: "Who in this room would you trust to plan your surprise birthday party?",
    isActive: true,
  },
  {
    id: 't-fri-4',
    type: 'truth',
    category: 'friendship',
    difficulty: 'spicy',
    text: "What was your very first honest impression of the host when you met?",
    isActive: true,
  },
  {
    id: 't-fri-5',
    type: 'truth',
    category: 'friendship',
    difficulty: 'easy',
    text: "If you could trade wardrobes with any player here for a week, who would you pick?",
    isActive: true,
  },
  {
    id: 't-fri-6',
    type: 'truth',
    category: 'friendship',
    difficulty: 'medium',
    text: "Who in this room is most likely to become a celebrity or viral meme?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - CRUSHES & RELATIONSHIPS
  // ==========================================
  {
    id: 't-cru-1',
    type: 'truth',
    category: 'crushes',
    difficulty: 'easy',
    text: "Who was your very first fictional character crush?",
    isActive: true,
  },
  {
    id: 't-cru-2',
    type: 'truth',
    category: 'crushes',
    difficulty: 'medium',
    text: "What is your biggest green flag and biggest red flag in someone you like?",
    isActive: true,
  },
  {
    id: 't-cru-3',
    type: 'truth',
    category: 'crushes',
    difficulty: 'spicy',
    text: "Do you currently have a crush on someone whom nobody in this room knows about?",
    isActive: true,
  },
  {
    id: 't-cru-4',
    type: 'truth',
    category: 'crushes',
    difficulty: 'spicy',
    text: "What was the worst date or romantic situation you ever had to sit through?",
    isActive: true,
  },
  {
    id: 't-cru-5',
    type: 'truth',
    category: 'crushes',
    difficulty: 'medium',
    text: "Have you ever stalked an ex or crush on social media from a burner account?",
    isActive: true,
  },
  {
    id: 't-cru-6',
    type: 'truth',
    category: 'crushes',
    difficulty: 'easy',
    text: "What celebrity would you say 'yes' to on the spot if they asked you to coffee?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - PERSONAL PREFERENCES
  // ==========================================
  {
    id: 't-per-1',
    type: 'truth',
    category: 'personal',
    difficulty: 'easy',
    text: "What is your ultimate guilty pleasure song that you only sing alone?",
    isActive: true,
  },
  {
    id: 't-per-2',
    type: 'truth',
    category: 'personal',
    difficulty: 'medium',
    text: "What's something everyone seems to love that you secretly think is overrated?",
    isActive: true,
  },
  {
    id: 't-per-3',
    type: 'truth',
    category: 'personal',
    difficulty: 'easy',
    text: "If you had to eat only one meal for the rest of your life, what would it be?",
    isActive: true,
  },
  {
    id: 't-per-4',
    type: 'truth',
    category: 'personal',
    difficulty: 'spicy',
    text: "What is the most expensive purchase you made that you instantly regretted?",
    isActive: true,
  },
  {
    id: 't-per-5',
    type: 'truth',
    category: 'personal',
    difficulty: 'medium',
    text: "What childhood habit or comfort item did you hold onto way longer than you should have?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - EMBARRASSING MOMENTS
  // ==========================================
  {
    id: 't-emb-1',
    type: 'truth',
    category: 'embarrassing',
    difficulty: 'easy',
    text: "What is the funniest thing you have ever said while half asleep?",
    isActive: true,
  },
  {
    id: 't-emb-2',
    type: 'truth',
    category: 'embarrassing',
    difficulty: 'medium',
    text: "Have you ever sent a text talking about someone to the very person you were talking about?",
    isActive: true,
  },
  {
    id: 't-emb-3',
    type: 'truth',
    category: 'embarrassing',
    difficulty: 'spicy',
    text: "What is the most awkward misunderstanding you have ever experienced in public?",
    isActive: true,
  },
  {
    id: 't-emb-4',
    type: 'truth',
    category: 'embarrassing',
    difficulty: 'medium',
    text: "What fashion trend did you enthusiastically rock in the past that makes you cringe now?",
    isActive: true,
  },
  {
    id: 't-emb-5',
    type: 'truth',
    category: 'embarrassing',
    difficulty: 'spicy',
    text: "Have you ever laughed so hard that food or drink came out of your nose?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - SCHOOL & COLLEGE LIFE
  // ==========================================
  {
    id: 't-sch-1',
    type: 'truth',
    category: 'school',
    difficulty: 'easy',
    text: "What was your favorite subject in school and why?",
    isActive: true,
  },
  {
    id: 't-sch-2',
    type: 'truth',
    category: 'school',
    difficulty: 'medium',
    text: "Did you ever get caught doing something you weren't supposed to in class?",
    isActive: true,
  },
  {
    id: 't-sch-3',
    type: 'truth',
    category: 'school',
    difficulty: 'medium',
    text: "What is the wildest excuse you ever gave a teacher or professor that was completely made up?",
    isActive: true,
  },
  {
    id: 't-sch-4',
    type: 'truth',
    category: 'school',
    difficulty: 'spicy',
    text: "Did you ever fall asleep in a lecture or exam and wake up in a panic?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - RANDOM & UNEXPECTED
  // ==========================================
  {
    id: 't-ran-1',
    type: 'truth',
    category: 'random',
    difficulty: 'easy',
    text: "If your life had a theme song that played whenever you walked into a room, what would it be?",
    isActive: true,
  },
  {
    id: 't-ran-2',
    type: 'truth',
    category: 'random',
    difficulty: 'medium',
    text: "If you could instantly be fluent in any 3 languages, which ones would you choose?",
    isActive: true,
  },
  {
    id: 't-ran-3',
    type: 'truth',
    category: 'random',
    difficulty: 'spicy',
    text: "If you had to delete all social media apps except one forever, which one survives?",
    isActive: true,
  },
  {
    id: 't-ran-4',
    type: 'truth',
    category: 'random',
    difficulty: 'easy',
    text: "What conspiracy theory is so funny that you almost wish it were true?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - DEEP CONVERSATIONS
  // ==========================================
  {
    id: 't-dep-1',
    type: 'truth',
    category: 'deep',
    difficulty: 'medium',
    text: "What is a piece of advice you received that genuinely changed how you live your life?",
    isActive: true,
  },
  {
    id: 't-dep-2',
    type: 'truth',
    category: 'deep',
    difficulty: 'spicy',
    text: "What is one dream you had as a kid that you still secretly want to accomplish?",
    isActive: true,
  },
  {
    id: 't-dep-3',
    type: 'truth',
    category: 'deep',
    difficulty: 'medium',
    text: "What are you most proud of achieving in the last 12 months?",
    isActive: true,
  },
  {
    id: 't-dep-4',
    type: 'truth',
    category: 'deep',
    difficulty: 'spicy',
    text: "What is something you learned the hard way about yourself?",
    isActive: true,
  },

  // ==========================================
  // TRUTH - WOULD YOU RATHER
  // ==========================================
  {
    id: 't-wyr-1',
    type: 'truth',
    category: 'would_you_rather',
    difficulty: 'easy',
    text: "Would you rather explore deep ocean trenches or outer space planets?",
    isActive: true,
  },
  {
    id: 't-wyr-2',
    type: 'truth',
    category: 'would_you_rather',
    difficulty: 'medium',
    text: "Would you rather always speak in rhymes or speak only in questions?",
    isActive: true,
  },
  {
    id: 't-wyr-3',
    type: 'truth',
    category: 'would_you_rather',
    difficulty: 'spicy',
    text: "Would you rather have your search history projected in times square for 10 seconds or lose your phone for a month?",
    isActive: true,
  },
  {
    id: 't-wyr-4',
    type: 'truth',
    category: 'would_you_rather',
    difficulty: 'easy',
    text: "Would you rather never have bad hair again or never have bad Wi-Fi again?",
    isActive: true,
  },

  // ==========================================
  // DARE - FUNNY ACTIONS
  // ==========================================
  {
    id: 'd-act-1',
    type: 'dare',
    category: 'funny_actions',
    difficulty: 'easy',
    text: "Do your best slow-motion matrix dodge for 10 seconds right now!",
    isActive: true,
  },
  {
    id: 'd-act-2',
    type: 'dare',
    category: 'funny_actions',
    difficulty: 'medium',
    text: "Balance a random nearby object on your head for the next 2 rounds.",
    isActive: true,
  },
  {
    id: 'd-act-3',
    type: 'dare',
    category: 'funny_actions',
    difficulty: 'spicy',
    text: "Talk with a high-pitched cartoon squirrel voice until your next turn!",
    isActive: true,
  },
  {
    id: 'd-act-4',
    type: 'dare',
    category: 'funny_actions',
    difficulty: 'easy',
    text: "Give a dramatic 30-second speech thanking your left shoe for supporting you.",
    isActive: true,
  },
  {
    id: 'd-act-5',
    type: 'dare',
    category: 'funny_actions',
    difficulty: 'medium',
    text: "Pretend the floor is hot lava and cross the room without touching the floor directly.",
    isActive: true,
  },

  // ==========================================
  // DARE - ACTING & IMPRESSIONS
  // ==========================================
  {
    id: 'd-imp-1',
    type: 'dare',
    category: 'acting',
    difficulty: 'easy',
    text: "Do an impression of another player in this room until someone guesses who it is!",
    isActive: true,
  },
  {
    id: 'd-imp-2',
    type: 'dare',
    category: 'acting',
    difficulty: 'medium',
    text: "Act out a dramatic soap opera breakup scene with an invisible partner.",
    isActive: true,
  },
  {
    id: 'd-imp-3',
    type: 'dare',
    category: 'acting',
    difficulty: 'spicy',
    text: "Deliver your next 3 sentences as if you are a movie trailer narrator with a booming voice.",
    isActive: true,
  },
  {
    id: 'd-imp-4',
    type: 'dare',
    category: 'acting',
    difficulty: 'easy',
    text: "Do your best impression of a cat trying to wake its owner up for breakfast.",
    isActive: true,
  },
  {
    id: 'd-imp-5',
    type: 'dare',
    category: 'acting',
    difficulty: 'medium',
    text: "Re-enact your favorite action movie scene using only household items as props.",
    isActive: true,
  },

  // ==========================================
  // DARE - SINGING OR DANCING
  // ==========================================
  {
    id: 'd-sin-1',
    type: 'dare',
    category: 'singing_dancing',
    difficulty: 'easy',
    text: "Sing the chorus of your favorite pop anthem at full energy!",
    isActive: true,
  },
  {
    id: 'd-sin-2',
    type: 'dare',
    category: 'singing_dancing',
    difficulty: 'medium',
    text: "Invent a new signature victory dance and perform it for the group.",
    isActive: true,
  },
  {
    id: 'd-sin-3',
    type: 'dare',
    category: 'singing_dancing',
    difficulty: 'spicy',
    text: "Freestyle rap for 20 seconds about the person to your left (or the host)!",
    isActive: true,
  },
  {
    id: 'd-sin-4',
    type: 'dare',
    category: 'singing_dancing',
    difficulty: 'easy',
    text: "Hum a famous movie theme song until someone in the room guesses it correctly.",
    isActive: true,
  },
  {
    id: 'd-sin-5',
    type: 'dare',
    category: 'singing_dancing',
    difficulty: 'medium',
    text: "Do the robot dance for 15 seconds with authentic sound effects.",
    isActive: true,
  },

  // ==========================================
  // DARE - CREATIVE CHALLENGES
  // ==========================================
  {
    id: 'd-cre-1',
    type: 'dare',
    category: 'creative',
    difficulty: 'easy',
    text: "Take a selfie making the most dramatic villain face you can summon and show it to everyone.",
    isActive: true,
  },
  {
    id: 'd-cre-2',
    type: 'dare',
    category: 'creative',
    difficulty: 'medium',
    text: "Create a 15-second TV infomercial selling a pen like it will save humanity.",
    isActive: true,
  },
  {
    id: 'd-cre-3',
    type: 'dare',
    category: 'creative',
    difficulty: 'spicy',
    text: "Draw a portrait of any player in 30 seconds using whatever tool or paper you have, then reveal it!",
    isActive: true,
  },
  {
    id: 'd-cre-4',
    type: 'dare',
    category: 'creative',
    difficulty: 'easy',
    text: "Make up a haiku about pizza and recite it with deep emotional feeling.",
    isActive: true,
  },

  // ==========================================
  // DARE - FRIENDLY GROUP CHALLENGES
  // ==========================================
  {
    id: 'd-grp-1',
    type: 'dare',
    category: 'group',
    difficulty: 'easy',
    text: "Give a genuine, personalized compliment to every single player in the room.",
    isActive: true,
  },
  {
    id: 'd-grp-2',
    type: 'dare',
    category: 'group',
    difficulty: 'medium',
    text: "Start a group wave or synchronized clap that travels through all players.",
    isActive: true,
  },
  {
    id: 'd-grp-3',
    type: 'dare',
    category: 'group',
    difficulty: 'spicy',
    text: "Let the group vote on an emoji you must put as your profile status for the rest of the game.",
    isActive: true,
  },

  // ==========================================
  // DARE - VIDEO CALL & ONLINE CHALLENGES
  // ==========================================
  {
    id: 'd-vid-1',
    type: 'dare',
    category: 'video_call',
    difficulty: 'easy',
    text: "Show the most unusual item currently within arm's reach of your keyboard.",
    isActive: true,
  },
  {
    id: 'd-vid-2',
    type: 'dare',
    category: 'video_call',
    difficulty: 'medium',
    text: "Freeze completely like your video connection lagged for 15 seconds without laughing.",
    isActive: true,
  },
  {
    id: 'd-vid-3',
    type: 'dare',
    category: 'video_call',
    difficulty: 'spicy',
    text: "Change your camera angle or background to look like you're in an interrogation room.",
    isActive: true,
  },
  {
    id: 'd-vid-4',
    type: 'dare',
    category: 'video_call',
    difficulty: 'easy',
    text: "Give a 20-second cribs-style tour of just the space immediately surrounding your chair.",
    isActive: true,
  },

  // ==========================================
  // DARE - EMOJI & TYPING CHALLENGES
  // ==========================================
  {
    id: 'd-emj-1',
    type: 'dare',
    category: 'emoji_typing',
    difficulty: 'easy',
    text: "Send a message in the chat that tells a story using ONLY 8 emojis.",
    isActive: true,
  },
  {
    id: 'd-emj-2',
    type: 'dare',
    category: 'emoji_typing',
    difficulty: 'medium',
    text: "Type out 'Truth or Dare is the supreme party game' with your eyes closed in the chat without editing!",
    isActive: true,
  },
  {
    id: 'd-emj-3',
    type: 'dare',
    category: 'emoji_typing',
    difficulty: 'spicy',
    text: "React with 5 different emojis to the next 3 things anyone says in the room.",
    isActive: true,
  },
  {
    id: 'd-emj-4',
    type: 'dare',
    category: 'emoji_typing',
    difficulty: 'easy',
    text: "Type out the lyrics to your favorite song using one emoji for every line.",
    isActive: true,
  },
];
