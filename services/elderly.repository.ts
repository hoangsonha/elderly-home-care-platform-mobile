import { getDatabase, isSQLiteSupported } from './database.service';
import { ElderlyProfile, ElderlyProfileRow } from './database.types';
import * as SQLite from 'expo-sqlite';

/**
 * Helper to get database and throw if not available
 */
const getDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!isSQLiteSupported()) {
    throw new Error('SQLite not supported on this platform');
  }
  const db = await getDatabase();
  if (!db) throw new Error('Database not available');
  return db;
};

/**
 * Convert database row to ElderlyProfile object
 */
const rowToElderlyProfile = (row: ElderlyProfileRow): ElderlyProfile => {
  return {
    ...row,
    underlying_diseases: row.underlying_diseases ? JSON.parse(row.underlying_diseases) : [],
    medications: row.medications ? JSON.parse(row.medications) : [],
    allergies: row.allergies ? JSON.parse(row.allergies) : [],
    special_conditions: row.special_conditions ? JSON.parse(row.special_conditions) : [],
    independence_level: row.independence_level ? JSON.parse(row.independence_level) : undefined,
    living_environment: row.living_environment ? JSON.parse(row.living_environment) : undefined,
    hobbies: row.hobbies ? JSON.parse(row.hobbies) : [],
    favorite_activities: row.favorite_activities ? JSON.parse(row.favorite_activities) : [],
    food_preferences: row.food_preferences ? JSON.parse(row.food_preferences) : [],
    emergency_contact: row.emergency_contact ? JSON.parse(row.emergency_contact) : undefined,
  };
};

/**
 * Convert ElderlyProfile object to database row
 */
const elderlyProfileToRow = (profile: Partial<ElderlyProfile>): Partial<ElderlyProfileRow> => {
  return {
    ...profile,
    underlying_diseases: profile.underlying_diseases ? JSON.stringify(profile.underlying_diseases) : '[]',
    medications: profile.medications ? JSON.stringify(profile.medications) : '[]',
    allergies: profile.allergies ? JSON.stringify(profile.allergies) : '[]',
    special_conditions: profile.special_conditions ? JSON.stringify(profile.special_conditions) : '[]',
    independence_level: profile.independence_level ? JSON.stringify(profile.independence_level) : '{}',
    living_environment: profile.living_environment ? JSON.stringify(profile.living_environment) : '{}',
    hobbies: profile.hobbies ? JSON.stringify(profile.hobbies) : '[]',
    favorite_activities: profile.favorite_activities ? JSON.stringify(profile.favorite_activities) : '[]',
    food_preferences: profile.food_preferences ? JSON.stringify(profile.food_preferences) : '[]',
    emergency_contact: profile.emergency_contact ? JSON.stringify(profile.emergency_contact) : '{}',
  };
};

/**
 * Get all elderly profiles for a user
 */
export const getAllElderlyProfiles = async (userId: string): Promise<ElderlyProfile[]> => {
  const db = await getDB();
  if (!db) return [];
  
  const result = await db.getAllAsync<ElderlyProfileRow>(
    'SELECT * FROM elderly_profiles WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return result.map(rowToElderlyProfile);
};

/**
 * Get an elderly profile by ID
 */
export const getElderlyProfileById = async (id: string): Promise<ElderlyProfile | null> => {
  const db = await getDB();
  const result = await db.getFirstAsync<ElderlyProfileRow>(
    'SELECT * FROM elderly_profiles WHERE id = ?',
    [id]
  );
  return result ? rowToElderlyProfile(result) : null;
};

/**
 * Create a new elderly profile
 */
export const createElderlyProfile = async (profile: Omit<ElderlyProfile, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const db = await getDB();
  const id = `elderly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const row = elderlyProfileToRow({ ...profile, id });
  
  const query = `
    INSERT INTO elderly_profiles (
      id, user_id, name, age, gender, avatar, address, phone,
      blood_type, health_condition, underlying_diseases, medications,
      allergies, special_conditions, independence_level, living_environment,
      hobbies, favorite_activities, food_preferences, emergency_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.runAsync(
    query,
    id,
    row.user_id!,
    row.name!,
    row.age!,
    row.gender!,
    row.avatar || null,
    row.address || null,
    row.phone || null,
    row.blood_type || null,
    row.health_condition || null,
    row.underlying_diseases || '[]',
    row.medications || '[]',
    row.allergies || '[]',
    row.special_conditions || '[]',
    row.independence_level || '{}',
    row.living_environment || '{}',
    row.hobbies || '[]',
    row.favorite_activities || '[]',
    row.food_preferences || '[]',
    row.emergency_contact || '{}'
  );
  
  return id;
};

/**
 * Update an elderly profile
 */
export const updateElderlyProfile = async (id: string, profile: Partial<ElderlyProfile>): Promise<void> => {
  const db = await getDB();
  const row = elderlyProfileToRow(profile);
  
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(row).forEach(([key, value]) => {
    if (key !== 'id' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE elderly_profiles SET ${fields.join(', ')} WHERE id = ?`;
  await db.runAsync(query, ...values);
};

/**
 * Delete an elderly profile
 */
export const deleteElderlyProfile = async (id: string): Promise<void> => {
  const db = await getDB();
  await db.runAsync('DELETE FROM elderly_profiles WHERE id = ?', [id]);
};

/**
 * Search elderly profiles by name
 */
export const searchElderlyProfiles = async (userId: string, searchTerm: string): Promise<ElderlyProfile[]> => {
  const db = await getDB();
  const result = await db.getAllAsync<ElderlyProfileRow>(
    'SELECT * FROM elderly_profiles WHERE user_id = ? AND name LIKE ? ORDER BY created_at DESC',
    [userId, `%${searchTerm}%`]
  );
  return result.map(rowToElderlyProfile);
};

export default {
  getAllElderlyProfiles,
  getElderlyProfileById,
  createElderlyProfile,
  updateElderlyProfile,
  deleteElderlyProfile,
  searchElderlyProfiles,
};
