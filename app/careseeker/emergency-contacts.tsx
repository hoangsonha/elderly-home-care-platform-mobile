import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { DynamicContactList } from '@/components/ui/DynamicContactList';
import { useEmergencyContact } from '@/contexts/EmergencyContactContext';

interface Contact {
  name: string;
  relationship: string;
  phone: string;
}

export default function EmergencyContactsScreen() {
  const { tempContacts, setTempContacts } = useEmergencyContact();
  const bottomNavPadding = useBottomNavPadding();
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Load contacts from context on mount
  useEffect(() => {
    if (tempContacts.length > 0) {
      setContacts(tempContacts);
    }
  }, []);

  const handleSave = () => {
    // Update context with new contacts
    setTempContacts(contacts);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Liên hệ khẩn cấp</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Quản lý danh sách liên hệ</ThemedText>
        </View>

        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavPadding }]}
      >
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#68C2E8" />
          <ThemedText style={styles.infoText}>
            Thêm các liên hệ khẩn cấp để được hỗ trợ kịp thời khi cần thiết
          </ThemedText>
        </View>

        <DynamicContactList
          contacts={contacts}
          onContactsChange={setContacts}
          maxItems={5}
        />

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <ThemedText style={styles.saveButtonText}>Lưu thay đổi</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <SimpleNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4FE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#68C2E8',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
    elevation: 2,
    shadowColor: '#68C2E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

