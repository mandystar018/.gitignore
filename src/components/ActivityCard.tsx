import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Activity } from '../types';
import { colors, spacing, radius, typography, categoryColors, categoryEmojis, categoryLabels } from '../theme';

interface Props {
  activity: Activity;
  onPress: () => void;
}

const DIFFICULTY_DOTS: Record<string, number> = { easy: 1, medium: 2, challenging: 3 };
const MATERIAL_ICONS: Record<string, string> = { household: '🏡', natural: '🍃', store: '🛍️' };

export default function ActivityCard({ activity, onPress }: Props) {
  const catColor = categoryColors[activity.category];
  const materialTypes = [...new Set(activity.materials.map((m) => m.type))];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.colorBar, { backgroundColor: catColor }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.categoryChip, { backgroundColor: catColor + '18' }]}>
            <Text style={styles.categoryEmoji}>{categoryEmojis[activity.category]}</Text>
            <Text style={[styles.categoryLabel, { color: catColor }]}>
              {categoryLabels[activity.category]}
            </Text>
          </View>
          <View style={styles.durationChip}>
            <Text style={styles.durationText}>⏱ {activity.duration} min</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>

        <Text style={styles.description} numberOfLines={2}>
          {activity.description}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaGroup}>
            <Text style={styles.metaIcon}>
              {activity.location === 'indoor' ? '🏠' : activity.location === 'outdoor' ? '🌳' : '✨'}
            </Text>
            {materialTypes.map((type) => (
              <Text key={type} style={styles.metaIcon}>
                {MATERIAL_ICONS[type]}
              </Text>
            ))}
          </View>

          <View style={styles.difficultyRow}>
            {[1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.difficultyDot,
                  dot <= DIFFICULTY_DOTS[activity.difficulty]
                    ? { backgroundColor: catColor }
                    : { backgroundColor: colors.border },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.arrowWrap}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  colorBar: {
    width: 5,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 3,
  },
  categoryEmoji: {
    fontSize: 11,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  durationChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    fontSize: 16,
    lineHeight: 21,
  },
  description: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaGroup: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  difficultyDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  arrowWrap: {
    justifyContent: 'center',
    paddingRight: spacing.md,
  },
  arrow: {
    fontSize: 22,
    color: colors.border,
    fontWeight: '300',
  },
});
