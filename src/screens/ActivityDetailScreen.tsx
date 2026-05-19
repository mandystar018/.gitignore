import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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

export default function ActivityDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { activity } = route.params;
  const catColor = categoryColors[activity.category];
  const diff = DIFFICULTY_CONFIG[activity.difficulty];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {activity.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
      >
        <View style={[styles.heroCard, { borderTopColor: catColor }]}>
          <View style={styles.heroEmojiWrap}>
            <Text style={styles.heroEmoji}>{categoryEmojis[activity.category]}</Text>
          </View>
          <Text style={styles.heroTitle}>{activity.title}</Text>
          <Text style={styles.heroDescription}>{activity.description}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaBadge, { backgroundColor: catColor + '18', borderColor: catColor + '40' }]}>
              <Text style={[styles.metaBadgeText, { color: catColor }]}>
                {categoryEmojis[activity.category]} {categoryLabels[activity.category]}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>⏱ {activity.duration} min</Text>
            </View>
            <View style={[styles.metaBadge, { backgroundColor: diff.color + '18', borderColor: diff.color + '40' }]}>
              <Text style={[styles.metaBadgeText, { color: diff.color }]}>
                {diff.emoji} {diff.label}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaBadgeText}>
                {activity.location === 'indoor' ? '🏠 Indoor' : activity.location === 'outdoor' ? '🌳 Outdoor' : '✨ Either'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌱 Montessori Principle</Text>
          </View>
          <View style={styles.principleBox}>
            <Text style={styles.principleText}>{activity.montessoriPrinciple}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🧺 What You'll Need</Text>
          </View>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>✨ Skills Developed</Text>
          </View>
          <View style={styles.skillsWrap}>
            {activity.skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, { backgroundColor: catColor + '15' }]}>
                <Text style={[styles.skillText, { color: catColor }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.imageSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🖼️ Activity Preview</Text>
          </View>
          <View style={[styles.imagePlaceholder, { borderColor: catColor + '40' }]}>
            <Text style={styles.imagePlaceholderEmoji}>{categoryEmojis[activity.category]}</Text>
            <Text style={styles.imagePlaceholderTitle}>{activity.title}</Text>
            <Text style={styles.imagePlaceholderHint}>AI image generation coming soon</Text>
            <View style={styles.imagePromptBox}>
              <Text style={styles.imagePromptLabel}>Image prompt:</Text>
              <Text style={styles.imagePromptText}>{activity.imagePrompt}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.tryButton, { backgroundColor: catColor }]}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.tryButtonText}>← Back to Activities</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getMaterialColor(type: string): string {
  if (type === 'household') return '#C4714A';
  if (type === 'natural') return '#7D9B76';
  return '#4A8FAA';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    fontSize: 18,
    color: colors.textDark,
  },
  headerTitle: {
    flex: 1,
    ...typography.h4,
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderTopWidth: 4,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  heroEmojiWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroEmoji: {
    fontSize: 36,
  },
  heroTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  metaBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMedium,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...typography.h4,
    fontSize: 16,
  },
  sectionCount: {
    ...typography.label,
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
  imageSection: {},
  imagePlaceholder: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  imagePlaceholderEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  imagePlaceholderTitle: {
    ...typography.h4,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  imagePlaceholderHint: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  imagePromptBox: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.md,
    width: '100%',
  },
  imagePromptLabel: {
    ...typography.label,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  imagePromptText: {
    fontSize: 12,
    color: colors.textMedium,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tryButton: {
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
