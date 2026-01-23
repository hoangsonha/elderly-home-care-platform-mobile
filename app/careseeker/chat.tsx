import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SimpleNavBar } from '@/components/navigation/SimpleNavBar';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { getChatId } from '@/hooks/useChatId';
import { ChatMessage, useChatMessages } from '@/hooks/useChatMessages';
import { caregiverService } from '@/services/caregiver.service';
import { chatService } from '@/services/chat.service';

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const caregiverId = params.caregiverId as string; // caregiverProfileId
  const accountId = params.accountId as string | undefined; // accountId để gửi tin nhắn
  const caregiverName = params.caregiverName as string;
  const caregiverAvatar = params.caregiverAvatar as string | undefined;
  const chatIdFromParams = params.chatId as string | undefined;
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [caregiverAvatarFromResponse, setCaregiverAvatarFromResponse] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const bottomNavPadding = useBottomNavPadding();

  // Ưu tiên chatId từ params (từ API), nếu không có thì generate từ userId và caregiverId
  const chatId = chatIdFromParams || (user?.id && caregiverId ? getChatId(user.id, caregiverId) : null);

  // Listen messages real-time từ Firestore
  const { messages: firestoreMessages, loading, error } = useChatMessages(chatId);
  
  // Kiểm tra xem screen có đang focus không (chỉ mark as read khi screen đang focus)
  const isFocused = useIsFocused();

  const normalizeParam = (value?: string | string[]) => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) {
      return "";
    }
    const cleaned = raw.trim();
    if (!cleaned || cleaned === "undefined" || cleaned === "null") {
      return "";
    }
    return cleaned;
  };

  const resolveCaregiverName = () => {
    const nameFromParams = normalizeParam(caregiverName);
    if (nameFromParams) {
      return nameFromParams;
    }
    const firstMessage: any = firestoreMessages?.[0];
    if (!firstMessage) {
      return "Người chăm sóc";
    }
    return firstMessage.senderId === user?.id
      ? firstMessage.receiverName || "Người chăm sóc"
      : firstMessage.senderName || "Người chăm sóc";
  };

  const resolveCaregiverAvatar = () => {
    // 1. Ưu tiên từ params (từ chat list) - encode lại để giữ nguyên URL gốc
    const avatarFromParams = Array.isArray(caregiverAvatar) ? caregiverAvatar[0] : caregiverAvatar;
    if (avatarFromParams && typeof avatarFromParams === 'string' && avatarFromParams.startsWith("http")) {
      // Nếu URL đã bị decode (có / trong path sau /o/), encode lại thành %2F
      // Ví dụ: .../o/exe201_project/file.jpg -> .../o/exe201_project%2Ffile.jpg
      if (avatarFromParams.includes('/o/')) {
        const parts = avatarFromParams.split('/o/');
        if (parts.length === 2) {
          // Encode phần sau /o/ để / thành %2F
          const encodedPath = parts[1].replace(/\//g, '%2F');
          const encodedUrl = `${parts[0]}/o/${encodedPath}`;
          return encodedUrl;
        }
      }
      return avatarFromParams;
    }

    // 2. Lấy từ Firestore messages (nếu có)
    const messageWithAvatar = firestoreMessages.find((msg: any) => {
      if (msg.senderId === user?.id) {
        return msg.receiverAvatar && msg.receiverAvatar.startsWith("http");
      } else {
        return msg.senderAvatar && msg.senderAvatar.startsWith("http");
      }
    });

    if (messageWithAvatar) {
      const isSender = messageWithAvatar.senderId === user?.id;
      const avatar = isSender
        ? messageWithAvatar.receiverAvatar || ""
        : messageWithAvatar.senderAvatar || "";
      if (avatar && avatar.startsWith("http")) {
        return avatar;
      }
    }

    // 3. Fallback: từ response khi gửi message (nếu có)
    if (caregiverAvatarFromResponse && caregiverAvatarFromResponse.startsWith("http")) {
      return caregiverAvatarFromResponse;
    }

    return "";
  };

  const displayName = resolveCaregiverName();
  const displayAvatar = resolveCaregiverAvatar();
  const hasAvatar = typeof displayAvatar === "string" && displayAvatar.length > 0;
  const listBottomPadding =
    Math.max(100, inputHeight + 32) +
    (isKeyboardVisible ? keyboardHeight + 4 : 32);

  // Convert Firestore messages to display format
  useEffect(() => {
    if (!user?.id) return;

    const convertedMessages: Message[] = firestoreMessages.map((msg: ChatMessage) => {
      const timestamp = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
      return {
        id: msg.id,
        text: msg.content,
        isMine: msg.senderId === user.id,
        timestamp,
        status: msg.read ? 'read' : 'sent',
      };
    });

    setLocalMessages(convertedMessages);
  }, [firestoreMessages, user?.id]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [localMessages]);

  // Đánh dấu đã đọc khi vào chat và có tin nhắn mới
  // CHỈ mark as read khi screen đang focus (user thực sự xem chat)
  // Chỉ mark tin nhắn mới nhất (tin nhắn cuối cùng chưa đọc) - backend sẽ tự động mark tất cả tin nhắn cũ hơn
  useEffect(() => {
    if (!isFocused || !user?.id || !firestoreMessages.length) return;

    // Tìm các tin nhắn chưa đọc mà receiver là current user
    const unreadMessages = firestoreMessages.filter(
      (msg: ChatMessage) =>
        msg.receiverId === user.id &&
        !msg.read
    );

    // Chỉ mark tin nhắn mới nhất (tin nhắn cuối cùng chưa đọc)
    // Backend sẽ tự động mark tất cả tin nhắn cũ hơn là đã đọc khi mark tin nhắn mới nhất
    if (unreadMessages.length > 0) {
      // Sắp xếp theo timestamp để tìm tin nhắn mới nhất
      const sortedUnreadMessages = [...unreadMessages].sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
        return timeB - timeA; // Descending - tin nhắn mới nhất đầu tiên
      });

      // Chỉ mark tin nhắn mới nhất
      const latestUnreadMessage = sortedUnreadMessages[0];
      if (latestUnreadMessage && latestUnreadMessage.id && typeof latestUnreadMessage.id === 'string') {
        chatService.markAsRead(latestUnreadMessage.id).catch((err) => {
          // Silent fail - không cần hiển thị error
        });
      }
    }
  }, [firestoreMessages, user?.id, isFocused]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates?.height || 0);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) {
      return;
    }

    // Cần accountId để gửi tin nhắn, không phải caregiverProfileId
    let receiverAccountId = accountId;

    // Nếu không có accountId trong params, cần lấy từ API
    if (!receiverAccountId && caregiverId) {
      try {
        const caregiverDetail = await caregiverService.getPublicCaregiverById(caregiverId);
        receiverAccountId = caregiverDetail.accountId;
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể lấy thông tin người nhận. Vui lòng thử lại.');
        return;
      }
    }

    if (!receiverAccountId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin người nhận.');
      return;
    }

    if (sending) {
      return;
    }

    // Optimistic update: Add message to local state immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      text: inputText.trim(),
      isMine: true,
      timestamp: new Date(),
      status: 'sent',
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    const messageContent = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      // Gửi message qua REST API với accountId (receiverId)
      const response = await chatService.sendMessage(receiverAccountId, messageContent);

      // Lưu avatar từ response vào state
      let avatarToSave: string | null = null;
      if (response?.data) {
        // Response có structure: { status, message, data: { senderAvatar, receiverAvatar, ... } }
        const responseData = response.data;
        // Nếu user là sender, lấy receiverAvatar; nếu user là receiver, lấy senderAvatar
        if (responseData.senderId === user?.id) {
          avatarToSave = responseData.receiverAvatar || null;
        } else {
          avatarToSave = responseData.senderAvatar || null;
        }
      } else if (response) {
        // Response có structure trực tiếp: { senderAvatar, receiverAvatar, ... }
        if (response.senderId === user?.id) {
          avatarToSave = response.receiverAvatar || null;
        } else {
          avatarToSave = response.senderAvatar || null;
        }
      }

      // Lưu avatar vào state nếu có
      if (avatarToSave) {
        setCaregiverAvatarFromResponse(avatarToSave);
      }

      // Firestore listener sẽ tự động update UI khi message được lưu
      // Remove optimistic message sau 2 giây
      setTimeout(() => {
        setLocalMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );
      }, 2000);
    } catch (err: any) {
      // Remove optimistic message on error
      setLocalMessages((prev) =>
        prev.filter((msg) => msg.id !== optimisticMessage.id)
      );
      Alert.alert('Lỗi', err.message || 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Ensure text is properly rendered by using a string directly
    const messageText = typeof item.text === 'string' ? item.text : String(item.text || '');
    
    return (
      <View style={[
        styles.messageContainer,
        item.isMine ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          item.isMine ? styles.myMessage : styles.theirMessage
        ]}>
          <Text 
            style={[
              styles.messageText,
              item.isMine ? styles.myMessageText : styles.theirMessageText
            ]}
            selectable={false}
          >
            {messageText}
          </Text>
        <View style={styles.messageFooter}>
          <ThemedText style={[
            styles.timestamp,
            item.isMine ? styles.myTimestamp : styles.theirTimestamp
          ]}>
            {item.timestamp.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </ThemedText>
          {item.isMine && item.status && (
            <Ionicons
              name={
                item.status === 'read' ? 'checkmark-done' :
                  item.status === 'delivered' ? 'checkmark-done' :
                    'checkmark'
              }
              size={14}
              color={item.status === 'read' ? '#68C2E8' : '#FFFFFF'}
            />
          )}
        </View>
      </View>
    </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeAreaTop} edges={['top']}>
        <View style={styles.topSafeAreaBackground} />
      </SafeAreaView>
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : bottomNavPadding}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.avatar}>
                {hasAvatar && !avatarLoadError ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <ThemedText style={styles.avatarText}>
                    {displayName?.charAt(0) || 'C'}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerInfo}>
                <ThemedText style={styles.headerName}>{displayName}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                router.push({
                  pathname: '/careseeker/video-call',
                  params: {
                    caregiverId,
                    caregiverName: displayName,
                    caregiverAvatar: displayAvatar,
                  },
                });
              }}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {loading && localMessages.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#68C2E8" />
              <ThemedText style={styles.loadingText}>Đang tải tin nhắn...</ThemedText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={localMessages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={scrollToBottom}
              onLayout={scrollToBottom}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={<View style={{ height: listBottomPadding }} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                  </ThemedText>
                </View>
              }
            />
          )}

          {/* Input */}
          <View
            style={[
              styles.inputContainer,
              {
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: isKeyboardVisible ? keyboardHeight + 12 : 16,
                zIndex: 2,
                elevation: 2,
              },
            ]}
            onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)}
          >
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="add-circle-outline" size={28} color="#68C2E8" />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              multiline
              maxLength={1000}
              editable={!sending}
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <SimpleNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#68C2E8',
  },
  safeAreaTop: {
    backgroundColor: '#68C2E8',
  },
  topSafeAreaBackground: {
    backgroundColor: '#68C2E8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#68C2E8',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '75%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  myMessage: {
    backgroundColor: '#68C2E8',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E8EBED',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  theirMessageText: {
    color: '#2C3E50',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  theirTimestamp: {
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EBED',
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#2C3E50',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#68C2E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
});
