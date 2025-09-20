import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../themed-text';

export const AddElderlyDemo: React.FC = () => {
  const handleNavigateToAddElderly = () => {
    router.push('/add-elderly');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="person-add" size={48} color="#4ECDC4" />
        </View>
        
        <ThemedText style={styles.title}>Tạo hồ sơ người già</ThemedText>
        <ThemedText style={styles.description}>
          Tạo hồ sơ chi tiết cho người già với đầy đủ thông tin y tế, nhu cầu chăm sóc và sở thích
        </ThemedText>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <ThemedText style={styles.featureText}>7 bước tạo hồ sơ</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <ThemedText style={styles.featureText}>Xem trước trước khi lưu</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <ThemedText style={styles.featureText}>Thông báo đẹp mắt</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#28a745" />
            <ThemedText style={styles.featureText}>Validation thông minh</ThemedText>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleNavigateToAddElderly}
        >
          <Ionicons name="add" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Bắt đầu tạo hồ sơ</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  features: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});


