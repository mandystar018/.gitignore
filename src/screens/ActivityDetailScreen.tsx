import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Image, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types';
import {
  colors, spacing, radius, typography,
  categoryColors, categoryEmojis, categoryGradients, categoryLabels,
} from '../theme';
import { getPhotos, savePhoto, deletePhoto } from '../utils/photoStorage';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'ActivityDetail'>;
  route: RouteProp<RootStackParamList, 'ActivityDetail'>;
};

const PHOTO_SIZE = (Dimensions.get('window').width - spacing.md * 2 - spacing.sm * 2) / 3;

const MATERIAL_ICONS: Record<string, string> = {
  household: '🏡', natural: '🍃', store: '🛍️',
};

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  easy: { color: '#5B8A5B', label: 'Easy', emoji: '🌱' },
  medium: { color: '#E8B84B', label: 'Medium', emoji: '🌻' },
  challenging: { color: '#C4714A', label: 'Challenging', emoji: '🌳' },
};

function getMaterialColor(type: string): string {
  if (type === 'household') return '#C4714A';
  if (type === 'natural') return '#7D9B76';
  return '#4A8FAA';
}

export default function ActivityDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { activity } = route.params;
  const catColor = categoryColors[activity.category];
  const catGradient = categoryGradients[activity.category];
  const diff = DIFFICULTY_CONFIG[activity.difficulty];

  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    getPhotos(activity.id).then(setPhotos);
  }, [activity.id]);

  const handleAddPhoto = useCallback(() => {
    Alert.alert(
      'Add a Memory',
      'How would you like to add a photo?',
      [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Library', onPress: () => pickImage('library') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [activity.id]);

  const pickImage = async (source: 'camera' | 'library') => {
    const permResult = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permResult.status !== 'granted') {
      Alert.alert(
        'Permission needed',
        source === 'camera'
          ? 'Please allow camera access in Settings to take photos.'
          : 'Please allow photo library access in Settings to add photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled && result.assets[0]?.uri) {
      try {
        const saved = await savePhoto(activity.id, result.assets[0].uri);
        setPhotos((prev) => [...prev, saved]);
      } catch {
        Alert.alert('Could not save photo', 'Please try again.');
      }
    }
  };

  const handleDeletePhoto = (uri: string) => {
    Alert.alert(
      'Remove Photo',
      'Remove this photo from your memories?',
      [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deletePhoto(activity.id, uri);
            setPhotos((prev) => prev.filter((u) => u !== uri));
          },
        },
        { text: 'Keep', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={catGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.heroBackBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.heroBackText}>←</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={styles.heroEmojiCircle}>
            <Text style={styles.heroEmoji}>{categoryEmojis[activity.category]}</Text>
          </View>
          <Text style={styles.heroCategory}>{categoryLabels[activity.category].toUpperCase()}</Text>
          <Text style={styles.heroTitle}>{activity.title}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>⏱ {activity.duration} min</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: diff.color + '50' }]}>
              <Text style={styles.heroBadgeText}>{diff.emoji} {diff.label}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {activity.location === 'indoor' ? '🏠 Indoor'
                  : activity.location === 'outdoor' ? '🌳 Outdoor' : '✨ Either'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{activity.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌱 Montessori Principle</Text>
          <View style={styles.principleBox}>
            <Text style={styles.principleText}>{activity.montessoriPrinciple}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧺 What You'll Need</Text>
          {activity.materials.map((material, index) => (
            <View key={index} style={styles.materialRow}>
              <View style={styles.materialIcon}>
                <Text style={styles.materialIconText}>{MATERIAL_ICONS[material.type]}</Text>
              </View>
              <Text style={styles.materialName}>{material.name}</Text>
              <View style={[styles.materialTypeBadge, { backgroundColor: getMaterialColor(material.type) + '20' }]}>
                <Text style={[styles.materialTypeText, { color: getMaterialColor(material.type) }]}>
                  {material.type}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📋 How To Do It</Text>
            <Text style={styles.sectionCount}>{activity.steps.length} steps</Text>
          </View>
          {activity.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: catColor }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Skills Developed</Text>
          <View style={styles.skillsWrap}>
            {activity.skills.map((skill, index) => (
              <View key={index} style={[styles.skillChip, { backgroundColor: catColor + '15' }]}>
                <Text style={[styles.skillText, { color: catColor }]}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Your Memories */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>📷 Your Memories</Text>
            {photos.length > 0 && (
              <Text style={styles.sectionCount}>{photos.length} photo{photos.length !== 1 ? 's' : ''}</Text>
            )}
          </View>
          <Text style={styles.photoSectionNote}>
            Photos of your child doing this activity — beautiful memories to look back on!
          </Text>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((uri) => (
                <TouchableOpacity
                  key={uri}
                  onLongPress={() => handleDeletePhoto(uri)}
                  activeOpacity={0.85}
                  style={styles.photoThumb}
                >
                  <Image source={{ uri }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.addPhotoBox, { borderColor: catColor + '60' }]}
            onPress={handleAddPhoto}
            activeOpacity={0.7}
          >
            <View style={[styles.addPhotoCircle, { backgroundColor: catColor + '18' }]}>
              <Text style={styles.addPhotoIcon}>📸</Text>
            </View>
            <Text style={[styles.addPhotoLabel, { color: catColor }]}>
              {photos.length === 0 ? 'Add your first photo' : 'Add another photo'}
            </Text>
            <Text style={styles.addPhotoHint}>
              {photos.length === 0 ? 'Tap to take or choose a photo' : 'Hold a photo to remove it'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: catColor }]}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Activities</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingBottom: spacing.lg, paddingHorizontal: spacing.lg },
  heroBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroBackText: { fontSize: 18, color: colors.white, fontWeight: '600' },
  heroContent: { alignItems: 'center' },
  heroEmojiCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroEmoji: { fontSize: 36 },
  heroCategory: {
    fontSize: 11, fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5, marginBottom: 4,
  },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: colors.white,
    textAlign: 'center', marginBottom: spacing.md, lineHeight: 32,
  },
  heroBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  heroBadge: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  descriptionBox: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  descriptionText: { ...typography.body, lineHeight: 22 },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h4, fontSize: 16 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionCount: { ...typography.label },
  principleBox: {
    backgroundColor: colors.accentLight, borderRadius: radius.md,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.accent,
  },
  principleText: { ...typography.body, fontStyle: 'italic', lineHeight: 22 },
  materialRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, gap: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  materialIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  materialIconText: { fontSize: 18 },
  materialName: { flex: 1, fontSize: 15, color: colors.textDark, fontWeight: '500' },
  materialTypeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  materialTypeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  stepRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  stepNumberText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  stepContent: {
    flex: 1, backgroundColor: colors.surface,
    borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  stepText: { fontSize: 15, color: colors.textDark, lineHeight: 22 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  skillText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  photoSectionNote: { ...typography.bodySmall, lineHeight: 18 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoThumb: {
    width: PHOTO_SIZE, height: PHOTO_SIZE,
    borderRadius: radius.md, overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  addPhotoBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  addPhotoCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  addPhotoIcon: { fontSize: 26 },
  addPhotoLabel: { fontSize: 15, fontWeight: '700' },
  addPhotoHint: { ...typography.bodySmall },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  backButton: { borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center' },
  backButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
