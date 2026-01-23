import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CaregiverBottomNav from '@/components/navigation/CaregiverBottomNav';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useBottomNavPadding } from '@/hooks/useBottomNavPadding';
import { getChatId } from '@/hooks/useChatId';
import { ChatMessage, useChatMessages } from '@/hooks/useChatMessages';
import { chatService } from '@/services/chat.service';

interface Message {
  id: string;
  text: string;
  isMine: boolean;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = useLocalSearchParams();

  // Với Drawer Navigator, params sẽ ở route.params - dùng useMemo để tránh re-render
  const routeParams = useMemo(() => {
    return (route.params || {}) as any;
  }, [route.params]);

  // Đọc params từ route.params (Drawer Navigator) hoặc useLocalSearchParams (fallback)
  // Ưu tiên routeParams vì dùng Drawer Navigator
  const chatName = routeParams.chatName || (Array.isArray(params.chatName) ? params.chatName[0] : params.chatName) || "";
  const chatAvatar = routeParams.chatAvatar || (Array.isArray(params.chatAvatar) ? params.chatAvatar[0] : params.chatAvatar) || "";
  const seekerName = routeParams.seekerName || (Array.isArray(params.seekerName) ? params.seekerName[0] : params.seekerName) || "";
  const seekerAvatar = routeParams.seekerAvatar || (Array.isArray(params.seekerAvatar) ? params.seekerAvatar[0] : params.seekerAvatar) || "";
  const fromScreen = routeParams.fromScreen || (Array.isArray(params.fromScreen) ? params.fromScreen[0] : params.fromScreen) || "";
  const appointmentId = routeParams.appointmentId || (Array.isArray(params.appointmentId) ? params.appointmentId[0] : params.appointmentId) || "";

  // Lấy receiverId (seekerId) và accountId từ params - ưu tiên route.params vì dùng Drawer Navigator
  // receiverId có thể là profileId, cần accountId để gửi message
  const receiverId = (routeParams.receiverId ||
    routeParams.seekerId ||
    routeParams.chatId ||
    (params.receiverId as string) ||
    (params.seekerId as string) ||
    (params.chatId as string)) as string;

  // accountId để gửi tin nhắn (nếu có trong params)
  const accountId = (routeParams.accountId ||
    (params.accountId as string)) as string | undefined;

  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [seekerAvatarFromResponse, setSeekerAvatarFromResponse] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const bottomNavPadding = useBottomNavPadding();

  // Validate receiverId trước khi generate chatId
  const isValidReceiverId = receiverId && typeof receiverId === 'string' && receiverId.trim() !== '';

  // Generate chatId từ userId và receiverId
  const chatId = (user?.id && isValidReceiverId)
    ? getChatId(user.id, receiverId.trim())
    : null;

  // Listen messages real-time từ Firestore
  const { messages: firestoreMessages, loading } = useChatMessages(chatId);

  // Đảm bảo firestoreMessages luôn là array - dùng useMemo để tránh re-render
  const safeFirestoreMessages = useMemo(() => {
    return Array.isArray(firestoreMessages) ? firestoreMessages : [];
  }, [firestoreMessages]);

