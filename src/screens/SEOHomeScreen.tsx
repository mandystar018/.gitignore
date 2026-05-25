import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TrackedKeyword, KeywordStatus } from '../types';
import { loadKeywords, getStatusColor } from '../utils/seoUtils';
import { colors, spacing, radius, typography } from '../theme';

type Nav = StackNavigationProp<RootStackParamList, 'SEOHome'>;

const STATUS_ORDER: KeywordStatus[] = ['ranking', 'improving', 'needs-work', 'tracking'];

export default function SEOHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
    }, [])
  );

  const rankingCount = keywords.filter(k => k.status === 'ranking').length;
  const needsWorkCount = keywords.filter(k => k.status === 'needs-work').length;
  const improvingCount = keywords.filter(k => k.status === 'improving').length;

  const recent = [...keywords]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>SEO Edge</Text>
            <Text style={styles.subtitle}>Photography Keyword Manager</Text>
          </View>
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{keywords.length}</Text>
            <Text style={styles.statLabel}>Keywords</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: '#5B8A5B' }]}>
            <Text style={[styles.statNumber, { color: '#5B8A5B' }]}>{rankingCount}</Text>
            <Text style={styles.statLabel}>Ranking</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: '#E8B84B' }]}>
            <Text style={[styles.statNumber, { color: '#E8B84B' }]}>{improvingCount}</Text>
            <Text style={styles.statLabel}>Improving</Text>
          </View>
          <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: '#D44533' }]}>
            <Text style={[styles.statNumber, { color: '#D44533' }]}>{needsWorkCount}</Text>
            <Text style={styles.statLabel}>Needs Work</Text>
          </View>
        </View>

        {/* Action Cards */}
        <Text style={styles.sectionTitle}>Tools</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.primaryLight }]}
            onPress={() => navigation.navigate('KeywordTracker')}
            activeOpacity={0.8}
          >
            <Ionicons name="key" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>Keyword{`\n`}Tracker</Text>
            <Text style={styles.actionSub}>Track & manage your{`\n`}photography keywords</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#E5EDE4' }]}
            onPress={() => navigation.navigate('ContentAnalysis')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={32} color="#5B8A5B" />
            <Text style={[styles.actionTitle, { color: '#5B8A5B' }]}>Content{`\n`}Analyzer</Text>
            <Text style={styles.actionSub}>Score your blog posts{`\n`}for SEO performance</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Keywords */}
        {recent.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Keywords</Text>
              <TouchableOpacity onPress={() => navigation.navigate('KeywordTracker')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentList}>
              {recent.map(kw => (
                <View key={kw.id} style={styles.recentItem}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(kw.status) }]} />
                  <Text style={styles.recentKeyword}>{kw.keyword}</Text>
                  <Text style={styles.recentCategory}>{kw.category}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Empty state */}
        {keywords.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No keywords yet</Text>
            <Text style={styles.emptyText}>Open Keyword Tracker to add your first photography keywords.</Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('KeywordTracker')}
            >
              <Text style={styles.emptyBtnText}>Add Keywords</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tip card */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={18} color={colors.accent} />
          <Text style={styles.tipText}>
            <Text style={{ fontWeight: '600' }}>Tip: </Text>
            Long-tail keywords like "newborn photography tips" convert better than broad terms like "photography".
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: { ...typography.h1, fontSize: 28 },
  subtitle: { ...typography.bodySmall, marginTop: 2 },
  cameraIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { ...typography.h2, fontSize: 22, color: colors.textDark },
  statLabel: { ...typography.label, fontSize: 10, marginTop: 2, textAlign: 'center' },
  sectionTitle: { ...typography.h4, marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  seeAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionTitle: { ...typography.h4, color: colors.primary },
  actionSub: { ...typography.bodySmall, lineHeight: 18 },
  recentList: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  recentKeyword: { ...typography.body, flex: 1, fontWeight: '500', color: colors.textDark },
  recentCategory: { ...typography.bodySmall, textTransform: 'capitalize' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.h3, marginTop: spacing.sm },
  emptyText: { ...typography.body, textAlign: 'center', color: colors.textLight, maxWidth: 260 },
  emptyBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  emptyBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  tipText: { ...typography.bodySmall, flex: 1, lineHeight: 20, color: colors.textMedium },
});
