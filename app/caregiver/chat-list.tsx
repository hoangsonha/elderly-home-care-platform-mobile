import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { chatService } from '@/services/chat.service';
import { useFocusEffect } from '@react-navigation/native';

interface ChatConversation {
  id: string;
  seekerId: string; // accountId của seeker
  seekerName: string;
  seekerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
}

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  
  // Listen conversations real-time từ Firestore
  const { conversations: firestoreConversations } = useConversations();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = React.useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiConversations = await chatService.getConversations();
      const mappedConversations: ChatConversation[] = apiConversations.map((conv: any) => {
        // API returns participantId (the other user - seeker)
        const seekerId = conv.participantId || conv.seekerId || conv.userId || conv.receiverId || conv.id;

        let timeStr = "Vừa xong";
        if (conv.lastMessageTime) {
          const lastTime = new Date(conv.lastMessageTime);
          const now = new Date();
          const diffMs = now.getTime() - lastTime.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 1) {
            timeStr = "Vừa xong";
          } else if (diffMins < 60) {
            timeStr = `${diffMins} phút trước`;
          } else if (diffHours < 24) {
            timeStr = lastTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          } else if (diffDays === 1) {
            timeStr = "Hôm qua";
          } else if (diffDays < 7) {
            timeStr = `${diffDays} ngày trước`;
          } else {
            timeStr = lastTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          }
        }

        return {
          id: seekerId,
          seekerId,
          seekerName: conv.participantName || conv.seekerName || conv.userName || conv.name || "Người dùng",
          seekerAvatar: conv.participantAvatar || conv.seekerAvatar || conv.userAvatar || conv.avatar || "",
          lastMessage: conv.lastMessage || conv.content || "",
          lastMessageTime: timeStr,
          unreadCount: conv.unreadCount || 0,
          isOnline: conv.isOnline || false,
          isTyping: conv.isTyping || false,
        };
      });

      setConversations(mappedConversations);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tải danh sách tin nhắn';
      setError(message);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // Map Firestore conversations to ChatConversation format
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // Update từ Firestore nhưng giữ lại tên/avatar từ API
    if (firestoreConversations.length > 0) {
      setConversations((prev) => {
        const existingMap = new Map(prev.map(conv => [conv.id, conv]));
        
        firestoreConversations.forEach((conv: any) => {
          // Get other participant (not current user) - should be seeker
          const participants = conv.participants || [];
          const seekerId = participants.find((id: string) => id !== user.id) || participants[0] || conv.id;
          
          // Format timestamp
          let timeStr = "Vừa xong";
          if (conv.lastMessageTime) {
            const lastTime = conv.lastMessageTime?.toDate ? conv.lastMessageTime.toDate() : new Date(conv.lastMessageTime);
            const now = new Date();
            const diffMs = now.getTime() - lastTime.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) {
              timeStr = "Vừa xong";
            } else if (diffMins < 60) {
              timeStr = `${diffMins} phút trước`;
            } else if (diffHours < 24) {
              timeStr = lastTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays === 1) {
              timeStr = "Hôm qua";
            } else if (diffDays < 7) {
              timeStr = `${diffDays} ngày trước`;
            } else {
              timeStr = lastTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            }
          }

          // Lấy existing conversation từ API (có tên/avatar đúng)
          const existingConv = existingMap.get(seekerId);
          
          // Kiểm tra xem có lastMessage mới không (so sánh với existing)
          const hasNewMessage = conv.lastMessage && 
            conv.lastMessage !== existingConv?.lastMessage &&
            conv.lastMessage.trim() !== '';
          
          // Xác định unreadCount: ưu tiên Firestore, nếu có tin nhắn mới thì tăng unreadCount
          let unreadCount = conv.unreadCount;
          if (unreadCount === undefined || unreadCount === null) {
            if (hasNewMessage) {
              // Có tin nhắn mới: tăng unreadCount
              unreadCount = (existingConv?.unreadCount ?? 0) + 1;
            } else {
              // Giữ nguyên từ existing
              unreadCount = existingConv?.unreadCount ?? 0;
            }
          } else if (hasNewMessage && unreadCount === 0) {
            // Nếu Firestore báo unreadCount = 0 nhưng có lastMessage mới, có thể là chưa sync
            // Tăng lên 1 để đảm bảo hiển thị
            unreadCount = 1;
          }
          
          // Update chỉ các field real-time từ Firestore, giữ lại tên/avatar từ API
          const updatedConv: ChatConversation = {
            id: seekerId,
            seekerId: seekerId,
            seekerName: existingConv?.seekerName || conv.participantName || conv.seekerName || conv.userName || conv.name || "Người dùng",
            seekerAvatar: existingConv?.seekerAvatar || conv.participantAvatar || conv.seekerAvatar || conv.userAvatar || conv.avatar || "",
            lastMessage: conv.lastMessage || conv.content || existingConv?.lastMessage || "",
            lastMessageTime: timeStr,
            unreadCount: unreadCount,
            isOnline: conv.isOnline ?? existingConv?.isOnline ?? false,
            isTyping: conv.isTyping ?? existingConv?.isTyping ?? false,
          };
          
          existingMap.set(seekerId, updatedConv);
        });
        
        return Array.from(existingMap.values());
      });
    }
  }, [firestoreConversations, user?.id]);

  const handleConversationPress = (conversation: ChatConversation) => {
    // Validate conversation data trước khi navigate
    if (!conversation.seekerId || !conversation.id) {
      return; // Không navigate nếu thiếu data
    }

    // KHÔNG mark as read ở đây - chỉ mark khi thực sự vào chat screen và xem tin nhắn
    // Việc mark as read sẽ được xử lý trong chat.tsx khi user thực sự xem tin nhắn
    
    // Đảm bảo receiverId được pass đúng - conversation.seekerId đã là accountId (nếu có từ API)
    const receiverId = conversation.seekerId || conversation.id;
    
    navigation.navigate("Tin nhắn", {
      receiverId: receiverId, // accountId của seeker (nếu có từ API)
      seekerId: receiverId, // Alias
      accountId: receiverId, // accountId để gửi tin nhắn (đảm bảo là accountId, không phải profileId)
      chatName: conversation.seekerName || "Người dùng",
      chatAvatar: conversation.seekerAvatar || "", // Dùng URL gốc, không encode/decode
      fromScreen: "chat-list"
    });
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
          {conversation.seekerAvatar ? (
            <Image source={{ uri: conversation.seekerAvatar }} style={styles.avatarImage} />
          ) : (
            <ThemedText style={styles.avatarText}>
              {conversation.seekerName ? conversation.seekerName.split(' ').pop()?.charAt(0) : '?'}
            </ThemedText>
          )}
        </View>
        {conversation.isOnline && (
          <View style={styles.onlineIndicator} />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText style={styles.seekerName}>
            {conversation.seekerName}
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
          onPress={() => navigation.navigate("Trang chủ")}
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
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#68C2E8" />
            <ThemedText style={styles.emptySubtitle}>Đang tải danh sách tin nhắn...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptySubtitle}>{error}</ThemedText>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ced4da" />
            <ThemedText style={styles.emptyTitle}>Chưa có cuộc trò chuyện</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Bạn chưa có cuộc trò chuyện nào. Tin nhắn sẽ xuất hiện ở đây khi có người nhắn cho bạn.
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
    backgroundColor: '#68C2E8',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
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
    minWidth: 40,
    justifyContent: 'flex-end',
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
    backgroundColor: '#68C2E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  seekerName: {
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
    backgroundColor: '#68C2E8',
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
