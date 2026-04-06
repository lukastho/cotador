import { useState, useCallback, useEffect } from 'react';
import { storageService, FishRecord } from '../services/storageService';

export const useFishRecords = () => {
  const [records, setRecords] = useState<FishRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const data = await storageService.getAllRecords();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar registros de peixes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (record: Omit<FishRecord, 'id' | 'date'>) => {
    const newRecord: FishRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      date: new Date().toISOString(),
    };

    try {
      await storageService.saveRecord(newRecord);
      await fetchRecords(); // Atualiza a lista após salvar
      return newRecord;
    } catch (err) {
      setError('Erro ao salvar novo registro.');
      throw err;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await storageService.deleteRecord(id);
      await fetchRecords();
    } catch (err) {
      setError('Erro ao deletar registro.');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    addRecord,
    deleteRecord,
    refreshRecords: fetchRecords,
  };
};
