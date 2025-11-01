import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
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
  dosageAmount?: string;
  dosageUnit?: string;
  frequencyTimes?: string;
  frequencyUnit?: string;
  isConfirmed?: boolean;
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
  const [showFrequencyUnitPicker, setShowFrequencyUnitPicker] = useState(false);
  const [showDosageUnitPicker, setShowDosageUnitPicker] = useState(false);
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState<number>(-1);
  
  const frequencyUnits = [
    { value: 'ngày', label: 'Ngày' },
    { value: 'tuần', label: 'Tuần' },
    { value: 'tháng', label: 'Tháng' },
  ];

  const dosageUnits = [
    { value: 'mg', label: 'mg (milligram)' },
    { value: 'g', label: 'g (gram)' },
    { value: 'ml', label: 'ml (milliliter)' },
    { value: 'viên', label: 'viên' },
    { value: 'gói', label: 'gói' },
    { value: 'ống', label: 'ống' },
  ];

  const addMedication = () => {
    if (medications.length < maxItems) {
      onMedicationsChange([
        ...medications,
        { 
          name: '', 
          dosage: '', 
          frequency: '', 
          dosageAmount: '',
          dosageUnit: 'mg',
          frequencyTimes: '', 
          frequencyUnit: 'ngày', 
          isConfirmed: false 
        },
      ]);
    }
  };

  const confirmMedication = (index: number) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], isConfirmed: true };
    onMedicationsChange(newMedications);
  };

  const editMedication = (index: number) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], isConfirmed: false };
    onMedicationsChange(newMedications);
  };

  const isMedicationValid = (medication: Medication): boolean => {
    return !!(
      medication.name.trim() && 
      medication.dosageAmount?.trim() && 
      medication.frequencyTimes?.trim()
    );
  };

  const removeMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    onMedicationsChange(newMedications);
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = { ...newMedications[index], [field]: value };
    
    // Auto-generate dosage string
    if (field === 'dosageAmount' || field === 'dosageUnit') {
      const amount = field === 'dosageAmount' ? value : newMedications[index].dosageAmount || '';
      const unit = field === 'dosageUnit' ? value : newMedications[index].dosageUnit || 'mg';
      newMedications[index].dosage = amount ? `${amount}${unit}` : '';
    }
    
    // Auto-generate frequency string
    if (field === 'frequencyTimes' || field === 'frequencyUnit') {
      const times = field === 'frequencyTimes' ? value : newMedications[index].frequencyTimes || '';
      const unit = field === 'frequencyUnit' ? value : newMedications[index].frequencyUnit || 'ngày';
      newMedications[index].frequency = times ? `${times} lần/${unit}` : '';
    }
    
    onMedicationsChange(newMedications);
  };

  const handleSelectFrequencyUnit = (unit: string) => {
    if (selectedMedicationIndex >= 0) {
      updateMedication(selectedMedicationIndex, 'frequencyUnit', unit);
    }
    setShowFrequencyUnitPicker(false);
    setSelectedMedicationIndex(-1);
  };

  const handleSelectDosageUnit = (unit: string) => {
    if (selectedMedicationIndex >= 0) {
      updateMedication(selectedMedicationIndex, 'dosageUnit', unit);
    }
    setShowDosageUnitPicker(false);
    setSelectedMedicationIndex(-1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Thuốc đang sử dụng</ThemedText>
        {medications.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={addMedication}>
            <Ionicons name="add-circle" size={28} color="#68C2E8" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.medicationsContainer}>
        {medications.map((medication, index) => (
          <React.Fragment key={index}>
            <View style={[
              styles.medicationCard,
              medication.isConfirmed && styles.medicationCardConfirmed
            ]}>
              <View style={styles.medicationHeader}>
                <View style={styles.medicationHeaderLeft}>
                  <ThemedText style={styles.medicationNumber}>Thuốc {index + 1}</ThemedText>
                  {medication.isConfirmed && (
                    <View style={styles.confirmedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#68C2E8" />
                      <ThemedText style={styles.confirmedText}>Đã xác nhận</ThemedText>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedication(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>

            {medication.isConfirmed ? (
              // Confirmed view - Read only
              <View style={styles.confirmedContent}>
                <View style={styles.confirmedRow}>
                  <ThemedText style={styles.confirmedLabel}>Tên thuốc:</ThemedText>
                  <ThemedText style={styles.confirmedValue}>{medication.name}</ThemedText>
                </View>
                <View style={styles.confirmedRow}>
                  <ThemedText style={styles.confirmedLabel}>Liều lượng:</ThemedText>
                  <ThemedText style={styles.confirmedValue}>{medication.dosage}</ThemedText>
                </View>
                <View style={styles.confirmedRow}>
                  <ThemedText style={styles.confirmedLabel}>Tần suất:</ThemedText>
                  <ThemedText style={styles.confirmedValue}>{medication.frequency}</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => editMedication(index)}
                >
                  <Ionicons name="create-outline" size={18} color="#68C2E8" />
                  <ThemedText style={styles.editButtonText}>Chỉnh sửa</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              // Edit view
              <>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Tên thuốc</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <TextInput
                style={styles.textInput}
                value={medication.name}
                onChangeText={(text) => updateMedication(index, 'name', text)}
                placeholder="Ví dụ: Metformin"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Liều lượng</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <View style={styles.dosageRow}>
                <TextInput
                  style={[styles.textInput, styles.dosageAmountInput]}
                  value={medication.dosageAmount || ''}
                  onChangeText={(text) => updateMedication(index, 'dosageAmount', text)}
                  placeholder="Số lượng"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setSelectedMedicationIndex(index);
                      setShowDosageUnitPicker(true);
                    }}
                  >
                    <ThemedText style={styles.dropdownText}>
                      {medication.dosageUnit || 'mg'}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={16} color="#7F8C8D" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Tần suất</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <View style={styles.frequencyRow}>
                <TextInput
                  style={[styles.textInput, styles.frequencyTimesInput]}
                  value={medication.frequencyTimes || ''}
                  onChangeText={(text) => updateMedication(index, 'frequencyTimes', text)}
                  placeholder="Số lần"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
                <ThemedText style={styles.frequencyText}>lần/</ThemedText>
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                      setSelectedMedicationIndex(index);
                      setShowFrequencyUnitPicker(true);
                    }}
                  >
                    <ThemedText style={styles.dropdownText}>
                      {medication.frequencyUnit || 'ngày'}
                    </ThemedText>
                    <Ionicons name="chevron-down" size={16} color="#7F8C8D" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Confirm button */}
            {!medication.isConfirmed && (
              <TouchableOpacity 
                style={[
                  styles.confirmButton,
                  !isMedicationValid(medication) && styles.confirmButtonDisabled
                ]}
                onPress={() => confirmMedication(index)}
                disabled={!isMedicationValid(medication)}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <ThemedText style={styles.confirmButtonText}>Xác nhận thuốc này</ThemedText>
              </TouchableOpacity>
            )}
              </>
            )}
          </View>
            
            {/* Add button after each medication */}
            {index === medications.length - 1 && medication.isConfirmed && medications.length < maxItems && (
              <TouchableOpacity 
                style={styles.addAnotherButton}
                onPress={addMedication}
              >
                <Ionicons name="add-circle-outline" size={20} color="#68C2E8" />
                <ThemedText style={styles.addAnotherText}>Thêm thuốc khác</ThemedText>
              </TouchableOpacity>
            )}
          </React.Fragment>
        ))}
      </View>

      {medications.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Nhấn nút + để thêm thuốc đang sử dụng
          </ThemedText>
        </View>
      )}

      {/* Frequency Unit Picker Modal */}
      <Modal
        visible={showFrequencyUnitPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFrequencyUnitPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrequencyUnitPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <ThemedText style={styles.pickerTitle}>Chọn tần suất</ThemedText>
            </View>
            {frequencyUnits.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={styles.pickerOption}
                onPress={() => handleSelectFrequencyUnit(unit.value)}
              >
                <ThemedText style={styles.pickerOptionText}>{unit.label}</ThemedText>
                {selectedMedicationIndex >= 0 && 
                 medications[selectedMedicationIndex]?.frequencyUnit === unit.value && (
                  <Ionicons name="checkmark" size={20} color="#68C2E8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Dosage Unit Picker Modal */}
      <Modal
        visible={showDosageUnitPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDosageUnitPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDosageUnitPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <ThemedText style={styles.pickerTitle}>Chọn đơn vị</ThemedText>
            </View>
            {dosageUnits.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                style={styles.pickerOption}
                onPress={() => handleSelectDosageUnit(unit.value)}
              >
                <ThemedText style={styles.pickerOptionText}>{unit.label}</ThemedText>
                {selectedMedicationIndex >= 0 && 
                 medications[selectedMedicationIndex]?.dosageUnit === unit.value && (
                  <Ionicons name="checkmark" size={20} color="#68C2E8" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    padding: 4,
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
  medicationCardConfirmed: {
    backgroundColor: '#F0FFF4',
    borderColor: '#68C2E8',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  medicationNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confirmedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#68C2E8',
  },
  removeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requiredMark: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc3545',
    marginLeft: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8EBED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2C3E50',
    backgroundColor: 'white',
  },
  dosageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dosageAmountInput: {
    flex: 1,
    minWidth: 100,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  frequencyTimesInput: {
    flex: 1,
    minWidth: 80,
  },
  frequencyText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EBED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  dropdownText: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  addAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F6F3',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#68C2E8',
    borderStyle: 'dashed',
  },
  addAnotherText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#68C2E8',
    marginLeft: 8,
  },
  confirmedContent: {
    gap: 12,
  },
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    width: 100,
  },
  confirmedValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#68C2E8',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
});
