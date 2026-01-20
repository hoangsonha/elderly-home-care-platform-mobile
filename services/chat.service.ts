import apiClient, { BASE_URL } from './apiClient';

/**
 * ChatService - Quản lý REST API calls cho chat
 */
class ChatService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${BASE_URL}/api/v1`;
  }

  /**
   * Set JWT token cho API calls
   */
  setAuthToken(token: string): void {
    // Token đã được set trong apiClient interceptor
    // Không cần làm gì thêm
  }

  /**
   * Gửi tin nhắn
   */
  async sendMessage(receiverId: string, content: string): Promise<any> {
    try {
      const response = await apiClient.post('/api/v1/chat/send', {
        receiverId,
        content,
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Lấy danh sách conversations
   */
  async getConversations(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v1/chat/conversations');

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.conversations && Array.isArray(response.data.conversations)) {
        return response.data.conversations;
      }

      return [];
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Lấy messages trong một conversation
   */
  async getMessages(chatId: string, limit: number = 50): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/v1/chat/messages/${chatId}`, {
        params: { limit },
      });

      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.messages && Array.isArray(response.data.messages)) {
        return response.data.messages;
      }

      return [];
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Đánh dấu message đã đọc
   */
  async markAsRead(messageId: string): Promise<any> {
    try {
      console.log('=== ChatService.markAsRead ===');
      console.log('API Endpoint: PUT /api/v1/chat/messages/' + messageId + '/read');
      console.log('MessageId:', messageId);
      const response = await apiClient.put(`/api/v1/chat/messages/${messageId}/read`);
      console.log('Mark as read API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Mark as read API error:', error);
      console.error('Error response:', error?.response?.data);
      throw error;
    }
  }

  /**
   * Lấy message history với một user cụ thể
   */
  async getMessageHistory(otherUserId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/v1/chat/messages/${otherUserId}`);
      return response.data || [];
    } catch (error: any) {
      return [];
    }
  }

  /**
   * Lấy chat ID từ receiverId
   */
  async getChatId(receiverId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/api/v1/chat/chat-id/${receiverId}`);

      // Handle different response formats
      if (response.data?.data) {
        return response.data.data;
      } else if (response.data?.chatId) {
        return response.data;
      }

      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Export class for testing
export { ChatService };
