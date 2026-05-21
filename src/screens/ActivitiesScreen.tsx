import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, Activity, ActivityCategory, QuizAnswers } from '../types';
import { colors, spacing, radius, typography, categoryColors, categoryEmojis, categoryLabels } from '../theme';
import { filterActivities, shuffleArray } from '../utils/filterActivities';
import { getAllActivities } from '../data';
import ActivityCard from '../components/ActivityCard';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Activities'>;
  route: RouteProp<RootStackParamList, 'Activities'>;
};

const SORT_OPTIONS = ['Recommended', 'Shortest first', 'Longest first', 'A–Z'];

export default function ActivitiesScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { answers } = route.params;
  const [activeSort, setActiveSort] = useState('Recommended');
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | 'all'>('all');

  const allActivities = getAllActivities();

  const filtered = useMemo(() => {
    let results = filterActivities(allActivities, answers);

    if (activeCategory !== 'all') {
      results = results.filter((a) => a.category === activeCategory);
    }

    if (activeSort === 'Recommended') return shuffleArray(results);
    if (activeSort === 'Shortest first') return [...results].sort((a, b) => a.duration - b.duration);
    if (activeSort === 'Longest first') return [...results].sort((a, b) => b.duration - a.duration);
    if (activeSort === 'A–Z') return [...results].sort((a, b) => a.title.localeCompare(b.title));
    return results;
  }, [answers, activeSort, activeCategory]);

  const presentCategories = useMemo(() => {
    const filtered2 = filterActivities(allActivities, answers);
    const cats = new Set(filtered2.map((a) => a.category));
    return Array.from(cats) as ActivityCategory[];
  }, [answers]);

  const renderItem = useCallback(
    ({ item }: { item: Activity }) => (
      <ActivityCard
        activity={item}
        onPress={() => navigation.navigate('ActivityDetail', { activity: item })}
      />
    ),
    [navigation]
  );

  const keyExtractor = useCallback((item: Activity) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Quiz')}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {filtered.length} {filtered.length === 1 ? 'Activity' : 'Activities'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {answers.duration < 999 ? `≤ ${answers.duration} min` : 'Any duration'}
            {' · '}
            {answers.location === 'any' ? 'Any location' : answers.location}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Welcome')}
          style={styles.homeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.homeText}>🌱</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[styles.sortChip, activeSort === sort && styles.sortChipActive]}
              onPress={() => setActiveSort(sort)}
            >
              <Text style={[styles.sortChipText, activeSort === sort && styles.sortChipTextActive]}>
                {sort}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {presentCategories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
            <TouchableOpacity
              style={[
                styles.catChip,
                activeCategory === 'all' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveCategory('all')}
            >
              <Text style={[styles.catChipText, activeCategory === 'all' && { color: colors.white }]}>
                All
              </Text>
            </TouchableOpacity>
            {presentCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  activeCategory === cat && { backgroundColor: categoryColors[cat] },
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={styles.catChipEmoji}>{categoryEmojis[cat]}</Text>
                <Text
                  style={[
                    styles.catChipText,
                    activeCategory === cat && { color: colors.white, fontWeight: '700' },
                  ]}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🌿</Text>
          <Text style={styles.emptyTitle}>No matches found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filters or tap the back button to try different answers.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.emptyButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  headerSubtitle: {
    ...typography.label,
    textTransform: 'capitalize',
  },
  homeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeText: {
    fontSize: 24,
  },
  filtersSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  sortRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: 4,
  },
  sortChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sortChipText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  categoryRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingTop: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  catChipEmoji: {
    fontSize: 13,
  },
  catChipText: {
    fontSize: 13,
    color: colors.textMedium,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
