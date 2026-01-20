# Chat Service - WebSocket Real-time Chat

## 📦 Đã cài đặt

- ✅ `@stomp/stompjs` - STOMP client cho WebSocket

## 🚀 Cách sử dụng

### 1. Sử dụng Hook (Khuyến nghị)

```tsx
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

function ChatScreen({ receiverId }: { receiverId: string }) {
  const { user } = useAuth();
  const {
    connectionState,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    messages,
    error,
  } = useChat({
    autoConnect: true, // Tự động kết nối khi component mount
    onMessage: (message) => {
      console.log('New message:', message);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const handleSend = async () => {
    try {
      await sendMessage({
        receiverId: receiverId,
        content: 'Hello!',
      });
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  return (
    <View>
      <Text>Status: {connectionState}</Text>
      {/* Render messages */}
    </View>
  );
}
```

### 2. Sử dụng Service trực tiếp

```tsx
import { chatService } from '@/services/chat.service';
import { useAuth } from '@/contexts/AuthContext';

function ChatScreen({ receiverId }: { receiverId: string }) {
  const { user } = useAuth();

  useEffect(() => {
    // Connect
    chatService.connect(user.id).catch(console.error);

    // Setup callbacks
    chatService.setCallbacks({
      onMessage: (message) => {
        console.log('New message:', message);
      },
      onConnectionStateChange: (state) => {
        console.log('Connection state:', state);
      },
      onError: (error) => {
        console.error('Error:', error);
      },
    });

    // Cleanup
    return () => {
      chatService.disconnect();
    };
  }, [user.id]);

  const handleSend = async () => {
    try {
      await chatService.sendMessage({
        receiverId: receiverId,
        content: 'Hello!',
      });
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };
}
```

### 3. Xem Example Component

Xem file `components/chat/ChatExample.tsx` để có ví dụ đầy đủ về cách implement một chat screen.

## 🔧 Cấu hình

### WebSocket URL

Mặc định: `ws://157.245.155.77:8080/ws`

Để thay đổi, sửa trong `services/chat.service.ts`:

```typescript
const WS_URL = 'ws://your-server:8080/ws';
```

### Reconnection Settings

```typescript
chatService.configureReconnect({
  autoReconnect: true,
  maxAttempts: 5,
  initialDelay: 1000, // 1 second
});
```

## 📋 API Reference

### ChatService Methods

- `connect(userId: string, token?: string): Promise<void>` - Kết nối WebSocket
- `disconnect(): void` - Ngắt kết nối
- `sendMessage(payload: SendMessagePayload): Promise<void>` - Gửi tin nhắn
- `setCallbacks(callbacks: ChatServiceCallbacks): void` - Set callbacks
- `getConnectionState(): ConnectionState` - Lấy trạng thái kết nối
- `isConnected(): boolean` - Kiểm tra đã kết nối chưa
- `updateToken(newToken: string): Promise<void>` - Cập nhật token mới

### Connection States

- `disconnected` - Chưa kết nối
- `connecting` - Đang kết nối
- `connected` - Đã kết nối
- `reconnecting` - Đang kết nối lại
- `error` - Có lỗi

### Message Format

**Gửi:**
```typescript
{
  receiverId: string;
  content: string;
}
```

**Nhận:**
```typescript
{
  messageId: string;
  senderId: string;
  senderEmail?: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO 8601 format
}
```

## ⚠️ Lưu ý

1. **Authentication**: Phải có JWT token hợp lệ để kết nối. Token được lấy tự động từ AsyncStorage.

2. **Lifecycle**: 
   - Connect khi vào màn hình chat
   - Disconnect khi rời màn hình chat
   - Hook `useChat` tự động xử lý lifecycle

3. **Reconnection**: Tự động reconnect với exponential backoff khi mất kết nối.

4. **App State**: Hook tự động xử lý khi app vào background/foreground.

5. **Error Handling**: Luôn có error handling và user-friendly messages.

## 🐛 Troubleshooting

### Không connect được

1. Kiểm tra JWT token có hợp lệ không
2. Kiểm tra WebSocket URL đúng chưa
3. Kiểm tra network connection
4. Check backend logs

### Nhận được message nhưng không hiển thị

1. Kiểm tra callback `onMessage` có được set chưa
2. Kiểm tra user ID trong subscription có đúng không
3. Check console logs

### Connection bị drop thường xuyên

1. Kiểm tra network stability
2. Kiểm tra token có hết hạn không
3. Tăng `maxReconnectAttempts` nếu cần
