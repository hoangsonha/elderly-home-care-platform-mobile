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
    backgroundColor: 'transparent',
    paddingTop: 4,
    paddingBottom: 20,
  },
  filtersScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#68C2E8',
    backgroundColor: 'white',
    gap: 8,
    elevation: 2,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
    elevation: 4,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  filterButtonText: {
    fontSize: 15,
    color: '#68C2E8',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  filterButtonTextActive: {
    color: 'white',
  },
});
