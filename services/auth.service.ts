// auth.service.ts

import { getDatabase } from './database.service';

export const AuthService = {
  // Login: kiểm tra email + password từ SQLite
  login: async (email: string, password: string) => {
    const db = await getDatabase();
    if (!db) return null;

    const row = await db.getFirstAsync<any>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (!row) return null;

    // For development we store plaintext password; in production hash & salt
    if (row.password !== password) return null;

    return row;
  },

  // Register: insert into users table
  register: async (payload: any) => {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');

    const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const email = payload.email;
    const password = payload.password;
    const name = payload.fullName || payload.name || null;
    const role = payload.role || payload.userType || 'Care Seeker';
    const status = payload.status || 'approved';
    const hasCompletedProfile = payload.hasCompletedProfile ? 1 : 0;

    // Check for existing email to provide a friendly error instead of a SQLite unique-constraint crash
    const existing = await db.getFirstAsync<any>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing) {
      const err: any = new Error('EMAIL_ALREADY_EXISTS');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }

    await db.runAsync(
      `INSERT INTO users (id, email, password, name, role, status, hasCompletedProfile)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, email, password, name, role, status, hasCompletedProfile]
    );

    const created = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [id]);
    return created;
  },
  // Update profile information for a user and mark profile as completed
  updateProfile: async (userId: string, profile: any) => {
    const db = await getDatabase();
    if (!db) throw new Error('Database not available');

    console.log('💾 Saving profile to database for user:', userId);

    // Update users table: set name, phone, dateOfBirth and mark hasCompletedProfile
    try {
      await db.runAsync(
        `UPDATE users SET 
          name = ?, 
          phone = ?,
          dateOfBirth = ?,
          address = ?,
          avatar = ?,
          hasCompletedProfile = 1, 
          updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [
          profile.name || null,
          profile.phone || null,
          profile.dateOfBirth || null,
          profile.address || null,
          profile.profileImage || null,
          userId
        ]
      );
      console.log('✅ Users table updated successfully');
    } catch (err) {
      console.error('❌ Failed to update users table:', err);
      throw err;
    }

    // Upsert into caregivers table using the same id as userId
    const caregiverEntry = {
      id: userId,
      name: profile.name || null,
      age: profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null,
      gender: profile.gender || null,
      phone: profile.phone || null,
      address: profile.address || null,
      experience_years: profile.yearsOfExperience ? Number(profile.yearsOfExperience) : 0,
      bio: profile.introduction || null,
      avatar: profile.profileImage || null,
      certificates: profile.certificates ? JSON.stringify(profile.certificates) : null,
      languages: null, // Can be added later
      specializations: null, // Can be added later
    };

    try {
      // Check if caregiver record exists
      const existingCaregiver = await db.getFirstAsync<any>(
        'SELECT id FROM caregivers WHERE id = ?',
        [userId]
      );

      if (existingCaregiver) {
        // Update existing record
        await db.runAsync(
          `UPDATE caregivers SET 
            name = ?,
            age = ?,
            gender = ?,
            phone = ?,
            address = ?,
            experience_years = ?,
            bio = ?,
            avatar = ?,
            certificates = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [
            caregiverEntry.name,
            caregiverEntry.age,
            caregiverEntry.gender,
            caregiverEntry.phone,
            caregiverEntry.address,
            caregiverEntry.experience_years,
            caregiverEntry.bio,
            caregiverEntry.avatar,
            caregiverEntry.certificates,
            caregiverEntry.id,
          ]
        );
        console.log('✅ Caregivers table updated successfully');
      } else {
        // Insert new record
        await db.runAsync(
          `INSERT INTO caregivers (
            id, name, age, gender, phone, address, 
            experience_years, bio, avatar, certificates,
            rating, total_reviews, is_verified, is_available,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            caregiverEntry.id,
            caregiverEntry.name,
            caregiverEntry.age,
            caregiverEntry.gender,
            caregiverEntry.phone,
            caregiverEntry.address,
            caregiverEntry.experience_years,
            caregiverEntry.bio,
            caregiverEntry.avatar,
            caregiverEntry.certificates,
          ]
        );
        console.log('✅ New caregiver record created successfully');
      }
    } catch (err) {
      console.error('❌ Failed to save caregivers table:', err);
      throw err;
    }

    // Return the updated user row
    const updated = await db.getFirstAsync<any>('SELECT * FROM users WHERE id = ?', [userId]);
    console.log('✅ Profile update complete, returning updated user');
    return updated;
  },
};
