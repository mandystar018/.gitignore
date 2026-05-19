import { Activity } from '../types';
import { sampleActivities } from './sampleActivities';

// Agent-generated partial batch (practical-life PL001-PL050)
let part1Activities: Activity[] = [];
try {
  const mod = require('../activities_part1');
  part1Activities = (mod.part1 ?? []) as Activity[];
} catch {
  // not yet present
}

// Batch 1 (practical-life, sensorial, language, mathematics) — generated activities
let batch1Activities: Activity[] = [];
try {
  const mod = require('./activitiesBatch1');
  batch1Activities = mod.activitiesBatch1 ?? [];
} catch {
  // batch not yet generated
}

// Batch 2 (art, science, music-movement, outdoor) — generated activities
let batch2Activities: Activity[] = [];
try {
  const mod = require('./activitiesBatch2');
  batch2Activities = mod.activitiesBatch2 ?? [];
} catch {
  // batch not yet generated
}

let _cachedActivities: Activity[] | null = null;

export function getAllActivities(): Activity[] {
  if (_cachedActivities) return _cachedActivities;

  const all = [...sampleActivities, ...part1Activities, ...batch1Activities, ...batch2Activities];

  // Deduplicate by id
  const seen = new Set<string>();
  _cachedActivities = all.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return _cachedActivities;
}
