import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/TabNavigator';
import { useFishRecords } from '../hooks/useFishRecords';

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
  { id: '1', name: 'Iniciante', emoji: '🐣', description: 'Registre o seu primeiro peixe!', requiredCount: 1 },
  { id: '2', name: 'Aprendiz', emoji: '🎣', description: 'Registre 5 peixes diferentes.', requiredCount: 5 },
  { id: '3', name: 'Pescador', emoji: '🚣', description: 'Registre 10 peixes diferentes.', requiredCount: 10 },
  { id: '4', name: 'Veterano', emoji: '🏆', description: 'Registre 25 peixes diferentes.', requiredCount: 25 },
  { id: '5', name: 'Mestre Pescador', emoji: '🦈', description: 'Registre 50 peixes diferentes.', requiredCount: 50 },
  { id: '6', name: 'Lenda dos Mares', emoji: '🔱', description: 'Complete 100 registros na Peixedex!', requiredCount: 100 },
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
          <Text style={styles.welcomeText}>Bem-vindo ao Peixedex!</Text>
          <Text style={styles.statsText}>Descubra o mundo aquático ao seu redor.</Text>
        </View>

        {/* Sistema de Progressão */}
        <View style={styles.progressionCard}>
          <View style={styles.progressionHeader}>
            <Text style={styles.progressionTitle}>Sua Jornada</Text>
            <Text style={styles.progressionCount}>{registeredCount} / {TOTAL_FISH_GOAL}</Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>

          <Text style={styles.progressionText}>
            Você já descobriu {registeredCount} espécies de peixes!
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
              <Text style={styles.buttonTitle}>Identificar Novo Peixe</Text>
              <Text style={styles.buttonSubtitle}>Use a câmera para escanear</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={() => navigation.navigate('Peixedex')}
          >
            <Text style={styles.buttonEmoji}>📔</Text>
            <View style={styles.buttonTextContent}>
              <Text style={[styles.buttonTitle, styles.secondaryButtonTitle]}>Ver Minha Coleção</Text>
              <Text style={[styles.buttonSubtitle, styles.secondaryButtonSubtitle]}>Explore sua coleção salva</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Seção de Insígnias (Resumo) */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Suas Insígnias</Text>
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
    backgroundColor: '#F8FBFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  progressionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  progressionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0055CC',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E1E9F4',
    borderRadius: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0055CC',
    borderRadius: 6,
  },
  progressionText: {
    fontSize: 14,
    color: '#666',
  },
  badgeCard: {
    flexDirection: 'row',
    backgroundColor: '#0055CC',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  badgeDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 35,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#E6F0FF',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCE0FF',
  },
  secondaryActionButton: {
    backgroundColor: '#FFF',
    borderColor: '#E1E9F4',
  },
  buttonEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  buttonTextContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0055CC',
  },
  secondaryButtonTitle: {
    color: '#333',
  },
  buttonSubtitle: {
    fontSize: 13,
    color: '#5588DD',
    marginTop: 2,
  },
  secondaryButtonSubtitle: {
    color: '#777',
  },
  badgesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeChip: {
    width: '30%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E9F4',
  },
  lockedBadge: {
    backgroundColor: '#F5F5F5',
    borderColor: '#EEE',
  },
  badgeChipEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  lockedEmoji: {
    opacity: 0.3,
  },
  badgeChipName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  lockedText: {
    color: '#AAA',
  },
});

export default HomeScreen;
