import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DivorceStackParamList } from '../types';
import {
  getPhaseById,
  getStepById,
  EmbeddedQuiz,
  QuizResult,
} from '../data/divorceData';
import { loadProgress, saveProgress, toggleTask } from '../utils/divorceProgress';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type StepNavProp = StackNavigationProp<DivorceStackParamList, 'DivorceStep'>;
type StepRouteProp = RouteProp<DivorceStackParamList, 'DivorceStep'>;

interface Props {
  navigation: StepNavProp;
  route: StepRouteProp;
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

// ─── Quiz Component ───────────────────────────────────────────────────────────

function QuizSection({ quiz }: { quiz: EmbeddedQuiz }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  function selectAnswer(questionIndex: number, points: number) {
    const updated = { ...answers, [questionIndex]: points };
    setAnswers(updated);
    // auto-score once all questions answered
    if (Object.keys(updated).length === totalQuestions) {
      const total = Object.values(updated).reduce((a, b) => a + b, 0);
      const found = quiz.results.find(
        (r) => total >= r.minPoints && total <= r.maxPoints,
      );
      if (found) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setResult(found);
      }
    } else {
      setResult(null);
    }
  }

  function resetQuiz() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAnswers({});
    setResult(null);
  }

  return (
    <View style={quizStyles.container}>
      <View style={quizStyles.header}>
        <Text style={quizStyles.title}>{quiz.title}</Text>
        <Text style={quizStyles.progress}>
          {answeredCount}/{totalQuestions} answered
        </Text>
      </View>

      {quiz.questions.map((q, qi) => (
        <View key={qi} style={quizStyles.questionBlock}>
          <Text style={quizStyles.questionText}>
            {qi + 1}. {q.text}
          </Text>
          {q.options.map((opt, oi) => {
            const isSelected = answers[qi] === opt.points;
            return (
              <TouchableOpacity
                key={oi}
                style={[
                  quizStyles.optionBtn,
                  isSelected && quizStyles.optionBtnSelected,
                ]}
                onPress={() => selectAnswer(qi, opt.points)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    quizStyles.optionDot,
                    isSelected && quizStyles.optionDotSelected,
                  ]}
                >
                  {isSelected && <View style={quizStyles.optionDotInner} />}
                </View>
                <Text
                  style={[
                    quizStyles.optionText,
                    isSelected && quizStyles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {result && (
        <View style={quizStyles.resultCard}>
          <Text style={quizStyles.resultTitle}>{result.title}</Text>
          <Text style={quizStyles.resultDesc}>{result.description}</Text>
          {quiz.note && (
            <View style={quizStyles.noteBox}>
              <Text style={quizStyles.noteText}>⚠️  {quiz.note}</Text>
            </View>
          )}
          <TouchableOpacity style={quizStyles.retakeBtn} onPress={resetQuiz}>
            <Text style={quizStyles.retakeBtnText}>Retake Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const quizStyles = StyleSheet.create({
  container: {
    backgroundColor: D.primaryLight,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: D.primary,
    flex: 1,
    marginRight: 8,
  },
  progress: {
    fontSize: 12,
    color: D.textLight,
    fontWeight: '600',
  },
  questionBlock: {
    marginBottom: 18,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: D.textDark,
    lineHeight: 20,
    marginBottom: 10,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: D.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: D.border,
    gap: 10,
  },
  optionBtnSelected: {
    borderColor: D.primary,
    backgroundColor: '#F8F0FF',
  },
  optionDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: D.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  optionDotSelected: {
    borderColor: D.primary,
  },
  optionDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: D.primary,
  },
  optionText: {
    fontSize: 13,
    color: D.textMedium,
    flex: 1,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: D.primary,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: D.success,
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  resultDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  noteBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  noteText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  retakeBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  retakeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

// ─── Collapsible Info Section ─────────────────────────────────────────────────

function CollapsibleSection({
  title,
  content,
  phaseColor,
}: {
  title: string;
  content: string | string[];
  phaseColor: string;
}) {
  const [open, setOpen] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  function toggle() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotation, {
      toValue: open ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setOpen((v) => !v);
  }

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const items = typeof content === 'string' ? [content] : content;

  return (
    <View style={collStyles.container}>
      <TouchableOpacity style={collStyles.header} onPress={toggle} activeOpacity={0.7}>
        <View style={[collStyles.accent, { backgroundColor: phaseColor }]} />
        <Text style={collStyles.title}>{title}</Text>
        <Animated.Text style={[collStyles.chevron, { transform: [{ rotate }] }]}>
          ›
        </Animated.Text>
      </TouchableOpacity>
      {open && (
        <View style={collStyles.body}>
          {items.map((item, i) => (
            <View key={i} style={collStyles.itemRow}>
              <Text style={collStyles.bullet}>•</Text>
              <Text style={collStyles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const collStyles = StyleSheet.create({
  container: {
    backgroundColor: D.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: D.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: D.textDark,
  },
  chevron: {
    fontSize: 20,
    color: D.textLight,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: D.textLight,
    lineHeight: 22,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: D.textMedium,
    lineHeight: 21,
  },
});

// ─── Main Step Screen ─────────────────────────────────────────────────────────

export default function DivorceStepScreen({ navigation, route }: Props) {
  const { phaseId, stepId } = route.params;
  const phase = getPhaseById(phaseId);
  const step = getStepById(stepId);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      loadProgress().then(setProgress);
    }, []),
  );

  if (!step || !phase) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 24, color: D.textMedium }}>Step not found.</Text>
      </View>
    );
  }

  async function handleToggle(taskId: string) {
    const current = !!progress[taskId];
    const updated = toggleTask(taskId, current, progress);
    setProgress(updated);
    await saveProgress(updated);
  }

  const completedCount = step.tasks.filter((t) => progress[t.id]).length;
  const totalCount = step.tasks.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const phaseColor = phase.color;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={phase.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>‹  Back</Text>
        </TouchableOpacity>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>STEP {step.number}</Text>
        </View>
        <Text style={styles.stepIcon}>{step.icon}</Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{step.summary}</Text>
        </View>

        {/* Tasks Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Tasks</Text>
            <View style={styles.taskProgressPill}>
              <Text style={styles.taskProgressText}>
                {completedCount}/{totalCount} done
              </Text>
            </View>
          </View>

          {/* Task Progress Bar */}
          <View style={styles.taskProgressTrack}>
            <View
              style={[
                styles.taskProgressFill,
                {
                  width: `${pct}%`,
                  backgroundColor: pct === 100 ? '#5A9B6E' : phaseColor,
                },
              ]}
            />
          </View>

          {/* Task Items */}
          {step.tasks.map((task) => {
            const done = !!progress[task.id];
            return (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onPress={() => handleToggle(task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    done && { backgroundColor: phaseColor, borderColor: phaseColor },
                  ]}
                >
                  {done && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.taskText,
                    done && styles.taskTextDone,
                  ]}
                >
                  {task.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Sections */}
        {step.infoSections && step.infoSections.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Information</Text>
            {step.infoSections.map((section, i) => (
              <CollapsibleSection
                key={i}
                title={section.title}
                content={section.content}
                phaseColor={phaseColor}
              />
            ))}
          </View>
        )}

        {/* Lawyer Questions */}
        {step.lawyerQuestions && step.lawyerQuestions.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Questions for Your Lawyer</Text>
            <View style={styles.lawyerCard}>
              <Text style={styles.lawyerCardIcon}>⚖️</Text>
              {step.lawyerQuestions.map((q, i) => (
                <View key={i} style={styles.lawyerQuestionRow}>
                  <Text style={styles.lawyerBullet}>›</Text>
                  <Text style={styles.lawyerQuestionText}>{q}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Embedded Quiz */}
        {step.quiz && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Quiz</Text>
            <QuizSection quiz={step.quiz} />
          </View>
        )}

        {/* Links */}
        {step.links && step.links.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Resources & Templates</Text>
            {step.links.map((link, i) => {
              const iconMap: Record<string, string> = {
                website: '🌐',
                template: '📄',
                resource: '📚',
              };
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.linkBtn}
                  onPress={() => Linking.openURL(link.url)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.linkIcon}>{iconMap[link.type] ?? '🔗'}</Text>
                  <Text style={styles.linkLabel}>{link.label}</Text>
                  <Text style={styles.linkArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Quote */}
        {step.quote && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>{step.quote}</Text>
          </View>
        )}
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
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 14,
  },
  backBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.2,
  },
  stepIcon: {
    fontSize: 36,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  summaryCard: {
    backgroundColor: D.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: D.accent,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryText: {
    fontSize: 15,
    color: D.textMedium,
    lineHeight: 23,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: D.textDark,
    marginBottom: 12,
  },
  taskProgressPill: {
    backgroundColor: D.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  taskProgressText: {
    fontSize: 12,
    fontWeight: '700',
    color: D.primary,
  },
  taskProgressTrack: {
    height: 6,
    backgroundColor: D.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: D.border,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: D.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    color: D.textDark,
    lineHeight: 21,
  },
  taskTextDone: {
    color: D.textLight,
    textDecorationLine: 'line-through',
  },
  lawyerCard: {
    backgroundColor: '#FDF0E8',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: D.secondary,
  },
  lawyerCardIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  lawyerQuestionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  lawyerBullet: {
    fontSize: 18,
    color: D.secondary,
    lineHeight: 22,
  },
  lawyerQuestionText: {
    flex: 1,
    fontSize: 14,
    color: D.textDark,
    lineHeight: 21,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: D.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: D.border,
    shadowColor: '#7B4F8C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    gap: 10,
  },
  linkIcon: {
    fontSize: 20,
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: D.primary,
  },
  linkArrow: {
    fontSize: 20,
    color: D.textLight,
    fontWeight: '600',
  },
  quoteCard: {
    backgroundColor: D.accentLight,
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: D.accent,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: D.textDark,
    lineHeight: 23,
  },
});
