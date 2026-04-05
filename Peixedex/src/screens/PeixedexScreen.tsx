import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFishRecords } from '../hooks/useFishRecords';
import { FishRecord } from '../services/storageService';
import { RootTabParamList } from '../navigation/TabNavigator';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_SIZE = (width - 60) / COLUMN_COUNT;

type PeixedexScreenNavigationProp = StackNavigationProp<RootTabParamList, 'Peixedex'>;

type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc';
type RarityFilter = 'Todos' | 'Comum' | 'Raro' | 'Épico' | 'Lendário';

const PeixedexScreen = () => {
  const navigation = useNavigation<PeixedexScreenNavigationProp>();
  const { records, loading, refreshRecords } = useFishRecords();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('Todos');

  useFocusEffect(
    useCallback(() => {
      refreshRecords();
    }, [refreshRecords])
  );

  const filteredAndSortedRecords = useMemo(() => {
    let result = [...records];

    // Busca por nome
    if (searchQuery) {
      result = result.filter(record =>
        record.popularName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por raridade
    if (rarityFilter !== 'Todos') {
      result = result.filter(record => record.rarity === rarityFilter);
    }

    // Ordenação
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'alpha_asc':
          return a.popularName.localeCompare(b.popularName);
        case 'alpha_desc':
          return b.popularName.localeCompare(a.popularName);
        default:
          return 0;
      }
    });

    return result;
  }, [records, searchQuery, sortOption, rarityFilter]);

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
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FishDetails', { fish: item })}
    >
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

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilters(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros e Ordenação</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeText}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.sectionTitle}>Raridade</Text>
            <View style={styles.filterOptions}>
              {['Todos', 'Comum', 'Raro', 'Épico', 'Lendário'].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.filterChip, rarityFilter === r && styles.filterChipActive]}
                  onPress={() => setRarityFilter(r as RarityFilter)}
                >
                  <Text style={[styles.filterChipText, rarityFilter === r && styles.filterChipTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ordenar por</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'date_desc' && styles.sortItemActive]}
                onPress={() => setSortOption('date_desc')}
              >
                <Text style={styles.sortItemText}>Data de Captura (Mais recente)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'date_asc' && styles.sortItemActive]}
                onPress={() => setSortOption('date_asc')}
              >
                <Text style={styles.sortItemText}>Data de Captura (Mais antiga)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'alpha_asc' && styles.sortItemActive]}
                onPress={() => setSortOption('alpha_asc')}
              >
                <Text style={styles.sortItemText}>Ordem Alfabética (A-Z)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'alpha_desc' && styles.sortItemActive]}
                onPress={() => setSortOption('alpha_desc')}
              >
                <Text style={styles.sortItemText}>Ordem Alfabética (Z-A)</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🎣</Text>
      <Text style={styles.emptyTitle}>
        {records.length === 0 ? 'Sua Peixedex está vazia!' : 'Nenhum peixe encontrado.'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {records.length === 0
          ? 'Comece sua aventura capturando o seu primeiro peixe agora mesmo.'
          : 'Tente mudar os filtros ou a sua pesquisa.'}
      </Text>
      {records.length === 0 && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Câmera')}
        >
          <Text style={styles.emptyButtonText}>Abrir Câmera</Text>
        </TouchableOpacity>
      )}
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Minha Coleção</Text>
            <Text style={styles.subtitle}>{records.length} peixes descobertos</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>⌛ Filtros</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou espécie..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={filteredAndSortedRecords}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F5FF',
    borderWidth: 1,
    borderColor: '#D0E0FF',
  },
  filterButtonText: {
    color: '#0055CC',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: '#F2F4F7',
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
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
    marginTop: 50,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeText: {
    color: '#0055CC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalScroll: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    marginTop: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  filterChipActive: {
    backgroundColor: '#0055CC',
    borderColor: '#0055CC',
  },
  filterChipText: {
    color: '#666',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  sortOptions: {
    gap: 10,
  },
  sortItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  sortItemActive: {
    borderColor: '#0055CC',
    backgroundColor: '#F0F5FF',
  },
  sortItemText: {
    fontSize: 15,
    color: '#444',
  }
});

export default PeixedexScreen;
