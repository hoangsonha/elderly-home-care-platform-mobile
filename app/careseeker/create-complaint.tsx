import { ThemedText } from '@/components/themed-text';
import { ComplaintFormData, ComplaintService, ComplaintType } from '@/types/complaint';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateComplaintScreen() {
  const [formData, setFormData] = useState<ComplaintFormData>({
    serviceId: '',
    accusedId: '',
    type: 'salary',
    title: '',
    description: '',
    evidences: [],
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAccusedModal, setShowAccusedModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Mock data
  const mockServices: ComplaintService[] = [
    {
      id: '1',
      name: 'Dịch vụ chăm sóc tại nhà - Buổi sáng',
      type: 'caregiver_service',
      caregiver: {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        role: 'caregiver',
      },
      startDate: '2024-01-01',
      status: 'active',
    },
    {
      id: '2',
      name: 'Dịch vụ chăm sóc tại nhà - Buổi chiều',
      type: 'caregiver_service',
      caregiver: {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0912345678',
        role: 'caregiver',
      },
      startDate: '2024-01-15',
      status: 'active',
    },
    {
      id: '3',
      name: 'Dịch vụ chăm sóc 24/7',
      type: 'caregiver_service',
      caregiver: {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        phone: '0923456789',
        role: 'caregiver',
      },
      startDate: '2024-01-10',
      status: 'active',
    },
    {
      id: '4',
      name: 'Dịch vụ chăm sóc cuối tuần',
      type: 'caregiver_service',
      caregiver: {
        id: '5',
        name: 'Hoàng Văn E',
        email: 'hoangvane@email.com',
        phone: '0934567890',
        role: 'caregiver',
      },
      startDate: '2024-01-12',
      status: 'active',
    },
    {
      id: '5',
      name: 'Dịch vụ chăm sóc đặc biệt',
      type: 'caregiver_service',
      caregiver: {
        id: '6',
        name: 'Vũ Thị F',
        email: 'vuthif@email.com',
        phone: '0945678901',
        role: 'caregiver',
      },
      startDate: '2024-01-08',
      status: 'active',
    },
  ];

  const complaintTypes: { value: ComplaintType; label: string }[] = [
    { value: 'salary', label: 'Lương' },
    { value: 'behavior', label: 'Thái độ' },
    { value: 'quality', label: 'Chất lượng' },
    { value: 'schedule', label: 'Lịch trình' },
    { value: 'payment', label: 'Thanh toán' },
    { value: 'other', label: 'Khác' },
  ];

  const getTypeLabel = (type: ComplaintType) => {
    return complaintTypes.find(t => t.value === type)?.label || 'Không xác định';
  };

  const getSelectedService = () => {
    return mockServices.find(s => s.id === formData.serviceId);
  };

  const getSelectedAccused = () => {
    const service = getSelectedService();
    return service?.caregiver;
  };

  const handleServiceSelect = (service: ComplaintService) => {
    setFormData(prev => ({
      ...prev,
      serviceId: service.id,
      accusedId: service.caregiver?.id || '',
    }));
    setShowServiceModal(false);
  };

  const handleTypeSelect = (type: ComplaintType) => {
    setFormData(prev => ({ ...prev, type }));
    setShowTypeModal(false);
  };

  const handleAddEvidence = () => {
    // Mock adding evidence - in real app, use image picker
    const newEvidence = {
      id: Date.now().toString(),
      type: 'image' as const,
      url: `https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Evidence+${formData.evidences.length + 1}`,
      filename: `evidence_${formData.evidences.length + 1}.jpg`,
      uploadedAt: new Date().toISOString(),
    };
    
    setFormData(prev => ({
      ...prev,
      evidences: [...prev.evidences, newEvidence],
    }));
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    setFormData(prev => ({
      ...prev,
      evidences: prev.evidences.filter(e => e.id !== evidenceId),
    }));
  };

  const validateForm = () => {
    if (!formData.serviceId) {
      Alert.alert('Lỗi', 'Vui lòng chọn dịch vụ khiếu nại');
      return false;
    }
    if (!formData.accusedId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người bị khiếu nại');
      return false;
    }
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề khiếu nại');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn gửi khiếu nại này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Gửi', 
          onPress: () => {
            console.log('Submitting complaint:', formData);
            Alert.alert('Thành công', 'Khiếu nại đã được gửi thành công!');
            router.back();
          }
        },
      ]
    );
  };

  const renderServiceItem = ({ item }: { item: ComplaintService }) => (
    <TouchableOpacity
      style={styles.serviceItem}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        <ThemedText style={styles.serviceCaregiver}>
          Người chăm sóc: {item.caregiver?.name}
        </ThemedText>
        <ThemedText style={styles.serviceDate}>
          Bắt đầu: {new Date(item.startDate).toLocaleDateString('vi-VN')}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#6c757d" />
    </TouchableOpacity>
  );

  const renderEvidenceItem = ({ item }: { item: any }) => (
    <View style={styles.evidenceItem}>
      <Image source={{ uri: item.url }} style={styles.evidenceImage} />
      <TouchableOpacity
        style={styles.removeEvidenceButton}
        onPress={() => handleRemoveEvidence(item.id)}
      >
        <Ionicons name="close-circle" size={20} color="#ff4757" />
      </TouchableOpacity>
      <ThemedText style={styles.evidenceFilename} numberOfLines={1}>
        {item.filename}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tạo khiếu nại</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Selection */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Dịch vụ khiếu nại</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowServiceModal(true)}
          >
            <ThemedText style={styles.selectButtonText}>
              {getSelectedService()?.name || 'Chọn dịch vụ'}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* Accused Person (Auto-filled) */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Người bị khiếu nại</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <View style={styles.accusedInfo}>
            <View style={styles.accusedCard}>
              <Ionicons name="person" size={20} color="#FF6B6B" />
              <View style={styles.accusedDetails}>
                <ThemedText style={styles.accusedName}>
                  {getSelectedAccused()?.name || 'Chưa chọn'}
                </ThemedText>
                <ThemedText style={styles.accusedEmail}>
                  {getSelectedAccused()?.email || ''}
                </ThemedText>
                <ThemedText style={styles.accusedPhone}>
                  {getSelectedAccused()?.phone || ''}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Complaint Type */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Loại khiếu nại</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTypeModal(true)}
          >
            <ThemedText style={styles.selectButtonText}>
              {getTypeLabel(formData.type)}
            </ThemedText>
            <Ionicons name="chevron-down" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Tiêu đề khiếu nại</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Nhập tiêu đề khiếu nại"
            placeholderTextColor="#6c757d"
            multiline
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Mô tả chi tiết</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Mô tả chi tiết về khiếu nại..."
            placeholderTextColor="#6c757d"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <View style={styles.labelContainer}>
            <ThemedText style={styles.label}>Bằng chứng</ThemedText>
            <ThemedText style={styles.requiredMark}>*</ThemedText>
          </View>
          
          <TouchableOpacity
            style={styles.addEvidenceButton}
            onPress={handleAddEvidence}
          >
            <Ionicons name="add" size={20} color="#4ECDC4" />
            <ThemedText style={styles.addEvidenceText}>Thêm bằng chứng</ThemedText>
          </TouchableOpacity>

          {formData.evidences.length > 0 && (
            <FlatList
              data={formData.evidences}
              renderItem={renderEvidenceItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evidenceList}
            />
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <ThemedText style={styles.submitButtonText}>Gửi khiếu nại</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Service Selection Modal */}
      <Modal
        visible={showServiceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Chọn dịch vụ</ThemedText>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={mockServices}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Chọn loại khiếu nại</ThemedText>
              <TouchableOpacity onPress={() => setShowTypeModal(false)}>
                <Ionicons name="close" size={24} color="#6c757d" />
              </TouchableOpacity>
            </View>
            <View style={styles.typeList}>
              {complaintTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeItem,
                    formData.type === type.value && styles.typeItemSelected
                  ]}
                  onPress={() => handleTypeSelect(type.value)}
                >
                  <ThemedText style={[
                    styles.typeText,
                    formData.type === type.value && styles.typeTextSelected
                  ]}>
                    {type.label}
                  </ThemedText>
                  {formData.type === type.value && (
                    <Ionicons name="checkmark" size={20} color="#4ECDC4" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
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
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
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
  submitContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#68C2E8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  requiredMark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#68C2E8',
    marginLeft: 4,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  accusedInfo: {
    marginTop: 8,
  },
  accusedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 12,
  },
  accusedDetails: {
    flex: 1,
  },
  accusedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  accusedEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  accusedPhone: {
    fontSize: 14,
    color: '#6c757d',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  addEvidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4ECDC4',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  addEvidenceText: {
    fontSize: 14,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  evidenceList: {
    paddingRight: 16,
  },
  evidenceItem: {
    width: 100,
    marginRight: 12,
    position: 'relative',
  },
  evidenceImage: {
    width: 100,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  removeEvidenceButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  evidenceFilename: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalList: {
    maxHeight: 400,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  serviceCaregiver: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  serviceDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  typeList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  typeItemSelected: {
    backgroundColor: '#f8f9fa',
  },
  typeText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  typeTextSelected: {
    fontWeight: '600',
    color: '#4ECDC4',
  },
});
