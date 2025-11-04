import CaregiverBottomNav from "@/components/navigation/CaregiverBottomNav";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isPriority?: boolean;
  isTyping?: boolean;
  isSeen?: boolean;
}

// Mock data
const chatData: ChatItem[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    avatar: "👵",
    lastMessage: "Chào anh, hôm nay tôi cảm thấy khỏe hơn rồi",
    time: "9:30",
    unreadCount: 2,
    isOnline: true,
    isPriority: true,
  },
  {
    id: "2",
    name: "Trần Văn Hùng",
    avatar: "👴",
    lastMessage: "đang nhập...",
    time: "9:15",
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
  },
  {
    id: "3",
    name: "Lê Thị Phương",
    avatar: "�",
    lastMessage: "🚨 Khẩn cấp: Tôi vừa ngã, cần hỗ trợ ngay!",
    time: "8:45",
    unreadCount: 1,
    isOnline: false,
    isPriority: true,
  },
  {
    id: "4",
    name: "Nguyễn Thị Mai",
    avatar: "👵",
    lastMessage: "✓✓ Cảm ơn anh đã chăm sóc tôi rất tốt!",
    time: "Hôm qua",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "5",
    name: "Lê Văn Sơn",
    avatar: "👴",
    lastMessage: "✓ Vâng, tôi đã uống thuốc đầy đủ rồi",
    time: "Hôm qua",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "6",
    name: "Phạm Văn Minh",
    avatar: "�",
    lastMessage: "✓✓ Lịch tuần sau như thế nào a?",
    time: "3 ngày trước",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "7",
    name: "Hoàng Thị Hoa",
    avatar: "👵",
    lastMessage: "✓✓ Hẹn gặp lại anh tuần sau nhé",
    time: "1 tuần trước",
    unreadCount: 0,
    isOnline: false,
    isSeen: true,
  },
  {
    id: "8",
    name: "Hỗ trợ Elder Care",
    avatar: "🏥",
    lastMessage: "Chào mừng bạn đến với Elder Care Connect! 👋",
    time: "2 tuần trước",
    unreadCount: 0,
    isOnline: false,
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter chats
  const filteredChats = chatData.filter((chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || (activeFilter === "unread" && chat.unreadCount > 0);
    return matchesSearch && matchesFilter;
  });

  const unreadCount = chatData.filter((chat) => chat.unreadCount > 0).length;

  const handleChatPress = (chat: ChatItem) => {
    navigation.navigate("Tin nhắn", { 
      chatId: chat.id,
      chatName: chat.name,
      chatAvatar: chat.avatar 
    });
  };

  const renderChatItem = (chat: ChatItem) => (
    <TouchableOpacity
      key={chat.id}
      style={[
        styles.chatItem,
        chat.unreadCount > 0 && styles.chatItemUnread,
      ]}
      onPress={() => handleChatPress(chat)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name={chat.avatar === "🏥" ? "hospital-building" : "account"}
            size={32}
            color="#2196F3"
          />
        </View>
        {chat.isOnline && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{chat.name}</Text>
          <Text style={styles.chatTime}>{chat.time}</Text>
        </View>
        <View style={styles.chatMessageRow}>
          {chat.isPriority && !chat.isTyping && (
            <Text style={styles.priorityIcon}>🚨</Text>
          )}
          <Text
            style={[
              styles.chatMessage,
              chat.isTyping && styles.chatMessageTyping,
              chat.unreadCount > 0 && styles.chatMessageUnread,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#6B7280"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm tin nhắn..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "all" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "all" && styles.filterTabTextActive,
            ]}
          >
            Tất cả
          </Text>
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{chatData.length}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === "unread" && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter("unread")}
        >
          <Text
            style={[
              styles.filterTabText,
              activeFilter === "unread" && styles.filterTabTextActive,
            ]}
          >
            Chưa đọc
          </Text>
          {unreadCount > 0 && (
            <View style={[styles.filterBadge, styles.filterBadgeUnread]}>
              <Text style={styles.filterBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatListContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredChats.map(renderChatItem)}
      </ScrollView>

      {/* Bottom Navigation */}
      <CaregiverBottomNav activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },

  // Filter
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    gap: 8,
  },
  filterTabActive: {
    backgroundColor: "#3B82F6",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  filterBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
  },
  filterBadgeUnread: {
    backgroundColor: "#EF4444",
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  // Chat List
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  chatItemUnread: {
    backgroundColor: "#FEF3C7",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#fff",
  },
  chatContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  chatMessageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priorityIcon: {
    fontSize: 14,
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
  },
  chatMessageTyping: {
    color: "#3B82F6",
    fontStyle: "italic",
  },
  chatMessageUnread: {
    fontWeight: "600",
    color: "#1F2937",
  },
  unreadBadge: {
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
