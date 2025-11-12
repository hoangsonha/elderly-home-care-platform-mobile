import { getDatabase } from './database.service';
import { Notification, NotificationRow } from './database.types';

/**
 * Convert row to Notification
 */
const rowToNotification = (row: NotificationRow): Notification => {
  return {
    ...row,
    is_read: Boolean(row.is_read),
  };
};

/**
 * Get all notifications for a user
 */
export const getNotificationsByUser = async (userId: string): Promise<Notification[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<NotificationRow>(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return result.map(rowToNotification);
};

/**
 * Get unread notifications
 */
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<NotificationRow>(
    'SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC',
    [userId]
  );
  return result.map(rowToNotification);
};

/**
 * Get notifications by type
 */
export const getNotificationsByType = async (userId: string, type: string): Promise<Notification[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<NotificationRow>(
    'SELECT * FROM notifications WHERE user_id = ? AND type = ? ORDER BY created_at DESC',
    [userId, type]
  );
  return result.map(rowToNotification);
};

/**
 * Get notification by ID
 */
export const getNotificationById = async (id: string): Promise<Notification | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<NotificationRow>(
    'SELECT * FROM notifications WHERE id = ?',
    [id]
  );
  return result ? rowToNotification(result) : null;
};

/**
 * Create notification
 */
export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.runAsync(
    `INSERT INTO notifications (id, user_id, title, message, type, related_id, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      notification.user_id,
      notification.title,
      notification.message,
      notification.type,
      notification.related_id || null,
      notification.is_read ? 1 : 0
    ]
  );
  
  return id;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE notifications SET is_read = 1 WHERE id = ?',
    [id]
  );
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
    [userId]
  );
};

/**
 * Delete notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications WHERE id = ?', [id]);
};

/**
 * Delete all notifications for a user
 */
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM notifications WHERE user_id = ?', [userId]);
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return result?.count || 0;
};

/**
 * Delete old notifications (older than X days)
 */
export const deleteOldNotifications = async (userId: string, daysOld: number = 30): Promise<void> => {
  const db = await getDatabase();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  await db.runAsync(
    'DELETE FROM notifications WHERE user_id = ? AND created_at < ?',
    [userId, cutoffDate.toISOString()]
  );
};

export default {
  getNotificationsByUser,
  getUnreadNotifications,
  getNotificationsByType,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  deleteOldNotifications,
};
