import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import {
  colors,
  spacing,
  radius,
  typography,
  categoryColors,
  categoryEmojis,
  categoryGradients,
  categoryLabels,
} from '../theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ActivityDetail'>;
  route: RouteProp<RootStackParamList, 'ActivityDetail'>;
};

const MATERIAL_ICONS: Record<string, string> = {
  household: '🏡',
  natural: '🍃',
  store: '🛍️',
};

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  easy: { color: '#5B8A5B', label: 'Easy', emoji: '🌱' },
  medium: { color: '#E8B84B', label: 'Medium', emoji: '🌻' },
  challenging: { color: '#C4714A', label: 'Challenging', emoji: '🌳' },
};

function getMaterialColor(type: string): string {
  if (type === 'household') return '#C4714A';
  if (type === 'natural') return '#7D9B76';
  return '#4A8FAA';
}

// Returns a free, seed-based photo URL so every activity gets a consistent real photo
function getActivityPhotoUrl(id: string, width = 800, height = 400): string {
  return `https://picsum.photos/seed/${id}/${width}/${height}`;
}

export default function ActivityDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { activity } = route.params;
  const catColor = categoryColors[activity.category];
  const catGradient = categoryGradients[activity.category];
  const diff = DIFFICULTY_CONFIG[activity.difficulty];

  return (
    <View style={[styles.container]}>
      {/* Gradient hero header — full bleed, overlaps status bar */}
      <LinearGradient
        colors={catGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        {/* Back button overlaid on gradient */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.heroBackBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.heroBackText}>←</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.heroEmojiCircle}>
            <Text style={styles.heroEmoji}>{categoryEmojis[activity.category]}</Text>
          </View>
          <Text style={styles.heroCategory}>{categoryLabels[activity.category].toUpperCase()}</Text>
          <Text style={styles.heroTitle}>{activity.title}</Text>

          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⏱ {activity.duration} min</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: diff.color + '50' }]}>
              <Text style={styles.heroBadgeText}>{diff.emoji} {diff.label}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {activity.location === 'indoor' ? '🏠 Indoor' : activity.location === 'outdoor' ? '🌳 Outdoor' : '✨ Either'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {/* Result photo — real image showing what finished activity looks like */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 What It Looks Like</Text>
          <View style={styles.photoCard}>
            <Image
              source={{ uri: getActivityPhotoUrl(activity.id) }}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={[styles.photoOverlay, { backgroundColor: catColor + '22' }]}>
              <View style={styles.photoLabel}>
                <Text style={styles.photoLabelText}>{activity.title}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{activity.description}</Text>
        </View>

        {/* Montessori Principle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 Montessori Principle</Text>
          <View style={styles.principleBox}>
            <Text style={styles.principleText}>{activity.montessoriPrinciple}</Text>
          </View>
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧺 What You'll Need</Text>
          {activity.materials.map((material, index) => (
            <View key={index} style={styles.materialRow}>
              <View style={styles.materialIcon}>
                <Text style={styles.materialIconText}>{MATERIAL_ICONS[material.type]}</Text>
              </View>
              <Text style={styles.materialName}>{material.name}</Text>
              <View style={[styles.materialTypeBadge, { backgroundColor: getMaterialColor(material.type) + '20' }]}>
                <Text style={[styles.materialTypeText, { color: getMaterialColor(material.type) }]}>
                  {material.type}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📋 How To Do It</Text>
            <Text style={styles.sectionCount}>{activity.steps.length} steps</Text>
          </View>
          {activity.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: catColor }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Skills Developed</Text>
          <View style={styles.skillsWrap}>
            {activity.skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, { backgroundColor: catColor + '15' }]}>
                <Text style={[styles.skillText, { color: catColor }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: catColor }]}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Activities</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  heroBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroBackText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  heroBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    fontSize: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCount: {
    ...typography.label,
  },
  photoCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    height: 200,
    backgroundColor: colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    justifyContent: 'flex-end',
  },
  photoLabel: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  photoLabelText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descriptionText: {
    ...typography.body,
    lineHeight: 22,
  },
  principleBox: {
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  principleText: {
    ...typography.body,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  materialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialIconText: {
    fontSize: 18,
  },
  materialName: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '500',
  },
  materialTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  materialTypeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumberText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepText: {
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
