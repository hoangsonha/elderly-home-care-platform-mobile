import { getDatabase } from './database.service';
import { Appointment, AppointmentRow } from './database.types';

/**
 * Convert database row to Appointment object
 */
const rowToAppointment = (row: AppointmentRow): Appointment => {
  return {
    ...row,
    tasks: row.tasks ? JSON.parse(row.tasks) : [],
  };
};

/**
 * Convert Appointment object to database row
 */
const appointmentToRow = (appointment: Partial<Appointment>): Partial<AppointmentRow> => {
  return {
    ...appointment,
    tasks: appointment.tasks ? JSON.stringify(appointment.tasks) : '[]',
  };
};

/**
 * Get all appointments for a user
 */
export const getAllAppointments = async (userId: string): Promise<Appointment[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<AppointmentRow>(
    'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return result.map(rowToAppointment);
};

/**
 * Get all appointments for a caregiver
 */
export const getAppointmentsByCaregiver = async (caregiverId: string): Promise<Appointment[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<AppointmentRow>(
    'SELECT * FROM appointments WHERE caregiver_id = ? ORDER BY created_at DESC',
    [caregiverId]
  );
  return result.map(rowToAppointment);
};

/**
 * Get appointments by status
 */
export const getAppointmentsByStatus = async (userId: string, status: string): Promise<Appointment[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<AppointmentRow>(
    'SELECT * FROM appointments WHERE user_id = ? AND status = ? ORDER BY created_at DESC',
    [userId, status]
  );
  return result.map(rowToAppointment);
};

/**
 * Get an appointment by ID
 */
export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<AppointmentRow>(
    'SELECT * FROM appointments WHERE id = ?',
    [id]
  );
  return result ? rowToAppointment(result) : null;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  const db = await getDatabase();
  const id = `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const row = appointmentToRow({ ...appointment, id });
  
  const query = `
    INSERT INTO appointments (
      id, user_id, caregiver_id, elderly_profile_id, booking_type,
      status, package_type, start_date, end_date, start_time, end_time,
      duration, work_location, tasks, notes, total_amount,
      payment_status, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  await db.runAsync(
    query,
    id,
    row.user_id!,
    row.caregiver_id!,
    row.elderly_profile_id!,
    row.booking_type!,
    row.status!,
    row.package_type || null,
    row.start_date!,
    row.end_date || null,
    row.start_time!,
    row.end_time || null,
    row.duration || null,
    row.work_location || null,
    row.tasks || '[]',
    row.notes || null,
    row.total_amount || null,
    row.payment_status || 'pending',
    row.payment_method || null
  );
  
  return id;
};

/**
 * Update an appointment
 */
export const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<void> => {
  const db = await getDatabase();
  const row = appointmentToRow(appointment);
  
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
  
  const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;
  await db.runAsync(query, ...values);
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (id: string, status: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE appointments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [status, id]
  );
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (id: string, paymentStatus: string, paymentMethod?: string): Promise<void> => {
  const db = await getDatabase();
  if (paymentMethod) {
    await db.runAsync(
      'UPDATE appointments SET payment_status = ?, payment_method = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [paymentStatus, paymentMethod, id]
    );
  } else {
    await db.runAsync(
      'UPDATE appointments SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [paymentStatus, id]
    );
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (id: string): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
};

/**
 * Get upcoming appointments
 */
export const getUpcomingAppointments = async (userId: string): Promise<Appointment[]> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getAllAsync<AppointmentRow>(
    `SELECT * FROM appointments 
     WHERE user_id = ? 
     AND status IN ('pending', 'confirmed') 
     AND start_date >= ? 
     ORDER BY start_date ASC, start_time ASC`,
    [userId, today]
  );
  return result.map(rowToAppointment);
};

/**
 * Get today's appointments
 */
export const getTodayAppointments = async (userId: string): Promise<Appointment[]> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await db.getAllAsync<AppointmentRow>(
    `SELECT * FROM appointments 
     WHERE user_id = ? 
     AND start_date = ? 
     ORDER BY start_time ASC`,
    [userId, today]
  );
  return result.map(rowToAppointment);
};

/**
 * Get appointments by date range
 */
export const getAppointmentsByDateRange = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<AppointmentRow>(
    `SELECT * FROM appointments 
     WHERE user_id = ? 
     AND start_date >= ? 
     AND start_date <= ? 
     ORDER BY start_date ASC, start_time ASC`,
    [userId, startDate, endDate]
  );
  return result.map(rowToAppointment);
};

export default {
  getAllAppointments,
  getAppointmentsByCaregiver,
  getAppointmentsByStatus,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  updatePaymentStatus,
  deleteAppointment,
  getUpcomingAppointments,
  getTodayAppointments,
  getAppointmentsByDateRange,
};
