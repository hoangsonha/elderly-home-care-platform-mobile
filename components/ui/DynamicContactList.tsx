import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
  useMyPhone?: boolean;
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
  const { user } = useAuth();
  
  const addContact = () => {
    if (contacts.length < maxItems) {
      onContactsChange([
        ...contacts,
        { name: '', relationship: '', phone: '', useMyPhone: false },
      ]);
    }
  };

  const removeContact = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    onContactsChange(newContacts);
  };

  const updateContact = (index: number, field: keyof Contact, value: string | boolean) => {
    const newContacts = [...contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    onContactsChange(newContacts);
  };

  const toggleUseMyPhone = (index: number) => {
    const newContacts = [...contacts];
    const useMyPhone = !newContacts[index].useMyPhone;
    newContacts[index] = { 
      ...newContacts[index], 
      useMyPhone,
      phone: useMyPhone ? (user?.phone || '') : ''
    };
    onContactsChange(newContacts);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Liên hệ khẩn cấp</ThemedText>
        {contacts.length < maxItems && (
          <TouchableOpacity style={styles.addButton} onPress={addContact}>
            <Ionicons name="add" size={20} color="#68C2E8" />
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
              
              {/* Option to use own phone */}
              <TouchableOpacity 
                style={styles.useMyPhoneOption}
                onPress={() => toggleUseMyPhone(index)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, contact.useMyPhone && styles.checkboxActive]}>
                  {contact.useMyPhone && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <ThemedText style={styles.useMyPhoneText}>
                  Dùng số điện thoại của tôi
                </ThemedText>
              </TouchableOpacity>
              
              <TextInput
                style={[styles.textInput, contact.useMyPhone && styles.textInputDisabled]}
                value={contact.phone}
                onChangeText={(text) => updateContact(index, 'phone', text)}
                placeholder={contact.useMyPhone ? "Số điện thoại của bạn" : "Ví dụ: 0901234567"}
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                editable={!contact.useMyPhone}
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
    borderColor: '#68C2E8',
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
    color: '#68C2E8',
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
    borderColor: '#E8EBED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2C3E50',
    backgroundColor: 'white',
  },
  textInputDisabled: {
    backgroundColor: '#F5F7FA',
    color: '#7F8C8D',
  },
  useMyPhoneOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E8EBED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'white',
  },
  checkboxActive: {
    backgroundColor: '#68C2E8',
    borderColor: '#68C2E8',
  },
  useMyPhoneText: {
    fontSize: 14,
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
});
