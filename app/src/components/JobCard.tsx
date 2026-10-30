import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Job } from '@/schemas/job.schema';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
}

function formatSalary(salary: number | null): string {
  if (salary === null) return 'Salario no especificado';
  return `$${salary.toLocaleString('es-MX')} MXN`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

function JobCardComponent({ job, onPress }: JobCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(job)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.company}>{job.company}</Text>
        <Text style={styles.date}>{formatDate(job.publishedAt)}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>

      <View style={styles.details}>
        <Text style={styles.city}>📍 {job.city}</Text>
        <Text style={styles.salary}>{formatSalary(job.salary)}</Text>
      </View>

      <View style={styles.tags}>
        {job.tags.slice(0, 3).map((tag, index) => (
          <View style={styles.tag} key={`${tag}-${index}`}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {job.tags.length > 3 && (
          <Text style={styles.moreTags}>+{job.tags.length - 3}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const JobCard = memo(JobCardComponent);

const styles = StyleSheet.create({
  container: {
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
  header: {
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
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
    lineHeight: 22,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  city: {
    fontSize: 13,
    color: '#666',
  },
  salary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#0066CC',
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
    marginLeft: 4,
  },
});
