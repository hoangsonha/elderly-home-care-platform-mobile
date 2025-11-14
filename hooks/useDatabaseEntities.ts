import * as AppointmentRepository from '@/services/appointment.repository';
import * as CaregiverRepository from '@/services/caregiver.repository';
import { Appointment, Caregiver, ElderlyProfile } from '@/services/database.types';
import * as ElderlyRepository from '@/services/elderly.repository';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook to manage elderly profiles
 */
export const useElderlyProfiles = (userId: string) => {
  const [profiles, setProfiles] = useState<ElderlyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const data = await ElderlyRepository.getAllElderlyProfiles(userId);
      setProfiles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching elderly profiles:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const addProfile = async (profile: Omit<ElderlyProfile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await ElderlyRepository.createElderlyProfile(profile);
      await fetchProfiles();
    } catch (err) {
      console.error('Error adding elderly profile:', err);
      throw err;
    }
  };

  const updateProfile = async (id: string, profile: Partial<ElderlyProfile>) => {
    try {
      await ElderlyRepository.updateElderlyProfile(id, profile);
      await fetchProfiles();
    } catch (err) {
      console.error('Error updating elderly profile:', err);
      throw err;
    }
  };

  const deleteProfile = async (id: string) => {
    try {
      await ElderlyRepository.deleteElderlyProfile(id);
      await fetchProfiles();
    } catch (err) {
      console.error('Error deleting elderly profile:', err);
      throw err;
    }
  };

  return {
    profiles,
    loading,
    error,
    refresh: fetchProfiles,
    addProfile,
    updateProfile,
    deleteProfile,
  };
};

/**
 * Hook to manage caregivers
 */
export const useCaregivers = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCaregivers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CaregiverRepository.getAvailableCaregivers();
      setCaregivers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching caregivers:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCaregivers();
  }, [fetchCaregivers]);

  const searchCaregivers = async (searchTerm: string) => {
    try {
      const data = await CaregiverRepository.searchCaregivers(searchTerm);
      setCaregivers(data);
    } catch (err) {
      console.error('Error searching caregivers:', err);
      throw err;
    }
  };

  const filterByRating = async (minRating: number) => {
    try {
      const data = await CaregiverRepository.getCaregiversByRating(minRating);
      setCaregivers(data);
    } catch (err) {
      console.error('Error filtering caregivers by rating:', err);
      throw err;
    }
  };

  const filterByPrice = async (minRate: number, maxRate: number) => {
    try {
      const data = await CaregiverRepository.getCaregiversByPriceRange(minRate, maxRate);
      setCaregivers(data);
    } catch (err) {
      console.error('Error filtering caregivers by price:', err);
      throw err;
    }
  };

  return {
    caregivers,
    loading,
    error,
    refresh: fetchCaregivers,
    searchCaregivers,
    filterByRating,
    filterByPrice,
  };
};

/**
 * Hook to manage appointments
 */
export const useAppointments = (userId: string, role?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      let data;
      // If user is caregiver, get appointments by caregiver_id
      if (role === 'Caregiver') {
        data = await AppointmentRepository.getAppointmentsByCaregiver(userId);
      } else {
        // Otherwise get by user_id (care seeker)
        data = await AppointmentRepository.getAllAppointments(userId);
      }
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, role]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const getByStatus = async (status: string) => {
    try {
      const data = await AppointmentRepository.getAppointmentsByStatus(userId, status);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching appointments by status:', err);
      throw err;
    }
  };

  const getTodayAppointments = async () => {
    try {
      const data = await AppointmentRepository.getTodayAppointments(userId);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching today appointments:', err);
      throw err;
    }
  };

  const getUpcoming = async () => {
    try {
      const data = await AppointmentRepository.getUpcomingAppointments(userId);
      setAppointments(data);
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err);
      throw err;
    }
  };

  const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await AppointmentRepository.createAppointment(appointment);
      await fetchAppointments();
    } catch (err) {
      console.error('Error creating appointment:', err);
      throw err;
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await AppointmentRepository.updateAppointmentStatus(id, status);
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      throw err;
    }
  };

  return {
    appointments,
    loading,
    error,
    refresh: fetchAppointments,
    getByStatus,
    getTodayAppointments,
    getUpcoming,
    createAppointment,
    updateStatus,
  };
};

/**
 * Hook to get a single elderly profile
 */
export const useElderlyProfile = (id: string) => {
  const [profile, setProfile] = useState<ElderlyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await ElderlyRepository.getElderlyProfileById(id);
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching elderly profile:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  return { profile, loading, error };
};

/**
 * Hook to get a single caregiver
 */
export const useCaregiver = (id: string) => {
  const [caregiver, setCaregiver] = useState<Caregiver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCaregiver = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await CaregiverRepository.getCaregiverById(id);
        setCaregiver(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching caregiver:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCaregiver();
  }, [id]);

  return { caregiver, loading, error };
};

/**
 * Hook to get a single appointment
 */
export const useAppointment = (id: string) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await AppointmentRepository.getAppointmentById(id);
        setAppointment(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  return { appointment, loading, error };
};
