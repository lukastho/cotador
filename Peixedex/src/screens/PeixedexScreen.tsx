import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFishRecords } from '../hooks/useFishRecords';
import { FishRecord } from '../services/storageService';
import { RootTabParamList } from '../navigation/TabNavigator';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_SIZE = (width - 60) / COLUMN_COUNT;

type PeixedexScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Peixedex'>;

const PeixedexScreen = () => {
  const navigation = useNavigation<PeixedexScreenNavigationProp>();
  const { records, loading, refreshRecords } = useFishRecords();

  useFocusEffect(
    useCallback(() => {
      refreshRecords();
    }, [refreshRecords])
  );

  const getRarityEmoji = (rarity: string) => {
    switch (rarity) {
      case 'Comum': return '🟢';
      case 'Raro': return '🔵';
      case 'Épico': return '🟣';
      case 'Lendário': return '🟠';
      default: return '⚪';
    }
  };

  const renderItem = ({ item }: { item: FishRecord }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.popularName} numberOfLines={1}>{item.popularName}</Text>
        <View style={styles.rarityContainer}>
          <Text style={styles.rarityEmoji}>{getRarityEmoji(item.rarity)}</Text>
          <Text style={styles.rarityText}>{item.rarity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎣</Text>
      <Text style={styles.emptyTitle}>Sua Peixedex está vazia!</Text>
      <Text style={styles.emptySubtitle}>
        Comece sua aventura capturando o seu primeiro peixe agora mesmo.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Câmera')}
      >
        <Text style={styles.emptyButtonText}>Abrir Câmera</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && records.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0055CC" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minha Coleção</Text>
        <Text style={styles.subtitle}>{records.length} peixes descobertos</Text>
      </View>

      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E9F4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  card: {
    width: ITEM_SIZE,
    backgroundColor: '#FFF',
    borderRadius: 16,
    margin: 7.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: ITEM_SIZE,
    backgroundColor: '#EEE',
  },
  info: {
    padding: 10,
  },
  popularName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rarityEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  rarityText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#0055CC',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PeixedexScreen;
