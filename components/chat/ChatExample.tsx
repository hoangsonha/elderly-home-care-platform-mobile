/**
 * Example component minh họa cách sử dụng ChatService
 * Component này có thể được sử dụng làm reference hoặc base cho chat screen thực tế
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useChat } from '@/hooks/useChat';
import { ChatMessage, SendMessagePayload } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface ChatExampleProps {
  receiverId: string;
  receiverName?: string;
}

export function ChatExample({ receiverId, receiverName }: ChatExampleProps) {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    messages,
    clearMessages,
    error,
  } = useChat({
    autoConnect: true,
    onMessage: (message) => {
      // Auto scroll to bottom when new message arrives
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (err) => {
      Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra khi chat');
    },
  });

  // Merge messages from hook with local messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Connect when component mounts
  useEffect(() => {
    if (!isConnected && connectionState === 'disconnected') {
      connect().catch((err) => {
        // Silent fail
      });
    }
  }, []);

  // Disconnect when component unmounts
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }

    if (!isConnected) {
      Alert.alert('Lỗi', 'Chưa kết nối. Vui lòng đợi...');
      return;
    }

    const payload: SendMessagePayload = {
      receiverId,
      content: inputText.trim(),
    };

    // Optimistic update: Add message to local state immediately
    const optimisticMessage: ChatMessage = {
      messageId: `temp-${Date.now()}`,
      senderId: user?.id || '',
      senderEmail: user?.email,
      receiverId,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, optimisticMessage]);
    setInputText('');

    try {
      await sendMessage(payload);
      // Message will be added to messages array when received from server
      // Remove optimistic message when real message arrives
    } catch (err) {
      // Remove optimistic message on error
      setLocalMessages((prev) =>
        prev.filter((msg) => msg.messageId !== optimisticMessage.messageId)
      );
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageContent}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const renderConnectionStatus = () => {
    let statusText = '';
    let statusColor = '#666';

    switch (connectionState) {
      case 'connecting':
        statusText = 'Đang kết nối...';
        statusColor = '#FFA500';
        break;
      case 'connected':
        statusText = 'Đã kết nối';
        statusColor = '#4CAF50';
        break;
      case 'reconnecting':
        statusText = 'Đang kết nối lại...';
        statusColor = '#FFA500';
        break;
      case 'disconnected':
        statusText = 'Đã ngắt kết nối';
        statusColor = '#666';
        break;
      case 'error':
        statusText = 'Lỗi kết nối';
        statusColor = '#F44336';
        break;
    }

    return (
      <View style={styles.statusBar}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
        <Text style={styles.statusText}>{statusText}</Text>
        {connectionState === 'error' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => connect()}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {receiverName || 'Chat'}
        </Text>
      </View>

      {/* Connection Status */}
      {renderConnectionStatus()}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={localMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
          multiline
          maxLength={1000}
          editable={isConnected}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!isConnected || !inputText.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!isConnected || !inputText.trim()}
        >
          {connectionState === 'connecting' || connectionState === 'reconnecting' ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.sendButtonText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2196F3',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
  },
  messageContent: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    alignSelf: 'flex-end',
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
    backgroundColor: '#FFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
