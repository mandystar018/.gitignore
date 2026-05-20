import { Activity } from '../types';
import { sampleActivities } from './sampleActivities';
import { babyActivities } from './babyActivities';
import { moreBabyActivities } from './moreBabyActivities';

// Generated batch: practical-life PL051–PL100
let part2Activities: Activity[] = [];
try {
  const mod = require('../activities_part2');
  part2Activities = (mod.part2 ?? []) as Activity[];
} catch {
  // not yet present
}

// Generated batch: practical-life PL101–PL150
let part3Activities: Activity[] = [];
try {
  const mod = require('../activities_part3');
  part3Activities = (mod.part3 ?? []) as Activity[];
} catch {
  // not yet present
}

// Future batch 1 placeholder (sensorial, language, mathematics)
let batch1Activities: Activity[] = [];
try {
  const mod = require('./activitiesBatch1');
  batch1Activities = (mod.activitiesBatch1 ?? []) as Activity[];
} catch {
  // not yet generated
}

// Future batch 2 placeholder (art, science, music-movement, outdoor)
let batch2Activities: Activity[] = [];
try {
  const mod = require('./activitiesBatch2');
  batch2Activities = (mod.activitiesBatch2 ?? []) as Activity[];
} catch {
  // not yet generated
}

let _cachedActivities: Activity[] | null = null;

export function getAllActivities(): Activity[] {
  if (_cachedActivities) return _cachedActivities;

  const all = [
    ...sampleActivities,
    ...babyActivities,
    ...moreBabyActivities,
    ...part2Activities,
    ...part3Activities,
    ...batch1Activities,
    ...batch2Activities,
  ];

  // Deduplicate by id
  const seen = new Set<string>();
  _cachedActivities = all.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  return _cachedActivities;
}
