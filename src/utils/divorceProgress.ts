import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'divorce_task_progress';

export async function loadProgress(): Promise<Record<string, boolean>> {
  try {
    const raw = await AsyncStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export async function saveProgress(progress: Record<string, boolean>): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // silently fail — progress simply won't persist
  }
}

export function toggleTask(
  taskId: string,
  current: boolean,
  progress: Record<string, boolean>,
): Record<string, boolean> {
  return { ...progress, [taskId]: !current };
}
