import { useState, useEffect } from 'react';
import { openDatabase, isSQLiteSupported } from '@/services/database.service';
import { seedAllData } from '@/services/database.seed';

/**
 * Hook to initialize database on app start
 */
export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Check if SQLite is supported (skip on web)
        if (!isSQLiteSupported()) {
          console.warn('⚠️ SQLite not supported on this platform (web), skipping database initialization');
          setIsReady(true);
          return;
        }

        await openDatabase();
        setIsReady(true);
        console.log('✅ Database initialized successfully');
      } catch (err) {
        console.error('❌ Error initializing database:', err);
        setError(err as Error);
        // Still mark as ready to not block app
        setIsReady(true);
      }
    };

    initDatabase();
  }, []);

  return { isReady, error };
};

/**
 * Hook to seed database with initial data (for development/testing)
 */
export const useDatabaseSeeder = (userId: string, shouldSeed: boolean = false) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shouldSeed) return;

    const seed = async () => {
      setIsSeeding(true);
      try {
        await seedAllData(userId);
        setIsSeeded(true);
        console.log('✅ Database seeded successfully');
      } catch (err) {
        console.error('❌ Error seeding database:', err);
        setError(err as Error);
      } finally {
        setIsSeeding(false);
      }
    };

    seed();
  }, [userId, shouldSeed]);

  return { isSeeding, isSeeded, error };
};
