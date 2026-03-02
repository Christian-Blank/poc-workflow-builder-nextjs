export interface EnneagramType {
  number: number;
  name: string;
  alias: string;
  summary: string;
  strengths: string[];
  challenges: string[];
  growth: string;
  color: string;
}

export const enneagramTypes: EnneagramType[] = [
  {
    number: 1,
    name: "The Reformer",
    alias: "The Perfectionist",
    summary:
      "You have a strong sense of right and wrong. Principled, purposeful, and self-controlled, you strive for integrity and fear being corrupt or defective. You want to make the world a better place through improvement and high standards.",
    strengths: ["Ethical", "Reliable", "Thorough", "Fair-minded"],
    challenges: [
      "Self-criticism",
      "Rigidity",
      "Resentment",
      "Impatience with imperfection",
    ],
    growth:
      "Learn to embrace imperfection and practice self-compassion. Not everything needs to be corrected.",
    color: "#6B7280",
  },
  {
    number: 2,
    name: "The Helper",
    alias: "The Giver",
    summary:
      "You are caring, interpersonal, and generous. You want to be loved and needed, and you express this through helping others. Warm-hearted and sincere, you go out of your way to make others feel supported.",
    strengths: ["Empathetic", "Generous", "Warm", "People-oriented"],
    challenges: [
      "People-pleasing",
      "Difficulty setting boundaries",
      "Neglecting own needs",
      "Possessiveness",
    ],
    growth:
      "Practice self-care and learn that your worth isn't tied to what you do for others.",
    color: "#EC4899",
  },
  {
    number: 3,
    name: "The Achiever",
    alias: "The Performer",
    summary:
      "You are success-oriented, adaptable, and driven. Image-conscious and highly motivated, you excel at setting and reaching goals. You want to be affirmed and distinguished from others through accomplishments.",
    strengths: ["Ambitious", "Efficient", "Energetic", "Self-assured"],
    challenges: [
      "Workaholism",
      "Image-consciousness",
      "Competitiveness",
      "Difficulty with vulnerability",
    ],
    growth:
      "Slow down and connect with your authentic self beyond achievements. You are more than your accomplishments.",
    color: "#F59E0B",
  },
  {
    number: 4,
    name: "The Individualist",
    alias: "The Romantic",
    summary:
      "You are expressive, dramatic, and self-aware. You feel things deeply and have a strong desire to be authentic and unique. Creative and introspective, you are attuned to beauty and meaning in life.",
    strengths: ["Creative", "Authentic", "Emotionally honest", "Intuitive"],
    challenges: [
      "Moodiness",
      "Envy",
      "Self-absorption",
      "Feeling misunderstood",
    ],
    growth:
      "Appreciate what you have rather than longing for what's missing. Your feelings are valid, but they aren't the whole truth.",
    color: "#8B5CF6",
  },
  {
    number: 5,
    name: "The Investigator",
    alias: "The Observer",
    summary:
      "You are perceptive, innovative, and cerebral. You have an intense need to understand the world and accumulate knowledge. Independent and insightful, you value privacy and competence above all.",
    strengths: ["Analytical", "Objective", "Perceptive", "Self-sufficient"],
    challenges: [
      "Detachment",
      "Isolation",
      "Overthinking",
      "Difficulty with emotions",
    ],
    growth:
      "Engage more with the world and your body. Knowledge is enriched by experience and connection.",
    color: "#3B82F6",
  },
  {
    number: 6,
    name: "The Loyalist",
    alias: "The Skeptic",
    summary:
      "You are committed, security-oriented, and reliable. You have a keen eye for potential problems and work hard to create safety and stability. Responsible and trustworthy, you value loyalty above all.",
    strengths: ["Loyal", "Responsible", "Prepared", "Courageous"],
    challenges: [
      "Anxiety",
      "Worst-case thinking",
      "Indecisiveness",
      "Suspicion",
    ],
    growth:
      "Trust yourself more. You have the inner resources to handle what comes. Courage isn't the absence of fear.",
    color: "#059669",
  },
  {
    number: 7,
    name: "The Enthusiast",
    alias: "The Epicure",
    summary:
      "You are busy, fun-loving, and spontaneous. You want to experience everything life has to offer and maintain your freedom and happiness. Versatile and optimistic, you bring energy and excitement wherever you go.",
    strengths: ["Optimistic", "Versatile", "Adventurous", "Quick-thinking"],
    challenges: [
      "Scattered focus",
      "Avoidance of pain",
      "Impulsiveness",
      "Commitment difficulty",
    ],
    growth:
      "Stay present with difficult emotions instead of seeking the next distraction. Depth comes from stillness.",
    color: "#F97316",
  },
  {
    number: 8,
    name: "The Challenger",
    alias: "The Protector",
    summary:
      "You are powerful, decisive, and self-confident. You have a strong presence and aren't afraid to take charge. Protective of those you care about, you value strength, justice, and truth.",
    strengths: ["Decisive", "Protective", "Direct", "Self-confident"],
    challenges: [
      "Confrontational",
      "Dominating",
      "Difficulty being vulnerable",
      "Excessive intensity",
    ],
    growth:
      "Let your guard down and show your tender side. True strength includes vulnerability and gentleness.",
    color: "#DC2626",
  },
  {
    number: 9,
    name: "The Peacemaker",
    alias: "The Mediator",
    summary:
      "You are easygoing, accepting, and agreeable. You seek peace and harmony, both internally and in your environment. Patient and supportive, you have a gift for seeing all perspectives and bringing people together.",
    strengths: ["Diplomatic", "Patient", "Open-minded", "Supportive"],
    challenges: [
      "Passivity",
      "Conflict avoidance",
      "Stubbornness",
      "Self-forgetting",
    ],
    growth:
      "Your voice matters. Engage with your own desires and priorities instead of merging with others' agendas.",
    color: "#14B8A6",
  },
];

