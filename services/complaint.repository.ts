import { getDatabase } from './database.service';
import { Complaint } from './database.types';

/**
 * Get all complaints by a user
 */
export const getComplaintsByUser = async (userId: string): Promise<Complaint[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Complaint>(
    'SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return result;
};

/**
 * Get complaints by status
 */
export const getComplaintsByStatus = async (userId: string, status: string): Promise<Complaint[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Complaint>(
    'SELECT * FROM complaints WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
    [userId, status]
  );
  return result;
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (id: string): Promise<Complaint | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Complaint>(
    'SELECT * FROM complaints WHERE id = ?',
    [id]
  );
  return result || null;
};

/**
 * Get complaints for a caregiver
 */
export const getComplaintsByCaregiver = async (caregiverId: string): Promise<Complaint[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Complaint>(
    'SELECT * FROM complaints WHERE caregiver_id = ? ORDER BY created_at DESC',
    [caregiverId]
  );
  return result;
};

/**
 * Get complaints for an appointment
 */
export const getComplaintsByAppointment = async (appointmentId: string): Promise<Complaint[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Complaint>(
    'SELECT * FROM complaints WHERE appointment_id = ? ORDER BY created_at DESC',
    [appointmentId]
  );
  return result;
};

/**
 * Create a new complaint
 */
export const createComplaint = async (complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `complaint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.runAsync(
    `INSERT INTO complaints (
      id, user_id, appointment_id, caregiver_id, title, description,
      category, status, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      complaint.user_id,
      complaint.appointment_id || null,
      complaint.caregiver_id || null,
      complaint.title,
      complaint.description,
      complaint.category,
      complaint.status || 'pending',
      complaint.priority || 'medium'
    ]
  );
  
  return id;
};

/**
 * Update complaint status
 */
export const updateComplaintStatus = async (id: string, status: string, response?: string): Promise<void> => {
  const db = await getDatabase();
  
  if (response) {
    const resolvedAt = status === 'resolved' ? new Date().toISOString() : null;
    await db.runAsync(
      'UPDATE complaints SET status = ?, response = ?, resolved_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, response, resolvedAt, id]
    );
  } else {
    await db.runAsync(
      'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );
  }
};

/**
 * Update complaint
 */
export const updateComplaint = async (id: string, complaint: Partial<Complaint>): Promise<void> => {
  const db = await getDatabase();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(complaint).forEach(([key, value]) => {
    if (key !== 'id' && value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) return;
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  const query = `UPDATE complaints SET ${fields.join(', ')} WHERE id = ?`;
  await db.runAsync(query, ...values);
};

/**
 * Delete complaint
 */
export const deleteComplaint = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM complaints WHERE id = ?', [id]);
};

/**
 * Check if user has complained about an appointment
 */
export const hasComplainedAboutAppointment = async (userId: string, appointmentId: string): Promise<boolean> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM complaints WHERE user_id = ? AND appointment_id = ?',
    [userId, appointmentId]
  );
  return (result?.count || 0) > 0;
};

export default {
  getComplaintsByUser,
  getComplaintsByStatus,
  getComplaintById,
  getComplaintsByCaregiver,
  getComplaintsByAppointment,
  createComplaint,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  hasComplainedAboutAppointment,
};
