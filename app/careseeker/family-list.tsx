import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface Family {
  id: string;
  name: string;
  memberCount: number;
  elderlyCount: number;
  userRole: 'admin_family' | 'member';
  createdAt: string;
  description?: string;
}

interface FamilyMember {
  id: string;
  email: string;
  role: 'admin_family' | 'member';
}

interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  avatar?: string;
}

export default function FamilyListScreen() {
  const { user } = useAuth();
  
  // State for create family modal
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  
  // Mock data - in real app, this would come from API
  const [families, setFamilies] = useState<Family[]>([
    {
      id: '1',
      name: 'Gia đình Nguyễn',
      memberCount: 5,
      elderlyCount: 2,
      userRole: 'admin_family',
      createdAt: '2024-01-15',
      description: 'Gia đình đa thế hệ với ông bà và con cháu',
    },
    {
      id: '2',
      name: 'Gia đình Trần',
      memberCount: 3,
      elderlyCount: 1,
      userRole: 'member',
      createdAt: '2024-02-20',
      description: 'Gia đình nhỏ gọn, chăm sóc bà nội',
    },
    {
      id: '3',
      name: 'Gia đình Lê',
      memberCount: 8,
      elderlyCount: 3,
      userRole: 'member',
      createdAt: '2024-03-10',
      description: 'Gia đình lớn với nhiều thế hệ',
    },
  ]);

  const handleFamilyPress = (family: Family) => {
    router.push(`/careseeker/family-detail?id=${family.id}`);
  };

  const handleCreateFamily = () => {
    setShowCreateFamilyModal(true);
  };

  const handleAddMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      email: '',
      role: 'member',
    };
    setFamilyMembers([...familyMembers, newMember]);
  };

  const handleRemoveMember = (memberId: string) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== memberId));
  };

  const handleMemberEmailChange = (memberId: string, email: string) => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === memberId ? { ...member, email } : member
    ));
  };



  const handleCreateFamilySubmit = () => {
    if (!familyName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên gia đình!');
      return;
    }

    const newFamily: Family = {
      id: Date.now().toString(),
      name: familyName.trim(),
      memberCount: familyMembers.length + 1, // +1 for creator
      elderlyCount: 0,
      userRole: 'admin_family',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setFamilies([...families, newFamily]);
    setShowCreateFamilyModal(false);
    setFamilyName('');
    setFamilyMembers([]);
    
    Alert.alert('Thành công', 'Gia đình đã được tạo thành công!');
  };

  const handleCancelCreateFamily = () => {
    setShowCreateFamilyModal(false);
    setFamilyName('');
    setFamilyMembers([]);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin_family': return 'Quản trị viên';
      case 'member': return 'Thành viên';
      default: return 'Không xác định';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin_family': return '#dc3545';
      case 'member': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const renderFamilyCard = (family: Family) => (
    <TouchableOpacity
      key={family.id}
      style={styles.familyCard}
      onPress={() => handleFamilyPress(family)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.familyInfo}>
          <ThemedText style={styles.familyName}>{family.name}</ThemedText>
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(family.userRole) + '20' }]}>
              <ThemedText style={[styles.roleText, { color: getRoleColor(family.userRole) }]}>
                {getRoleText(family.userRole)}
              </ThemedText>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6c757d" />
      </View>

      {family.description && (
        <ThemedText style={styles.familyDescription} numberOfLines={2}>
          {family.description}
        </ThemedText>
      )}

      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color="#4ECDC4" />
          <ThemedText style={styles.statText}>
            {family.memberCount} thành viên
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="person" size={16} color="#ff6b6b" />
          <ThemedText style={styles.statText}>
            {family.elderlyCount} người già
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <ThemedText style={styles.createdDate}>
          Tham gia: {new Date(family.createdAt).toLocaleDateString('vi-VN')}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Gia đình</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Chào {user?.name || user?.email}!</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateFamily}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {families.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color="#ced4da" />
            <ThemedText style={styles.emptyTitle}>Chưa có gia đình nào</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Bạn chưa tham gia gia đình nào. Hãy tạo gia đình mới hoặc được mời tham gia.
            </ThemedText>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateFamily}>
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.createButtonText}>Tạo gia đình mới</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="home" size={24} color="#4ECDC4" />
                <ThemedText style={styles.statNumber}>{families.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Gia đình</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="people" size={24} color="#ff6b6b" />
                <ThemedText style={styles.statNumber}>
                  {families.reduce((sum, family) => sum + family.memberCount, 0)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Thành viên</ThemedText>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="person" size={24} color="#ffa726" />
                <ThemedText style={styles.statNumber}>
                  {families.reduce((sum, family) => sum + family.elderlyCount, 0)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Người già</ThemedText>
              </View>
            </View>

            <View style={styles.familiesList}>
              <ThemedText style={styles.sectionTitle}>Danh sách gia đình</ThemedText>
              {families.map(renderFamilyCard)}
            </View>
          </>
        )}
      </ScrollView>

      {/* Create Family Modal */}
      <Modal
        visible={showCreateFamilyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelCreateFamily}>
              <ThemedText style={styles.cancelButton}>Hủy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Tạo gia đình mới</ThemedText>
            <TouchableOpacity onPress={handleCreateFamilySubmit}>
              <ThemedText style={styles.saveButton}>Tạo</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Family Name */}
            <View style={styles.inputSection}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.inputLabel}>Tên gia đình </ThemedText>
                <ThemedText style={styles.requiredAsterisk}>*</ThemedText>
              </View>
              <TextInput
                style={styles.textInput}
                value={familyName}
                onChangeText={setFamilyName}
                placeholder="Nhập tên gia đình"
                placeholderTextColor="#6c757d"
              />
            </View>

            {/* Family Members */}
            <View style={styles.inputSection}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.inputLabel}>Thành viên</ThemedText>
                <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
                  <Ionicons name="add" size={20} color="#4ECDC4" />
                  <ThemedText style={styles.addButtonText}>Thêm</ThemedText>
                </TouchableOpacity>
              </View>

              {/* Creator (Admin) */}
              <View style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  <Ionicons name="person" size={20} color="#4ECDC4" />
                  <View style={styles.memberDetails}>
                    <ThemedText style={styles.memberName}>
                      {user?.name || user?.email || 'Bạn'}
                    </ThemedText>
                    <ThemedText style={styles.memberRole}>Quản trị viên</ThemedText>
                  </View>
                </View>
              </View>

              {/* Added Members */}
              {familyMembers.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberInfo}>
                    <Ionicons name="person-outline" size={20} color="#6c757d" />
                    <View style={styles.memberDetails}>
                      <TextInput
                        style={styles.memberEmailInput}
                        value={member.email}
                        onChangeText={(email) => handleMemberEmailChange(member.id, email)}
                        placeholder="Nhập email"
                        placeholderTextColor="#6c757d"
                        keyboardType="email-address"
                      />
                      <View style={styles.roleDisplay}>
                        <ThemedText style={styles.roleText}>Thành viên</ThemedText>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveMember(member.id)}
                  >
                    <Ionicons name="remove-circle" size={24} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 100, // Space for navigation bar
  },
  header: {
    backgroundColor: '#4ECDC4',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  familiesList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  familyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  familyDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  createdDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  cancelButton: {
    fontSize: 16,
    color: '#6c757d',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requiredAsterisk: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  roleDisplay: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  memberEmailInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
  },
  roleOptionSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6c757d',
  },
  roleOptionTextSelected: {
    color: 'white',
  },
  removeButton: {
    padding: 4,
  },
  selectedElderlyList: {
    gap: 8,
  },
  selectedElderlyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  elderlyList: {
    flex: 1,
    padding: 20,
  },
  elderlyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  elderlyItemSelected: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f0fdfa',
  },
  elderlyInfo: {
    flex: 1,
  },
  elderlyItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  elderlyItemAge: {
    fontSize: 14,
    color: '#6c757d',
  },
});
