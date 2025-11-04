import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { ThemedText } from "@/components/themed-text";

interface Message {
  id: string;
  text: string;
  sender: "user" | "caregiver";
  timestamp: Date;
  isRead: boolean;
}

interface ChatScreenProps {
  caregiverName: string;
  caregiverAvatar: string;
}

export default function ChatScreen() {
  const route = useRoute();
  const params = useLocalSearchParams();
  
  // Thử lấy params từ cả route và useLocalSearchParams
  const routeParams = (route.params || {}) as any;
  
  // Đọc từ các nguồn khác nhau (chat-list truyền chatName, các màn hình khác có thể truyền clientName)
  const chatName = routeParams.chatName || params.chatName;
  const chatAvatar = routeParams.chatAvatar || params.chatAvatar;
  const clientName = routeParams.clientName || params.clientName;
  const clientAvatar = routeParams.clientAvatar || params.clientAvatar;
  const caregiverName = routeParams.caregiverName || params.caregiverName;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "caregiver",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: true,
    },
    {
      id: "2",
      text: "Chào anh/chị! Tôi đang cần tìm người chăm sóc cho bà nội của tôi",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
      isRead: true,
    },
    {
      id: "3",
      text: "Dạ, tôi có 5 năm kinh nghiệm chăm sóc người cao tuổi, đặc biệt là những người có vấn đề về trí nhớ và vận động. Bà nội của bạn bao nhiêu tuổi và tình trạng sức khỏe hiện tại như thế nào ạ?",
      sender: "caregiver",
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
      isRead: true,
    },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  // Lấy tên và avatar người nhận từ params (ưu tiên chatName từ chat-list)
  const recipientName = (chatName as string) || (clientName as string) || (caregiverName as string) || "";
  const recipientAvatar = (chatAvatar as string) || (clientAvatar as string) || "👤";
  
  // Debug log
  console.log("Chat params:", { chatName, chatAvatar, clientName, clientAvatar, caregiverName, recipientName });

  useEffect(() => {
    // Auto scroll to bottom when new message is added
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        sender: "user",
        timestamp: new Date(),
        isRead: false,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      // Simulate caregiver response after 2 seconds
      setTimeout(() => {
        const responses = [
          "Cảm ơn bạn đã quan tâm!",
          "Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể.",
          "Bạn có câu hỏi gì khác không?",
          "Tôi có thể tư vấn thêm về dịch vụ của mình.",
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        const caregiverMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: randomResponse,
          sender: "caregiver",
          timestamp: new Date(),
          isRead: true,
        };

        setMessages((prev) => [...prev, caregiverMessage]);
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = (message: Message) => {
    // Trong màn hình chat của caregiver: caregiver ở bên phải, user/seeker ở bên trái
    const isCaregiver = message.sender === "caregiver";

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isCaregiver
            ? styles.userMessageContainer
            : styles.caregiverMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCaregiver ? styles.userMessageBubble : styles.caregiverMessageBubble,
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isCaregiver ? styles.userMessageText : styles.caregiverMessageText,
            ]}
          >
            {message.text}
          </ThemedText>
          <ThemedText
            style={[
              styles.messageTime,
              isCaregiver ? styles.userMessageTime : styles.caregiverMessageTime,
            ]}
          >
            {formatTime(message.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Chat Header - Info người nhận */}
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderAvatar}>
          <Text style={styles.chatHeaderAvatarText}>{recipientAvatar}</Text>
        </View>
        <View style={styles.chatHeaderInfo}>
          <ThemedText style={styles.chatHeaderName}>
            {recipientName || "Chưa có tên"}
          </ThemedText>
        </View>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor="#999"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                newMessage.trim()
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={newMessage.trim() ? "white" : "#999"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  
  // Chat Header - Info người nhận
  chatHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  chatHeaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatHeaderAvatarText: {
    fontSize: 28,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  chatHeaderStatus: {
    fontSize: 13,
    color: "#10B981",
  },
  
  header: {
    backgroundColor: "#4ECDC4",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 160,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  caregiverMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userMessageBubble: {
    backgroundColor: "#4ECDC4",
    borderBottomRightRadius: 4,
  },
  caregiverMessageBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: "white",
  },
  caregiverMessageText: {
    color: "#2c3e50",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userMessageTime: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "right",
  },
  caregiverMessageTime: {
    color: "#6c757d",
  },
  inputContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    marginBottom: 80,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: "#4ECDC4",
  },
  sendButtonInactive: {
    backgroundColor: "#e9ecef",
  },
});
