export type ActivityCategory =
  | 'practical-life'
  | 'sensorial'
  | 'language'
  | 'mathematics'
  | 'art'
  | 'science'
  | 'music-movement'
  | 'outdoor';

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
  duration: number;
  location: LocationType | 'any';
  materials: MaterialType[];
  categories: ActivityCategory[];
}

export type RootStackParamList = {
  Welcome: undefined;
  Quiz: undefined;
  Activities: { answers: QuizAnswers };
  ActivityDetail: { activity: Activity };
};
