import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackedKeyword, KeywordStatus, KeywordCategory, ContentAnalysisResult } from '../types';

const KEYWORDS_KEY = 'seo_tracked_keywords';

export async function loadKeywords(): Promise<TrackedKeyword[]> {
  try {
    const data = await AsyncStorage.getItem(KEYWORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveKeywords(keywords: TrackedKeyword[]): Promise<void> {
  await AsyncStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords));
}

export async function addKeyword(
  keyword: string,
  category: KeywordCategory,
  status: KeywordStatus = 'tracking',
  notes: string = ''
): Promise<TrackedKeyword> {
  const keywords = await loadKeywords();
  const newKeyword: TrackedKeyword = {
    id: Date.now().toString(),
    keyword,
    category,
    status,
    notes,
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  await saveKeywords([...keywords, newKeyword]);
  return newKeyword;
}

export async function updateKeyword(id: string, updates: Partial<TrackedKeyword>): Promise<void> {
  const keywords = await loadKeywords();
  const updated = keywords.map(k =>
    k.id === id ? { ...k, ...updates, lastUpdated: new Date().toISOString() } : k
  );
  await saveKeywords(updated);
}

export async function deleteKeyword(id: string): Promise<void> {
  const keywords = await loadKeywords();
  await saveKeywords(keywords.filter(k => k.id !== id));
}

export function analyzeContent(
  text: string,
  trackedKeywords: TrackedKeyword[]
): ContentAnalysisResult {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  const keywordsFound = trackedKeywords
    .map(tk => {
      const kw = tk.keyword.toLowerCase();
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.toLowerCase().match(new RegExp(escaped, 'g')) || [];
      const count = matches.length;
      const kwWordCount = kw.split(' ').length;
      const density = wordCount > 0 ? (count * kwWordCount / wordCount) * 100 : 0;
      return { keyword: tk.keyword, count, density };
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count);

  let score = 0;

  // Word count score (max 20 pts)
  if (wordCount >= 1500) score += 20;
  else if (wordCount >= 800) score += 15;
  else if (wordCount >= 400) score += 10;
  else if (wordCount >= 200) score += 5;

  // Keywords found (max 40 pts)
  score += Math.min(keywordsFound.length * 8, 40);

  // Good keyword density 0.5–3% (max 20 pts)
  const goodDensity = keywordsFound.filter(k => k.density >= 0.5 && k.density <= 3).length;
  score += Math.min(goodDensity * 5, 20);

  // Variety bonus (max 20 pts)
  if (keywordsFound.length >= 5) score += 20;
  else if (keywordsFound.length >= 3) score += 12;
  else if (keywordsFound.length >= 1) score += 6;

  const recommendations: string[] = [];
  if (wordCount < 400) {
    recommendations.push('Write more — aim for at least 400 words for better SEO.');
  } else if (wordCount < 800) {
    recommendations.push('Consider expanding to 800+ words for stronger rankings.');
  }
  if (keywordsFound.length === 0) {
    recommendations.push('None of your tracked keywords appear — add them naturally to your content.');
  } else if (keywordsFound.length < 3) {
    recommendations.push('Try to include at least 3 of your target keywords.');
  }
  const overDense = keywordsFound.filter(k => k.density > 3);
  if (overDense.length > 0) {
    recommendations.push(`"${overDense[0].keyword}" appears too often — reduce to avoid keyword stuffing.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Great SEO! Keep creating content with your target keywords.');
  }

  return {
    score: Math.min(score, 100),
    wordCount,
    keywordsFound,
    recommendations,
    topKeyword: keywordsFound[0]?.keyword || null,
  };
}

export function getStatusColor(status: KeywordStatus): string {
  switch (status) {
    case 'ranking': return '#5B8A5B';
    case 'improving': return '#E8B84B';
    case 'needs-work': return '#D44533';
    case 'tracking': return '#4A8FAA';
  }
}

export function getStatusLabel(status: KeywordStatus): string {
  switch (status) {
    case 'ranking': return 'Ranking';
    case 'improving': return 'Improving';
    case 'needs-work': return 'Needs Work';
    case 'tracking': return 'Tracking';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#5B8A5B';
  if (score >= 50) return '#E8B84B';
  return '#D44533';
}

export function getScoreLabel(score: number): string {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Fair';
  return 'Needs Work';
}
