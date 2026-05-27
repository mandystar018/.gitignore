import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { DivorceStackParamList } from '../types';
import { divorceTimeline } from '../data/divorceData';

type TimelineNavProp = StackNavigationProp<DivorceStackParamList, 'DivorceTimeline'>;

interface Props {
  navigation: TimelineNavProp;
}

const D = {
  primary: '#7B4F8C',
  primaryLight: '#F0E8F5',
  accent: '#F4C842',
  accentLight: '#FEF8E0',
  background: '#FDF8F6',
  surface: '#FFFFFF',
  textDark: '#2C1A3A',
  textMedium: '#6B4C7A',
  textLight: '#A08AB0',
  border: '#EAE0F0',
};

export default function DivorceTimelineScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#2C1A3A', '#7B4F8C']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹  Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Legal Process Timeline</Text>
        <Text style={styles.headerSubtitle}>
          A typical overview of how long each stage takes
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Note at top */}
        <View style={styles.noteCard}>
          <Text style={styles.noteIcon}>ℹ️</Text>
          <Text style={styles.noteText}>
            Every divorce journey is unique. Timelines will vary based on your circumstances,
            jurisdiction, and level of agreement between parties.
          </Text>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {divorceTimeline.map((item, index) => {
            const isLast = index === divorceTimeline.length - 1;
            return (
              <View key={item.id} style={styles.timelineItem}>
                {/* Left column: dot + line */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: item.color }]}>
                    <View style={styles.dotInner} />
                  </View>
                  {!isLast && (
                    <View style={[styles.connector, { borderColor: item.color + '40' }]} />
                  )}
                </View>

                {/* Right column: card */}
                <View style={[styles.timelineCard, { borderLeftColor: item.color }]}>
                  <View style={[styles.durationPill, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.durationText, { color: item.color }]}>
                      {item.duration}
                    </Text>
                  </View>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineDesc}>{item.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Total estimate */}
        <View style={styles.totalCard}>
          <LinearGradient
            colors={['#7B4F8C', '#9D72B0']}
            style={styles.totalGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.totalLabel}>TYPICAL RANGE</Text>
            <Text style={styles.totalDuration}>5 Months – 5+ Years</Text>
            <Text style={styles.totalNote}>
              Amicable divorces with full agreement can resolve in as little as 5–6 months.
              High-conflict cases involving litigation can take several years.
            </Text>
          </LinearGradient>
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsSectionTitle}>Tips to Stay on Track</Text>
          {[
            'Be organized from Day 1 — gather financial documents early.',
            'Choose mediation or collaborative divorce if possible to save time and cost.',
            'Give your lawyer advance notice — last-minute requests add delays and cost.',
            'Stay focused on resolution, not retaliation.',
            'Keep children\'s wellbeing at the center of every decision.',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipBullet}>✓</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: D.background,
  },
  header: {
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: D.accentLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
    alignItems: 'flex-start',
  },
  noteIcon: {
    fontSize: 18,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: D.textMedium,
    lineHeight: 19,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 14,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  connector: {
    flex: 1,
    width: 2,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    minHeight: 20,
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: D.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  durationPill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: D.textDark,
    marginBottom: 6,
  },
  timelineDesc: {
    fontSize: 13,
    color: D.textMedium,
    lineHeight: 20,
  },
  totalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  totalGradient: {
    padding: 20,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  totalDuration: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  totalNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 19,
  },
  tipsCard: {
    backgroundColor: D.surface,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: D.border,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: D.textDark,
    marginBottom: 14,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 14,
    color: '#5A9B6E',
    fontWeight: '800',
    lineHeight: 21,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: D.textMedium,
    lineHeight: 21,
  },
});
