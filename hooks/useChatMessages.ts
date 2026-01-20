import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any; // Firestore Timestamp
  read?: boolean;
  [key: string]: any;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook để listen messages real-time từ Firestore
 */
export function useChatMessages(chatId: string | null | undefined): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      const db = firestore();
      if (!db) {
        setError(new Error('Firestore is not available. Please rebuild app.'));
        setLoading(false);
        return;
      }

      // Real-time listener cho messages
      // Note: Cần composite index nếu dùng where + orderBy
      // Tạm thời chỉ dùng where, không orderBy để tránh lỗi
      const query = db
        .collection('messages')
        .where('chatId', '==', chatId)
        .limit(50);

      unsubscribe = query.onSnapshot(
        (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const messageList: ChatMessage[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            messageList.push({
              id: doc.id,
              ...data,
            } as ChatMessage);
          });

          // Sort manually by timestamp (descending)
          messageList.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeB - timeA; // Descending
          });

          // Reverse để hiển thị từ cũ đến mới
          const sortedMessages = messageList.reverse();

          setMessages(sortedMessages);
          setLoading(false);
          setError(null);
        },
        (err: Error) => {
          const errorCode = (err as any).code;

          if (errorCode === 'firestore/unavailable') {
            // Don't set error, let it retry
            setLoading(false);
          } else {
            setError(err);
            setLoading(false);
          }
        }
      );

    } catch (err: any) {
      // More specific error message
      if (err?.message?.includes('collectionOnSnapshot') || err?.message?.includes('native')) {
        setError(new Error('Firestore native module not linked. Please rebuild app: npx expo prebuild --clean && npx expo run:android'));
      } else {
        setError(err as Error);
      }
      setLoading(false);
    }

    // Cleanup listener khi unmount
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          // Silent fail
        }
      }
    };
  }, [chatId]);

  return { messages, loading, error };
}