  // Validate receiverId và hiển thị error nếu thiếu
  useEffect(() => {
    if (!isValidReceiverId || !user?.id) {
      Alert.alert(
        'Lỗi',
        'Không tìm thấy thông tin người nhận. Vui lòng quay lại danh sách chat.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate("Danh sách tin nhắn" as any)
          }
        ]
      );
    }
  }, [isValidReceiverId, user?.id, navigation]);

  // Chỉ resolve name và avatar sau khi firestoreMessages đã được khởi tạo
  const [displayName, setDisplayName] = useState<string>("Người dùng");
  const [displayAvatar, setDisplayAvatar] = useState<string>("");
  const [hasAvatar, setHasAvatar] = useState(false);

  // Update displayName và displayAvatar khi có data
  useEffect(() => {
    try {
      // Resolve name - ưu tiên từ params (chatName từ chat-list)
      let name = "";

      // Ưu tiên chatName (từ chat-list), sau đó seekerName
      if (chatName && typeof chatName === 'string' && chatName.trim() !== '') {
        name = chatName.trim();
      } else if (seekerName && typeof seekerName === 'string' && seekerName.trim() !== '') {
        name = seekerName.trim();
      }

      // Fallback: lấy từ Firestore messages
      if (!name && Array.isArray(safeFirestoreMessages) && safeFirestoreMessages.length > 0) {
        const firstMessage: any = safeFirestoreMessages[0];
        if (firstMessage && typeof firstMessage === 'object') {
          name = firstMessage.senderId === user?.id
            ? firstMessage.receiverName || "Người dùng"
            : firstMessage.senderName || "Người dùng";
        }
      }
      if (!name) name = "Người dùng";

      // Resolve avatar - dùng URL gốc từ params, không encode/decode
      let avatar = "";

      // Ưu tiên chatAvatar (từ chat-list), sau đó seekerAvatar
      const avatarFromParams = (chatAvatar && typeof chatAvatar === 'string' && chatAvatar.trim() !== '')
        ? chatAvatar.trim()
        : (seekerAvatar && typeof seekerAvatar === 'string' && seekerAvatar.trim() !== '')
          ? seekerAvatar.trim()
          : "";

      // Nếu có avatar từ params, dùng trực tiếp URL gốc (không encode/decode)
      if (avatarFromParams && avatarFromParams.startsWith("http")) {
        avatar = avatarFromParams; // Dùng URL gốc từ params, không encode/decode
      }

      if (!avatar && Array.isArray(safeFirestoreMessages) && safeFirestoreMessages.length > 0) {
        const messageWithAvatar = safeFirestoreMessages.find((msg: any) => {
          if (!msg || typeof msg !== 'object') return false;
          if (msg.senderId === user?.id) {
            return msg.receiverAvatar && typeof msg.receiverAvatar === 'string' && msg.receiverAvatar.startsWith("http");
          } else {
            return msg.senderAvatar && typeof msg.senderAvatar === 'string' && msg.senderAvatar.startsWith("http");
          }
        });

        if (messageWithAvatar) {
          const isSender = messageWithAvatar.senderId === user?.id;
          const foundAvatar = isSender
            ? messageWithAvatar.receiverAvatar || ""
            : messageWithAvatar.senderAvatar || "";
          if (foundAvatar && typeof foundAvatar === 'string' && foundAvatar.startsWith("http")) {
            avatar = foundAvatar;
          }
        }
      }

      if (!avatar && seekerAvatarFromResponse && typeof seekerAvatarFromResponse === 'string' && seekerAvatarFromResponse.startsWith("http")) {
        avatar = seekerAvatarFromResponse;
      }

      setDisplayName(name);
      setDisplayAvatar(avatar);
      setHasAvatar(typeof avatar === "string" && avatar.length > 0 && avatar.startsWith("http"));
    } catch {
      // Fallback nếu có lỗi
      setDisplayName("Người dùng");
      setDisplayAvatar("");
      setHasAvatar(false);
    }
  }, [safeFirestoreMessages, chatName, seekerName, chatAvatar, seekerAvatar, seekerAvatarFromResponse, user?.id]);

  const listBottomPadding =
    Math.max(100, inputHeight + 32) +
    (isKeyboardVisible ? keyboardHeight + 4 : 32);

  // Convert Firestore messages to display format
  useEffect(() => {
    if (!user?.id) return;

    // Dùng safeFirestoreMessages (đã đảm bảo là array)
    const convertedMessages: Message[] = safeFirestoreMessages.map((msg: ChatMessage) => {
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
  }, [safeFirestoreMessages, user?.id]);

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
  // Chỉ mark as read khi screen được focus (user thực sự xem chat)
  // Chỉ mark tin nhắn mới nhất (tin nhắn cuối cùng chưa đọc) - backend sẽ tự động mark tất cả tin nhắn cũ hơn
  const isFocused = useIsFocused();

  useEffect(() => {
    // CHỈ mark as read khi screen đang focus
    if (!isFocused || !user?.id || !Array.isArray(safeFirestoreMessages) || safeFirestoreMessages.length === 0) return;

    // Tìm các tin nhắn chưa đọc mà receiver là current user
    const unreadMessages = safeFirestoreMessages.filter(
      (msg: ChatMessage) =>
        msg &&
        typeof msg === 'object' &&
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
  }, [safeFirestoreMessages, user?.id, isFocused]);

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

  // Setup header - tắt default header để dùng custom header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Tắt default header để dùng custom header
    });
  }, [navigation]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id) {
      return;
    }

    // Cần accountId để gửi tin nhắn, không phải seekerProfileId
    let receiverAccountId = accountId;

    // Nếu không có accountId trong params, dùng receiverId (giả định là accountId)
    // Nếu receiverId là profileId, cần lấy accountId từ API (nhưng không có API cho seeker)
    // Tạm thời dùng receiverId, nếu fail thì sẽ báo lỗi
    if (!receiverAccountId && receiverId) {
      // Giả định receiverId từ chat-list đã là accountId
      receiverAccountId = receiverId;
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
        const responseData = response.data;
        if (responseData.senderId === user?.id) {
          avatarToSave = responseData.receiverAvatar || null;
        } else {
          avatarToSave = responseData.senderAvatar || null;
        }
      } else if (response) {
        if (response.senderId === user?.id) {
          avatarToSave = response.receiverAvatar || null;
        } else {
          avatarToSave = response.senderAvatar || null;
        }
      }

      if (avatarToSave) {
        setSeekerAvatarFromResponse(avatarToSave);
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

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isMine ? styles.myMessageContainer : styles.theirMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        item.isMine ? styles.myMessage : styles.theirMessage
      ]}>
        <ThemedText style={[
          styles.messageText,
          item.isMine ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.text}
        </ThemedText>
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
              onPress={() => {
                if (fromScreen === "appointment-detail" && appointmentId) {
                  navigation.navigate("Appointment Detail", {
                    appointmentId: appointmentId,
                    fromScreen: "chat",
                  });
                } else if (fromScreen === "dashboard") {
                  navigation.navigate("Trang chủ");
                } else {
                  navigation.navigate("Danh sách tin nhắn");
                }
              }}
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
                    {displayName?.charAt(0) || 'N'}
                  </ThemedText>
                )}
              </View>
              <View style={styles.headerInfo}>
                <ThemedText style={styles.headerName}>{displayName}</ThemedText>
              </View>
            </View>

            <View style={styles.headerRight} />
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

        <CaregiverBottomNav activeTab="home" />
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
  headerRight: {
    width: 40,
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
