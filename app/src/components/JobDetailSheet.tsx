import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useJobsStore } from '@/stores/jobs.store';
import { useAuthStore } from '@/stores/auth.store';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/schemas/job.schema';

interface JobDetailSheetProps {
  job: Job;
  onSwipe: (direction: 'left' | 'right') => void;
  canSwipeLeft: boolean;
  canSwipeRight: boolean;
}

const SWIPE_THRESHOLD = 80;

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

export function JobDetailSheet({
  job,
  onSwipe,
  canSwipeLeft,
  canSwipeRight,
}: JobDetailSheetProps) {
  const { isApplied, isFavorited, addApplication, removeApplication, addFavorite, removeFavorite } =
    useJobsStore();
  const { isAuthenticated } = useAuthStore();

  const [isApplying, setIsApplying] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const translateX = useSharedValue(0);
  const applied = isApplied(job.id);
  const favorited = isFavorited(job.id);

  const handleApply = useCallback(async () => {
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
      if (result.error.code === 'AUTH_REQUIRED' || result.error.code === 'TOKEN_EXPIRED') {
        router.push('/sign-in');
      } else {
        Alert.alert('Error', result.error.message);
      }
    }
  }, [isAuthenticated, applied, job.id, addApplication]);

  const handleToggleFavorite = useCallback(async () => {
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
        if (result.error.code === 'AUTH_REQUIRED' || result.error.code === 'TOKEN_EXPIRED') {
          router.push('/sign-in');
        } else {
          Alert.alert('Error', result.error.message);
        }
      }
    }

    setIsTogglingFavorite(false);
  }, [isAuthenticated, favorited, job.id, addFavorite, removeFavorite]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      const clampedX =
        Math.max(canSwipeLeft ? -150 : 0, Math.min(canSwipeRight ? 150 : 0, event.translationX));
      translateX.value = clampedX;
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD && canSwipeRight) {
        runOnJS(onSwipe)('right');
      } else if (event.translationX > SWIPE_THRESHOLD && canSwipeLeft) {
        runOnJS(onSwipe)('left');
      }
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
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

        <View style={styles.swipeHint}>
          {canSwipeLeft && <Text style={styles.swipeHintText}>← Anterior</Text>}
          <View style={styles.swipeHintSpacer} />
          {canSwipeRight && <Text style={styles.swipeHintText}>Siguiente →</Text>}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    marginBottom: 20,
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
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  swipeHintText: {
    fontSize: 13,
    color: '#999',
  },
  swipeHintSpacer: {
    flex: 1,
  },
});
