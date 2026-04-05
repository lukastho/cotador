import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../navigation/TabNavigator';

type HomeScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Início'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo ao Peixedex!</Text>
        <Text style={styles.statsText}>Você já registrou 15 peixes diferentes</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Câmera')}
        >
          <Text style={styles.buttonEmoji}>📸</Text>
          <Text style={styles.buttonTitle}>Identificar Novo Peixe</Text>
          <Text style={styles.buttonSubtitle}>Use a câmera para escanear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Peixedex')}
        >
          <Text style={styles.buttonEmoji}>📔</Text>
          <Text style={styles.buttonTitle}>Ver Minha Coleção</Text>
          <Text style={styles.buttonSubtitle}>Explore sua coleção salva</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statsText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  buttonContainer: {
    gap: 20,
  },
  actionButton: {
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#D0E5FF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0055CC',
  },
  buttonSubtitle: {
    fontSize: 14,
    color: '#5588DD',
    marginTop: 4,
  },
});

export default HomeScreen;
