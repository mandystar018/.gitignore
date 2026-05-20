import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ActivityCategory, MaterialType, LocationType, AgeRange } from '../types';
import { colors, spacing, radius, typography } from '../theme';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Quiz'>;
};

interface QuizOption {
  label: string;
  sublabel?: string;
  value: string | number;
  emoji?: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  emoji: string;
  multiSelect: boolean;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'ageRange',
    question: 'How old is your little one?',
    subtitle: "We'll match activities to their stage of development",
    emoji: '👶',
    multiSelect: false,
    options: [
      { label: '0 – 6 months', sublabel: 'Newborn', value: '0-6 months', emoji: '🌙' },
      { label: '6 – 12 months', sublabel: 'Young baby', value: '6-12 months', emoji: '🌱' },
      { label: '12 – 18 months', sublabel: 'Older baby', value: '12-18 months', emoji: '🌿' },
      { label: '18 – 24 months', sublabel: 'Young toddler', value: '18-24 months', emoji: '🌻' },
      { label: '2 – 3 years', sublabel: 'Toddler', value: '2-3 years', emoji: '🌳' },
      { label: '3 – 6 years', sublabel: 'Preschooler', value: '3-6 years', emoji: '🌈' },
    ],
  },
  {
    id: 'duration',
    question: 'How much time do you have?',
    subtitle: "We'll match activities to fit your schedule",
    emoji: '⏱️',
    multiSelect: false,
    options: [
      { label: 'Quick', sublabel: 'Up to 15 minutes', value: 15, emoji: '⚡' },
      { label: 'Medium', sublabel: 'Up to 30 minutes', value: 30, emoji: '☀️' },
      { label: 'About an hour', sublabel: '30–60 minutes', value: 60, emoji: '🌞' },
      { label: 'All day!', sublabel: 'Open-ended', value: 999, emoji: '🌈' },
    ],
  },
  {
    id: 'location',
    question: 'Where will you be?',
    subtitle: 'Indoor adventures or outdoor explorations?',
    emoji: '🗺️',
    multiSelect: false,
    options: [
      { label: 'Indoors', value: 'indoor', emoji: '🏠' },
      { label: 'Outdoors', value: 'outdoor', emoji: '🌳' },
      { label: 'Either works!', value: 'any', emoji: '✨' },
    ],
  },
];

export default function QuizScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    ageRange: null,
    duration: null,
    location: null,
  });
  const progressAnim = useRef(new Animated.Value(1 / QUESTIONS.length)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const question = QUESTIONS[currentIndex];

  const animateProgress = (toValue: number) => {
    Animated.spring(progressAnim, { toValue, friction: 8, useNativeDriver: false }).start();
  };

  const animateCard = (direction: 1 | -1, callback: () => void) => {
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: direction * -40, duration: 150, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: direction * 60, duration: 0, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
    setTimeout(callback, 120);
  };

  const selectOption = (value: string | number) => {
    const qId = question.id;
    if (question.multiSelect) {
      const current: any[] = answers[qId] || [];
      const exists = current.includes(value);
      setAnswers((prev) => ({
        ...prev,
        [qId]: exists ? current.filter((v) => v !== value) : [...current, value],
      }));
    } else {
      setAnswers((prev) => ({ ...prev, [qId]: value }));
    }
  };

  const isSelected = (value: string | number): boolean => {
    const qId = question.id;
    if (question.multiSelect) return (answers[qId] || []).includes(value);
    return answers[qId] === value;
  };

  const canProceed = (): boolean => {
    const qId = question.id;
    if (question.multiSelect) return true;
    return answers[qId] !== null && answers[qId] !== undefined;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (currentIndex < QUESTIONS.length - 1) {
      animateCard(1, () => setCurrentIndex((i) => i + 1));
      animateProgress((currentIndex + 2) / QUESTIONS.length);
    } else {
      navigation.navigate('Activities', {
        answers: {
          ageRange: (answers.ageRange ?? '3-6 years') as AgeRange,
          duration: answers.duration ?? 999,
          location: (answers.location ?? 'any') as LocationType | 'any',
          materials: [] as MaterialType[],
          categories: [] as ActivityCategory[],
        },
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateCard(-1, () => setCurrentIndex((i) => i - 1));
      animateProgress(currentIndex / QUESTIONS.length);
    } else {
      navigation.goBack();
    }
  };

  const handleSkip = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      animateCard(1, () => setCurrentIndex((i) => i + 1));
      animateProgress((currentIndex + 2) / QUESTIONS.length);
    } else {
      navigation.navigate('Activities', {
        answers: {
          ageRange: (answers.ageRange ?? '3-6 years') as AgeRange,
          duration: answers.duration ?? 999,
          location: (answers.location ?? 'any') as LocationType | 'any',
          materials: [] as MaterialType[],
          categories: [] as ActivityCategory[],
        },
      });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>{currentIndex + 1} of {QUESTIONS.length}</Text>
        </View>
        {question.multiSelect ? (
          <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <Animated.View style={[styles.questionCard, { transform: [{ translateX: cardAnim }] }]}>
        <Text style={styles.questionEmoji}>{question.emoji}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
      </Animated.View>

      <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.optionsContent} showsVerticalScrollIndicator={false}>
        {question.options.map((option) => {
          const selected = isSelected(option.value);
          const isCategoryQ = question.id === 'category';
          const catColor = isCategoryQ ? categoryColors[option.value as ActivityCategory] : colors.primary;

          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[styles.optionCard, selected && { borderColor: catColor, backgroundColor: catColor + '12' }]}
              onPress={() => selectOption(option.value)}
              activeOpacity={0.7}
            >
              {option.emoji && (
                <View style={[styles.optionEmojiBox, selected && { backgroundColor: catColor + '25' }]}>
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                </View>
              )}
              <View style={styles.optionTextGroup}>
                <Text style={[styles.optionLabel, selected && { color: catColor, fontWeight: '700' }]}>
                  {option.label}
                </Text>
                {option.sublabel && (
                  <Text style={styles.optionSublabel}>{option.sublabel}</Text>
                )}
              </View>
              {selected && (
                <View style={[styles.checkCircle, { backgroundColor: catColor }]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === QUESTIONS.length - 1 ? 'See Activities 🌱' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  backText: { fontSize: 18, color: colors.textDark },
  progressContainer: { flex: 1, alignItems: 'center', gap: 4 },
  progressTrack: {
    height: 6, width: '100%',
    backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressLabel: { ...typography.label, fontSize: 11 },
  skipText: { width: 40, textAlign: 'right', fontSize: 14, color: colors.textLight, fontWeight: '600' },
  questionCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  questionEmoji: { fontSize: 44, marginBottom: spacing.md },
  questionText: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  questionSubtitle: { ...typography.body, textAlign: 'center', lineHeight: 20 },
  optionsScroll: { flex: 1 },
  optionsContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2, borderColor: colors.border,
    gap: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 1,
  },
  optionEmojiBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  optionEmoji: { fontSize: 22 },
  optionTextGroup: { flex: 1 },
  optionLabel: { fontSize: 16, color: colors.textDark, fontWeight: '500' },
  optionSublabel: { fontSize: 12, color: colors.textLight, marginTop: 1 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: '700' },
  footer: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  nextButtonDisabled: { backgroundColor: colors.border, shadowOpacity: 0, elevation: 0 },
  nextButtonText: { fontSize: 17, fontWeight: '700', color: colors.white },
});
