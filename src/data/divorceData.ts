export interface DivorceTask {
  id: string;
  text: string;
}

export interface DivorceLink {
  label: string;
  url: string;
  type: 'website' | 'template' | 'resource';
}

export interface InfoSection {
  title: string;
  content: string | string[];
}

export interface QuizOption {
  label: string;
  points: number;
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface QuizResult {
  minPoints: number;
  maxPoints: number;
  title: string;
  description: string;
}

export interface EmbeddedQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  note?: string;
}

export interface DivorceStep {
  id: string;
  phaseId: string;
  number: number;
  title: string;
  icon: string;
  summary: string;
  tasks: DivorceTask[];
  infoSections?: InfoSection[];
  lawyerQuestions?: string[];
  tips?: InfoSection[];
  links?: DivorceLink[];
  quiz?: EmbeddedQuiz;
  quote?: string;
}

export interface DivorcePhase {
  id: string;
  number: number;
  title: string;
  icon: string;
  color: string;
  gradientColors: [string, string];
  duration: string;
  description: string;
  stepIds: string[];
}

// ─── QUIZZES ──────────────────────────────────────────────────────────────────

const amicableOrHighConflictQuiz: EmbeddedQuiz = {
  id: 'amicable-quiz',
  title: 'Is My Divorce Amicable or High Conflict?',
  questions: [
    {
      text: 'How well do you and your former partner communicate?',
      options: [
        { label: 'We communicate well and can discuss issues calmly.', points: 1 },
        { label: 'We have some difficulty, but can usually work through it.', points: 2 },
        { label: 'We have a lot of trouble and often end up arguing.', points: 3 },
      ],
    },
    {
      text: 'Do you agree on major issues such as property division and child custody?',
      options: [
        { label: 'Yes, we are in agreement on most major issues.', points: 1 },
        { label: 'We have some disagreements, but are willing to compromise.', points: 2 },
        { label: 'We have major disagreements and cannot seem to reach a compromise.', points: 3 },
      ],
    },
    {
      text: 'How long have you been married?',
      options: [
        { label: 'Less than 5 years.', points: 1 },
        { label: 'Between 5 and 10 years.', points: 2 },
        { label: 'More than 10 years.', points: 3 },
      ],
    },
    {
      text: 'Do you have children?',
      options: [
        { label: 'No.', points: 1 },
        { label: 'Yes, but they are grown and out of the house.', points: 2 },
        { label: 'Yes, and they are still young.', points: 3 },
      ],
    },
    {
      text: 'Have either you or your former partner been unfaithful or neglectful during the marriage?',
      options: [
        { label: 'No.', points: 1 },
        { label: 'Yes, but it was a one-time occurrence and we worked through it.', points: 2 },
        { label: 'Yes, and it has caused a lot of problems in the marriage.', points: 3 },
      ],
    },
  ],
  results: [
    {
      minPoints: 5,
      maxPoints: 7,
      title: 'Likely Amicable & Simple',
      description:
        'You communicate well and agree on major issues. A straightforward legal process may be all you need.',
    },
    {
      minPoints: 8,
      maxPoints: 11,
      title: 'More Complicated but Manageable',
      description:
        'Some disagreements exist, but you are willing to compromise. You may benefit from a mediator or lawyer to help navigate the process.',
    },
    {
      minPoints: 12,
      maxPoints: 15,
      title: 'Likely High Conflict & Complex',
      description:
        'There are major disagreements on many issues. A mediator or lawyer is strongly recommended. The process may be longer and more stressful — having a strong team is essential.',
    },
  ],
  note: 'If you do not feel safe or are unable to advocate for yourself, seek legal counsel immediately.',
};

const capableNegotiatorQuiz: EmbeddedQuiz = {
  id: 'negotiator-quiz',
  title: 'Are You a Capable Negotiator?',
  questions: [
    {
      text: 'Are you able to keep your emotions in check during difficult negotiations?',
      options: [
        { label: 'Yes, I am able to remain calm and focused.', points: 1 },
        { label: 'No, I tend to get emotional and reactive.', points: 0 },
      ],
    },
    {
      text: 'Do you have a clear understanding of what you want to achieve in negotiations?',
      options: [
        { label: 'Yes, I have a clear idea of my goals and objectives.', points: 1 },
        { label: 'No, I am unsure of what I want to achieve.', points: 0 },
      ],
    },
    {
      text: 'Are you able to communicate your needs effectively to others?',
      options: [
        { label: 'Yes, I am able to express myself clearly and assertively.', points: 1 },
        { label: 'No, I struggle to communicate my needs effectively.', points: 0 },
      ],
    },
    {
      text: 'Do you have a plan for dealing with difficult or uncooperative negotiators?',
      options: [
        { label: 'Yes, I have strategies for dealing with difficult people.', points: 1 },
        { label: 'No, I am unsure of how to handle difficult negotiators.', points: 0 },
      ],
    },
    {
      text: 'Are you willing to compromise and find solutions that work for everyone?',
      options: [
        { label: 'Yes, I am willing to be flexible and find common ground.', points: 1 },
        { label: 'No, I am not willing to compromise on my needs and wants.', points: 0 },
      ],
    },
  ],
  results: [
    {
      minPoints: 4,
      maxPoints: 5,
      title: 'Capable Negotiator',
      description:
        'You are a capable negotiator! You have the skills and mindset needed to advocate effectively for yourself.',
    },
    {
      minPoints: 2,
      maxPoints: 3,
      title: 'Room for Improvement',
      description:
        'There is some room for improvement. Consider seeking resources or professional support to strengthen your negotiation skills.',
    },
    {
      minPoints: 0,
      maxPoints: 1,
      title: 'Seek Support',
      description:
        'You may struggle with negotiating. Consider working with a professional to develop the skills and confidence you need.',
    },
  ],
};

