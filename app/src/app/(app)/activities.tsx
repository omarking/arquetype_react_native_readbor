import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useJobsStore } from '@/stores/jobs.store';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/schemas/job.schema';

type Tab = 'applications' | 'favorites';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ActivitiesScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('applications');
  const [applications, setApplications] = useState<Job[]>([]);
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { removeApplication, removeFavorite, setApplications: setStoreApplications, setFavorites: setStoreFavorites } =
    useJobsStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [appsResult, favsResult] = await Promise.all([
      jobsService.getApplications(),
      jobsService.getFavorites(),
    ]);

    if (appsResult.ok) {
      setApplications(appsResult.data);
      setStoreApplications(appsResult.data.map((j) => j.id));
    }

    if (favsResult.ok) {
      setFavorites(favsResult.data);
      setStoreFavorites(favsResult.data.map((j) => j.id));
    }

    if (!appsResult.ok && !favsResult.ok) {
      setError('Error al cargar datos');
    }

    setIsLoading(false);
  }, [setStoreApplications, setStoreFavorites]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelApplication = useCallback(
    async (jobId: number) => {
      Alert.alert(
        'Cancelar aplicación',
        '¿Estás seguro de que quieres cancelar esta aplicación?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: async () => {
              const result = await jobsService.cancelApplication(jobId);
              if (result.ok) {
                setApplications((prev) => prev.filter((j) => j.id !== jobId));
                removeApplication(jobId);
              } else {
                Alert.alert('Error', result.error.message);
              }
            },
          },
        ]
      );
    },
    [removeApplication]
  );

  const handleRemoveFavorite = useCallback(
    async (jobId: number) => {
      const result = await jobsService.removeFavorite(jobId);
      if (result.ok) {
        setFavorites((prev) => prev.filter((j) => j.id !== jobId));
        removeFavorite(jobId);
      } else {
        Alert.alert('Error', result.error.message);
      }
    },
    [removeFavorite]
  );

  const renderApplicationItem: ListRenderItem<Job> = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.city}>📍 {item.city}</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelApplication(item.id)}
        >
          <Text style={styles.cancelText}>Cancelar aplicación</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleCancelApplication]
  );

  const renderFavoriteItem: ListRenderItem<Job> = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.date}>{formatDate(item.publishedAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.city}>📍 {item.city}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Text style={styles.removeText}>Eliminar de favoritos</Text>
        </TouchableOpacity>
      </View>
    ),
    [handleRemoveFavorite]
  );

  const keyExtractor = useCallback((item: Job) => item.id.toString(), []);

  const currentData = activeTab === 'applications' ? applications : favorites;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.tabActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.tabTextActive]}>
            Aplicaciones ({applications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
            Favoritos ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlashList
        data={currentData}
        renderItem={activeTab === 'applications' ? renderApplicationItem : renderFavoriteItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'applications'
                ? 'No has aplicado a ninguna vacante'
                : 'No tienes vacantes favoritas'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  city: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  cancelButton: {
    backgroundColor: '#FFF3F3',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  cancelText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#888',
  },
  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
