// Database Service
export { default as DatabaseService, openDatabase, getDatabase, closeDatabase, clearAllData, dropAllTables } from './database.service';

// Types
export * from './database.types';

// Repositories
export { default as ElderlyRepository } from './elderly.repository';
export { default as AppointmentRepository } from './appointment.repository';
export { default as CaregiverRepository } from './caregiver.repository';

// Re-export commonly used functions
export {
  getAllElderlyProfiles,
  getElderlyProfileById,
  createElderlyProfile,
  updateElderlyProfile,
  deleteElderlyProfile,
  searchElderlyProfiles,
} from './elderly.repository';

export {
  getAllAppointments,
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
} from './appointment.repository';

export {
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
} from './caregiver.repository';
