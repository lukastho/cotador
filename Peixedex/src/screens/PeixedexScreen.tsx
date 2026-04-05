import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  TextInput,
  Modal,
  ScrollView
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFishRecords } from '../hooks/useFishRecords';
import { FishRecord } from '../services/storageService';
import { RootTabParamList } from '../navigation/TabNavigator';
import { THEME } from '../theme';

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
      <Image
        source={{ uri: item.imageUri }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        cachePolicy="disk"
      />
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
            <Text style={styles.modalTitle}>FILTROS_</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeText}>FECHAR</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <Text style={styles.sectionTitle}>RARIDADE</Text>
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

            <Text style={styles.sectionTitle}>ORDENAR</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'date_desc' && styles.sortItemActive]}
                onPress={() => setSortOption('date_desc')}
              >
                <Text style={[styles.sortItemText, sortOption === 'date_desc' && styles.sortItemTextActive]}>MAIS RECENTE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'date_asc' && styles.sortItemActive]}
                onPress={() => setSortOption('date_asc')}
              >
                <Text style={[styles.sortItemText, sortOption === 'date_asc' && styles.sortItemTextActive]}>MAIS ANTIGA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'alpha_asc' && styles.sortItemActive]}
                onPress={() => setSortOption('alpha_asc')}
              >
                <Text style={[styles.sortItemText, sortOption === 'alpha_asc' && styles.sortItemTextActive]}>ALFABÉTICA (A-Z)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortItem, sortOption === 'alpha_desc' && styles.sortItemActive]}
                onPress={() => setSortOption('alpha_desc')}
              >
                <Text style={[styles.sortItemText, sortOption === 'alpha_desc' && styles.sortItemTextActive]}>ALFABÉTICA (Z-A)</Text>
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
        {records.length === 0 ? 'COLEÇÃO VAZIA_' : 'NADA ENCONTRADO_'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {records.length === 0
          ? 'COMECE SUA AVENTURA CAPTURANDO O SEU PRIMEIRO PEIXE.'
          : 'TENTE MUDAR OS FILTROS OU A SUA PESQUISA.'}
      </Text>
      {records.length === 0 && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Câmera')}
        >
          <Text style={styles.emptyButtonText}>ABRIR CÂMERA</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && records.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>COLEÇÃO_</Text>
            <Text style={styles.subtitle}>{records.length} REGISTROS</Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>⌛ FILTROS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="BUSCAR POR NOME OU ESPÉCIE..."
            placeholderTextColor={THEME.colors.textSecondary}
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
    backgroundColor: THEME.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.accent,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  filterButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  searchContainer: {
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: THEME.colors.card,
    padding: 14,
    borderRadius: 0,
    fontSize: 14,
    color: THEME.colors.text,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    fontWeight: '700',
  },
  listContent: {
    padding: 15,
    flexGrow: 1,
  },
  card: {
    width: ITEM_SIZE,
    backgroundColor: THEME.colors.card,
    borderRadius: 0,
    margin: 7.5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME.colors.border,
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  image: {
    width: '100%',
    height: ITEM_SIZE,
    backgroundColor: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  info: {
    padding: 12,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  rarityEmoji: {
    fontSize: 10,
    marginRight: 4,
  },
  rarityText: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
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
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: THEME.colors.shadow,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 25,
    maxHeight: '85%',
    borderTopWidth: 4,
    borderTopColor: THEME.colors.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  closeText: {
    color: THEME.colors.secondary,
    fontWeight: '900',
    fontSize: 16,
  },
  modalScroll: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    marginBottom: 15,
    marginTop: 10,
    letterSpacing: 2,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.card,
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: '#000',
  },
  filterChipText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: '#000',
    fontWeight: '900',
  },
  sortOptions: {
    gap: 12,
  },
  sortItem: {
    padding: 18,
    backgroundColor: THEME.colors.card,
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  sortItemActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#1E1E35',
  },
  sortItemText: {
    fontSize: 14,
    color: THEME.colors.text,
    fontWeight: '700',
  },
  sortItemTextActive: {
    color: THEME.colors.primary,
    fontWeight: '900',
  }
});

export default PeixedexScreen;
