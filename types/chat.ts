/**
 * Chat Types
 */

export type ConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface ChatMessage {
  messageId: string;
  senderId: string;
  senderEmail?: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export interface SendMessagePayload {
  receiverId: string;
  content: string;
}

export interface ChatServiceCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onConnectionStateChange?: (state: ConnectionState) => void;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
}

export interface ChatServiceConfig {
  userId: string;
  token: string;
  callbacks?: ChatServiceCallbacks;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}
