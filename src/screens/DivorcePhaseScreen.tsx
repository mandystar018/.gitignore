import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DivorceStackParamList } from '../types';
import { getPhaseById, getStepsByPhase, DivorceStep } from '../data/divorceData';
import { loadProgress } from '../utils/divorceProgress';

type PhaseNavProp = StackNavigationProp<DivorceStackParamList, 'DivorcePhase'>;
type PhaseRouteProp = RouteProp<DivorceStackParamList, 'DivorcePhase'>;

interface Props {
  navigation: PhaseNavProp;
  route: PhaseRouteProp;
}

const D = {
  primary: '#7B4F8C',
  primaryLight: '#F0E8F5',
  secondary: '#E8956A',
  background: '#FDF8F6',
  surface: '#FFFFFF',
  textDark: '#2C1A3A',
  textMedium: '#6B4C7A',
  textLight: '#A08AB0',
  border: '#EAE0F0',
  success: '#5A9B6E',
};

export default function DivorcePhaseScreen({ navigation, route }: Props) {
  const { phaseId } = route.params;
  const phase = getPhaseById(phaseId);
  const steps = getStepsByPhase(phaseId);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, []),
  );

  if (!phase) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Phase not found.</Text>
      </View>
    );
  }

  function stepProgress(step: DivorceStep): { done: number; total: number; pct: number } {
    const done = step.tasks.filter((t) => progress[t.id]).length;
    const total = step.tasks.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }

  const phaseDone = steps.flatMap((s) => s.tasks).filter((t) => progress[t.id]).length;
  const phaseTotal = steps.flatMap((s) => s.tasks).length;
  const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Phase Header */}
      <LinearGradient
        colors={phase.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹  Back</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.phaseIconCircle}>
            <Text style={styles.phaseIconText}>{phase.icon}</Text>
          </View>
          <Text style={styles.phaseNumberLabel}>PHASE {phase.number}</Text>
          <Text style={styles.phaseTitle}>{phase.title}</Text>
          <Text style={styles.phaseDuration}>{phase.duration}</Text>
        </View>

        {/* Phase Progress */}
        <View style={styles.headerProgress}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Phase Progress</Text>
            <Text style={styles.progressPct}>{phasePct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${phasePct}%` },
              ]}
            />
          </View>
          <Text style={styles.progressSub}>
            {phaseDone} of {phaseTotal} tasks completed
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{phase.description}</Text>
        </View>

        {/* Steps Label */}
        <Text style={styles.sectionLabel}>STEPS IN THIS PHASE</Text>

        {/* Step Cards */}
        {steps.map((step) => {
          const sp = stepProgress(step);
          const isComplete = sp.done === sp.total && sp.total > 0;
          return (
            <TouchableOpacity
              key={step.id}
              style={[styles.stepCard, isComplete && styles.stepCardComplete]}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('DivorceStep', { phaseId, stepId: step.id })
              }
            >
              <View style={styles.stepCardLeft}>
                <View
                  style={[
                    styles.stepIconCircle,
                    { backgroundColor: isComplete ? D.success : phase.color + '20' },
                  ]}
                >
                  <Text style={styles.stepIconText}>{step.icon}</Text>
                </View>
              </View>

              <View style={styles.stepCardMiddle}>
                <Text style={styles.stepNumberLabel}>STEP {step.number}</Text>
                <Text style={styles.stepTitle} numberOfLines={2}>
                  {step.title}
                </Text>
                <View style={styles.stepProgressRow}>
                  <View style={styles.stepProgressTrack}>
                    <View
                      style={[
                        styles.stepProgressFill,
                        {
                          width: `${sp.pct}%`,
                          backgroundColor: isComplete ? D.success : phase.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.stepProgressText}>
                    {sp.done}/{sp.total}
                  </Text>
                </View>
              </View>

              <View style={styles.stepCardRight}>
                {isComplete ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : (
                  <Text style={styles.stepArrow}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: D.background,
  },
  errorText: {
    margin: 24,
    fontSize: 16,
    color: D.textMedium,
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
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIconText: {
    fontSize: 34,
  },
  phaseNumberLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  phaseTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  phaseDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerProgress: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 4,
  },
  progressSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  descriptionCard: {
    backgroundColor: D.surface,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    color: D.textMedium,
    lineHeight: 23,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: D.textLight,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: D.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: D.border,
  },
  stepCardComplete: {
    borderColor: '#5A9B6E40',
    backgroundColor: '#F0F8F3',
  },
  stepCardLeft: {
    marginRight: 14,
  },
  stepIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 24,
  },
  stepCardMiddle: {
    flex: 1,
  },
  stepNumberLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: D.textLight,
    letterSpacing: 1,
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: D.textDark,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepProgressTrack: {
    flex: 1,
    height: 5,
    backgroundColor: D.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepProgressText: {
    fontSize: 12,
    color: D.textLight,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'right',
  },
  stepCardRight: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: D.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepArrow: {
    fontSize: 24,
    color: D.textLight,
    fontWeight: '600',
  },
});
