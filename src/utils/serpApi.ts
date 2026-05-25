import AsyncStorage from '@react-native-async-storage/async-storage';

const SERP_API_KEY_STORAGE = 'seo_serpapi_key';

export async function loadSerpApiKey(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(SERP_API_KEY_STORAGE)) || '';
  } catch {
    return '';
  }
}

export async function saveSerpApiKey(key: string): Promise<void> {
  await AsyncStorage.setItem(SERP_API_KEY_STORAGE, key.trim());
}

function extractDomain(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .toLowerCase()
    .trim();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

export async function checkKeywordRank(
  keyword: string,
  websiteUrl: string,
  apiKey: string
): Promise<{ rank: number | null; error?: string }> {
  if (!apiKey) return { rank: null, error: 'No API key' };
  if (!websiteUrl) return { rank: null, error: 'No website URL' };

  const domain = extractDomain(websiteUrl);

  try {
    const endpoint = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(keyword)}&num=100&api_key=${encodeURIComponent(apiKey)}`;
    const response = await withTimeout(fetch(endpoint), 15000);

    if (response.status === 401) return { rank: null, error: 'Invalid API key' };
    if (!response.ok) return { rank: null, error: `API error ${response.status}` };

    const data = await response.json();
    if (data.error) return { rank: null, error: data.error };

    const results: { position: number; link?: string }[] = data.organic_results || [];
    for (const result of results) {
      const resultDomain = extractDomain(result.link || '');
      if (
        resultDomain === domain ||
        resultDomain.endsWith('.' + domain) ||
        domain.endsWith('.' + resultDomain)
      ) {
        return { rank: result.position };
      }
    }

    return { rank: null }; // site not in top 100
  } catch (e: any) {
    return { rank: null, error: e.message || 'Network error' };
  }
}

export async function checkAllKeywords(
  items: { id: string; keyword: string }[],
  websiteUrl: string,
  apiKey: string,
  onProgress: (done: number) => void
): Promise<{ id: string; rank: number | null; error?: string }[]> {
  const results: { id: string; rank: number | null; error?: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const { id, keyword } = items[i];
    const result = await checkKeywordRank(keyword, websiteUrl, apiKey);
    results.push({ id, ...result });
    onProgress(i + 1);
    if (i < items.length - 1) {
      await new Promise(r => setTimeout(r, 400)); // avoid rate-limiting
    }
  }

  return results;
}
