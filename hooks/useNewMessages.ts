import { useAuth } from '@/contexts/AuthContext';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface NewMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any; // Firestore Timestamp
  read: boolean;
  [key: string]: any;
}

interface UseNewMessagesReturn {
  newMessages: NewMessage[];
  unreadCount: number;
}

/**
 * Hook để listen messages mới gửi đến user (chưa đọc)
 */
export function useNewMessages(): UseNewMessagesReturn {
  const { user } = useAuth();
  const [newMessages, setNewMessages] = useState<NewMessage[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setNewMessages([]);
      return;
    }

    const userId = user.id;
    let unsubscribe: (() => void) | null = null;

    try {
      const db = firestore();
      if (!db) {
        return;
      }

      // Listen cho messages mới gửi đến user
      // Note: Cần composite index nếu dùng multiple where + orderBy
      // Tạm thời chỉ dùng where, không orderBy để tránh lỗi
      const query = db
        .collection('messages')
        .where('receiverId', '==', userId)
        .where('read', '==', false);

      unsubscribe = query.onSnapshot(
        (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const unreadMessages: NewMessage[] = [];
          snapshot.forEach((doc) => {
            unreadMessages.push({
              id: doc.id,
              ...doc.data(),
            } as NewMessage);
          });
          // Sort manually by timestamp (descending)
          unreadMessages.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
            return timeB - timeA; // Descending
          });
          setNewMessages(unreadMessages);
        },
        (error: Error) => {
          // Silent fail
        }
      );
    } catch (err: any) {
      // Silent fail
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

  return {
    newMessages,
    unreadCount: newMessages.length,
  };
}
