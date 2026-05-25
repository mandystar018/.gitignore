import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TrackedKeyword, KeywordStatus } from '../types';
import {
  loadKeywords,
  loadWebsiteUrl,
  addKeyword,
  updateKeywordRank,
  markKeywordChecked,
  deleteKeyword,
  getStatusColor,
  getStatusLabel,
  getRankTrend,
  getRankChange,
  buildGoogleSearchUrl,
  formatLastChecked,
} from '../utils/seoUtils';
import { loadSerpApiKey, checkKeywordRank, checkAllKeywords } from '../utils/serpApi';
import { colors, spacing, radius, typography } from '../theme';

const FILTER_OPTIONS: (KeywordStatus | 'all')[] = ['all', 'ranking', 'improving', 'needs-work', 'tracking'];

export default function KeywordTrackerScreen() {
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [filter, setFilter] = useState<KeywordStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set());

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  // Manual rank modal (fallback when no API key)
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankTarget, setRankTarget] = useState<TrackedKeyword | null>(null);
  const [rankInput, setRankInput] = useState('');

  const appStateRef = useRef(AppState.currentState);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function init() {
        const [kws, url, key] = await Promise.all([
          loadKeywords(),
          loadWebsiteUrl(),
          loadSerpApiKey(),
        ]);
        if (!active) return;
        setKeywords(kws);
        setWebsiteUrl(url);
        setApiKey(key);

        // Auto-refresh if API is configured
        if (key && url && kws.length > 0) {
          runAutoRefresh(kws, url, key);
        }
      }

      init();

      // Re-check when app comes back to foreground
      const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
        if (state === 'active' && appStateRef.current !== 'active') {
          init();
        }
        appStateRef.current = state;
      });

      return () => {
        active = false;
        sub.remove();
      };
    }, [])
  );

  async function runAutoRefresh(
    kws: TrackedKeyword[],
    url: string,
    key: string
  ) {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshProgress(0);

    const allIds = new Set(kws.map(k => k.id));
    setCheckingIds(allIds);

    const results = await checkAllKeywords(
      kws.map(k => ({ id: k.id, keyword: k.keyword })),
      url,
      key,
      (done) => setRefreshProgress(done)
    );

    for (const r of results) {
      if (r.rank !== null) {
        await updateKeywordRank(r.id, r.rank, 'auto');
      } else {
        await markKeywordChecked(r.id, r.error || 'Not found in top 100');
      }
      setCheckingIds(prev => {
        const next = new Set(prev);
        next.delete(r.id);
        return next;
      });
    }

    const updated = await loadKeywords();
    setKeywords(updated);
    setRefreshing(false);
    setCheckingIds(new Set());
  }

  async function handleRefreshAll() {
    if (!apiKey || !websiteUrl) {
      Alert.alert(
        'Setup Required',
        'Add your website URL and SerpApi key on the dashboard to enable live rank tracking.',
        [{ text: 'OK' }]
      );
      return;
    }
    runAutoRefresh(keywords, websiteUrl, apiKey);
  }

  async function handleRefreshOne(kw: TrackedKeyword) {
    if (!apiKey || !websiteUrl) {
      openRankModal(kw);
      return;
    }
    setCheckingIds(prev => new Set(prev).add(kw.id));
    const result = await checkKeywordRank(kw.keyword, websiteUrl, apiKey);
    if (result.rank !== null) {
      await updateKeywordRank(kw.id, result.rank, 'auto');
    } else {
      await markKeywordChecked(kw.id, result.error || 'Not found in top 100');
    }
    const updated = await loadKeywords();
    setKeywords(updated);
    setCheckingIds(prev => {
      const next = new Set(prev);
      next.delete(kw.id);
      return next;
    });
  }

  async function handleAdd() {
    if (!newKeyword.trim()) return;
    const added = await addKeyword(newKeyword.trim());
    setKeywords(prev => [...prev, added]);
    setNewKeyword('');
    setShowAddModal(false);

    // Immediately check this keyword if API is set
    if (apiKey && websiteUrl) {
      handleRefreshOne(added);
    }
  }

  function openRankModal(kw: TrackedKeyword) {
    setRankTarget(kw);
    setRankInput(kw.currentRank?.toString() ?? '');
    setShowRankModal(true);
  }

  async function handleSaveManualRank() {
    if (!rankTarget) return;
    const rank = parseInt(rankInput, 10);
    if (isNaN(rank) || rank < 1) return;
    await updateKeywordRank(rankTarget.id, rank, 'manual');
    const updated = await loadKeywords();
    setKeywords(updated);
    setShowRankModal(false);
    setRankTarget(null);
  }

  async function handleDelete(id: string) {
    Alert.alert('Remove Keyword', 'Remove this keyword from tracking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await deleteKeyword(id);
          setKeywords(prev => prev.filter(k => k.id !== id));
        },
      },
    ]);
  }

  const filtered = keywords.filter(k => {
    const matchesFilter = filter === 'all' || k.status === filter;
    const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function renderTrend(kw: TrackedKeyword) {
    const trend = getRankTrend(kw.rankHistory);
    const change = Math.abs(getRankChange(kw.rankHistory));
    if (trend === 'up') return (
      <View style={styles.trendUp}>
        <Ionicons name="arrow-up" size={11} color="#5B8A5B" />
        <Text style={styles.trendUpText}>{change}</Text>
      </View>
    );
    if (trend === 'down') return (
      <View style={styles.trendDown}>
        <Ionicons name="arrow-down" size={11} color="#D44533" />
        <Text style={styles.trendDownText}>{change}</Text>
      </View>
    );
    if (trend === 'same') return <Text style={styles.trendSame}>—</Text>;
    return null;
  }

  function renderKeyword({ item }: { item: TrackedKeyword }) {
    const isChecking = checkingIds.has(item.id);
    const notFoundInTop100 = item.lastCheckError === 'Not found in top 100';

    return (
      <View style={styles.keywordCard}>
        <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.keywordBody}>
          {/* Keyword + rank */}
          <View style={styles.keywordTop}>
            <Text style={styles.keywordText} numberOfLines={2}>{item.keyword}</Text>
            <View style={styles.rankArea}>
              {isChecking ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : item.currentRank !== undefined ? (
                <>
                  <Text style={[styles.rankNumber, { color: getStatusColor(item.status) }]}>
                    #{item.currentRank}
                  </Text>
                  {renderTrend(item)}
                </>
              ) : notFoundInTop100 ? (
                <Text style={styles.notRanked}>100+</Text>
              ) : (
                <Text style={styles.noRank}>—</Text>
              )}
            </View>
          </View>

          {/* Status + last checked */}
          <View style={styles.metaRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            <Text style={styles.checkedAt}>
              {isChecking ? 'Checking...' : formatLastChecked(item.lastChecked)}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.keywordActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleRefreshOne(item)}
              disabled={isChecking}
            >
              <Ionicons
                name={apiKey ? 'refresh' : 'podium'}
                size={13}
                color={isChecking ? colors.textLight : colors.primary}
              />
              <Text style={[styles.actionBtnText, { color: isChecking ? colors.textLight : colors.primary }]}>
                {apiKey ? 'Check now' : 'Log rank'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Linking.openURL(buildGoogleSearchUrl(item.keyword, websiteUrl))}
            >
              <Ionicons name="search" size={13} color={colors.textMedium} />
              <Text style={styles.actionBtnText}>Google</Text>
            </TouchableOpacity>

            {!apiKey && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => openRankModal(item)}>
                <Ionicons name="pencil" size={13} color={colors.textMedium} />
                <Text style={styles.actionBtnText}>Manual</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash" size={13} color="#D44533" />
              <Text style={[styles.actionBtnText, { color: '#D44533' }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Keyword Tracker</Text>
          {refreshing && (
            <Text style={styles.refreshStatus}>
              Checking {refreshProgress}/{keywords.length}...
            </Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleRefreshAll}
            style={styles.refreshBtn}
            disabled={refreshing}
          >
            {refreshing
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Ionicons name="refresh" size={20} color={apiKey ? colors.primary : colors.textLight} />
            }
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* No-API-key banner */}
      {!apiKey && (
        <View style={styles.apiBanner}>
          <Ionicons name="flash" size={14} color={colors.accent} />
          <Text style={styles.apiBannerText}>
            Add a SerpApi key on the dashboard to enable live automatic rank checking.
          </Text>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search keywords..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all'
                ? `All (${keywords.length})`
                : `${getStatusLabel(f)} (${keywords.filter(k => k.status === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderKeyword}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="key-outline" size={40} color={colors.textLight} />
            <Text style={styles.emptyText}>
              {keywords.length === 0
                ? 'No keywords yet. Tap + to add any keyword you want to rank for.'
                : 'No keywords match this filter.'}
            </Text>
            {keywords.length === 0 && (
              <TouchableOpacity style={styles.emptyAddBtn} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyAddBtnText}>+ Add First Keyword</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Add Keyword Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Add Keyword</Text>
              <Text style={styles.modalHint}>
                {apiKey
                  ? 'The app will automatically check your Google ranking after adding.'
                  : 'Add any keyword you want to track from your website or blog.'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. wedding photographer Dallas"
                placeholderTextColor={colors.textLight}
                value={newKeyword}
                onChangeText={setNewKeyword}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setShowAddModal(false); setNewKeyword(''); }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !newKeyword.trim() && styles.saveBtnDisabled]}
                  onPress={handleAdd}
                  disabled={!newKeyword.trim()}
                >
                  <Text style={styles.saveBtnText}>
                    {apiKey ? 'Add & Check Rank' : 'Add Keyword'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manual Rank Modal (fallback) */}
      <Modal visible={showRankModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Log Rank Manually</Text>
              <Text style={styles.modalKeywordName}>"{rankTarget?.keyword}"</Text>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() =>
                  rankTarget &&
                  Linking.openURL(buildGoogleSearchUrl(rankTarget.keyword, websiteUrl))
                }
              >
                <Ionicons name="search" size={15} color={colors.white} />
                <Text style={styles.googleBtnText}>Open Google to find your rank</Text>
              </TouchableOpacity>

              <Text style={styles.modalLabel}>Your position on Google</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 7"
                placeholderTextColor={colors.textLight}
                value={rankInput}
                onChangeText={setRankInput}
                keyboardType="number-pad"
                autoFocus
              />
              {rankTarget?.currentRank !== undefined && (
                <Text style={styles.prevRank}>Previous: #{rankTarget.currentRank}</Text>
              )}
              <View style={styles.rankKey}>
                <Text style={styles.rankKeyItem}>
                  <Text style={{ color: '#5B8A5B', fontWeight: '700' }}>#1–10</Text> = Page 1 (Ranking)
                </Text>
                <Text style={styles.rankKeyItem}>
                  <Text style={{ color: '#E8B84B', fontWeight: '700' }}>#11–20</Text> = Page 2 (Improving)
                </Text>
                <Text style={styles.rankKeyItem}>
                  <Text style={{ color: '#D44533', fontWeight: '700' }}>#21+</Text> = Needs work
                </Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowRankModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !rankInput.trim() && styles.saveBtnDisabled]}
                  onPress={handleSaveManualRank}
                  disabled={!rankInput.trim()}
                >
                  <Text style={styles.saveBtnText}>Save Rank</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { ...typography.h3 },
  refreshStatus: { ...typography.bodySmall, color: colors.primary, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  refreshBtn: { padding: spacing.xs },
  addBtn: {
    backgroundColor: colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  apiBannerText: { ...typography.bodySmall, flex: 1, lineHeight: 18, color: colors.textMedium },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, ...typography.body, color: colors.textDark },
  filterScroll: { maxHeight: 46 },
  filterContent: { paddingHorizontal: spacing.md, gap: spacing.sm, alignItems: 'center' },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { ...typography.bodySmall, fontWeight: '500', color: colors.textMedium },
  filterTabTextActive: { color: colors.white },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxl },
  keywordCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBar: { width: 4 },
  keywordBody: { flex: 1, padding: spacing.md, gap: spacing.xs },
  keywordTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  keywordText: { ...typography.body, fontWeight: '600', color: colors.textDark, flex: 1 },
  rankArea: { alignItems: 'flex-end', gap: 2, minWidth: 52 },
  rankNumber: { fontSize: 24, fontWeight: '800', lineHeight: 28 },
  notRanked: { fontSize: 16, fontWeight: '700', color: '#D44533' },
  noRank: { fontSize: 20, color: colors.textLight },
  trendUp: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendUpText: { fontSize: 11, fontWeight: '700', color: '#5B8A5B' },
  trendDown: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendDownText: { fontSize: 11, fontWeight: '700', color: '#D44533' },
  trendSame: { fontSize: 11, color: colors.textLight },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  checkedAt: { ...typography.bodySmall, fontSize: 11, color: colors.textLight },
  keywordActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { ...typography.bodySmall, color: colors.textMedium },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textLight, textAlign: 'center', maxWidth: 280 },
  emptyAddBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  emptyAddBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  modalTitle: { ...typography.h3 },
  modalHint: { ...typography.bodySmall, color: colors.textLight },
  modalLabel: { ...typography.label, marginTop: spacing.xs },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textDark,
  },
  modalKeywordName: { ...typography.body, fontWeight: '600', color: colors.textDark },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  googleBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  prevRank: { ...typography.bodySmall, color: colors.textLight },
  rankKey: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
  },
  rankKeyItem: { ...typography.bodySmall, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { ...typography.body, fontWeight: '600', color: colors.textMedium },
  saveBtn: { flex: 1, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { ...typography.body, fontWeight: '600', color: colors.white },
});
