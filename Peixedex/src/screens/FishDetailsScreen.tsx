import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { FishRecord } from '../services/storageService';

type FishDetailsRouteProp = RouteProp<{ params: { fish: FishRecord } }, 'params'>;

const FishDetailsScreen = () => {
  const route = useRoute<FishDetailsRouteProp>();
  const navigation = useNavigation();
  const { fish } = route.params;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Olha só o que eu pesquei! Um ${fish.popularName} (${fish.scientificName}). Capturado em ${new Date(fish.date).toLocaleDateString()} em ${fish.location}. #Peixedex`,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar sua descoberta.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>⬅️</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes do Peixe</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareIcon}>📤</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: fish.imageUri }} style={styles.mainImage} />

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.popularName}>{fish.popularName}</Text>
            <Text style={styles.scientificName}>{fish.scientificName}</Text>
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(fish.rarity) }]}>
              <Text style={styles.rarityText}>{fish.rarity}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍 LOCAL DA CAPTURA</Text>
              <Text style={styles.infoValue}>{fish.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📅 DATA DO REGISTRO</Text>
              <Text style={styles.infoValue}>{formatDate(fish.date)}</Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Sobre esta espécie</Text>
            <Text style={styles.descriptionText}>{fish.description}</Text>
          </View>

          {fish.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notas do Pescador</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>"{fish.notes}"</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.mainShareButton} onPress={handleShare}>
            <Text style={styles.mainShareButtonText}>Compartilhar Descoberta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'Comum': return '#4CAF50';
    case 'Raro': return '#2196F3';
    case 'Épico': return '#9C27B0';
    case 'Lendário': return '#FF9800';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 24,
  },
  mainImage: {
    width: '100%',
    height: 350,
    backgroundColor: '#F0F0F0',
  },
  content: {
    padding: 20,
    marginTop: -30,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  popularName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  scientificName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rarityText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#AAA',
    marginBottom: 4,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  descriptionSection: {
    marginBottom: 25,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  notesSection: {
    marginBottom: 35,
  },
  notesCard: {
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#0055CC',
  },
  notesText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
  },
  mainShareButton: {
    backgroundColor: '#0055CC',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  mainShareButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FishDetailsScreen;
