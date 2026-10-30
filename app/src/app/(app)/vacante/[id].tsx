import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useJobsStore } from '@/stores/jobs.store';
import { useAuthStore } from '@/stores/auth.store';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/schemas/job.schema';

function formatSalary(salary: number | null): string {
  if (salary === null) return 'Salario no especificado';
  return `$${salary.toLocaleString('es-MX')} MXN`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function VacanteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isApplied, isFavorited, addApplication, addFavorite, removeFavorite } = useJobsStore();
  const { isAuthenticated } = useAuthStore();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!id) {
        setError('ID de vacante no válido');
        setIsLoading(false);
        return;
      }

      const jobId = parseInt(id, 10);
      if (isNaN(jobId)) {
        setError('ID de vacante no válido');
        setIsLoading(false);
        return;
      }

      const result = await jobsService.getJobById(jobId);

      if (result.ok) {
        setJob(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
    }

    loadJob();
  }, [id]);

  const applied = job ? isApplied(job.id) : false;
  const favorited = job ? isFavorited(job.id) : false;

  const handleApply = useCallback(async () => {
    if (!job) return;

    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    if (applied) {
      Alert.alert('Ya aplicaste', 'Ya has aplicado a esta vacante');
      return;
    }

    setIsApplying(true);
    const result = await jobsService.applyToJob(job.id);
    setIsApplying(false);

    if (result.ok) {
      addApplication(job.id);
      Alert.alert('Éxito', 'Tu aplicación ha sido registrada');
    } else {
      Alert.alert('Error', result.error.message);
    }
  }, [isAuthenticated, applied, job, addApplication]);

  const handleToggleFavorite = useCallback(async () => {
    if (!job) return;

    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    setIsTogglingFavorite(true);

    if (favorited) {
      const result = await jobsService.removeFavorite(job.id);
      if (result.ok) {
        removeFavorite(job.id);
      } else {
        Alert.alert('Error', result.error.message);
      }
    } else {
      const result = await jobsService.addFavorite(job.id);
      if (result.ok) {
        addFavorite(job.id);
      } else {
        Alert.alert('Error', result.error.message);
      }
    }

    setIsTogglingFavorite(false);
  }, [isAuthenticated, favorited, job, addFavorite, removeFavorite]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando vacante...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error || 'Vacante no encontrada'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: job.title,
          headerBackTitle: 'Vacantes',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.company}>{job.company}</Text>
          <Text style={styles.date}>{formatDate(job.publishedAt)}</Text>
        </View>

        <Text style={styles.title}>{job.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.city}>📍 {job.city}</Text>
          <Text style={styles.salary}>{formatSalary(job.salary)}</Text>
        </View>

        <View style={styles.tags}>
          {job.tags.map((tag, index) => (
            <View style={styles.tag} key={`${tag}-${index}`}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{job.description}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.favoriteButton, favorited && styles.favoriteButtonActive]}
            onPress={handleToggleFavorite}
            disabled={isTogglingFavorite}
          >
            {isTogglingFavorite ? (
              <ActivityIndicator size="small" color={favorited ? '#FFFFFF' : '#0066CC'} />
            ) : (
              <Text style={[styles.favoriteText, favorited && styles.favoriteTextActive]}>
                {favorited ? '❤️ Favorito' : '🤍 Favorito'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.applyButton, applied && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={isApplying || applied}
          >
            {isApplying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.applyText}>{applied ? '✓ Aplicado' : 'Aplicar'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  company: {
    fontSize: 15,
    color: '#0066CC',
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  city: {
    fontSize: 15,
    color: '#666',
  },
  salary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 13,
    color: '#0066CC',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  favoriteButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFE0E0',
    borderColor: '#FF6B6B',
  },
  favoriteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  favoriteTextActive: {
    color: '#FF6B6B',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  applyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