// ─── STEPS ────────────────────────────────────────────────────────────────────

export const divorceSteps: DivorceStep[] = [
  // ── Phase 1 ──────────────────────────────────────────────────────────────────
  {
    id: 'step-1',
    phaseId: 'phase-1',
    number: 1,
    title: 'Officially Separate & Start Independent Living',
    icon: '🏠',
    summary:
      'Establish your date of separation and begin independent living. The person who is more informed has a massive advantage.',
    tasks: [
      { id: 'step1-task1', text: 'Note the date and conversation with your partner about the decision to separate' },
      { id: 'step1-task2', text: 'Determine the official date of separation' },
      { id: 'step1-task3', text: 'Begin living separately — separate finances and belongings (even in same home)' },
      { id: 'step1-task4', text: 'Consider protecting financial interests: close/open accounts, update beneficiaries and estate plans' },
      { id: 'step1-task5', text: 'Consider informing family and friends of the separation (see Step 4)' },
      { id: 'step1-task6', text: 'Consider obtaining legal separation agreement if situation is high-conflict, unsafe, or complex' },
      { id: 'step1-task7', text: 'Implement self-care practices that are accessible and sustainable' },
    ],
    infoSections: [
      {
        title: 'Why the Date of Separation Matters',
        content: [
          'Property Division: Assets acquired after separation date are considered separate property.',
          'Spousal Support: Length of marriage affects duration of spousal support payments.',
          'Child Custody & Support: Separation date used to determine living history with each parent.',
          'Division of Debt: Debts incurred after separation date are separate debts.',
        ],
      },
      {
        title: 'What Determines Separation Date (if disputed)',
        content: [
          'Living Arrangements: separate residences or separate bedrooms.',
          'Financial Separation: separate bank accounts or separate tax returns.',
          'Communication: less frequent or stopped communication.',
          'Social Activities: attending events separately.',
        ],
      },
    ],
    lawyerQuestions: [
      'Should I close or freeze joint accounts to prevent my partner from accessing funds or running up debt?',
      'We are on good terms — what interim financial agreement do I need to protect myself?',
      'What are the legal implications of staying or leaving the matrimonial home?',
      'If you do not have access to money and/or it is being withheld — a lawyer can assist you in obtaining funds needed to live for a minimum of 1 year.',
      'When should I review and update beneficiaries and estate plans, including life insurance, retirement accounts, and wills?',
      'Is there anything I need to consider about unrealized gains or losses on investments?',
    ],
    links: [
      { label: 'Lemonade Life Website', url: 'https://www.lemonadelife.ca', type: 'website' },
      { label: 'Financial Templates & Resources', url: 'https://www.lemonadelife.ca', type: 'template' },
    ],
  },
  {
    id: 'step-2',
    phaseId: 'phase-1',
    number: 2,
    title: 'Gather Financial Info & Understand Cash Flow',
    icon: '💰',
    summary:
      'Being proactive in gathering financial information can save you major legal fees. This is simply an inventory to understand where everything is.',
    tasks: [
      { id: 'step2-task1', text: 'Locate and organize all INCOME documents: pay stubs, tax returns (past 3 years), other income sources' },
      { id: 'step2-task2', text: 'Gather BANK ACCOUNT info: account numbers, balances, transaction downloads' },
      { id: 'step2-task3', text: 'Gather INVESTMENT & RETIREMENT ACCOUNT info: account numbers, balances, investment holdings' },
      { id: 'step2-task4', text: 'Gather PROPERTY documents: home appraisal, titles, deeds, mortgage info, rental agreements' },
      { id: 'step2-task5', text: 'Gather DEBT documents: credit card balances, loan statements, other outstanding debts' },
      { id: 'step2-task6', text: 'Gather INSURANCE POLICIES: health, life, property' },
      { id: 'step2-task7', text: 'Gather BUSINESS OWNERSHIP documents (if applicable): business bank accounts, tax returns, financial & organizational docs' },
      { id: 'step2-task8', text: 'Gather SOCIAL SECURITY & RETIREMENT info: current and projected benefits' },
      { id: 'step2-task9', text: 'Complete the Financial Information Summary template (Document key facts)' },
      { id: 'step2-task10', text: 'Consider hiring a licensed appraiser for your home (see home appraisal process)' },
      { id: 'step2-task11', text: 'Create a personalized budget and understand your cashflow' },
    ],
    infoSections: [
      {
        title: 'Financial Document Instructions',
        content: [
          '1. Locate the document and organize in a folder (physically or electronically).',
          '2. Document key facts in your Financial Information Summary.',
          '3. Create a personalized budget so you know your monthly cashflow needs.',
          '4. As you complete an item, check it off your checklist.',
          '5. If you don\'t have the document — document the next step to obtain it.',
        ],
      },
      {
        title: 'Home Appraisal Process',
        content: [
          '1. Hire a licensed appraiser experienced with divorce settlements.',
          '2. Gather property documents: deed, property tax statements, mortgage statements.',
          '3. Provide a property description: age, size, condition, renovations.',
          '4. Conduct an inspection of the property.',
          '5. Research comparable properties to determine fair market value.',
          '6. Prepare a detailed report outlining fair market value.',
          '7. Present the report to both parties or lawyers for negotiation.',
        ],
      },
      {
        title: 'Budget Steps',
        content: [
          'Track your expenses for a month (bills, groceries, entertainment, transportation, insurance, extracurriculars, health, etc.)',
          'Categorize your expenses (housing, transportation, food, entertainment, etc.)',
          'Determine your monthly income after taxes.',
          'Prioritize essential expenses (housing, utilities, food).',
          'Set short-term and long-term financial goals.',
          'Create a budget balancing spending with financial goals.',
          'Review and adjust regularly as income or expenses change.',
        ],
      },
    ],
    links: [
      { label: 'Financial Summary Template', url: 'https://www.lemonadelife.ca', type: 'template' },
      { label: 'Budget Google Sheet Template', url: 'https://www.lemonadelife.ca', type: 'template' },
    ],
  },
  {
    id: 'step-3',
    phaseId: 'phase-1',
    number: 3,
    title: 'Create the Interim Family Plan',
    icon: '👨‍👩‍👧‍👦',
    summary:
      'Create a plan that is child-centered and conflict-free. This creates stability while you navigate your new family dynamic.',
    tasks: [
      { id: 'step3-task1', text: 'Identify the needs of each family member (emotional, physical, social, financial)' },
      { id: 'step3-task2', text: 'Decide on living and custody arrangements (who stays in family home, who moves out)' },
      { id: 'step3-task3', text: 'Create your communication strategy for discussions with former partner' },
      { id: 'step3-task4', text: 'If living TOGETHER: Schedule privacy time, divide home space, set separate bedrooms, alternate child-centered routines, document agreements, establish healthy boundaries' },
      { id: 'step3-task5', text: 'If living APART: Determine independent living arrangements, set transition days for children, create a communication plan' },
      { id: 'step3-task6', text: 'Research and decide on custody arrangement type (sole, joint, split, 50/50, bird\'s nest, alternating weeks)' },
      { id: 'step3-task7', text: 'Draft your ideal parenting plan' },
      { id: 'step3-task8', text: 'Draft your interim financial plan' },
      { id: 'step3-task9', text: 'If needed: Use the letter template to request money from former partner' },
      { id: 'step3-task10', text: 'Review and revise the family plan regularly' },
    ],
    infoSections: [
      {
        title: 'Custody Options',
        content: [
          'Sole Custody: One parent makes all major decisions and is primary caregiver.',
          'Joint Custody: Both parents share decision-making and physical custody.',
          'Split Custody: Each parent has custody of one or more children.',
          'Bird\'s Nest Custody: Child stays in one home, parents take turns living there.',
          '50/50 Custody: Child spends equal time with each parent (Week On/Week Off, 2-2-3, 3-4-4-3, or Alternating Weeks schedule).',
          'Customized Arrangements: Parents create a plan that meets unique needs.',
        ],
      },
      {
        title: 'Parenting Plan Elements',
        content: [
          'The custody schedule and how often it will be reviewed.',
          'Decision-making process for medical, dental, health, wellness, education.',
          'Special schedule accommodations for holidays.',
          'Schedule change request process and required response time.',
          'Transition day flow guidelines.',
          'Travel documentation and notification requirements.',
          'Communication with schools, medical and other third parties.',
          'Children\'s communication with the other co-parent.',
          'Other details important for the well-being of your children.',
        ],
      },
      {
        title: 'Financial Plan Elements',
        content: [
          'List of all debts (credit cards, loans, mortgage).',
          'Budget breakdown for monthly expenses.',
          'Investment portfolio overview.',
          'Income statement from both parties.',
          'Contingency plan for unexpected expenses.',
          'Note: net family income will continue to pay for the matrimonial home.',
        ],
      },
      {
        title: 'Understanding Equalization',
        content: [
          'Net family property = assets at date of separation minus debts at date of separation.',
          'The person with higher net family property pays the other half the difference.',
          'Certain assets may be excluded (gifts, inheritances).',
          'Seek advice from a lawyer or financial professional.',
        ],
      },
      {
        title: 'Living Together Tips',
        content: [
          'Schedule time for privacy in your home.',
          'Divide space to reduce constant contact.',
          'Time with kids: schedule one-on-one time for each parent.',
          'Alternate major child-centered routines (bedtime, mealtime).',
          'Keep separate bedrooms if possible.',
          'Reduce communication to essentials (children and settlement).',
          'Avoid "playing house" — no cooking meals together or dating behaviors.',
          'Be consistent with routines for children\'s stability.',
          'Establish healthy boundaries for time, roles, and responsibilities.',
        ],
      },
      {
        title: 'Living Apart Tips',
        content: [
          'Determine where each person will live (separate apartment, house, or with family).',
          'Decide how to split responsibilities (bills, home, children).',
          'Set regular transition days for children.',
          'Create a communication plan (phone, text, email).',
          'Seek support from friends, family, coach, or therapist.',
          'Take care of your physical and emotional health.',
        ],
      },
    ],
    links: [
      { label: 'Interim Financial Agreement Template', url: 'https://www.lemonadelife.ca', type: 'template' },
      { label: 'Letter Requesting Money Template', url: 'https://www.lemonadelife.ca', type: 'template' },
    ],
  },
  {
    id: 'step-4',
    phaseId: 'phase-1',
    number: 4,
    title: 'Communicate the Plan',
    icon: '💬',
    summary:
      'Sharing this news is loaded emotionally, socially and personally. Reduce decision fatigue with prepared statements. What you share sets the tone for how others will show up to support your family.',
    tasks: [
      { id: 'step4-task1', text: 'Create your "back pocket statement" for any situation' },
      { id: 'step4-task2', text: 'Create a comprehensive list of all stakeholders to notify' },
      { id: 'step4-task3', text: 'Communicate with your partner (choose safe time/place, use "I" statements, be clear and direct, listen to their perspective)' },
      { id: 'step4-task4', text: 'Communicate with your children (honest, reassuring, age-appropriate, listen to their feelings, create a future plan, seek support)' },
      { id: 'step4-task5', text: 'Communicate with extended family (decide on timeline, prepare clear message, address questions, seek support)' },
      { id: 'step4-task6', text: 'Set boundaries: only share what matters, redirect gossip, stay out of drama' },
    ],
    infoSections: [
      {
        title: 'Back Pocket Statement Examples',
        content: [
          '"This is an incredibly challenging time, but we are focused on the children and what will be our new family dynamic as co-parents."',
          '"We have so much respect, love and gratitude for everything our partnership and family has accomplished and know that our future will be whatever we make it so we appreciate your loving support, positive encouragement and keeping us included as always."',
        ],
      },
      {
        title: 'Communicating with Your Partner (7 Steps)',
        content: [
          '1. Choose a time and place where you both feel comfortable and safe, with enough time to talk without interruptions.',
          '2. Use "I" statements and avoid blaming or criticizing your partner.',
          '3. Be clear and direct about your decision, but listen to your partner\'s perspective and feelings.',
          '4. Provide specific reasons for your decision, acknowledging positive aspects of the relationship.',
          '5. Discuss practical aspects: living arrangements, finances, children.',
          '6. Take responsibility for your part and express regrets if necessary.',
          '7. Consider seeking professional help such as mediation.',
        ],
      },
      {
        title: 'Communicating with Your Children (7 Steps)',
        content: [
          '1. Choose an appropriate time and place — private and safe space.',
          '2. Be honest and direct: tell them you\'ve decided to separate.',
          '3. Reassure them: this has nothing to do with them, they will always have your love.',
          '4. Listen to their feelings, allow questions, answer honestly.',
          '5. Create a plan for the future: visitation, co-parenting, new family dynamic.',
          '6. Seek support: family therapy, teachers, coaches aware.',
          '7. Follow up: check in frequently, communicate openly.',
        ],
      },
      {
        title: 'Communicating with Extended Family & Community (5 Steps)',
        content: [
          '1. Decide on a timeline: closest family and friends first, then extended community.',
          '2. Consider your communication channels: face-to-face, phone, email, or social media.',
          '3. Prepare a clear and honest message: avoid blaming, focus on moving forward.',
          '4. Address questions and concerns: reassure commitment to minimizing impact on children.',
          '5. Seek support: reach out to trusted family, friends, or professional counselling.',
        ],
      },
    ],
  },

  // ── Phase 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'step-5',
    phaseId: 'phase-2',
    number: 5,
    title: 'Prepare Your Legal Divorce Brief and Story',
    icon: '📋',
    summary:
      'This document is presented to your lawyer to get them up to speed efficiently. By creating the legal brief ahead of time you can save thousands of dollars and position yourself as the leader of your divorce.',
    tasks: [
      { id: 'step5-task1', text: 'Complete the Legal Intake Form (personal, spouse, children, and marriage details)' },
      { id: 'step5-task2', text: 'Write your Divorce Story — BEFORE MARRIAGE (timeline of life, educational milestones, career achievements, personal accomplishments, values, and goals)' },
      { id: 'step5-task3', text: 'Write your Divorce Story — DURING MARRIAGE (chronological timeline, key issues, impact on your life, evidence)' },
      { id: 'step5-task4', text: 'Write your Divorce Story — LIFE BEYOND MARRIAGE (vision for future, timeline to rebuild, financial situation, goals, negotiation priorities)' },
      { id: 'step5-task5', text: 'Complete Executive Summary Part 1: Current Status, Background, Key Issues, Goals & Objectives' },
      { id: 'step5-task6', text: 'Complete Executive Summary Part 2: Urgent Needs & Questions, Action Plan, Team, Summary, Cost + Payment Schedule' },
      { id: 'step5-task7', text: 'Compile everything into the Legal Divorce Brief document' },
    ],
    infoSections: [
      {
        title: 'Legal Intake Form Fields',
        content: [
          'Name, Date, Lawyer name and firm.',
          'Client: Name at birth, married name, date of birth, phone, address, email.',
          'Spouse: Name at birth, married name, date of birth, phone, address.',
          'Dependents: Total number of children, names + DOB for each.',
          'Marriage: Date of marriage, date of separation, location, registration status, prenuptial agreement.',
        ],
      },
      {
        title: 'Divorce Story — Before Marriage Prompts',
        content: [
          '1. Create a timeline of your life from birth to today.',
          '2. Divide timeline into sections: educational milestones, career achievements, personal accomplishments.',
          '3. Include details: capabilities, values, and goals before marriage.',
        ],
      },
      {
        title: 'Divorce Story — During Marriage Prompts',
        content: [
          '1. Create a chronological timeline of events that led to the breakdown of the marriage.',
          '2. Identify key issues (infidelity, financial problems, irreconcilable differences).',
          '3. Write from your perspective — be honest and open about your feelings.',
          '4. Focus on facts, avoid assumptions about spouse\'s behavior.',
          '5. Discuss the impact on your life (emotional, financial, practical).',
          '6. Include any evidence (emails, text messages).',
          '7. Review and edit for clarity, accuracy, and coherence.',
        ],
      },
      {
        title: 'Divorce Story — Life Beyond Marriage Prompts',
        content: [
          '1. Share your vision: what you planned for and what it will now reflect.',
          '2. Create a timeline of events required to rebuild and re-establish yourself.',
          '3. Be honest about your financial situation.',
          '4. Discuss your goals for the divorce settlement (livelihood and lifestyle).',
          '5. Be prepared to negotiate: know your non-negotiables.',
        ],
      },
      {
        title: 'Executive Summary Part 1',
        content: [
          'Current Status: where you are in the process, what you want from this lawyer.',
          'Background: marital status, length of marriage, relevant facts.',
          'Key Issues: child custody, spousal support, property division, legal concerns.',
          'Goals & Objectives: fair property division, children\'s welfare, protecting legal rights. List your Top 3 Priorities and your former partner\'s top 3 as you understand them.',
        ],
      },
      {
        title: 'Executive Summary Part 2',
        content: [
          'Urgent Needs & Questions: How do I gain access to money? How do I protect my money? Rights/obligations for child and spousal support? Rights/risks of staying or leaving matrimonial home? How to proceed if children are not safe with former partner?',
          'Action Plan: Next steps if moving forward together with lawyer.',
          'Team: Brief description of each team member.',
          'Summary: 1–3 sentence summary of current situation.',
          'Cost + Payment Schedule: Request estimated cost and payment schedule/retainer fees.',
        ],
      },
    ],
    links: [
      { label: 'Legal Divorce Brief Template', url: 'https://www.lemonadelife.ca', type: 'template' },
    ],
    quote: '"You may not control all the events that happen to you, but you can decide not to be reduced by them." — Maya Angelou',
  },
  {
    id: 'step-6',
    phaseId: 'phase-2',
    number: 6,
    title: 'Establish Your Team of Experts',
    icon: '👥',
    summary:
      'Assembling a team of experts is crucial to achieving a successful divorce settlement. The right team provides guidance, support, and expertise.',
    tasks: [
      { id: 'step6-task1', text: 'Identify which experts you need on your team (review the list below)' },
      { id: 'step6-task2', text: 'Take the "Amicable or High Conflict?" quiz to determine your type of divorce' },
      { id: 'step6-task3', text: 'Research legal options: collaborative, mediation, litigation, notary, legal aid' },
      { id: 'step6-task4', text: 'Decide whether collaborative or mediation is right for your situation' },
      { id: 'step6-task5', text: 'Interview and hire your family lawyer' },
      { id: 'step6-task6', text: 'Engage financial advisor/planner' },
      { id: 'step6-task7', text: 'Consider engaging a mediator' },
      { id: 'step6-task8', text: 'Consider engaging an accountant' },
      { id: 'step6-task9', text: 'Find a therapist for emotional support' },
      { id: 'step6-task10', text: 'Consider a divorce coach for goals, vision, and co-parenting plan' },
      { id: 'step6-task11', text: 'Engage a real estate agent (if you own property)' },
      { id: 'step6-task12', text: 'Engage a child custody evaluator (if needed)' },
    ],
    infoSections: [
      {
        title: 'Expert Descriptions',
        content: [
          'Family Lawyer: Experience in divorce cases, knowledgeable about family law in your region.',
          'Financial Advisor/Planner: Understands financial implications of divorce settlement.',
          'Mediator: Neutral third party to help negotiate a fair settlement.',
          'Accountant: Understands tax implications of divorce settlement.',
          'Therapist: Helps family cope with emotional challenges.',
          'Divorce Coach: Helps establish goals, vision, values; creates intentional plan for co-parenting and new family dynamic.',
          'Real Estate Agent: Helps sell property or transfer ownership.',
          'Child Custody Evaluator: Helps determine best custody and visitation arrangements.',
        ],
      },
      {
        title: 'Types of Divorce',
        content: [
          'Simple Separation: Couple lives apart without officially ending marriage; may divide assets informally.',
          'Complex Separation: Legal battles over property, child custody, and other issues.',
          'Uncontested Divorce: No disputes over property or custody; straightforward legal process.',
          'Contested/Complex Divorce: Extensive legal proceedings and negotiations required.',
        ],
      },
      {
        title: 'Legal Options',
        content: [
          'Collaborative Divorce: Team of professionals (lawyers, financial experts, therapists/coaches) work together for mutually acceptable settlement; focused on cooperation.',
          'Mediation: Neutral third-party mediator facilitates discussion and helps reach resolution; parties maintain control; faster (1–2 sessions possible).',
          'Litigation: Court process where judge makes decisions; each party has their own lawyer; can be lengthy and costly.',
          'Notary: Notarizes important documents (affidavits, agreements); provides legal authenticity.',
          'Legal Aid: Government or non-profit assistance for low-income individuals.',
        ],
      },
    ],
    quiz: amicableOrHighConflictQuiz,
  },

  // ── Phase 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'step-7',
    phaseId: 'phase-3',
    number: 7,
    title: 'Manage Your Team and the Process',
    icon: '📊',
    summary:
      'You are the leader keeping this experience collaborative and accountable. Do not assume your lawyer is watching the plan, budget, or timeline.',
    tasks: [
      { id: 'step7-task1', text: 'Set clear goals and timelines for each stage of the divorce process' },
      { id: 'step7-task2', text: 'Identify and assign roles and responsibilities for each team member' },
      { id: 'step7-task3', text: 'Establish clear communication channels — set up regular meetings' },
      { id: 'step7-task4', text: 'Use project management tools to track progress (spreadsheets, Gantt charts)' },
      { id: 'step7-task5', text: 'Monitor and adjust the plan as needed to stay on track' },
      { id: 'step7-task6', text: 'Stay organized — keep all documents easily accessible' },
      { id: 'step7-task7', text: 'Create a detailed agenda before every meeting with your legal team' },
      { id: 'step7-task8', text: 'Review all legal invoices regularly — hold your lawyer accountable to budget' },
      { id: 'step7-task9', text: 'Stay focused on the end goal: fair and equitable settlement' },
      { id: 'step7-task10', text: 'Give your lawyer advance notice for upcoming work and last-minute requests (they are costly!)' },
      { id: 'step7-task11', text: 'Connect regularly for progress updates and open dialogue to avoid duplication of efforts' },
    ],
    infoSections: [
      {
        title: 'Managing Your Lawyer',
        content: [
          'Hourly Game: You are purchasing expertise by the hour. Avoid using your lawyer as a therapist or project manager — it\'s costly.',
          'Plan Ahead: Give ample notice for your lawyer\'s time and effort. Last-minute requests are expensive.',
          'Give Notice: Advance notice allows them to accommodate their schedule and assemble their team.',
          'Make it Personal: Connect regularly for progress updates, discuss goals and upcoming milestones.',
          'Lawyers Are Connected: Use your lawyer\'s trusted network (financial advisors, accountants, real estate).',
          'Sense of Urgency: Keep the momentum going so the lawyer doesn\'t need to review the file to get back up to speed. Time = Money.',
          'Create a Detailed Agenda: Know what you want to accomplish, questions for discussion, and a clear path to decisions.',
          'Review Fees: Properly analyze invoices regularly. Discuss improvements for cost and time savings.',
        ],
      },
    ],
  },
  {
    id: 'step-8',
    phaseId: 'phase-3',
    number: 8,
    title: 'Legal Preparation and Negotiation',
    icon: '⚖️',
    summary:
      'Negotiation is the process of reaching a mutually acceptable agreement. It requires a willingness to compromise, a clear understanding of your needs, and effective communication.',
    tasks: [
      { id: 'step8-task1', text: 'Research and understand your legal rights and options before negotiations' },
      { id: 'step8-task2', text: 'Identify the underlying interests of both parties (not just stated positions)' },
      { id: 'step8-task3', text: 'Take the "Are You a Capable Negotiator?" quiz (see below)' },
      { id: 'step8-task4', text: 'Practice keeping emotions in check during negotiations — stay calm and focused' },
      { id: 'step8-task5', text: 'Listen actively to the other party\'s concerns and needs' },
      { id: 'step8-task6', text: 'Use objective criteria (legal precedents, market values) to anchor proposals' },
      { id: 'step8-task7', text: 'If emotions are high: identify and acknowledge them, use "I" statements, take breaks' },
      { id: 'step8-task8', text: 'Seek professional help if needed (mediator, collaborative divorce attorney)' },
    ],
    infoSections: [
      {
        title: 'How to Negotiate',
        content: [
          'Prepare and Be Informed: Do your research and understand your legal rights and options.',
          'Focus on Interests, Not Positions: Find creative solutions that satisfy both parties\' needs.',
          'Keep Emotions in Check: Stay calm, rational, and focused.',
          'Listen Actively: Identify common ground.',
          'Use Objective Criteria: Anchor proposals in legal precedents or market values.',
          'Seek Professional Help: Work with mediator or collaborative attorney if needed.',
        ],
      },
      {
        title: 'How to Negotiate When Emotions Are High',
        content: [
          'Identify and Acknowledge Emotions: Understand each other\'s perspectives.',
          'Stay Calm and Composed: Deep breaths, focus on goals.',
          'Listen Actively: Find common ground.',
          'Use "I" Statements: Prevent defensiveness.',
          'Take Breaks: Rest, recharge, and reflect.',
          'Seek Professional Help: Mediator or professional support.',
        ],
      },
    ],
    quiz: capableNegotiatorQuiz,
    quote: '"This is your world. Shape it or someone else will." — Natalie Setareh',
  },

  // ── Phase 4 ──────────────────────────────────────────────────────────────────
  {
    id: 'step-9',
    phaseId: 'phase-4',
    number: 9,
    title: 'Wrap Up and Close Out',
    icon: '🎉',
    summary:
      'You have risen above countless challenges to divorce well! As everything comes to a close, honour your feelings and give yourself kudos for the work you\'ve done.',
    tasks: [
      { id: 'step9-task1', text: 'Finalize Divorce Settlement Agreement: notarized by both lawyers and parties. File this document — it is as important as a passport!' },
      { id: 'step9-task2', text: 'File the Divorce Decree with the court (legally dissolves the marriage)' },
      { id: 'step9-task3', text: 'Distribute assets as per the divorce agreement (property transfers, bank accounts, financial assets)' },
      { id: 'step9-task4', text: 'Implement child custody and support arrangements' },
      { id: 'step9-task5', text: 'Update driver\'s license — name and address' },
      { id: 'step9-task6', text: 'Update passport' },
      { id: 'step9-task7', text: 'Notify bank accounts of name and address change' },
      { id: 'step9-task8', text: 'Notify credit card companies of name and address change' },
      { id: 'step9-task9', text: 'Notify insurance companies (car, home, health, life) of name and address change' },
      { id: 'step9-task10', text: 'Notify employer of name and address change' },
      { id: 'step9-task11', text: 'Notify Social Security Administration / CRA of name and address change' },
      { id: 'step9-task12', text: 'Notify IRS / CRA of name and address change' },
      { id: 'step9-task13', text: 'Update voter registration with new name and address' },
      { id: 'step9-task14', text: 'Notify utility companies (gas, electric, water, phone) of name and address change' },
      { id: 'step9-task15', text: 'Fill out change of address form at the post office' },
      { id: 'step9-task16', text: 'Notify child\'s school or daycare of name and address change' },
      { id: 'step9-task17', text: 'Notify professional organizations of name and address change' },
      { id: 'step9-task18', text: 'Update will and all estate planning documents with new name and address' },
      { id: 'step9-task19', text: 'Implementation and Enforcement: Both parties abide by the agreement. If one party fails to comply, seek enforcement through the court.' },
      { id: 'step9-task20', text: 'Moving Forward: Start new relationships, find new living arrangements, build your new future' },
      { id: 'step9-task21', text: 'Self-Care and Recovery: Make time to recover, continue to heal, learn, grow, and show up for your family' },
      { id: 'step9-task22', text: 'Celebrate: Throw yourself a divorce party — you did it!' },
    ],
    links: [
      { label: 'Lemonade Life Website', url: 'https://www.lemonadelife.ca', type: 'website' },
      { label: '"Make Lemonade" Book', url: 'https://www.lemonadelife.ca', type: 'resource' },
    ],
  },
];

