import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/TabNavigator';
import { useFishRecords } from '../hooks/useFishRecords';
import { THEME } from '../theme';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Início'>;

const TOTAL_FISH_GOAL = 100;

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  requiredCount: number;
}

const BADGES: Badge[] = [
  { id: '1', name: 'INICIANTE', emoji: '🐣', description: 'Registre o seu primeiro peixe!', requiredCount: 1 },
  { id: '2', name: 'APRENDIZ', emoji: '🎣', description: 'Registre 5 peixes diferentes.', requiredCount: 5 },
  { id: '3', name: 'PESCADOR', emoji: '🚣', description: 'Registre 10 peixes diferentes.', requiredCount: 10 },
  { id: '4', name: 'VETERANO', emoji: '🏆', description: 'Registre 25 peixes diferentes.', requiredCount: 25 },
  { id: '5', name: 'MESTRE', emoji: '🦈', description: 'Registre 50 peixes diferentes.', requiredCount: 50 },
  { id: '6', name: 'LENDA', emoji: '🔱', description: 'Complete 100 registros na Peixedex!', requiredCount: 100 },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { records, refreshRecords } = useFishRecords();

  useFocusEffect(
    useCallback(() => {
      refreshRecords();
    }, [refreshRecords])
  );

  const registeredCount = records.length;
  const progressPercentage = Math.min((registeredCount / TOTAL_FISH_GOAL) * 100, 100);

  const unlockedBadges = BADGES.filter(badge => registeredCount >= badge.requiredCount);
  const currentBadge = unlockedBadges.length > 0 ? unlockedBadges[unlockedBadges.length - 1] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>BEM-VINDO AO</Text>
          <Text style={styles.brandText}>PEIXEDEX_</Text>
          <Text style={styles.statsText}>DESCUBRA O MUNDO AQUÁTICO.</Text>
        </View>

        {/* Sistema de Progressão */}
        <View style={styles.progressionCard}>
          <View style={styles.progressionHeader}>
            <Text style={styles.progressionTitle}>MISSÃO ATUAL</Text>
            <Text style={styles.progressionCount}>{registeredCount}/{TOTAL_FISH_GOAL}</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>

          <Text style={styles.progressionText}>
            VOCÊ JÁ DESCOBRIU {registeredCount} ESPÉCIES!
          </Text>
        </View>

        {/* Conquista Atual */}
        {currentBadge && (
          <View style={styles.badgeCard}>
            <View style={styles.badgeIconContainer}>
              <Text style={styles.badgeEmoji}>{currentBadge.emoji}</Text>
            </View>
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeLabel}>NÍVEL ATUAL</Text>
              <Text style={styles.badgeName}>{currentBadge.name}</Text>
              <Text style={styles.badgeDescription}>{currentBadge.description}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Câmera')}
          >
            <Text style={styles.buttonEmoji}>📸</Text>
            <View style={styles.buttonTextContent}>
              <Text style={styles.buttonTitle}>SCANEAR PEIXE</Text>
              <Text style={styles.buttonSubtitle}>INICIAR CÂMERA DE IA</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => navigation.navigate('Peixedex')}
          >
            <Text style={styles.buttonEmoji}>📔</Text>
            <View style={styles.buttonTextContent}>
              <Text style={[styles.buttonTitle, styles.secondaryButtonTitle]}>COLEÇÃO</Text>
              <Text style={[styles.buttonSubtitle, styles.secondaryButtonSubtitle]}>EXPLORAR SUA PEIXEDEX</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção de Insígnias */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>INSÍGNIAS_</Text>
          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => {
              const isUnlocked = registeredCount >= badge.requiredCount;
              return (
                <View key={badge.id} style={[styles.badgeChip, !isUnlocked && styles.lockedBadge]}>
                  <Text style={[styles.badgeChipEmoji, !isUnlocked && styles.lockedEmoji]}>
                    {isUnlocked ? badge.emoji : '🔒'}
                  </Text>
                  <Text style={[styles.badgeChipName, !isUnlocked && styles.lockedText]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 2,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: THEME.colors.primary,
    marginTop: -5,
    letterSpacing: -2,
    textShadowColor: THEME.colors.secondary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  statsText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },
  progressionCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  progressionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  progressionCount: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  progressBarBackground: {
    height: 16,
    backgroundColor: THEME.colors.background,
    borderRadius: 0,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: 0,
  },
  progressionText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.accent,
    borderRadius: 0,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
    letterSpacing: 1,
  },
  badgeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 35,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.primary,
    borderRadius: 0,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  secondaryActionButton: {
    backgroundColor: THEME.colors.secondary,
  },
  buttonEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  buttonTextContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  secondaryButtonTitle: {
    color: '#FFF',
  },
  buttonSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 2,
    fontWeight: '800',
  },
  secondaryButtonSubtitle: {
    color: 'rgba(255,255,255,0.6)',
  },
  badgesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: THEME.colors.text,
    marginBottom: 15,
    letterSpacing: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeChip: {
    width: '30%',
    backgroundColor: THEME.colors.card,
    borderRadius: 0,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  lockedBadge: {
    backgroundColor: '#111',
    borderColor: '#222',
  },
  badgeChipEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  lockedEmoji: {
    opacity: 0.2,
  },
  badgeChipName: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.text,
    letterSpacing: 1,
  },
  lockedText: {
    color: '#444',
  },
});

export default HomeScreen;
