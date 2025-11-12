import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Check if SQLite is supported on current platform
 */
export const isSQLiteSupported = (): boolean => {
  return Platform.OS !== 'web';
};

/**
 * Open or create the database
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase | null> => {
  if (!isSQLiteSupported()) {
    console.warn('SQLite is not supported on web platform');
    return null;
  }
  
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('elderly_care.db');
  await initializeTables();
  return db;
};

/**
 * Get the database instance
 */
export const getDatabase = async (): Promise<SQLite.SQLiteDatabase | null> => {
  if (!isSQLiteSupported()) {
    return null;
  }
  
  if (!db) {
    return await openDatabase();
  }
  return db;
};

/**
 * Initialize all database tables
 */
const initializeTables = async () => {
  if (!db) return;

  try {
    // Elderly profiles table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS elderly_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        avatar TEXT,
        address TEXT,
        phone TEXT,
        blood_type TEXT,
        health_condition TEXT,
        underlying_diseases TEXT,
        medications TEXT,
        allergies TEXT,
        special_conditions TEXT,
        independence_level TEXT,
        living_environment TEXT,
        hobbies TEXT,
        favorite_activities TEXT,
        food_preferences TEXT,
        emergency_contact TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Caregivers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS caregivers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        avatar TEXT,
        phone TEXT,
        address TEXT,
        experience_years INTEGER,
        rating REAL DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        hourly_rate REAL,
        specializations TEXT,
        certificates TEXT,
        languages TEXT,
        bio TEXT,
        is_verified BOOLEAN DEFAULT 0,
        is_available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Bookings/Appointments table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        caregiver_id TEXT NOT NULL,
        elderly_profile_id TEXT NOT NULL,
        booking_type TEXT NOT NULL,
        status TEXT NOT NULL,
        package_type TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT,
        duration TEXT,
        work_location TEXT,
        tasks TEXT,
        notes TEXT,
        total_amount REAL,
        payment_status TEXT DEFAULT 'pending',
        payment_method TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caregiver_id) REFERENCES caregivers(id),
        FOREIGN KEY (elderly_profile_id) REFERENCES elderly_profiles(id)
      );
    `);

    // Reviews table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        appointment_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        caregiver_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (caregiver_id) REFERENCES caregivers(id)
      );
    `);

    // Complaints table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        appointment_id TEXT,
        caregiver_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        response TEXT,
        resolved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (caregiver_id) REFERENCES caregivers(id)
      );
    `);

    // Emergency contacts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS emergency_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        elderly_profile_id TEXT,
        name TEXT NOT NULL,
        relationship TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT,
        is_primary BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (elderly_profile_id) REFERENCES elderly_profiles(id)
      );
    `);

    // Favorites/Saved caregivers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorite_caregivers (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        caregiver_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caregiver_id) REFERENCES caregivers(id),
        UNIQUE(user_id, caregiver_id)
      );
    `);

    // Chat messages table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        sender_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notifications table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        related_id TEXT,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    throw error;
  }
};

/**
 * Close the database connection
 */
export const closeDatabase = async () => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

/**
 * Clear all data from database (for testing/development)
 */
export const clearAllData = async () => {
  const database = await getDatabase();
  if (!database) return;
  
  await database.execAsync(`
    DELETE FROM chat_messages;
    DELETE FROM notifications;
    DELETE FROM favorite_caregivers;
    DELETE FROM emergency_contacts;
    DELETE FROM complaints;
    DELETE FROM reviews;
    DELETE FROM appointments;
    DELETE FROM caregivers;
    DELETE FROM elderly_profiles;
  `);
  
  console.log('🗑️ All data cleared from database');
};

/**
 * Drop all tables (for testing/development)
 */
export const dropAllTables = async () => {
  const database = await getDatabase();
  if (!database) return;
  
  await database.execAsync(`
    DROP TABLE IF EXISTS chat_messages;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS favorite_caregivers;
    DROP TABLE IF EXISTS emergency_contacts;
    DROP TABLE IF EXISTS complaints;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS appointments;
    DROP TABLE IF EXISTS caregivers;
    DROP TABLE IF EXISTS elderly_profiles;
  `);
  
  console.log('🗑️ All tables dropped from database');
  await initializeTables();
};

export default {
  openDatabase,
  getDatabase,
  closeDatabase,
  clearAllData,
  dropAllTables,
};
