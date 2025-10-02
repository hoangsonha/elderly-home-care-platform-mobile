import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
}

interface DynamicContactListProps {
  contacts: Contact[];
  onContactsChange: (contacts: Contact[]) => void;
  maxItems?: number;
}

export function DynamicContactList({
  contacts,
  onContactsChange,
  maxItems = 5,
}: DynamicContactListProps) {
  const addContact = () => {
    if (contacts.length < maxItems) {
      onContactsChange([
        ...contacts,
        { name: '', relationship: '', phone: '' },
      ]);
    }
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    onContactsChange(newContacts);
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onContactsChange(newContacts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Liên hệ khẩn cấp</ThemedText>
        {contacts.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Ionicons name="add" size={20} color="#4ECDC4" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contactsContainer}>
        {contacts.map((contact, index) => (
          <View key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <ThemedText style={styles.contactNumber}>Liên hệ {index + 1}</ThemedText>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeContact(index)}
              >
                <Ionicons name="remove" size={20} color="#dc3545" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Họ tên</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <TextInput
                style={styles.textInput}
                value={contact.name}
                onChangeText={(text) => updateContact(index, 'name', text)}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Mối quan hệ</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <TextInput
                style={styles.textInput}
                value={contact.relationship}
                onChangeText={(text) => updateContact(index, 'relationship', text)}
                placeholder="Ví dụ: Con trai"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Số điện thoại</ThemedText>
                <ThemedText style={styles.requiredMark}>*</ThemedText>
              </View>
              <TextInput
                style={styles.textInput}
                value={contact.phone}
                onChangeText={(text) => updateContact(index, 'phone', text)}
                placeholder="Ví dụ: 0901234567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ))}
      </View>

      {contacts.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>
            Nhấn nút + để thêm liên hệ khẩn cấp
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
  contactsContainer: {
    gap: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactNumber: {
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  requiredMark: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc3545',
    marginLeft: 2,
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
