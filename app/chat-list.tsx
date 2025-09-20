import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';

interface ChatConversation {
  id: string;
  caregiverId: string;
  caregiverName: string;
  caregiverAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
}

export default function ChatListScreen() {
  const { user } = useAuth();
  
  // Mock data - in real app, this would come from API
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: '1',
      caregiverId: '1',
      caregiverName: 'Chị Nguyễn Thị Lan',
      caregiverAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Cảm ơn bạn đã quan tâm! Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.',
      lastMessageTime: '10:30',
      unreadCount: 2,
      isOnline: true,
      isTyping: false,
    },
    {
      id: '2',
      caregiverId: '2',
      caregiverName: 'Chị Trần Văn Hoa',
      caregiverAvatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Tôi có thể tư vấn thêm về dịch vụ của mình.',
      lastMessageTime: '09:15',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
    },
    {
      id: '3',
      caregiverId: '3',
      caregiverName: 'Anh Lê Minh Đức',
      caregiverAvatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Bạn có câu hỏi gì khác không?',
      lastMessageTime: 'Hôm qua',
      unreadCount: 1,
      isOnline: true,
      isTyping: true,
    },
    {
      id: '4',
      caregiverId: '4',
      caregiverName: 'Chị Phạm Thị Mai',
      caregiverAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      lastMessage: 'Tôi có 5 năm kinh nghiệm chăm sóc người cao tuổi.',
      lastMessageTime: '2 ngày trước',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
    },
  ]);

  const handleConversationPress = (conversation: ChatConversation) => {
    // Mark as read
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    }
    
    router.push(`/chat?caregiverId=${conversation.caregiverId}&caregiverName=${conversation.caregiverName}`);
  };

  const handleMarkAllAsRead = () => {
    setConversations(prev => 
      prev.map(conv => ({ ...conv, unreadCount: 0 }))
    );
  };

  const formatTime = (timeString: string) => {
    // If it's a time like "10:30", return as is
    if (timeString.includes(':')) {
      return timeString;
    }
    // If it's "Hôm qua", "2 ngày trước", etc., return as is
    return timeString;
  };

  const totalUnreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const renderConversation = (conversation: ChatConversation) => (
    <TouchableOpacity
      key={conversation.id}
      style={styles.conversationItem}
      onPress={() => handleConversationPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {conversation.caregiverName.split(' ').pop()?.charAt(0)}
          </ThemedText>
        </View>
        {conversation.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText style={styles.caregiverName}>
            {conversation.caregiverName}
          </ThemedText>
          <ThemedText style={styles.messageTime}>
            {formatTime(conversation.lastMessageTime)}
          </ThemedText>
        </View>

        <View style={styles.messageContainer}>
          <ThemedText 
            style={[
              styles.lastMessage,
              conversation.unreadCount > 0 && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {conversation.isTyping ? 'Đang nhập...' : conversation.lastMessage}
          </ThemedText>
          
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadCount}>
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#6c757d" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Tin nhắn</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            {totalUnreadCount > 0 ? `${totalUnreadCount} tin nhắn chưa đọc` : 'Tất cả đã đọc'}
          </ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          {totalUnreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
              <Ionicons name="checkmark-done" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ced4da" />
            <ThemedText style={styles.emptyTitle}>Chưa có cuộc trò chuyện</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Bạn chưa có cuộc trò chuyện nào. Hãy tìm kiếm người chăm sóc để bắt đầu chat.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.conversationsList}>
            {conversations.map(renderConversation)}
          </View>
        )}
      </ScrollView>
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
  markAllButton: {
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
  },
  conversationsList: {
    padding: 20,
  },
  conversationItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
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
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
    marginRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caregiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: '#6c757d',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  unreadBadge: {
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
});