export interface Question {
  id: number;
  text: string;
  targetType: number; // 1-9
}

export const questions: Question[] = [
  // Type 1 — The Reformer
  {
    id: 1,
    text: "I have a strong inner critic that constantly evaluates whether I'm doing things correctly.",
    targetType: 1,
  },
  {
    id: 2,
    text: "I get frustrated when people don't follow rules or cut corners.",
    targetType: 1,
  },
  {
    id: 3,
    text: "I feel responsible for fixing mistakes and improving things around me.",
    targetType: 1,
  },
  {
    id: 4,
    text: "I hold myself to very high standards, even when others tell me to relax.",
    targetType: 1,
  },

  // Type 2 — The Helper
  {
    id: 5,
    text: "I often anticipate what others need before they ask.",
    targetType: 2,
  },
  {
    id: 6,
    text: "I feel most valued when I'm helping or supporting someone.",
    targetType: 2,
  },
  {
    id: 7,
    text: "I sometimes struggle to say no, even when I'm overextended.",
    targetType: 2,
  },
  {
    id: 8,
    text: "I feel hurt when people don't acknowledge or appreciate my efforts.",
    targetType: 2,
  },

  // Type 3 — The Achiever
  {
    id: 9,
    text: "I'm highly motivated by goals and feel restless without a clear objective.",
    targetType: 3,
  },
  {
    id: 10,
    text: "I adapt my presentation depending on the audience to make the best impression.",
    targetType: 3,
  },
  {
    id: 11,
    text: "I measure my self-worth largely through my accomplishments.",
    targetType: 3,
  },
  {
    id: 12,
    text: "I find it difficult to slow down — there's always something more to achieve.",
    targetType: 3,
  },

  // Type 4 — The Individualist
  {
    id: 13,
    text: "I often feel like something important is missing from my life.",
    targetType: 4,
  },
  {
    id: 14,
    text: "I'm drawn to expressing deep emotions through creativity or art.",
    targetType: 4,
  },
  {
    id: 15,
    text: "I feel fundamentally different from most people around me.",
    targetType: 4,
  },
  {
    id: 16,
    text: "I'm more in touch with melancholy and longing than most people seem to be.",
    targetType: 4,
  },

  // Type 5 — The Investigator
  {
    id: 17,
    text: "I need a lot of private time and space to recharge and think clearly.",
    targetType: 5,
  },
  {
    id: 18,
    text: "I'd rather observe and analyze a situation before jumping in.",
    targetType: 5,
  },
  {
    id: 19,
    text: "I feel drained when people make too many demands on my time or energy.",
    targetType: 5,
  },
  {
    id: 20,
    text: "I tend to dive deeply into subjects that interest me, sometimes for hours.",
    targetType: 5,
  },

  // Type 6 — The Loyalist
  {
    id: 21,
    text: "I tend to think about what could go wrong so I can prepare for it.",
    targetType: 6,
  },
  {
    id: 22,
    text: "Trust is something people have to earn with me — I don't give it easily.",
    targetType: 6,
  },
  {
    id: 23,
    text: "I look for guidance from authorities or systems I respect, but I also question them.",
    targetType: 6,
  },
  {
    id: 24,
    text: "Loyalty and commitment to my people are among my most important values.",
    targetType: 6,
  },

  // Type 7 — The Enthusiast
  {
    id: 25,
    text: "I love making plans and get excited about future possibilities.",
    targetType: 7,
  },
  {
    id: 26,
    text: "I struggle to stay focused on one thing — I want to experience everything.",
    targetType: 7,
  },
  {
    id: 27,
    text: "I reframe negatives into positives and avoid dwelling on painful feelings.",
    targetType: 7,
  },
  {
    id: 28,
    text: "Feeling limited, trapped, or bored is one of my worst experiences.",
    targetType: 7,
  },

  // Type 8 — The Challenger
  {
    id: 29,
    text: "I speak my mind directly and don't sugarcoat things.",
    targetType: 8,
  },
  {
    id: 30,
    text: "I instinctively take charge in situations where no one else is stepping up.",
    targetType: 8,
  },
  {
    id: 31,
    text: "I have a strong sense of justice and can't stand seeing people taken advantage of.",
    targetType: 8,
  },
  {
    id: 32,
    text: "Showing vulnerability feels risky to me — I prefer to appear strong.",
    targetType: 8,
  },

  // Type 9 — The Peacemaker
  {
    id: 33,
    text: "I tend to go along with others to keep the peace, even if I disagree.",
    targetType: 9,
  },
  {
    id: 34,
    text: "I can see all sides of an argument, which makes it hard to take a firm position.",
    targetType: 9,
  },
  {
    id: 35,
    text: "I sometimes zone out or numb myself when things get stressful.",
    targetType: 9,
  },
  {
    id: 36,
    text: "I avoid conflict and confrontation whenever possible.",
    targetType: 9,
  },
];

export type Answers = Record<number, number>;

export interface QuizResult {
  primaryType: EnneagramType;
  scores: { type: EnneagramType; score: number; percentage: number }[];
}

export function calculateResults(answers: Answers): QuizResult {
  const typeScores: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) {
    typeScores[i] = 0;
  }

  for (const question of questions) {
    const answer = answers[question.id];
    if (answer !== undefined) {
      typeScores[question.targetType] += answer;
    }
  }

  const maxPossible = 4 * 5; // 4 questions per type, max 5 each

  const scores = enneagramTypes.map((type) => ({
    type,
    score: typeScores[type.number],
    percentage: Math.round((typeScores[type.number] / maxPossible) * 100),
  }));

  scores.sort((a, b) => b.score - a.score);

  return {
    primaryType: scores[0].type,
    scores,
  };
}
