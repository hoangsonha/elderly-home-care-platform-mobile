import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface DynamicInputListProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  placeholder: string;
  title: string;
  maxItems?: number;
}

export function DynamicInputList({
  items,
  onItemsChange,
  placeholder,
  title,
  maxItems = 10,
}: DynamicInputListProps) {
  const addItem = () => {
    if (items.length < maxItems) {
      onItemsChange([...items, '']);
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onItemsChange(newItems);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {items.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Ionicons name="add" size={20} color="#4ECDC4" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.itemsContainer}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <TextInput
              style={styles.textInput}
              value={item}
              onChangeText={(text) => updateItem(index, text)}
              placeholder={placeholder}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(index)}
            >
              <Ionicons name="remove" size={20} color="#dc3545" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Nhấn nút + để thêm {title.toLowerCase()}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  itemsContainer: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
});
