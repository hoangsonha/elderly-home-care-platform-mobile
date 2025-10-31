// Temporary global store for mock data
// In production, this should be replaced with proper state management (Redux, Context API) or API calls

type AppointmentStatus = "new" | "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "rejected";

// Global appointments data
export const appointmentsStore: { [key: string]: any } = {
  "1": {
    id: "1",
    status: "in-progress",
    hasReviewed: false,
  },
  "2": {
    id: "2",
    status: "pending",
    hasReviewed: false,
  },
  "3": {
    id: "3",
    status: "new",
    hasReviewed: false,
  },
};

// Listeners for status changes
const listeners: (() => void)[] = [];

export const updateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
  if (appointmentsStore[id]) {
    appointmentsStore[id].status = newStatus;
    // Notify all listeners
    listeners.forEach(listener => listener());
  }
};

export const getAppointmentStatus = (id: string): AppointmentStatus | undefined => {
  return appointmentsStore[id]?.status;
};

export const subscribeToStatusChanges = (callback: () => void) => {
  listeners.push(callback);
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
};

export const markAppointmentAsReviewed = (id: string) => {
  if (appointmentsStore[id]) {
    appointmentsStore[id].hasReviewed = true;
    // Notify all listeners
    listeners.forEach(listener => listener());
  } else {
    // Initialize if doesn't exist
    appointmentsStore[id] = {
      id,
      status: "completed",
      hasReviewed: true,
    };
    listeners.forEach(listener => listener());
  }
};

export const getAppointmentHasReviewed = (id: string): boolean => {
  return appointmentsStore[id]?.hasReviewed || false;
};

