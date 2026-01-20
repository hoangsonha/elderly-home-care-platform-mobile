/**
 * Utility function để tạo chatId từ 2 userIds
 * Đảm bảo chatId luôn giống nhau dù user nào gọi
 */
export function getChatId(userId1: string, userId2: string): string {
  // Sort để đảm bảo chatId luôn giống nhau
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
}