// ─── PHASES ───────────────────────────────────────────────────────────────────

export const divorcePhases: DivorcePhase[] = [
  {
    id: 'phase-1',
    number: 1,
    title: 'Uncoupling',
    icon: '🌱',
    color: '#E8956A',
    gradientColors: ['#E8956A', '#F5B591'],
    duration: 'Weeks 1–4',
    description:
      'Establish your independence, gather critical information, and create the foundation for a stable transition. Being proactive now gives you a massive advantage throughout the process.',
    stepIds: ['step-1', 'step-2', 'step-3', 'step-4'],
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Prepare for Legal',
    icon: '📝',
    color: '#7B4F8C',
    gradientColors: ['#7B4F8C', '#9D72B0'],
    duration: 'Weeks 5–8',
    description:
      'Organize your legal story, assemble your expert team, and understand the full scope of your options. Preparation at this stage can save you thousands in legal fees.',
    stepIds: ['step-5', 'step-6'],
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Negotiation',
    icon: '🤝',
    color: '#4A8FAA',
    gradientColors: ['#4A8FAA', '#6AAFC8'],
    duration: 'Months 2–5',
    description:
      'Lead the process with clear communication, strategic planning, and collaborative negotiation. You are the project manager of your own divorce.',
    stepIds: ['step-7', 'step-8'],
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'Finalization',
    icon: '✨',
    color: '#5A9B6E',
    gradientColors: ['#5A9B6E', '#7DC492'],
    duration: 'Month 5–6+',
    description:
      'Close this chapter with intention. Complete all legal and administrative tasks, honour the journey, and step fully into your new life.',
    stepIds: ['step-9'],
  },
];

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

