import { getDatabase } from './database.service';
import { Review } from './database.types';

/**
 * Get all reviews for a caregiver
 */
export const getReviewsByCaregiver = async (caregiverId: string): Promise<Review[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE caregiver_id = ? ORDER BY created_at DESC',
    [caregiverId]
  );
  return result;
};

/**
 * Get all reviews by a user
 */
export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Review>(
    'SELECT * FROM reviews WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return result;
};

/**
 * Get review for an appointment
 */
export const getReviewByAppointment = async (appointmentId: string): Promise<Review | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Review>(
    'SELECT * FROM reviews WHERE appointment_id = ?',
    [appointmentId]
  );
  return result || null;
};

/**
 * Create a new review
 */
export const createReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.runAsync(
    `INSERT INTO reviews (id, appointment_id, user_id, caregiver_id, rating, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, review.appointment_id, review.user_id, review.caregiver_id, review.rating, review.comment || null]
  );
  
  return id;
};

/**
 * Update a review
 */
export const updateReview = async (id: string, rating: number, comment?: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment || null, id]
  );
};

/**
 * Delete a review
 */
export const deleteReview = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM reviews WHERE id = ?', [id]);
};

/**
 * Get average rating for a caregiver
 */
export const getAverageRating = async (caregiverId: string): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ avg_rating: number }>(
    'SELECT AVG(rating) as avg_rating FROM reviews WHERE caregiver_id = ?',
    [caregiverId]
  );
  return result?.avg_rating || 0;
};

/**
 * Check if user has reviewed an appointment
 */
export const hasUserReviewedAppointment = async (userId: string, appointmentId: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM reviews WHERE user_id = ? AND appointment_id = ?',
    [userId, appointmentId]
  );
  return (result?.count || 0) > 0;
};

export default {
  getReviewsByCaregiver,
  getReviewsByUser,
  getReviewByAppointment,
  createReview,
  updateReview,
  deleteReview,
  getAverageRating,
  hasUserReviewedAppointment,
};
