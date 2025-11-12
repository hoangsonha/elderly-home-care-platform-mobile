import { getDatabase } from './database.service';
import { Caregiver, CaregiverRow } from './database.types';

/**
 * Convert database row to Caregiver object
 */
const rowToCaregiver = (row: CaregiverRow): Caregiver => {
  return {
    ...row,
    specializations: row.specializations ? JSON.parse(row.specializations) : [],
    certificates: row.certificates ? JSON.parse(row.certificates) : [],
    languages: row.languages ? JSON.parse(row.languages) : [],
    is_verified: Boolean(row.is_verified),
    is_available: Boolean(row.is_available),
  };
};

/**
 * Convert Caregiver object to database row
 */
const caregiverToRow = (caregiver: Partial<Caregiver>): Partial<CaregiverRow> => {
  return {
    ...caregiver,
    specializations: caregiver.specializations ? JSON.stringify(caregiver.specializations) : '[]',
    certificates: caregiver.certificates ? JSON.stringify(caregiver.certificates) : '[]',
    languages: caregiver.languages ? JSON.stringify(caregiver.languages) : '[]',
    is_verified: caregiver.is_verified ? 1 : 0,
    is_available: caregiver.is_available ? 1 : 0,
  };
};

/**
 * Get all caregivers
 */
export const getAllCaregivers = async (): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers ORDER BY rating DESC, total_reviews DESC'
  );
  return result.map(rowToCaregiver);
};

/**
 * Get available caregivers
 */
export const getAvailableCaregivers = async (): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE is_available = 1 ORDER BY rating DESC'
  );
  return result.map(rowToCaregiver);
};

/**
 * Get a caregiver by ID
 */
export const getCaregiverById = async (id: string): Promise<Caregiver | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE id = ?',
    [id]
  );
  return result ? rowToCaregiver(result) : null;
};

/**
 * Search caregivers by name
 */
export const searchCaregivers = async (searchTerm: string): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE name LIKE ? ORDER BY rating DESC',
    [`%${searchTerm}%`]
  );
  return result.map(rowToCaregiver);
};

/**
 * Filter caregivers by rating
 */
export const getCaregiversByRating = async (minRating: number): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE rating >= ? ORDER BY rating DESC',
    [minRating]
  );
  return result.map(rowToCaregiver);
};

/**
 * Filter caregivers by hourly rate range
 */
export const getCaregiversByPriceRange = async (minRate: number, maxRate: number): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE hourly_rate >= ? AND hourly_rate <= ? ORDER BY hourly_rate ASC',
    [minRate, maxRate]
  );
  return result.map(rowToCaregiver);
};

/**
 * Get verified caregivers
 */
export const getVerifiedCaregivers = async (): Promise<Caregiver[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<CaregiverRow>(
    'SELECT * FROM caregivers WHERE is_verified = 1 ORDER BY rating DESC'
  );
  return result.map(rowToCaregiver);
};

/**
 * Create a new caregiver (for admin/seeding)
 */
export const createCaregiver = async (caregiver: Omit<Caregiver, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `caregiver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const row = caregiverToRow({ ...caregiver, id });
  
  const query = `
    INSERT INTO caregivers (
      id, name, age, gender, avatar, phone, address,
      experience_years, rating, total_reviews, hourly_rate,
      specializations, certificates, languages, bio,
      is_verified, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.runAsync(
    query,
    id,
    row.name!,
    row.age || null,
    row.gender || null,
    row.avatar || null,
    row.phone || null,
    row.address || null,
    row.experience_years || null,
    row.rating || 0,
    row.total_reviews || 0,
    row.hourly_rate || null,
    row.specializations || '[]',
    row.certificates || '[]',
    row.languages || '[]',
    row.bio || null,
    row.is_verified || 0,
    row.is_available || 1
  );
  
  return id;
};

/**
 * Update caregiver rating
 */
export const updateCaregiverRating = async (id: string, newRating: number): Promise<void> => {
  const db = await getDatabase();
  
  // Get current values
  const caregiver = await getCaregiverById(id);
  if (!caregiver) return;
  
  const totalReviews = caregiver.total_reviews + 1;
  const currentTotal = caregiver.rating * caregiver.total_reviews;
  const newAverageRating = (currentTotal + newRating) / totalReviews;
  
  await db.runAsync(
    'UPDATE caregivers SET rating = ?, total_reviews = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newAverageRating, totalReviews, id]
  );
};

/**
 * Update caregiver availability
 */
export const updateCaregiverAvailability = async (id: string, isAvailable: boolean): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE caregivers SET is_available = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [isAvailable ? 1 : 0, id]
  );
};

export default {
  getAllCaregivers,
  getAvailableCaregivers,
  getCaregiverById,
  searchCaregivers,
  getCaregiversByRating,
  getCaregiversByPriceRange,
  getVerifiedCaregivers,
  createCaregiver,
  updateCaregiverRating,
  updateCaregiverAvailability,
};
