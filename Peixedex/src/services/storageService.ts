import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FishRecord {
  id: string;
  imageUri: string;
  popularName: string;
  scientificName: string;
  rarity: string;
  description: string;
  date: string;
  notes?: string;
  location: string;
}

const STORAGE_KEY = '@peixedex_records';

export const storageService = {
  saveRecord: async (record: FishRecord): Promise<void> => {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      const records: FishRecord[] = existingData ? JSON.parse(existingData) : [];
      records.push(record);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error saving fish record:', error);
      throw error;
    }
  },

  getAllRecords: async (): Promise<FishRecord[]> => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting fish records:', error);
      return [];
    }
  },

  deleteRecord: async (id: string): Promise<void> => {
    try {
      const existingData = await AsyncStorage.getItem(STORAGE_KEY);
      if (existingData) {
        const records: FishRecord[] = JSON.parse(existingData);
        const filteredRecords = records.filter((r) => r.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRecords));
      }
    } catch (error) {
      console.error('Error deleting fish record:', error);
      throw error;
    }
  },
};
