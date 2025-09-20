import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface DynamicMedicationListProps {
  medications: Medication[];
  onMedicationsChange: (medications: Medication[]) => void;
  maxItems?: number;
}

export function DynamicMedicationList({
  medications,
  onMedicationsChange,
  maxItems = 10,
}: DynamicMedicationListProps) {
  const addMedication = () => {
    if (medications.length < maxItems) {
      onMedicationsChange([
        ...medications,
        { name: '', dosage: '', frequency: '' },
      ]);
    }
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const newMedications = medications.filter((_, i) => i !== index);
      onMedicationsChange(newMedications);
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    onMedicationsChange(newMedications);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Thuốc đang sử dụng</ThemedText>
        {medications.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Ionicons name="add" size={20} color="#4ECDC4" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.medicationsContainer}>
        {medications.map((medication, index) => (
          <View key={index} style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <ThemedText style={styles.medicationNumber}>Thuốc {index + 1}</ThemedText>
              {medications.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedication(index)}
                >
                  <Ionicons name="remove" size={20} color="#dc3545" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Tên thuốc *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={medication.name}
                onChangeText={(text) => updateMedication(index, 'name', text)}
                placeholder="Ví dụ: Metformin"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Liều lượng *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={medication.dosage}
                onChangeText={(text) => updateMedication(index, 'dosage', text)}
                placeholder="Ví dụ: 500mg"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Tần suất *</ThemedText>
              <TextInput
                style={styles.textInput}
                value={medication.frequency}
                onChangeText={(text) => updateMedication(index, 'frequency', text)}
                placeholder="Ví dụ: 2 lần/ngày"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        ))}
      </View>

      {medications.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Nhấn nút + để thêm thuốc đang sử dụng
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
  medicationsContainer: {
    gap: 16,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#2c3e50',
    backgroundColor: 'white',
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
