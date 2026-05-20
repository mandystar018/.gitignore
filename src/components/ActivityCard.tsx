import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from '../types';
import {
  colors, spacing, radius, typography,
  categoryColors, categoryEmojis, categoryGradients, categoryLabels,
} from '../theme';

interface Props {
  activity: Activity;
  onPress: () => void;
}

const DIFFICULTY_DOTS: Record<string, number> = { easy: 1, medium: 2, challenging: 3 };
const MATERIAL_ICONS: Record<string, string> = { household: '🏡', natural: '🍃', store: '🛍️' };

export default function ActivityCard({ activity, onPress }: Props) {
  const catColor = categoryColors[activity.category];
  const catGradient = categoryGradients[activity.category];
  const materialTypes = [...new Set(activity.materials.map((m) => m.type))];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Gradient header strip */}
      <LinearGradient
        colors={catGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientStrip}
      >
        <Text style={styles.stripEmoji}>{categoryEmojis[activity.category]}</Text>
        <View style={styles.stripRight}>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱ {activity.duration} min</Text>
          </View>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>
              {activity.location === 'indoor' ? '🏠' : activity.location === 'outdoor' ? '🌳' : '✨'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Card body */}
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.categoryChip, { backgroundColor: catColor + '18' }]}>
            <Text style={[styles.categoryLabel, { color: catColor }]}>
              {categoryLabels[activity.category]}
            </Text>
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

        <Text style={styles.title} numberOfLines={2}>{activity.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{activity.description}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.metaGroup}>
            {materialTypes.map((type) => (
              <Text key={type} style={styles.metaIcon}>{MATERIAL_ICONS[type]}</Text>
            ))}
          </View>
          <Text style={[styles.tapHint, { color: catColor }]}>View activity →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gradientStrip: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  stripEmoji: { fontSize: 32 },
  stripRight: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  durationBadge: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  durationText: { fontSize: 12, fontWeight: '700', color: colors.white },
  locationBadge: {
    backgroundColor: 'rgba(255,255,255,0.30)',
    borderRadius: radius.full,
    width: 30, height: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  locationText: { fontSize: 14 },
  body: { padding: spacing.md, gap: spacing.xs + 2 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  categoryLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  difficultyRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  difficultyDot: { width: 7, height: 7, borderRadius: 3.5 },
  title: { ...typography.h4, fontSize: 16, lineHeight: 21 },
  description: { ...typography.bodySmall, lineHeight: 18 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  metaGroup: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  metaIcon: { fontSize: 14 },
  tapHint: { fontSize: 12, fontWeight: '700' },
});
