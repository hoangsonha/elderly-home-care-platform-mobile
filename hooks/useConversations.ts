import { useState, useEffect } from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any; // Firestore Timestamp
  unreadCount?: number;
  [key: string]: any;
}

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook để listen conversations real-time từ Firestore
 */
export function useConversations(): UseConversationsReturn {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const userId = user.id;
    let unsubscribe: (() => void) | null = null;

    // Check if Firestore is available
    try {
      const db = firestore();
      if (!db) {
        setError(new Error('Firestore is not available. Please rebuild app.'));
        setLoading(false);
        return;
      }

      // Real-time listener cho conversations
      // Note: Cần composite index nếu dùng where + orderBy
      // Tạm thời chỉ dùng where, không orderBy để tránh lỗi
      const query = db
        .collection('chats')
        .where('participants', 'array-contains', userId);

      unsubscribe = query.onSnapshot(
        (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const conversationList: Conversation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            conversationList.push({
              id: doc.id,
              ...data,
            } as Conversation);
          });
          // Sort manually by lastMessageTime
          conversationList.sort((a, b) => {
            const timeA = a.lastMessageTime?.toDate ? a.lastMessageTime.toDate().getTime() : 0;
            const timeB = b.lastMessageTime?.toDate ? b.lastMessageTime.toDate().getTime() : 0;
            return timeB - timeA; // Descending
          });
          setConversations(conversationList);
          setLoading(false);
          setError(null);
        },
        (err: Error) => {
          setError(err);
          setLoading(false);
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

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          // Silent fail
        }
      }
    };
  }, [user?.id]);

  return { conversations, loading, error };
}
