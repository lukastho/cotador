import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType, CameraCapturedPicture } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { visionService, FishIdentification } from '../services/visionService';
import { useFishRecords } from '../hooks/useFishRecords';
import { RootTabParamList } from '../navigation/TabNavigator';

type CameraScreenNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Câmera'>;

const CameraScreen = () => {
  const navigation = useNavigation<CameraScreenNavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FishIdentification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('Localização desconhecida'); // Simulado
  const cameraRef = useRef<CameraView>(null);

  const { addRecord } = useFishRecords();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Precisamos da sua permissão para usar a câmera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo || null);
    }
  };

  const identifyFish = async () => {
    if (!capturedPhoto) return;
    setLoading(true);
    try {
      const fish = await visionService.identifyFish(capturedPhoto.uri);
      setResult(fish);
      setShowModal(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível identificar o peixe.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !capturedPhoto) return;

    try {
      setLoading(true);
      await addRecord({
        popularName: result.name,
        scientificName: result.scientificName,
        rarity: result.rarity,
        description: result.description,
        imageUri: capturedPhoto.uri,
        location: location,
        notes: notes,
      });

      setShowModal(false);
      setResult(null);
      setCapturedPhoto(null);
      setNotes('');

      // Redireciona para a aba Peixedex
      navigation.navigate('Peixedex');

      Alert.alert('Sucesso!', 'Peixe registrado na sua coleção.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar o registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>

      {/* Preview da Foto Capturada */}
      {capturedPhoto && (
        <Modal visible={!!capturedPhoto && !showModal} transparent={false} animationType="slide">
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
            {loading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFF" />
                <Text style={styles.loadingText}>Identificando peixe...</Text>
              </View>
            ) : (
              <View style={styles.confirmationControls}>
                <TouchableOpacity style={styles.confirmButton} onPress={identifyFish}>
                  <Text style={styles.buttonText}>Usar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedPhoto(null)}>
                  <Text style={styles.buttonText}>Tirar Outra</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* Modal de Registro */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalHeader}>Novo Registro</Text>

              {capturedPhoto && (
                <Image source={{ uri: capturedPhoto.uri }} style={styles.modalImage} />
              )}

              {result && (
                <View style={styles.fishInfoContainer}>
                  <Text style={styles.label}>Espécie Identificada</Text>
                  <Text style={styles.fishName}>{result.name}</Text>
                  <Text style={styles.scientificName}>{result.scientificName}</Text>

                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(result.rarity) }]}>
                    <Text style={styles.rarityText}>{result.rarity}</Text>
                  </View>

                  <Text style={styles.label}>Localização</Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="Onde você pescou?"
                  />

                  <Text style={styles.label}>Notas Extras</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Adicione observações..."
                    multiline
                    numberOfLines={4}
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Salvar na Peixedex</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  flipButton: {
    padding: 15,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  flipText: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
  },
  placeholder: {
    width: 54,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFF',
    fontSize: 16,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  confirmationControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#f44336',
    padding: 18,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 20,
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  fishInfoContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  fishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0055CC',
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 10,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  rarityText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    gap: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#0055CC',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  }
});

export default CameraScreen;
