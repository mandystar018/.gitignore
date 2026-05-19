import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity } from '../types';
import { colors, spacing, radius, typography, categoryColors, categoryEmojis, categoryGradients, categoryLabels } from '../theme';

interface Props {
  activity: Activity;
  onPress: () => void;
}

const DIFFICULTY_DOTS: Record<string, number> = { easy: 1, medium: 2, challenging: 3 };
const MATERIAL_ICONS: Record<string, string> = { household: '🏡', natural: '🍃', store: '🛍️' };

function getActivityPhotoUrl(id: string): string {
  return `https://picsum.photos/seed/${id}/400/200`;
}

export default function ActivityCard({ activity, onPress }: Props) {
  const catColor = categoryColors[activity.category];
  const catGradient = categoryGradients[activity.category];
  const materialTypes = [...new Set(activity.materials.map((m) => m.type))];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {/* Image header with gradient overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getActivityPhotoUrl(activity.id) }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[catGradient[0] + 'CC', catGradient[1] + '99']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.imageOverlay}
        >
          <Text style={styles.imageEmoji}>{categoryEmojis[activity.category]}</Text>
          <View style={styles.imageDuration}>
            <Text style={styles.imageDurationText}>⏱ {activity.duration} min</Text>
          </View>
        </LinearGradient>
      </View>

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
            <Text style={styles.metaIcon}>
              {activity.location === 'indoor' ? '🏠' : activity.location === 'outdoor' ? '🌳' : '✨'}
            </Text>
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
  imageContainer: {
    height: 110,
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  imageEmoji: {
    fontSize: 36,
  },
  imageDuration: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  imageDurationText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  body: {
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
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
  categoryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
  tapHint: {
    fontSize: 12,
    fontWeight: '700',
  },
});
