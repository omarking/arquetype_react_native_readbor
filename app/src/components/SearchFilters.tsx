import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import type { JobFilters } from '@/schemas/job.schema';

interface SearchFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  cities: string[];
}

type SortOption = NonNullable<JobFilters['sort']>;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Más recientes' },
  { value: 'date_asc', label: 'Más antiguos' },
  { value: 'salary_desc', label: 'Mayor salario' },
  { value: 'salary_asc', label: 'Menor salario' },
  { value: 'relevance', label: 'Relevancia' },
];

export function SearchFilters({ filters, onFiltersChange, cities }: SearchFiltersProps) {
  const [salaryMin, setSalaryMin] = useState(filters.salary_min?.toString() || '');
  const [salaryMax, setSalaryMax] = useState(filters.salary_max?.toString() || '');

  const handleSearchChange = useCallback(
    (q: string) => {
      onFiltersChange({ q: q || undefined });
    },
    [onFiltersChange]
  );

  const handleCitySelect = useCallback(
    (city: string) => {
      onFiltersChange({ city: filters.city === city ? undefined : city });
    },
    [filters.city, onFiltersChange]
  );

  const handleSortChange = useCallback(
    (sort: SortOption) => {
      onFiltersChange({ sort });
    },
    [onFiltersChange]
  );

  const handleSalaryMinBlur = useCallback(() => {
    const value = salaryMin ? parseInt(salaryMin, 10) : undefined;
    if (value !== filters.salary_min) {
      onFiltersChange({ salary_min: value });
    }
  }, [salaryMin, filters.salary_min, onFiltersChange]);

  const handleSalaryMaxBlur = useCallback(() => {
    const value = salaryMax ? parseInt(salaryMax, 10) : undefined;
    if (value !== filters.salary_max) {
      onFiltersChange({ salary_max: value });
    }
  }, [salaryMax, filters.salary_max, onFiltersChange]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por título o empresa..."
        placeholderTextColor="#999"
        value={filters.q || ''}
        onChangeText={handleSearchChange}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.citiesScroll}
        contentContainerStyle={styles.citiesContent}
      >
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityChip,
              filters.city === city && styles.cityChipActive,
            ]}
            onPress={() => handleCitySelect(city)}
          >
            <Text
              style={[
                styles.cityChipText,
                filters.city === city && styles.cityChipTextActive,
              ]}
            >
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.salaryRow}>
        <View style={styles.salaryInputContainer}>
          <Text style={styles.salaryLabel}>Salario mín</Text>
          <TextInput
            style={styles.salaryInput}
            placeholder="$0"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={salaryMin}
            onChangeText={setSalaryMin}
            onBlur={handleSalaryMinBlur}
          />
        </View>
        <View style={styles.salaryInputContainer}>
          <Text style={styles.salaryLabel}>Salario máx</Text>
          <TextInput
            style={styles.salaryInput}
            placeholder="$∞"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={salaryMax}
            onChangeText={setSalaryMax}
            onBlur={handleSalaryMaxBlur}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContent}
      >
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortChip,
              filters.sort === option.value && styles.sortChipActive,
            ]}
            onPress={() => handleSortChange(option.value)}
          >
            <Text
              style={[
                styles.sortChipText,
                filters.sort === option.value && styles.sortChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
  },
  citiesScroll: {
    marginTop: 12,
  },
  citiesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  cityChipActive: {
    backgroundColor: '#0066CC',
  },
  cityChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
  },
  salaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  salaryInputContainer: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  salaryInput: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
  },
  sortScroll: {
    marginTop: 12,
  },
  sortContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  sortChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  sortChipTextActive: {
    color: '#0066CC',
  },
});
