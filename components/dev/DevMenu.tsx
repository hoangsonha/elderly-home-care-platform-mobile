import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

interface DevMenuProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Developer Menu for testing - Switch roles, clear data, etc
 * Only use in development
 */
export function DevMenu({ visible, onClose }: DevMenuProps) {
  const { user, switchRole } = useAuth();

  const handleSwitchToCaregiver = () => {
    switchRole('Caregiver');
    onClose();
  };

  const handleSwitchToCareSeeker = () => {
    switchRole('Care Seeker');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menu}>
          <View style={styles.header}>
            <Text style={styles.title}>Dev Menu</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Role: {user?.role}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Switch Role:</Text>
            
            <TouchableOpacity 
              style={[styles.button, user?.role === 'Care Seeker' && styles.activeButton]}
              onPress={handleSwitchToCareSeeker}
            >
              <Ionicons name="person" size={20} color={user?.role === 'Care Seeker' ? '#fff' : '#2DC2D7'} />
              <Text style={[styles.buttonText, user?.role === 'Care Seeker' && styles.activeButtonText]}>
                Care Seeker
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, user?.role === 'Caregiver' && styles.activeButton]}
              onPress={handleSwitchToCaregiver}
            >
              <Ionicons name="medkit" size={20} color={user?.role === 'Caregiver' ? '#fff' : '#2DC2D7'} />
              <Text style={[styles.buttonText, user?.role === 'Caregiver' && styles.activeButtonText]}>
                Caregiver
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Development Only</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F9FF',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#2DC2D7',
  },
  activeButton: {
    backgroundColor: '#2DC2D7',
    borderColor: '#2DC2D7',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2DC2D7',
    marginLeft: 12,
  },
  activeButtonText: {
    color: '#fff',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
