import { getDatabase } from './database.service';
import { EmergencyContact, EmergencyContactRow } from './database.types';

/**
 * Convert row to EmergencyContact
 */
const rowToEmergencyContact = (row: EmergencyContactRow): EmergencyContact => {
  return {
    ...row,
    is_primary: Boolean(row.is_primary),
  };
};

/**
 * Get all emergency contacts for a user
 */
export const getEmergencyContactsByUser = async (userId: string): Promise<EmergencyContact[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC',
    [userId]
  );
  return result.map(rowToEmergencyContact);
};

/**
 * Get emergency contacts for an elderly profile
 */
export const getEmergencyContactsByElderly = async (elderlyProfileId: string): Promise<EmergencyContact[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts WHERE elderly_profile_id = ? ORDER BY is_primary DESC',
    [elderlyProfileId]
  );
  return result.map(rowToEmergencyContact);
};

/**
 * Get emergency contact by ID
 */
export const getEmergencyContactById = async (id: string): Promise<EmergencyContact | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts WHERE id = ?',
    [id]
  );
  return result ? rowToEmergencyContact(result) : null;
};

/**
 * Get primary emergency contact
 */
export const getPrimaryEmergencyContact = async (userId: string): Promise<EmergencyContact | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<EmergencyContactRow>(
    'SELECT * FROM emergency_contacts WHERE user_id = ? AND is_primary = 1 LIMIT 1',
    [userId]
  );
  return result ? rowToEmergencyContact(result) : null;
};

/**
 * Create emergency contact
 */
export const createEmergencyContact = async (contact: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // If setting as primary, unset other primary contacts
  if (contact.is_primary) {
    await db.runAsync(
      'UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = ?',
      [contact.user_id]
    );
  }
  
  await db.runAsync(
    `INSERT INTO emergency_contacts (
      id, user_id, elderly_profile_id, name, relationship, phone,
      email, address, is_primary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      contact.user_id,
      contact.elderly_profile_id || null,
      contact.name,
      contact.relationship,
      contact.phone,
      contact.email || null,
      contact.address || null,
      contact.is_primary ? 1 : 0
    ]
  );
  
  return id;
};

/**
 * Update emergency contact
 */
export const updateEmergencyContact = async (id: string, contact: Partial<EmergencyContact>): Promise<void> => {
  const db = await getDatabase();
  
  // If setting as primary, unset other primary contacts
  if (contact.is_primary) {
    const existing = await getEmergencyContactById(id);
    if (existing) {
      await db.runAsync(
        'UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = ? AND id != ?',
        [existing.user_id, id]
      );
    }
  }
  
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(contact).forEach(([key, value]) => {
    if (key !== 'id' && value !== undefined) {
      if (key === 'is_primary') {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
  });
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE emergency_contacts SET ${fields.join(', ')} WHERE id = ?`;
  await db.runAsync(query, ...values);
};

/**
 * Delete emergency contact
 */
export const deleteEmergencyContact = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM emergency_contacts WHERE id = ?', [id]);
};

/**
 * Set primary emergency contact
 */
export const setPrimaryContact = async (id: string, userId: string): Promise<void> => {
  const db = await getDatabase();
  
  // Unset all primary contacts for user
  await db.runAsync(
    'UPDATE emergency_contacts SET is_primary = 0 WHERE user_id = ?',
    [userId]
  );
  
  // Set new primary
  await db.runAsync(
    'UPDATE emergency_contacts SET is_primary = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id]
  );
};

export default {
  getEmergencyContactsByUser,
  getEmergencyContactsByElderly,
  getEmergencyContactById,
  getPrimaryEmergencyContact,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  setPrimaryContact,
};
