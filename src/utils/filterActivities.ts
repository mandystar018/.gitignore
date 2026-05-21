import { Activity, QuizAnswers } from '../types';

export function filterActivities(activities: Activity[], answers: QuizAnswers): Activity[] {
  return activities.filter((activity) => {
    // Age filter
    if (activity.ageRange !== answers.ageRange) return false;

    // Duration filter
    if (answers.duration < 999 && activity.duration > answers.duration) return false;

    // Location filter
    if (answers.location !== 'any') {
      if (
        answers.location !== 'both' &&
        activity.location !== answers.location &&
        activity.location !== 'both'
      ) {
        return false;
      }
    }

    // Materials filter
    if (answers.materials.length > 0) {
      const activityMaterialTypes = activity.materials.map((m) => m.type);
      const hasRequiredMaterials = answers.materials.some((mt) =>
        activityMaterialTypes.includes(mt)
      );
      if (!hasRequiredMaterials) return false;
    }

    // Category filter
    if (answers.categories.length > 0) {
      if (!answers.categories.includes(activity.category)) return false;
    }

    return true;
  });
}

export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
