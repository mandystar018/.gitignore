import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const PHOTOS_DIR = FileSystem.documentDirectory + 'activity_photos/';

async function ensureDir(activityId: string): Promise<string> {
  const dir = PHOTOS_DIR + activityId + '/';
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function getPhotos(activityId: string): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(`hearty:photos:${activityId}`);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function savePhoto(activityId: string, sourceUri: string): Promise<string> {
  const dir = await ensureDir(activityId);
  const dest = dir + Date.now() + '.jpg';
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  const existing = await getPhotos(activityId);
  await AsyncStorage.setItem(
    `hearty:photos:${activityId}`,
    JSON.stringify([...existing, dest])
  );
  return dest;
}

export async function deletePhoto(activityId: string, uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
  const existing = await getPhotos(activityId);
  await AsyncStorage.setItem(
    `hearty:photos:${activityId}`,
    JSON.stringify(existing.filter((u) => u !== uri))
  );
}
