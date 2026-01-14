import { ThemedText } from '@/components/themed-text';
import { Complaint } from '@/types/complaint';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function ComplaintDetailScreen() {
  const { id } = useLocalSearchParams();
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Mock data - in real app, fetch by id
  const complaint: Complaint = {
    id: '1',
    type: 'salary',
    title: 'Khiếu nại về lương không đúng thỏa thuận',
    description: 'Người chăm sóc không trả đúng số tiền đã thỏa thuận trong hợp đồng. Cụ thể, trong hợp đồng ghi rõ mức lương 200,000 VND/giờ nhưng chỉ trả 150,000 VND/giờ. Điều này vi phạm nghiêm trọng thỏa thuận ban đầu.',
    complainant: {
      id: '1',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0123456789',
      role: 'member',
    },
    accused: {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0987654321',
      role: 'caregiver',
    },
    service: {
      id: '1',
      name: 'Dịch vụ chăm sóc tại nhà',
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
    evidences: [
      {
        id: '1',
        type: 'image',
        url: 'https://via.placeholder.com/300x200/E74C3C/FFFFFF?text=Contract',
        filename: 'contract.jpg',
        uploadedAt: '2024-01-20T10:00:00Z',
      },
      {
        id: '2',
        type: 'image',
        url: 'https://via.placeholder.com/300x200/3498DB/FFFFFF?text=Payment',
        filename: 'payment_screenshot.jpg',
        uploadedAt: '2024-01-20T10:05:00Z',
      },
    ],
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'received': return 'Đã tiếp nhận';
      case 'processing': return 'Đang xử lí';
      case 'resolved': return 'Đã xử lí';
      case 'rejected': return 'Đã từ chối';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'received': return '#3498db';
      case 'processing': return '#f39c12';
      case 'resolved': return '#2ed573';
      case 'rejected': return '#ff4757';
      default: return '#6c757d';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'salary': return 'Lương';
      case 'behavior': return 'Thái độ';
      case 'quality': return 'Chất lượng';
      case 'schedule': return 'Lịch trình';
      case 'payment': return 'Thanh toán';
      case 'other': return 'Khác';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#2ed573';
      case 'medium': return '#ffa502';
      case 'high': return '#ff4757';
      case 'urgent': return '#ff6b6b';
      default: return '#6c757d';
    }
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const renderEvidenceItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.evidenceItem}
      onPress={() => handleImagePress(item.url)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.url }} style={styles.evidenceImage} />
      <View style={styles.evidenceOverlay}>
        <Ionicons name="eye" size={24} color="white" />
      </View>
      <ThemedText style={styles.evidenceFilename} numberOfLines={1}>
        {item.filename}
      </ThemedText>
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
          <ThemedText style={styles.headerTitle}>Chi tiết khiếu nại</ThemedText>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <ThemedText style={styles.statusLabel}>Trạng thái:</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint.status) }]}>
                <ThemedText style={styles.statusText}>
                  {getStatusText(complaint.status)}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Complaint Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Thông tin khiếu nại</ThemedText>
          <View style={styles.infoCard}>
            <ThemedText style={styles.complaintTitle}>{complaint.title}</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Loại khiếu nại:</ThemedText>
              <ThemedText style={styles.infoValue}>{getTypeText(complaint.type)}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Ngày tạo:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {new Date(complaint.createdAt).toLocaleDateString('vi-VN')}
              </ThemedText>
            </View>
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.infoLabel}>Mô tả chi tiết:</ThemedText>
              <ThemedText style={styles.descriptionText}>{complaint.description}</ThemedText>
            </View>
          </View>
        </View>

        {/* People Involved */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Người liên quan</ThemedText>
          <View style={styles.peopleContainer}>
            <View style={styles.personCard}>
              <View style={styles.personHeader}>
                <Ionicons name="person" size={20} color="#68C2E8" />
                <ThemedText style={styles.personTitle}>Người khiếu nại</ThemedText>
              </View>
              <ThemedText style={styles.personName}>{complaint.complainant.name}</ThemedText>
              <ThemedText style={styles.personEmail}>{complaint.complainant.email}</ThemedText>
              <ThemedText style={styles.personPhone}>{complaint.complainant.phone}</ThemedText>
            </View>
            
            <View style={styles.personCard}>
              <View style={styles.personHeader}>
                <Ionicons name="warning" size={20} color="#FF6B6B" />
                <ThemedText style={styles.personTitle}>Người bị khiếu nại</ThemedText>
              </View>
              <ThemedText style={styles.personName}>{complaint.accused.name}</ThemedText>
              <ThemedText style={styles.personEmail}>{complaint.accused.email}</ThemedText>
              <ThemedText style={styles.personPhone}>{complaint.accused.phone}</ThemedText>
            </View>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Dịch vụ liên quan</ThemedText>
          <View style={styles.serviceCard}>
            <View style={styles.serviceHeader}>
              <Ionicons name="business" size={20} color="#4ECDC4" />
              <ThemedText style={styles.serviceTitle}>{complaint.service.name}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Loại dịch vụ:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {complaint.service.type === 'caregiver_service' ? 'Dịch vụ chăm sóc' : 'Dịch vụ khác'}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Ngày bắt đầu:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {new Date(complaint.service.startDate).toLocaleDateString('vi-VN')}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Trạng thái:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {complaint.service.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Evidence */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bằng chứng ({complaint.evidences.length})</ThemedText>
          {complaint.evidences.length > 0 ? (
            <FlatList
              data={complaint.evidences}
              renderItem={renderEvidenceItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evidenceList}
            />
          ) : (
            <View style={styles.noEvidence}>
              <Ionicons name="image-outline" size={48} color="#6c757d" />
              <ThemedText style={styles.noEvidenceText}>Không có bằng chứng</ThemedText>
            </View>
          )}
        </View>

        {/* Resolution (if resolved) */}
        {complaint.status === 'resolved' && complaint.resolution && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Kết quả xử lí</ThemedText>
            <View style={styles.resolutionCard}>
              <ThemedText style={styles.resolutionText}>{complaint.resolution}</ThemedText>
              <ThemedText style={styles.resolutionDate}>
                Xử lí ngày: {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString('vi-VN') : 'N/A'}
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalCloseArea}
            onPress={() => setShowImageModal(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
            </View>
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  complaintTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginTop: 8,
  },
  peopleContainer: {
    gap: 12,
  },
  personCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  personTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  personEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  personPhone: {
    fontSize: 14,
    color: '#6c757d',
  },
  serviceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  evidenceList: {
    paddingRight: 16,
  },
  evidenceItem: {
    width: 120,
    marginRight: 12,
  },
  evidenceImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  evidenceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceFilename: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  noEvidence: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noEvidenceText: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
  },
  resolutionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  resolutionText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 8,
  },
  resolutionDate: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
});
