import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

export interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface SearchFiltersProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

export function SearchFilters({ filters, selectedFilter, onFilterChange }: SearchFiltersProps) {
  const renderFilterButton = (filter: FilterOption) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.filterButtonActive
      ]}
      onPress={() => onFilterChange(filter.id)}
    >
      <Ionicons
        name={filter.icon as any}
        size={16}
        color={selectedFilter === filter.id ? 'white' : '#667eea'}
      />
      <ThemedText
        style={[
          styles.filterButtonText,
          selectedFilter === filter.id && styles.filterButtonTextActive
        ]}
      >
        {filter.label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScrollContent}
      >
        {filters.map(renderFilterButton)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
    backgroundColor: 'white',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
});
