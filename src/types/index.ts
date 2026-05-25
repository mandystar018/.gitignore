export type ActivityCategory =
  | 'practical-life'
  | 'sensorial'
  | 'language'
  | 'mathematics'
  | 'art'
  | 'science'
  | 'music-movement'
  | 'outdoor';

export type AgeRange =
  | '0-6 months'
  | '6-12 months'
  | '12-18 months'
  | '18-24 months'
  | '2-3 years'
  | '3-6 years';

export type MaterialType = 'household' | 'natural' | 'store';
export type LocationType = 'indoor' | 'outdoor' | 'both';
export type DifficultyType = 'easy' | 'medium' | 'challenging';

export interface Material {
  name: string;
  type: MaterialType;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  ageRange: AgeRange;
  duration: number;
  location: LocationType;
  materials: Material[];
  steps: string[];
  skills: string[];
  montessoriPrinciple: string;
  difficulty: DifficultyType;
  imagePrompt: string;
}

export interface QuizAnswers {
  ageRange: AgeRange;
  duration: number;
  location: LocationType | 'any';
  materials: MaterialType[];
  categories: ActivityCategory[];
}

// SEO Edge types
export type KeywordStatus = 'ranking' | 'improving' | 'needs-work' | 'tracking';

export type KeywordCategory =
  | 'portrait'
  | 'wedding'
  | 'family'
  | 'newborn'
  | 'event'
  | 'general'
  | 'editing'
  | 'business'
  | 'custom';

export interface RankEntry {
  date: string;
  rank: number;
}

export interface TrackedKeyword {
  id: string;
  keyword: string;
  category: KeywordCategory;
  status: KeywordStatus;
  currentRank?: number;
  rankHistory: RankEntry[];
  notes: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface ContentAnalysisResult {
  score: number;
  wordCount: number;
  keywordsFound: { keyword: string; count: number; density: number }[];
  recommendations: string[];
  topKeyword: string | null;
}

export type RootStackParamList = {
  Welcome: undefined;
  Quiz: undefined;
  Activities: { answers: QuizAnswers };
  ActivityDetail: { activity: Activity };
  SEOHome: undefined;
  KeywordTracker: undefined;
  ContentAnalysis: undefined;
};
