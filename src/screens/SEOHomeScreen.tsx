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
  Modal,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TrackedKeyword } from '../types';
import { loadKeywords, loadWebsiteUrl, saveWebsiteUrl, getStatusColor, formatLastChecked } from '../utils/seoUtils';
import { loadSerpApiKey, saveSerpApiKey } from '../utils/serpApi';
import { colors, spacing, radius, typography } from '../theme';

type Nav = StackNavigationProp<RootStackParamList, 'SEOHome'>;

export default function SEOHomeScreen() {
  const navigation = useNavigation<Nav>();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
      loadWebsiteUrl().then(url => { setWebsiteUrl(url); setUrlDraft(url); });
      loadSerpApiKey().then(k => { setApiKey(k); setApiKeyDraft(k); });
    }, [])
  );

  async function handleSaveUrl() {
    const clean = urlDraft.trim();
    await saveWebsiteUrl(clean);
    setWebsiteUrl(clean);
    setEditingUrl(false);
  }

  async function handleSaveApiKey() {
    await saveSerpApiKey(apiKeyDraft.trim());
    setApiKey(apiKeyDraft.trim());
    setShowApiModal(false);
  }

  const rankingCount = keywords.filter(k => k.status === 'ranking').length;
  const improvingCount = keywords.filter(k => k.status === 'improving').length;
  const rankedKeywords = keywords.filter(k => k.currentRank !== undefined);
  const avgRank = rankedKeywords.length > 0
    ? Math.round(rankedKeywords.reduce((s, k) => s + (k.currentRank ?? 0), 0) / rankedKeywords.length)
    : null;

  const recent = [...keywords]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);

  const liveTrackingReady = !!apiKey && !!websiteUrl;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>SEO Edge</Text>
              <Text style={styles.subtitle}>Keyword Rank Tracker</Text>
            </View>
            <View style={[styles.liveBadge, liveTrackingReady ? styles.liveBadgeOn : styles.liveBadgeOff]}>
              <View style={[styles.liveDot, { backgroundColor: liveTrackingReady ? '#5B8A5B' : colors.textLight }]} />
              <Text style={[styles.liveText, { color: liveTrackingReady ? '#5B8A5B' : colors.textLight }]}>
                {liveTrackingReady ? 'Live' : 'Manual'}
              </Text>
            </View>
          </View>

          {/* Setup cards — shown when not fully configured */}
          {(!websiteUrl || !apiKey) && (
            <View style={styles.setupSection}>
              <Text style={styles.setupTitle}>Quick Setup</Text>

              {/* Website URL */}
              <TouchableOpacity
                style={[styles.setupCard, websiteUrl && styles.setupCardDone]}
                onPress={() => setEditingUrl(true)}
              >
                <View style={[styles.setupIcon, websiteUrl && { backgroundColor: '#E5EDE4' }]}>
                  <Ionicons name="globe" size={20} color={websiteUrl ? '#5B8A5B' : colors.primary} />
                </View>
                <View style={styles.setupCardBody}>
                  <Text style={styles.setupCardTitle}>
                    {websiteUrl ? 'Website URL saved' : 'Add your website URL'}
                  </Text>
                  <Text style={styles.setupCardSub}>
                    {websiteUrl || 'e.g. https://yourwebsite.com'}
                  </Text>
                </View>
                <Ionicons
                  name={websiteUrl ? 'checkmark-circle' : 'chevron-forward'}
                  size={20}
                  color={websiteUrl ? '#5B8A5B' : colors.textLight}
                />
              </TouchableOpacity>

              {/* API Key */}
              <TouchableOpacity
                style={[styles.setupCard, apiKey && styles.setupCardDone]}
                onPress={() => setShowApiModal(true)}
              >
                <View style={[styles.setupIcon, apiKey && { backgroundColor: '#E5EDE4' }]}>
                  <Ionicons name="key" size={20} color={apiKey ? '#5B8A5B' : colors.primary} />
                </View>
                <View style={styles.setupCardBody}>
                  <Text style={styles.setupCardTitle}>
                    {apiKey ? 'SerpApi key saved' : 'Add SerpApi key'}
                  </Text>
                  <Text style={styles.setupCardSub}>
                    {apiKey ? 'Live rank tracking enabled' : 'Free at serpapi.com — 100 searches/month'}
                  </Text>
                </View>
                <Ionicons
                  name={apiKey ? 'checkmark-circle' : 'chevron-forward'}
                  size={20}
                  color={apiKey ? '#5B8A5B' : colors.textLight}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Configured: compact website + settings row */}
          {websiteUrl && apiKey && (
            <View style={styles.configRow}>
              <View style={styles.configSite}>
                <Ionicons name="globe" size={14} color={colors.textMedium} />
                <Text style={styles.configSiteText} numberOfLines={1}>{websiteUrl}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowApiModal(true)} style={styles.configSettingsBtn}>
                <Ionicons name="settings-outline" size={18} color={colors.textMedium} />
              </TouchableOpacity>
            </View>
          )}

          {/* Website URL edit inline (for setup card tap) */}
          {editingUrl && (
            <View style={styles.urlInputCard}>
              <Text style={styles.urlInputLabel}>Your website URL</Text>
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
              <TouchableOpacity onPress={() => setEditingUrl(false)}>
                <Text style={styles.cancelLink}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

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
              <Ionicons name="trending-up" size={32} color={colors.primary} />
              <Text style={styles.actionTitle}>Keyword{'\n'}Tracker</Text>
              <Text style={styles.actionSub}>
                {liveTrackingReady ? 'Live Google rankings' : 'Track any keyword'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#E5EDE4' }]}
              onPress={() => navigation.navigate('ContentAnalysis')}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={32} color="#5B8A5B" />
              <Text style={[styles.actionTitle, { color: '#5B8A5B' }]}>Content{'\n'}Analyzer</Text>
              <Text style={styles.actionSub}>Score blog posts{'\n'}for SEO</Text>
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
                    <View style={styles.recentBody}>
                      <Text style={styles.recentKeyword} numberOfLines={1}>{kw.keyword}</Text>
                      <Text style={styles.recentChecked}>{formatLastChecked(kw.lastChecked)}</Text>
                    </View>
                    {kw.currentRank !== undefined ? (
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankBadgeText}>#{kw.currentRank}</Text>
                      </View>
                    ) : (
                      <Text style={styles.noRankText}>—</Text>
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
              <Text style={styles.emptyText}>
                Add any keyword from your website or blog — the app will check your Google ranking automatically.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('KeywordTracker')}>
                <Text style={styles.emptyBtnText}>Add Keywords</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* API Key Modal */}
      <Modal visible={showApiModal} transparent animationType="slide">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Live Rank Tracking</Text>
              <Text style={styles.modalBody}>
                Enter your SerpApi key to enable automatic Google rank checking. Sign up free at serpapi.com — includes 100 searches/month at no cost.
              </Text>

              <Text style={styles.modalLabel}>SerpApi Key</Text>
              <TextInput
                style={styles.modalInput}
                value={apiKeyDraft}
                onChangeText={setApiKeyDraft}
                placeholder="Paste your API key here"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={false}
              />

              {websiteUrl ? null : (
                <>
                  <Text style={styles.modalLabel}>Website URL</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={urlDraft}
                    onChangeText={setUrlDraft}
                    placeholder="https://yourwebsite.com"
                    placeholderTextColor={colors.textLight}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setShowApiModal(false); setApiKeyDraft(apiKey); }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveApiKey}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>

              {apiKey && (
                <TouchableOpacity
                  style={styles.removeKeyBtn}
                  onPress={async () => {
                    await saveSerpApiKey('');
                    setApiKey('');
                    setApiKeyDraft('');
                    setShowApiModal(false);
                  }}
                >
                  <Text style={styles.removeKeyText}>Remove API key (switch to manual)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { ...typography.h1, fontSize: 28 },
  subtitle: { ...typography.bodySmall, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  liveBadgeOn: { backgroundColor: '#E5EDE4' },
  liveBadgeOff: { backgroundColor: colors.border },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 12, fontWeight: '700' },
  setupSection: { gap: spacing.sm },
  setupTitle: { ...typography.label, marginBottom: spacing.xs },
  setupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setupCardDone: { borderColor: '#A8C8A2', backgroundColor: '#F8FDF8' },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupCardBody: { flex: 1 },
  setupCardTitle: { ...typography.body, fontWeight: '600', color: colors.textDark },
  setupCardSub: { ...typography.bodySmall, marginTop: 2 },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EDE4',
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  configSite: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  configSiteText: { ...typography.bodySmall, color: colors.textMedium, flex: 1 },
  configSettingsBtn: { padding: spacing.xs },
  urlInputCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  urlInputLabel: { ...typography.label },
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
  cancelLink: { ...typography.bodySmall, color: colors.textLight, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
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
  sectionTitle: { ...typography.h4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: spacing.md },
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
  recentBody: { flex: 1 },
  recentKeyword: { ...typography.body, fontWeight: '500', color: colors.textDark },
  recentChecked: { ...typography.bodySmall, fontSize: 11, marginTop: 1 },
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
  modalBody: { ...typography.body, color: colors.textMedium, lineHeight: 22 },
  modalLabel: { ...typography.label, marginTop: spacing.xs },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textDark,
  },
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
  saveBtnText: { ...typography.body, fontWeight: '600', color: colors.white },
  removeKeyBtn: { alignItems: 'center', paddingTop: spacing.xs },
  removeKeyText: { ...typography.bodySmall, color: '#D44533' },
});
