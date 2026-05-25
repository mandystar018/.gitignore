import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TrackedKeyword, KeywordStatus } from '../types';
import {
  loadKeywords,
  loadWebsiteUrl,
  addKeyword,
  updateKeyword,
  updateKeywordRank,
  deleteKeyword,
  getStatusColor,
  getStatusLabel,
  getRankTrend,
  getRankChange,
  buildGoogleSearchUrl,
} from '../utils/seoUtils';
import { colors, spacing, radius, typography } from '../theme';

const FILTER_OPTIONS: (KeywordStatus | 'all')[] = ['all', 'ranking', 'improving', 'needs-work', 'tracking'];

export default function KeywordTrackerScreen() {
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [filter, setFilter] = useState<KeywordStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newRank, setNewRank] = useState('');

  // Update rank modal
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankTarget, setRankTarget] = useState<TrackedKeyword | null>(null);
  const [rankInput, setRankInput] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
      loadWebsiteUrl().then(setWebsiteUrl);
    }, [])
  );

  const filtered = keywords.filter(k => {
    const matchesFilter = filter === 'all' || k.status === filter;
    const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function handleAdd() {
    if (!newKeyword.trim()) return;
    const rank = newRank.trim() ? parseInt(newRank.trim(), 10) : undefined;
    const added = await addKeyword(
      newKeyword.trim(),
      'custom',
      rank && rank <= 10 ? 'ranking' : rank && rank <= 20 ? 'improving' : rank ? 'needs-work' : 'tracking',
      '',
      rank && !isNaN(rank) ? rank : undefined
    );
    setKeywords(prev => [...prev, added]);
    setNewKeyword('');
    setNewRank('');
    setShowAddModal(false);
  }

  function openRankModal(kw: TrackedKeyword) {
    setRankTarget(kw);
    setRankInput(kw.currentRank?.toString() ?? '');
    setShowRankModal(true);
  }

  async function handleSaveRank() {
    if (!rankTarget) return;
    const rank = parseInt(rankInput, 10);
    if (isNaN(rank) || rank < 1) return;
    await updateKeywordRank(rankTarget.id, rank);
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
        }
      }
    ]);
  }

  function handleCheckOnGoogle(kw: TrackedKeyword) {
    const url = buildGoogleSearchUrl(kw.keyword, websiteUrl);
    Linking.openURL(url);
  }

  function renderTrendIcon(kw: TrackedKeyword) {
    const trend = getRankTrend(kw.rankHistory);
    const change = getRankChange(kw.rankHistory);
    if (trend === 'new') return null;
    if (trend === 'up') return (
      <View style={styles.trendUp}>
        <Ionicons name="arrow-up" size={12} color="#5B8A5B" />
        <Text style={styles.trendUpText}>+{change}</Text>
      </View>
    );
    if (trend === 'down') return (
      <View style={styles.trendDown}>
        <Ionicons name="arrow-down" size={12} color="#D44533" />
        <Text style={styles.trendDownText}>{change}</Text>
      </View>
    );
    return <Text style={styles.trendSame}>—</Text>;
  }

  function renderKeyword({ item }: { item: TrackedKeyword }) {
    return (
      <View style={styles.keywordCard}>
        <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.keywordBody}>
          {/* Top row: keyword + rank */}
          <View style={styles.keywordTop}>
            <Text style={styles.keywordText} numberOfLines={2}>{item.keyword}</Text>
            <View style={styles.rankArea}>
              {item.currentRank !== undefined ? (
                <>
                  <Text style={[styles.rankNumber, { color: getStatusColor(item.status) }]}>
                    #{item.currentRank}
                  </Text>
                  {renderTrendIcon(item)}
                </>
              ) : (
                <Text style={styles.noRank}>Not logged</Text>
              )}
            </View>
          </View>

          {/* Status badge */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
            {item.rankHistory.length > 1 && (
              <Text style={styles.historyNote}>
                {item.rankHistory.length} rank entries
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.keywordActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => openRankModal(item)}>
              <Ionicons name="podium" size={13} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Log rank</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleCheckOnGoogle(item)}>
              <Ionicons name="search" size={13} color={colors.textMedium} />
              <Text style={styles.actionBtnText}>Check Google</Text>
            </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Keyword Tracker</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={16} color={colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your keywords..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter tabs */}
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
              {f === 'all' ? `All (${keywords.length})` : `${getStatusLabel(f)} (${keywords.filter(k => k.status === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Keyword list */}
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
                ? 'No keywords yet. Tap + to add any keyword from your website or blog.'
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
              <Text style={styles.modalHint}>Add any keyword you want to rank for on Google.</Text>

              <Text style={styles.modalLabel}>Keyword</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. wedding photographer Dallas"
                placeholderTextColor={colors.textLight}
                value={newKeyword}
                onChangeText={setNewKeyword}
                autoFocus
              />

              <Text style={styles.modalLabel}>Current Google rank (optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 7  (leave blank if unknown)"
                placeholderTextColor={colors.textLight}
                value={newRank}
                onChangeText={setNewRank}
                keyboardType="number-pad"
              />
              <Text style={styles.rankHint}>
                Rank = the position your site appears on Google. #1 is the best.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAddModal(false); setNewKeyword(''); setNewRank(''); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !newKeyword.trim() && styles.saveBtnDisabled]}
                  onPress={handleAdd}
                  disabled={!newKeyword.trim()}
                >
                  <Text style={styles.saveBtnText}>Add Keyword</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Log Rank Modal */}
      <Modal visible={showRankModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Log Rank</Text>
              <Text style={styles.modalKeywordName}>"{rankTarget?.keyword}"</Text>

              <View style={styles.googleHint}>
                <Ionicons name="information-circle" size={15} color={colors.primary} />
                <Text style={styles.googleHintText}>
                  Search Google for this keyword, find where your website appears, then enter that position below.
                </Text>
              </View>

              {rankTarget && (
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={() => Linking.openURL(buildGoogleSearchUrl(rankTarget.keyword, websiteUrl))}
                >
                  <Ionicons name="search" size={16} color={colors.white} />
                  <Text style={styles.googleBtnText}>Search Google now</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Your rank position</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 5"
                placeholderTextColor={colors.textLight}
                value={rankInput}
                onChangeText={setRankInput}
                keyboardType="number-pad"
                autoFocus
              />

              {rankTarget?.currentRank !== undefined && (
                <Text style={styles.prevRank}>Previous rank: #{rankTarget.currentRank}</Text>
              )}

              <View style={styles.rankKey}>
                <Text style={styles.rankKeyItem}><Text style={{ color: '#5B8A5B', fontWeight: '700' }}>#1–10</Text> = Ranking (page 1)</Text>
                <Text style={styles.rankKeyItem}><Text style={{ color: '#E8B84B', fontWeight: '700' }}>#11–20</Text> = Improving (page 2)</Text>
                <Text style={styles.rankKeyItem}><Text style={{ color: '#D44533', fontWeight: '700' }}>#21+</Text> = Needs work</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRankModal(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, !rankInput.trim() && styles.saveBtnDisabled]}
                  onPress={handleSaveRank}
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },
  addBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: spacing.sm, ...typography.body, color: colors.textDark },
  filterScroll: { maxHeight: 48 },
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
  keywordTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
  keywordText: { ...typography.body, fontWeight: '600', color: colors.textDark, flex: 1 },
  rankArea: { alignItems: 'flex-end', gap: 2 },
  rankNumber: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  noRank: { ...typography.bodySmall, color: colors.textLight, fontStyle: 'italic' },
  trendUp: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendUpText: { fontSize: 11, fontWeight: '700', color: '#5B8A5B' },
  trendDown: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  trendDownText: { fontSize: 11, fontWeight: '700', color: '#D44533' },
  trendSame: { fontSize: 11, color: colors.textLight },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  historyNote: { ...typography.bodySmall, color: colors.textLight },
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
  modalHint: { ...typography.bodySmall, color: colors.textLight, marginBottom: spacing.xs },
  modalLabel: { ...typography.label, marginTop: spacing.xs },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textDark,
  },
  rankHint: { ...typography.bodySmall, color: colors.textLight, marginTop: -spacing.xs },
  modalKeywordName: { ...typography.body, fontWeight: '600', color: colors.textDark, marginBottom: spacing.xs },
  googleHint: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'flex-start',
  },
  googleHintText: { ...typography.bodySmall, flex: 1, lineHeight: 18, color: colors.textMedium },
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
  modalActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