export interface TimelineItem {
  id: string;
  duration: string;
  title: string;
  description: string;
  color: string;
}

export const divorceTimeline: TimelineItem[] = [
  {
    id: 'tl-1',
    duration: '1–2 MONTHS',
    title: 'Financial Disclosure',
    description:
      'Forms, Business Valuation, Property Assessments, Income Statement. Both parties share a full picture of their financial situation.',
    color: '#E8956A',
  },
  {
    id: 'tl-2',
    duration: '1 MONTH',
    title: 'Legal Back and Forth',
    description:
      'Communication with separate lawyers. Proposals, responses, and counter-proposals are exchanged between legal teams.',
    color: '#7B4F8C',
  },
  {
    id: 'tl-3',
    duration: '2–3 MONTHS',
    title: 'Mediation',
    description:
      'Negotiation with separate lawyers or a neutral mediator. A structured process to reach mutually acceptable agreements.',
    color: '#4A8FAA',
  },
  {
    id: 'tl-4',
    duration: '1 MONTH',
    title: 'Finalization / Wrap Up',
    description:
      'Signing the Separation Agreement, filing the Divorce Decree, distributing assets, and completing all administrative tasks.',
    color: '#5A9B6E',
  },
  {
    id: 'tl-5',
    duration: '6 MONTHS – 5 YEARS',
    title: 'Litigation / Court (if needed)',
    description:
      'If parties cannot reach agreement, the matter proceeds to court. A judge makes binding decisions on all outstanding issues.',
    color: '#A08AB0',
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getPhaseById(phaseId: string): DivorcePhase | undefined {
  return divorcePhases.find((p) => p.id === phaseId);
}

export function getStepById(stepId: string): DivorceStep | undefined {
  return divorceSteps.find((s) => s.id === stepId);
}

export function getStepsByPhase(phaseId: string): DivorceStep[] {
  return divorceSteps.filter((s) => s.phaseId === phaseId);
}

export function getAllTasks(): DivorceTask[] {
  return divorceSteps.flatMap((s) => s.tasks);
}

export function getTasksByStep(stepId: string): DivorceTask[] {
  const step = getStepById(stepId);
  return step ? step.tasks : [];
}
