import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TrackedKeyword } from '../types';
import { loadKeywords, loadWebsiteUrl, saveWebsiteUrl, getStatusColor } from '../utils/seoUtils';
import { colors, spacing, radius, typography } from '../theme';

type Nav = StackNavigationProp<RootStackParamList, 'SEOHome'>;

export default function SEOHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
      loadWebsiteUrl().then(url => { setWebsiteUrl(url); setUrlDraft(url); });
    }, [])
  );

  async function handleSaveUrl() {
    const clean = urlDraft.trim();
    await saveWebsiteUrl(clean);
    setWebsiteUrl(clean);
    setEditingUrl(false);
  }

  const rankingCount = keywords.filter(k => k.status === 'ranking').length;
  const needsWorkCount = keywords.filter(k => k.status === 'needs-work').length;
  const improvingCount = keywords.filter(k => k.status === 'improving').length;
  const rankedKeywords = keywords.filter(k => k.currentRank !== undefined);
  const avgRank = rankedKeywords.length > 0
    ? Math.round(rankedKeywords.reduce((s, k) => s + (k.currentRank ?? 0), 0) / rankedKeywords.length)
    : null;

  const recent = [...keywords]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SEO Edge</Text>
              <Text style={styles.subtitle}>Keyword Rank Tracker</Text>
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="trending-up" size={28} color={colors.primary} />
            </View>
          </View>

          {/* Website URL */}
          <View style={styles.urlCard}>
            <View style={styles.urlHeader}>
              <Ionicons name="globe" size={16} color={colors.primary} />
              <Text style={styles.urlTitle}>Your Website</Text>
              <TouchableOpacity onPress={() => setEditingUrl(!editingUrl)}>
                <Text style={styles.urlEdit}>{editingUrl ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>
            {editingUrl ? (
              <View style={styles.urlInputRow}>
                <TextInput
                  style={styles.urlInput}
                  value={urlDraft}
                  onChangeText={setUrlDraft}
                  placeholder="https://yourwebsite.com"
                  placeholderTextColor={colors.textLight}
                  autoCapitalize="none"
                  keyboardType="url"
                  autoFocus
                />
                <TouchableOpacity style={styles.urlSaveBtn} onPress={handleSaveUrl}>
                  <Text style={styles.urlSaveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={websiteUrl ? styles.urlValue : styles.urlPlaceholder}>
                {websiteUrl || 'Tap Edit to add your website URL'}
              </Text>
            )}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{keywords.length}</Text>
              <Text style={styles.statLabel}>Keywords</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: '#5B8A5B' }]}>
              <Text style={[styles.statNumber, { color: '#5B8A5B' }]}>{rankingCount}</Text>
              <Text style={styles.statLabel}>Top 10</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: '#E8B84B' }]}>
              <Text style={[styles.statNumber, { color: '#E8B84B' }]}>{improvingCount}</Text>
              <Text style={styles.statLabel}>Improving</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: colors.primary }]}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {avgRank !== null ? `#${avgRank}` : '—'}
              </Text>
              <Text style={styles.statLabel}>Avg Rank</Text>
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
              <Text style={styles.actionSub}>Track rankings for{`\n`}any keyword</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#E5EDE4' }]}
              onPress={() => navigation.navigate('ContentAnalysis')}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={32} color="#5B8A5B" />
              <Text style={[styles.actionTitle, { color: '#5B8A5B' }]}>Content{`\n`}Analyzer</Text>
              <Text style={styles.actionSub}>Score your blog{`\n`}posts for SEO</Text>
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
                    <Text style={styles.recentKeyword} numberOfLines={1}>{kw.keyword}</Text>
                    {kw.currentRank !== undefined ? (
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>#{kw.currentRank}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noRankText}>No rank</Text>
                    )}
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
              <Text style={styles.emptyText}>Add any keyword from your website or blog to start tracking its Google ranking.</Text>
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
              After searching Google for your keyword, count which page/position your site appears at and log it in the Keyword Tracker.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  urlCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  urlHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  urlTitle: { ...typography.label, flex: 1, color: colors.textMedium },
  urlEdit: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  urlValue: { ...typography.body, color: colors.textDark, fontWeight: '500' },
  urlPlaceholder: { ...typography.bodySmall, color: colors.textLight, fontStyle: 'italic' },
  urlInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    ...typography.body,
    color: colors.textDark,
  },
  urlSaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  urlSaveBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
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
  statNumber: { ...typography.h2, fontSize: 20, color: colors.textDark },
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
  actionsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  actionCard: { flex: 1, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
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
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  recentKeyword: { ...typography.body, flex: 1, fontWeight: '500', color: colors.textDark },
  rankBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  rankBadgeText: { fontSize: 12, fontWeight: '700', color: colors.primary },
  noRankText: { ...typography.bodySmall, color: colors.textLight },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyTitle: { ...typography.h3, marginTop: spacing.sm },
  emptyText: { ...typography.body, textAlign: 'center', color: colors.textLight, maxWidth: 280 },
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
