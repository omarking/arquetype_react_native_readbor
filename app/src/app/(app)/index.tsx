import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useJobs } from '@/hooks/useJobs';
import { useJobsStore } from '@/stores/jobs.store';
import { JobCard } from '@/components/JobCard';
import { JobDetailSheet } from '@/components/JobDetailSheet';
import { SearchFilters } from '@/components/SearchFilters';
import type { Job } from '@/schemas/job.schema';

const CITIES = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Puebla',
  'Querétaro',
  'Mérida',
];

const PREFETCH_THRESHOLD = 3;

export default function JobsScreen() {
  const {
    jobs,
    isLoading,
    isLoadingMore,
    error,
    filters,
    setFilters,
    refresh,
    loadMore,
    hasMore,
  } = useJobs({ sort: 'date_desc', limit: 20 });

  const { selectedJob, setSelectedJob, clearSelectedJob } = useJobsStore();
  const [sheetIndex, setSheetIndex] = useState(-1);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const currentJobIndexRef = useRef<number>(0);

  const snapPoints = useMemo(() => ['60%', '100%'], []);

  const handleJobPress = useCallback(
    (job: Job) => {
      const index = jobs.findIndex((j) => j.id === job.id);
      currentJobIndexRef.current = index;
      setSelectedJob(job);
      bottomSheetRef.current?.snapToIndex(0);
    },
    [jobs, setSelectedJob]
  );

  const handleSheetClose = useCallback(() => {
    clearSelectedJob();
    setSheetIndex(-1);
  }, [clearSelectedJob]);

  const handleSwipeToJob = useCallback(
    (direction: 'left' | 'right') => {
      const currentIndex = currentJobIndexRef.current;
      const nextIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex >= 0 && nextIndex < jobs.length) {
        currentJobIndexRef.current = nextIndex;
        setSelectedJob(jobs[nextIndex]);

        if (hasMore && jobs.length - nextIndex <= PREFETCH_THRESHOLD) {
          loadMore();
        }
      }
    },
    [jobs, setSelectedJob, hasMore, loadMore]
  );

  const renderItem: ListRenderItem<Job> = useCallback(
    ({ item }) => <JobCard job={item} onPress={handleJobPress} />,
    [handleJobPress]
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#0066CC" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron vacantes</Text>
        <Text style={styles.emptySubtext}>Intenta con otros filtros</Text>
      </View>
    );
  }, [isLoading]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  const keyExtractor = useCallback((item: Job) => item.id.toString(), []);

  if (isLoading && jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando vacantes...</Text>
      </View>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        cities={CITIES}
      />

      <FlashList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading && jobs.length > 0} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleSheetClose}
        onChange={setSheetIndex}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          {selectedJob && (
            <JobDetailSheet
              job={selectedJob}
              onSwipe={handleSwipeToJob}
              canSwipeLeft={currentJobIndexRef.current > 0}
              canSwipeRight={currentJobIndexRef.current < jobs.length - 1}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
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
  listContent: {
    paddingVertical: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetIndicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
  },
  sheetContent: {
    paddingBottom: 40,
  },
});
