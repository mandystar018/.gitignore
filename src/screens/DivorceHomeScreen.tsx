import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { DivorceStackParamList } from '../types';
import { divorcePhases, divorceSteps, getAllTasks } from '../data/divorceData';
import { loadProgress } from '../utils/divorceProgress';

type HomeNavProp = StackNavigationProp<DivorceStackParamList, 'DivorceHome'>;

interface Props {
  navigation: HomeNavProp;
}

const D = {
  primary: '#7B4F8C',
  primaryLight: '#F0E8F5',
  secondary: '#E8956A',
  secondaryLight: '#FDF0E8',
  accent: '#F4C842',
  accentLight: '#FEF8E0',
  success: '#5A9B6E',
  successLight: '#E5F2EA',
  background: '#FDF8F6',
  surface: '#FFFFFF',
  textDark: '#2C1A3A',
  textMedium: '#6B4C7A',
  textLight: '#A08AB0',
  border: '#EAE0F0',
};

export default function DivorceHomeScreen({ navigation }: Props) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [progressAnim] = useState(new Animated.Value(0));
  const allTasks = getAllTasks();

  useFocusEffect(
    useCallback(() => {
      loadProgress().then((p) => {
        setProgress(p);
      });
    }, []),
  );

  useEffect(() => {
    const completedCount = allTasks.filter((t) => progress[t.id]).length;
    const pct = allTasks.length > 0 ? completedCount / allTasks.length : 0;
    Animated.timing(progressAnim, {
      toValue: pct,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const completedCount = allTasks.filter((t) => progress[t.id]).length;
  const totalCount = allTasks.length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function phaseProgress(phaseId: string): { done: number; total: number; pct: number } {
    const steps = divorceSteps.filter((s) => s.phaseId === phaseId);
    const tasks = steps.flatMap((s) => s.tasks);
    const done = tasks.filter((t) => progress[t.id]).length;
    const total = tasks.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient colors={['#7B4F8C', '#9D72B0']} style={styles.header}>
        <Text style={styles.appTitle}>The Divorce Project Planner</Text>
        <Text style={styles.appSubtitle}>Your step-by-step guide to divorcing well</Text>
        <TouchableOpacity
          style={styles.timelineBtn}
          onPress={() => navigation.navigate('DivorceTimeline')}
          activeOpacity={0.8}
        >
          <Text style={styles.timelineBtnText}>📅  View Legal Timeline</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPct}>{overallPct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: barWidth, backgroundColor: overallPct === 100 ? D.success : D.primary },
              ]}
            />
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCount - completedCount}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalCount}</Text>
              <Text style={styles.statLabel}>Total Tasks</Text>
            </View>
          </View>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>YOUR PHASES</Text>

        {/* Phase Cards */}
        {divorcePhases.map((phase) => {
          const pp = phaseProgress(phase.id);
          return (
            <TouchableOpacity
              key={phase.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DivorcePhase', { phaseId: phase.id })}
            >
              <LinearGradient
                colors={phase.gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.phaseCard}
              >
                <View style={styles.phaseCardTop}>
                  <View style={styles.phaseIconBadge}>
                    <Text style={styles.phaseIcon}>{phase.icon}</Text>
                  </View>
                  <View style={styles.phaseCardText}>
                    <Text style={styles.phaseNumber}>PHASE {phase.number}</Text>
                    <Text style={styles.phaseTitle}>{phase.title}</Text>
                    <Text style={styles.phaseDuration}>{phase.duration}</Text>
                  </View>
                  <View style={styles.phaseArrow}>
                    <Text style={styles.phaseArrowText}>›</Text>
                  </View>
                </View>

                <View style={styles.phaseCardBottom}>
                  <View style={styles.phaseStepInfo}>
                    <Text style={styles.phaseStepCount}>
                      {phase.stepIds.length} {phase.stepIds.length === 1 ? 'Step' : 'Steps'}
                    </Text>
                    <Text style={styles.phaseTaskCount}>
                      {pp.done}/{pp.total} tasks
                    </Text>
                  </View>
                  <View style={styles.phaseProgressTrack}>
                    <View
                      style={[
                        styles.phaseProgressFill,
                        { width: `${pp.pct}%` },
                      ]}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            "The person who is more informed has a massive advantage."
          </Text>
        </View>

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandingText}>By Alicia Robertson</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.lemonadelife.ca')}>
            <Text style={styles.brandingLink}>www.lemonadelife.ca</Text>
          </TouchableOpacity>
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
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    marginBottom: 16,
  },
  timelineBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  timelineBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: D.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: D.textDark,
  },
  progressPct: {
    fontSize: 28,
    fontWeight: '800',
    color: D.primary,
  },
  progressTrack: {
    height: 10,
    backgroundColor: D.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: D.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: D.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: D.border,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: D.textLight,
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 4,
  },
  phaseCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  phaseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  phaseIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  phaseIcon: {
    fontSize: 26,
  },
  phaseCardText: {
    flex: 1,
  },
  phaseNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  phaseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  phaseDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  phaseArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseArrowText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  phaseCardBottom: {
    gap: 6,
  },
  phaseStepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  phaseStepCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  phaseTaskCount: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  phaseProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 3,
  },
  quoteCard: {
    backgroundColor: D.accentLight,
    borderRadius: 14,
    padding: 20,
    marginTop: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: D.accent,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: D.textDark,
    lineHeight: 22,
  },
  branding: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 8,
  },
  brandingText: {
    fontSize: 13,
    color: D.textLight,
  },
  brandingLink: {
    fontSize: 13,
    color: D.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
