import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, CameraCapturedPicture } from 'expo-camera';
import { visionService, FishIdentification } from '../services/visionService';

const CameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedPhoto, setCapturedPhoto] = useState<CameraCapturedPicture | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FishIdentification | null>(null);
  const cameraRef = useRef<CameraView>(null);

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

  const usePhoto = async () => {
    if (!capturedPhoto) return;
    setLoading(true);
    try {
      const fish = await visionService.identifyFish(capturedPhoto.uri);
      setResult(fish);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível identificar o peixe.');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <SafeAreaView style={styles.resultContainer}>
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.name}</Text>
          <Text style={styles.resultScientific}>{result.scientificName}</Text>
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(result.rarity) }]}>
            <Text style={styles.rarityText}>{result.rarity}</Text>
          </View>
          <Text style={styles.resultDescription}>{result.description}</Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setResult(null);
              setCapturedPhoto(null);
            }}
          >
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (capturedPhoto) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedPhoto.uri }} style={styles.preview} />
        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Identificando peixe...</Text>
          </View>
        ) : (
          <View style={styles.confirmationControls}>
            <TouchableOpacity style={styles.confirmButton} onPress={usePhoto}>
              <Text style={styles.buttonText}>Usar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedPhoto(null)}>
              <Text style={styles.buttonText}>Tirar Outra</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

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
    justifyContent: 'center',
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
  resultContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    padding: 20,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultScientific: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 16,
  },
  rarityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  rarityText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultDescription: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  }
});

export default CameraScreen;
