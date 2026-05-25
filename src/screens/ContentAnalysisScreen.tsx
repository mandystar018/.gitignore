import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TrackedKeyword, ContentAnalysisResult } from '../types';
import { loadKeywords, analyzeContent, getScoreColor, getScoreLabel } from '../utils/seoUtils';
import { colors, spacing, radius, typography } from '../theme';

export default function ContentAnalysisScreen() {
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState<TrackedKeyword[]>([]);
  const [content, setContent] = useState('');
  const [result, setResult] = useState<ContentAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadKeywords().then(setKeywords);
    }, [])
  );

  function handleAnalyze() {
    if (!content.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeContent(content, keywords));
      setAnalyzing(false);
    }, 600);
  }

  function handleClear() {
    setContent('');
    setResult(null);
  }

  const scoreColor = result ? getScoreColor(result.score) : colors.textLight;
  const scoreLabel = result ? getScoreLabel(result.score) : '';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Analyzer</Text>
        <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Info banner */}
        {keywords.length === 0 && (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={16} color={colors.accent} />
            <Text style={styles.infoText}>
              Add keywords in the Keyword Tracker first so the analyzer can find them in your content.
            </Text>
          </View>
        )}

        {/* Text input */}
        <Text style={styles.label}>Paste your blog post or web page content</Text>
        <TextInput
          style={styles.textArea}
          multiline
          placeholder="Paste your blog post, caption, or web page text here..."
          placeholderTextColor={colors.textLight}
          value={content}
          onChangeText={text => { setContent(text); setResult(null); }}
          textAlignVertical="top"
        />

        <View style={styles.inputMeta}>
          <Text style={styles.wordCount}>{content.trim() ? content.trim().split(/\s+/).length : 0} words</Text>
          <TouchableOpacity
            style={[styles.analyzeBtn, !content.trim() && styles.analyzeBtnDisabled]}
            onPress={handleAnalyze}
            disabled={!content.trim() || analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.analyzeBtnText}>Analyze SEO</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results */}
        {result && (
          <View style={styles.results}>
            {/* Score */}
            <View style={styles.scoreCard}>
              <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{result.score}</Text>
                <Text style={styles.scoreSlash}>/100</Text>
              </View>
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
                <Text style={styles.scoreDetail}>{result.wordCount} words</Text>
                {result.topKeyword && (
                  <Text style={styles.scoreDetail}>Top keyword: "{result.topKeyword}"</Text>
                )}
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendations</Text>
              {result.recommendations.map((rec, i) => (
                <View key={i} style={styles.recItem}>
                  <Ionicons
                    name={rec.includes('Great') ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={rec.includes('Great') ? '#5B8A5B' : colors.accent}
                  />
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>

            {/* Keywords found */}
            {result.keywordsFound.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Keywords Found</Text>
                {result.keywordsFound.map((kf, i) => (
                  <View key={i} style={styles.kwRow}>
                    <Text style={styles.kwName}>{kf.keyword}</Text>
                    <View style={styles.kwMeta}>
                      <View style={[styles.densityBar, { width: Math.min(kf.density * 20, 80) }]} />
                      <Text style={styles.kwCount}>{kf.count}x</Text>
                      <Text style={styles.kwDensity}>{kf.density.toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Missing keywords */}
            {result.keywordsFound.length === 0 && keywords.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tracked Keywords (not found)</Text>
                {keywords.slice(0, 5).map(k => (
                  <View key={k.id} style={styles.missingKw}>
                    <Ionicons name="close-circle" size={14} color="#D44533" />
                    <Text style={styles.missingKwText}>{k.keyword}</Text>
                  </View>
                ))}
                {keywords.length > 5 && (
                  <Text style={styles.moreText}>+{keywords.length - 5} more tracked keywords</Text>
                )}
              </View>
            )}

            {/* SEO Tips */}
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>Photography SEO Tips</Text>
              <Text style={styles.tipItem}>• Include your city/location + keyword (e.g. "Dallas newborn photographer")</Text>
              <Text style={styles.tipItem}>• Use keywords naturally in your first paragraph</Text>
              <Text style={styles.tipItem}>• Add alt text to all images with descriptive keywords</Text>
              <Text style={styles.tipItem}>• Blog posts should be 800–1,500+ words for best results</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  clearBtn: { padding: spacing.xs },
  clearBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: colors.accentLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  infoText: { ...typography.bodySmall, flex: 1, lineHeight: 18, color: colors.textMedium },
  label: { ...typography.label, marginBottom: -spacing.xs },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 180,
    ...typography.body,
    color: colors.textDark,
    lineHeight: 22,
  },
  inputMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -spacing.xs,
  },
  wordCount: { ...typography.bodySmall, color: colors.textLight },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minWidth: 120,
    alignItems: 'center',
  },
  analyzeBtnDisabled: { opacity: 0.4 },
  analyzeBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  results: { gap: spacing.md },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 26, fontWeight: '700' },
  scoreSlash: { fontSize: 11, color: colors.textLight, marginTop: -4 },
  scoreInfo: { flex: 1, gap: 4 },
  scoreLabel: { ...typography.h3 },
  scoreDetail: { ...typography.bodySmall },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { ...typography.h4, marginBottom: spacing.xs },
  recItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  recText: { ...typography.body, flex: 1, lineHeight: 20 },
  kwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  kwName: { ...typography.body, flex: 1, color: colors.textDark, fontWeight: '500' },
  kwMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  densityBar: {
    height: 6,
    backgroundColor: colors.primary + '66',
    borderRadius: 3,
    minWidth: 4,
  },
  kwCount: { ...typography.bodySmall, fontWeight: '600', minWidth: 24, textAlign: 'right' },
  kwDensity: { ...typography.bodySmall, color: colors.textLight, minWidth: 36, textAlign: 'right' },
  missingKw: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  missingKwText: { ...typography.body, color: colors.textMedium },
  moreText: { ...typography.bodySmall, color: colors.textLight, marginTop: spacing.xs },
  tipCard: {
    backgroundColor: colors.secondaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  tipTitle: { ...typography.h4, color: colors.secondary, marginBottom: spacing.xs },
  tipItem: { ...typography.bodySmall, lineHeight: 20, color: colors.textMedium },
});
