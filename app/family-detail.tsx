import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ElderlyList from '@/components/elderly/ElderlyList';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { ElderlyProfile } from '@/types/elderly';

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin_family' | 'member';
  avatar?: string;
  joinedAt: string;
  isOnline: boolean;
}


interface FamilyDetail {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  elderlyCount: number;
  userRole: 'admin_family' | 'member';
  members: FamilyMember[];
  elderlyProfiles: ElderlyProfile[];
  createdAt: string;
}

export default function FamilyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'members' | 'elderly'>('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddElderlyModal, setShowAddElderlyModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin_family' | 'member'>('member');
  const [selectedElderly, setSelectedElderly] = useState<ElderlyProfile[]>([]);

  // Mock data for elderly selection
  const availableElderly: ElderlyProfile[] = [
    {
      id: 'e1',
      name: 'Bà Nguyễn Thị Lan',
      age: 75,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 'e2',
      name: 'Ông Trần Văn Hùng',
      age: 82,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 'e3',
      name: 'Bà Lê Thị Mai',
      age: 68,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
    {
      id: 'e4',
      name: 'Ông Phạm Văn Đức',
      age: 79,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  ];

  // Mock data - in real app, this would come from API based on id
  const family: FamilyDetail = {
    id: id as string,
    name: 'Gia đình Nguyễn',
    description: 'Gia đình đa thế hệ với ông bà và con cháu, luôn quan tâm chăm sóc lẫn nhau',
    memberCount: 5,
    elderlyCount: 2,
    userRole: 'admin_family',
    createdAt: '2024-01-15',
    members: [
      {
        id: '1',
        name: 'Nguyễn Văn Minh',
        email: 'minh.nguyen@email.com',
        role: 'admin_family',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        joinedAt: '2024-01-15',
        isOnline: true,
      },
      {
        id: '2',
        name: 'Nguyễn Thị Lan',
        email: 'lan.nguyen@email.com',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        joinedAt: '2024-01-20',
        isOnline: false,
      },
      {
        id: '3',
        name: 'Nguyễn Văn Đức',
        email: 'duc.nguyen@email.com',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        joinedAt: '2024-02-01',
        isOnline: true,
      },
      {
        id: '4',
        name: 'Nguyễn Thị Hoa',
        email: 'hoa.nguyen@email.com',
        role: 'member',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        joinedAt: '2024-02-15',
        isOnline: false,
      },
      {
        id: '5',
        name: 'Nguyễn Văn Tuấn',
        email: 'tuan.nguyen@email.com',
        role: 'member',
        joinedAt: '2024-03-01',
        isOnline: true,
      },
    ],
    elderlyProfiles: [
      {
        id: '1',
        name: 'Bà Nguyễn Thị Lan',
        age: 75,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        healthStatus: 'fair',
        currentCaregivers: 1,
        family: 'Gia đình Nguyễn',
        personalInfo: {
          name: 'Bà Nguyễn Thị Lan',
          age: 75,
          phoneNumber: '0901 234 567',
          address: '123 Đường ABC, Quận 1, TP.HCM',
        },
        medicalConditions: {
          underlyingDiseases: ['Cao huyết áp', 'Tiểu đường'],
          specialConditions: ['Suy giảm trí nhớ nhẹ'],
          allergies: ['Dị ứng hải sản'],
        },
        independenceLevel: {
          eating: 'assisted',
          bathing: 'assisted',
          mobility: 'independent',
          toileting: 'assisted',
          dressing: 'independent',
        },
        careNeeds: {
          conversation: true,
          reminders: true,
          dietSupport: true,
          exercise: false,
          medicationManagement: true,
          companionship: true,
        },
        preferences: {
          hobbies: ['Nghe nhạc', 'Đọc sách'],
          favoriteActivities: ['Đi dạo', 'Trò chuyện'],
          foodPreferences: ['Cháo', 'Rau xanh'],
        },
        livingEnvironment: {
          houseType: 'private_house',
          livingWith: ['Con trai', 'Con dâu'],
          surroundings: 'Khu dân cư yên tĩnh',
        },
      },
      {
        id: '2',
        name: 'Ông Nguyễn Văn Hùng',
        age: 82,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        healthStatus: 'poor',
        currentCaregivers: 2,
        family: 'Gia đình Nguyễn',
        personalInfo: {
          name: 'Ông Nguyễn Văn Hùng',
          age: 82,
          phoneNumber: '0901 234 568',
          address: '123 Đường ABC, Quận 1, TP.HCM',
        },
        medicalConditions: {
          underlyingDiseases: ['Tim mạch', 'Xương khớp'],
          specialConditions: ['Suy giảm trí nhớ nặng', 'Khó khăn vận động'],
          allergies: ['Dị ứng thuốc kháng sinh'],
        },
        independenceLevel: {
          eating: 'dependent',
          bathing: 'dependent',
          mobility: 'dependent',
          toileting: 'dependent',
          dressing: 'dependent',
        },
        careNeeds: {
          conversation: true,
          reminders: true,
          dietSupport: true,
          exercise: true,
          medicationManagement: true,
          companionship: true,
        },
        preferences: {
          hobbies: ['Nghe radio', 'Xem TV'],
          favoriteActivities: ['Trò chuyện', 'Nghe kể chuyện'],
          foodPreferences: ['Cháo loãng', 'Sữa'],
        },
        livingEnvironment: {
          houseType: 'private_house',
          livingWith: ['Con trai', 'Con dâu'],
          surroundings: 'Khu dân cư yên tĩnh',
        },
      },
    ],
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  const handleAddElderly = () => {
    setShowAddElderlyModal(true);
  };

  const handleElderlyToggle = (elderly: ElderlyProfile) => {
    setSelectedElderly(prev => {
      const isSelected = prev.some(item => item.id === elderly.id);
      if (isSelected) {
        return prev.filter(item => item.id !== elderly.id);
      } else {
        return [...prev, elderly];
      }
    });
  };

  const handleAddElderlySubmit = () => {
    // Add selected elderly to family
    console.log('Adding elderly:', selectedElderly);
    setShowAddElderlyModal(false);
    setSelectedElderly([]);
  };

  const handleCancelAddElderly = () => {
    setShowAddElderlyModal(false);
    setSelectedElderly([]);
  };

  const handleAddMemberSubmit = () => {
    if (!newMemberEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email thành viên!');
      return;
    }

    // In real app, this would make API call
    Alert.alert('Thành công', `Đã gửi lời mời tham gia gia đình đến ${newMemberEmail}`);
    setShowAddMemberModal(false);
    setNewMemberEmail('');
    setNewMemberRole('member');
  };

  const handleCancelAddMember = () => {
    setShowAddMemberModal(false);
    setNewMemberEmail('');
    setNewMemberRole('member');
  };

  const handleEditMember = (member: FamilyMember) => {
    if (family.userRole !== 'admin_family') {
      Alert.alert('Thông báo', 'Chỉ quản trị viên mới có quyền chỉnh sửa thành viên!');
      return;
    }
    Alert.alert('Chỉnh sửa thành viên', `Chỉnh sửa thông tin ${member.name}?`);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    if (family.userRole !== 'admin_family') {
      Alert.alert('Thông báo', 'Chỉ quản trị viên mới có quyền xóa thành viên!');
      return;
    }
    Alert.alert(
      'Xóa thành viên',
      `Bạn có chắc chắn muốn xóa ${member.name} khỏi gia đình?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => console.log('Delete member') },
      ]
    );
  };

  const handleElderlyPress = (person: any) => {
    console.log('Navigating to elderly detail:', person.id);
    router.push(`/elderly-detail?id=${person.id}`);
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

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Tốt';
      case 'fair': return 'Trung bình';
      case 'poor': return 'Kém';
      default: return 'Không xác định';
    }
  };

  const renderMember = (member: FamilyMember) => {
    const isCurrentUser = user?.email === member.email;
    
    return (
      <View key={member.id} style={[styles.memberItem, isCurrentUser && styles.currentUserItem]}>
      <View style={styles.memberInfo}>
        <View style={styles.avatarContainer}>
          {member.avatar ? (
            <Image source={{ uri: member.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <ThemedText style={styles.avatarText}>
                {member.name ? member.name.split(' ').pop()?.charAt(0) : '?'}
              </ThemedText>
            </View>
          )}
          {member.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.memberDetails}>
          <View style={styles.memberNameContainer}>
            <ThemedText style={styles.memberName}>{member.name}</ThemedText>
            {isCurrentUser && (
              <View style={styles.currentUserBadge}>
                <ThemedText style={styles.currentUserText}>Bạn</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
          <View style={styles.roleContainer}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) + '20' }]}>
              <ThemedText style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                {getRoleText(member.role)}
              </ThemedText>
            </View>
            <ThemedText style={styles.joinedDate}>
              Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}
            </ThemedText>
          </View>
        </View>
      </View>

      {family.userRole === 'admin_family' && (
        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditMember(member)}
          >
            <Ionicons name="create-outline" size={20} color="#4ECDC4" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteMember(member)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc3545" />
          </TouchableOpacity>
        </View>
      )}
    </View>
    );
  };


  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
           <Ionicons name="arrow-back" size={24} color="white" />
         </TouchableOpacity>
         
         <View style={styles.headerContent}>
           <ThemedText style={styles.headerTitle}>{family.name}</ThemedText>
           <ThemedText style={styles.headerSubtitle}>Quản lý gia đình</ThemedText>
         </View>
         
         <View style={styles.headerActions}>
           {family.userRole === 'admin_family' && selectedTab === 'members' && (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => {
                setShowAddMemberModal(true);
              }}
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
           )}
         </View>
       </View>

      {/* Family Description */}
      <View style={styles.descriptionContainer}>
        <ThemedText style={styles.description}>{family.description}</ThemedText>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'members' && styles.activeTab]}
          onPress={() => setSelectedTab('members')}
        >
          <ThemedText style={[styles.tabText, selectedTab === 'members' && styles.activeTabText]}>
            Thành viên ({family.memberCount})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'elderly' && styles.activeTab]}
          onPress={() => setSelectedTab('elderly')}
        >
          <ThemedText style={[styles.tabText, selectedTab === 'elderly' && styles.activeTabText]}>
            Người già ({family.elderlyCount})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'members' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.membersList}>
            {family.members.map(renderMember)}
          </View>
        </ScrollView>
      ) : (
        <ElderlyList
          data={family.elderlyProfiles}
          showSearch={false}
          showStats={false}
          showCaregiverCount={true}
          onPersonPress={handleElderlyPress}
        />
      )}

       {/* Add Member Modal */}
       <Modal
         visible={showAddMemberModal}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <SafeAreaView style={styles.modalContainer} edges={['top']}>
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={handleCancelAddMember}>
               <ThemedText style={styles.cancelButton}>Hủy</ThemedText>
             </TouchableOpacity>
             <ThemedText style={styles.modalTitle}>Thêm thành viên</ThemedText>
             <TouchableOpacity onPress={handleAddMemberSubmit}>
               <ThemedText style={styles.saveButton}>Thêm</ThemedText>
             </TouchableOpacity>
           </View>

           <View style={styles.modalContent}>
             <View style={styles.inputSection}>
               <View style={styles.labelContainer}>
                 <ThemedText style={styles.inputLabel}>Email thành viên </ThemedText>
                 <ThemedText style={styles.requiredAsterisk}>*</ThemedText>
               </View>
               <TextInput
                 style={styles.textInput}
                 value={newMemberEmail}
                 onChangeText={setNewMemberEmail}
                 placeholder="Nhập email thành viên"
                 placeholderTextColor="#6c757d"
                 keyboardType="email-address"
                 autoCapitalize="none"
               />
             </View>

             <View style={styles.inputSection}>
               <ThemedText style={styles.inputLabel}>Vai trò</ThemedText>
               <View style={styles.roleSelector}>
                 <TouchableOpacity
                   style={[
                     styles.roleOption,
                     newMemberRole === 'admin_family' && styles.roleOptionSelected
                   ]}
                   onPress={() => setNewMemberRole('admin_family')}
                 >
                   <ThemedText style={[
                     styles.roleOptionText,
                     newMemberRole === 'admin_family' && styles.roleOptionTextSelected
                   ]}>
                     Quản trị viên
                   </ThemedText>
                 </TouchableOpacity>
                 <TouchableOpacity
                   style={[
                     styles.roleOption,
                     newMemberRole === 'member' && styles.roleOptionSelected
                   ]}
                   onPress={() => setNewMemberRole('member')}
                 >
                   <ThemedText style={[
                     styles.roleOptionText,
                     newMemberRole === 'member' && styles.roleOptionTextSelected
                   ]}>
                     Thành viên
                   </ThemedText>
                 </TouchableOpacity>
               </View>
             </View>

             <View style={styles.noteSection}>
               <Ionicons name="information-circle" size={20} color="#4ECDC4" />
               <ThemedText style={styles.noteText}>
                 Lời mời sẽ được gửi đến email này. Thành viên cần chấp nhận lời mời để tham gia gia đình.
               </ThemedText>
             </View>
           </View>
         </SafeAreaView>
       </Modal>

       {/* Add Elderly Modal */}
       <Modal
         visible={showAddElderlyModal}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <SafeAreaView style={styles.modalContainer} edges={['top']}>
           <View style={styles.modalHeader}>
             <TouchableOpacity onPress={handleCancelAddElderly}>
               <ThemedText style={styles.cancelButton}>Hủy</ThemedText>
             </TouchableOpacity>
             <ThemedText style={styles.modalTitle}>Thêm người già</ThemedText>
             <TouchableOpacity onPress={handleAddElderlySubmit}>
               <ThemedText style={styles.saveButton}>Thêm</ThemedText>
             </TouchableOpacity>
           </View>

           <View style={styles.modalContent}>
             <ThemedText style={styles.sectionTitle}>Chọn người già</ThemedText>
             <ThemedText style={styles.sectionSubtitle}>
               Chọn những người già bạn muốn thêm vào gia đình
             </ThemedText>

             <ScrollView style={styles.elderlySelectionList}>
               {availableElderly.map((elderly) => {
                 const isSelected = selectedElderly.some(item => item.id === elderly.id);
                 return (
                   <TouchableOpacity
                     key={elderly.id}
                     style={[
                       styles.elderlySelectionItem,
                       isSelected && styles.selectedElderlyItem
                     ]}
                     onPress={() => handleElderlyToggle(elderly)}
                   >
                     <View style={styles.elderlySelectionInfo}>
                       <Image source={{ uri: elderly.avatar }} style={styles.elderlySelectionAvatar} />
                       <View style={styles.elderlySelectionDetails}>
                         <ThemedText style={styles.elderlySelectionName}>{elderly.name}</ThemedText>
                         <ThemedText style={styles.elderlySelectionAge}>{elderly.age} tuổi</ThemedText>
                       </View>
                     </View>
                     {isSelected && (
                       <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
                     )}
                   </TouchableOpacity>
                 );
               })}
             </ScrollView>
           </View>
         </SafeAreaView>
       </Modal>
     </SafeAreaView>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  descriptionContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  description: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4ECDC4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#4ECDC4',
  },
  content: {
    flex: 1,
  },
  membersList: {
    padding: 20,
  },
  elderlyContainer: {
    flex: 1,
  },
  addElderlyButton: {
    backgroundColor: '#4ECDC4',
    margin: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  addElderlyText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  elderlySelectionList: {
    maxHeight: 400,
  },
  elderlySelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedElderlyItem: {
    borderColor: '#4ECDC4',
    backgroundColor: '#f8fffe',
  },
  elderlySelectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  elderlySelectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  elderlySelectionDetails: {
    flex: 1,
  },
  elderlySelectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  elderlySelectionAge: {
    fontSize: 14,
    color: '#6c757d',
  },
  memberItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: '#f8f9fa',
  },
  memberNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentUserBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentUserText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  memberInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: 'white',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  joinedDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  elderlyList: {
    padding: 20,
  },
  elderlyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  elderlyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  elderlyDetails: {
    flex: 1,
  },
  elderlyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  elderlyAge: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  caregiverCount: {
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
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  roleOptionTextSelected: {
    color: 'white',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
});
