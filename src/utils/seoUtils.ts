import AsyncStorage from '@react-native-async-storage/async-storage';
import { TrackedKeyword, KeywordStatus, KeywordCategory, ContentAnalysisResult, RankEntry } from '../types';

const KEYWORDS_KEY = 'seo_tracked_keywords';
const WEBSITE_URL_KEY = 'seo_website_url';

export async function loadKeywords(): Promise<TrackedKeyword[]> {
  try {
    const data = await AsyncStorage.getItem(KEYWORDS_KEY);
    const keywords: TrackedKeyword[] = data ? JSON.parse(data) : [];
    // Migrate old entries that lack rankHistory
    return keywords.map(k => ({ rankHistory: [], ...k }));
  } catch {
    return [];
  }
}

export async function saveKeywords(keywords: TrackedKeyword[]): Promise<void> {
  await AsyncStorage.setItem(KEYWORDS_KEY, JSON.stringify(keywords));
}

export async function loadWebsiteUrl(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(WEBSITE_URL_KEY)) || '';
  } catch {
    return '';
  }
}

export async function saveWebsiteUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(WEBSITE_URL_KEY, url);
}

export async function addKeyword(
  keyword: string,
  category: KeywordCategory = 'custom',
  status: KeywordStatus = 'tracking',
  notes: string = '',
  currentRank?: number
): Promise<TrackedKeyword> {
  const keywords = await loadKeywords();
  const rankHistory: RankEntry[] = currentRank
    ? [{ date: new Date().toISOString(), rank: currentRank }]
    : [];
  const newKeyword: TrackedKeyword = {
    id: Date.now().toString(),
    keyword,
    category,
    status,
    currentRank,
    rankHistory,
    notes,
    dateAdded: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  await saveKeywords([...keywords, newKeyword]);
  return newKeyword;
}

export async function updateKeywordRank(
  id: string,
  rank: number,
  source: 'manual' | 'auto' = 'manual'
): Promise<void> {
  const keywords = await loadKeywords();
  const now = new Date().toISOString();
  const updated = keywords.map(k => {
    if (k.id !== id) return k;
    const newEntry: RankEntry = { date: now, rank };
    const history = [...(k.rankHistory || []), newEntry].slice(-30);
    let status: KeywordStatus = k.status;
    if (rank <= 10) status = 'ranking';
    else if (rank <= 20) status = 'improving';
    else status = 'needs-work';
    return {
      ...k,
      currentRank: rank,
      rankHistory: history,
      status,
      lastChecked: now,
      lastCheckError: undefined,
      lastUpdated: now,
    };
  });
  await saveKeywords(updated);
}

export async function markKeywordChecked(
  id: string,
  error: string
): Promise<void> {
  const keywords = await loadKeywords();
  const now = new Date().toISOString();
  const updated = keywords.map(k =>
    k.id === id ? { ...k, lastChecked: now, lastCheckError: error } : k
  );
  await saveKeywords(updated);
}

export function formatLastChecked(iso?: string): string {
  if (!iso) return 'Never checked';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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

export function getRankTrend(rankHistory: RankEntry[]): 'up' | 'down' | 'same' | 'new' {
  if (rankHistory.length < 2) return 'new';
  const prev = rankHistory[rankHistory.length - 2].rank;
  const curr = rankHistory[rankHistory.length - 1].rank;
  if (curr < prev) return 'up';   // lower rank number = better position
  if (curr > prev) return 'down';
  return 'same';
}

export function getRankChange(rankHistory: RankEntry[]): number {
  if (rankHistory.length < 2) return 0;
  const prev = rankHistory[rankHistory.length - 2].rank;
  const curr = rankHistory[rankHistory.length - 1].rank;
  return prev - curr; // positive = moved up (improved)
}

export function buildGoogleSearchUrl(keyword: string, websiteUrl: string): string {
  const site = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const query = site ? `${keyword} site:${site}` : keyword;
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
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
  if (wordCount >= 1500) score += 20;
  else if (wordCount >= 800) score += 15;
  else if (wordCount >= 400) score += 10;
  else if (wordCount >= 200) score += 5;

  score += Math.min(keywordsFound.length * 8, 40);

  const goodDensity = keywordsFound.filter(k => k.density >= 0.5 && k.density <= 3).length;
  score += Math.min(goodDensity * 5, 20);

  if (keywordsFound.length >= 5) score += 20;
  else if (keywordsFound.length >= 3) score += 12;
  else if (keywordsFound.length >= 1) score += 6;

  const recommendations: string[] = [];
  if (wordCount < 400) recommendations.push('Write more — aim for at least 400 words for better SEO.');
  else if (wordCount < 800) recommendations.push('Consider expanding to 800+ words for stronger rankings.');
  if (keywordsFound.length === 0) recommendations.push('None of your tracked keywords appear — add them naturally to your content.');
  else if (keywordsFound.length < 3) recommendations.push('Try to include at least 3 of your target keywords.');
  const overDense = keywordsFound.filter(k => k.density > 3);
  if (overDense.length > 0) recommendations.push(`"${overDense[0].keyword}" appears too often — reduce to avoid keyword stuffing.`);
  if (recommendations.length === 0) recommendations.push('Great SEO! Keep creating content with your target keywords.');

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
