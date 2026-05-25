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
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TrackedKeyword, KeywordStatus, KeywordCategory } from '../types';
import {
  loadKeywords,
  addKeyword,
  updateKeyword,
  deleteKeyword,
  getStatusColor,
  getStatusLabel,
} from '../utils/seoUtils';
import { photographyKeywords, categoryLabels, categoryColors } from '../data/photographyKeywords';
import { colors, spacing, radius, typography } from '../theme';

const STATUS_OPTIONS: KeywordStatus[] = ['tracking', 'improving', 'ranking', 'needs-work'];
const FILTER_OPTIONS: (KeywordStatus | 'all')[] = ['all', 'ranking', 'improving', 'needs-work', 'tracking'];

export default function KeywordTrackerScreen() {
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [filter, setFilter] = useState<KeywordStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TrackedKeyword | null>(null);
  const [newKeyword, setNewKeyword] = useState('');
  const [newStatus, setNewStatus] = useState<KeywordStatus>('tracking');
  const [newCategory, setNewCategory] = useState<KeywordCategory>('general');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
    }, [])
  );

  const filtered = keywords.filter(k => {
    const matchesFilter = filter === 'all' || k.status === filter;
    const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  async function handleAdd() {
    if (!newKeyword.trim()) return;
    const added = await addKeyword(newKeyword.trim(), newCategory, newStatus);
    setKeywords(prev => [...prev, added]);
    setNewKeyword('');
    setNewStatus('tracking');
    setNewCategory('general');
    setShowAddModal(false);
  }

  async function handleAddSuggestion(keyword: string, category: KeywordCategory) {
    if (keywords.some(k => k.keyword.toLowerCase() === keyword.toLowerCase())) return;
    const added = await addKeyword(keyword, category);
    setKeywords(prev => [...prev, added]);
  }

  async function handleUpdateStatus(id: string, status: KeywordStatus) {
    await updateKeyword(id, { status });
    setKeywords(prev => prev.map(k => k.id === id ? { ...k, status } : k));
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

  function handleEditOpen(kw: TrackedKeyword) {
    setEditTarget(kw);
    setNewStatus(kw.status);
    setShowEditModal(true);
  }

  async function handleEditSave() {
    if (!editTarget) return;
    await updateKeyword(editTarget.id, { status: newStatus });
    setKeywords(prev => prev.map(k => k.id === editTarget.id ? { ...k, status: newStatus } : k));
    setShowEditModal(false);
    setEditTarget(null);
  }

  const alreadyTracked = new Set(keywords.map(k => k.keyword.toLowerCase()));
  const availableSuggestions = photographyKeywords.filter(
    s => !alreadyTracked.has(s.keyword.toLowerCase())
  );

  function renderKeyword({ item }: { item: TrackedKeyword }) {
    return (
      <View style={styles.keywordCard}>
        <View style={[styles.statusBar, { backgroundColor: getStatusColor(item.status) }]} />
        <View style={styles.keywordBody}>
          <View style={styles.keywordTop}>
            <Text style={styles.keywordText}>{item.keyword}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
          <Text style={styles.categoryText}>{categoryLabels[item.category]}</Text>
          <View style={styles.keywordActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditOpen(item)}>
              <Ionicons name="pencil" size={14} color={colors.textMedium} />
              <Text style={styles.actionBtnText}>Edit status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash" size={14} color="#D44533" />
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

      {/* Filter Tabs */}
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
              {f === 'all' ? 'All' : getStatusLabel(f)}
              {f !== 'all' && ` (${keywords.filter(k => k.status === f).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Keyword List */}
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
                ? 'No keywords yet. Tap + to add your first keyword or browse suggestions below.'
                : 'No keywords match this filter.'}
            </Text>
          </View>
        }
        ListFooterComponent={
          availableSuggestions.length > 0 ? (
            <View style={styles.suggestionsSection}>
              <TouchableOpacity
                style={styles.suggestionsToggle}
                onPress={() => setShowSuggestions(!showSuggestions)}
              >
                <Text style={styles.suggestionsToggleText}>Photography keyword suggestions</Text>
                <Ionicons
                  name={showSuggestions ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
              {showSuggestions && (
                <View style={styles.suggestionsList}>
                  {availableSuggestions.map(s => (
                    <TouchableOpacity
                      key={s.keyword}
                      style={styles.suggestionItem}
                      onPress={() => handleAddSuggestion(s.keyword, s.category)}
                    >
                      <View>
                        <Text style={styles.suggestionKeyword}>{s.keyword}</Text>
                        <Text style={styles.suggestionDesc}>{s.description}</Text>
                      </View>
                      <View style={[styles.categoryPill, { backgroundColor: categoryColors[s.category] + '22' }]}>
                        <Text style={[styles.categoryPillText, { color: categoryColors[s.category] }]}>
                          {categoryLabels[s.category]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ) : null
        }
      />

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Keyword</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. newborn photography tips"
              placeholderTextColor={colors.textLight}
              value={newKeyword}
              onChangeText={setNewKeyword}
              autoFocus
            />
            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
              {(Object.keys(categoryLabels) as KeywordCategory[]).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChip,
                    newCategory === cat && { backgroundColor: categoryColors[cat] }
                  ]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Text style={[styles.catChipText, newCategory === cat && { color: colors.white }]}>
                    {categoryLabels[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    newStatus === s && { backgroundColor: getStatusColor(s) }
                  ]}
                  onPress={() => setNewStatus(s)}
                >
                  <Text style={[styles.statusOptionText, newStatus === s && { color: colors.white }]}>
                    {getStatusLabel(s)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Add Keyword</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editTarget?.keyword}</Text>
            <Text style={styles.modalLabel}>Update Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    newStatus === s && { backgroundColor: getStatusColor(s) }
                  ]}
                  onPress={() => setNewStatus(s)}
                >
                  <Text style={[styles.statusOptionText, newStatus === s && { color: colors.white }]}>
                    {getStatusLabel(s)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleEditSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  filterContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
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
  keywordTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  keywordText: { ...typography.body, fontWeight: '600', color: colors.textDark, flex: 1, marginRight: spacing.sm },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  categoryText: { ...typography.bodySmall, textTransform: 'capitalize' },
  keywordActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtnText: { ...typography.bodySmall, color: colors.textMedium },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyText: { ...typography.body, color: colors.textLight, textAlign: 'center', maxWidth: 280 },
  suggestionsSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  suggestionsToggleText: { ...typography.body, fontWeight: '600', color: colors.primary },
  suggestionsList: { borderTopWidth: 1, borderTopColor: colors.border },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionKeyword: { ...typography.body, fontWeight: '500', color: colors.textDark },
  suggestionDesc: { ...typography.bodySmall, marginTop: 2 },
  categoryPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  categoryPillText: { fontSize: 11, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  modalTitle: { ...typography.h3, marginBottom: spacing.xs },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  modalLabel: { ...typography.label, marginBottom: spacing.xs },
  catChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  catChipText: { ...typography.bodySmall, fontWeight: '500', color: colors.textMedium },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statusOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusOptionText: { ...typography.bodySmall, fontWeight: '500', color: colors.textMedium },
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
  saveBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnText: { ...typography.body, fontWeight: '600', color: colors.white },
});
