// Temporary global store for mock data
// In production, this should be replaced with proper state management (Redux, Context API) or API calls

type AppointmentStatus = "new" | "pending" | "confirmed" | "in-progress" | "completed" | "cancelled" | "rejected";

export type ComplaintStatus = "pending" | "reviewing" | "need_more_info" | "resolved" | "refunded" | "rejected";

export interface ReviewData {
  cooperation: number;
  communication: number;
  respect: number;
  readiness: number;
  workingEnvironment: number;
  familySupport: string;
  issues: string[];
  recommendation: string;
  additionalNotes: string;
  submittedAt: string;
}

// Global appointments data
export const appointmentsStore: { [key: string]: any } = {
  "1": {
    id: "1",
    status: "in-progress",
    hasReviewed: false,
    review: null as ReviewData | null,
    hasComplained: false,
    complaint: null as any,
    hasComplaintFeedback: false,
    complaintFeedback: null as any,
  },
  "2": {
    id: "2",
    status: "pending",
    hasReviewed: false,
    review: null as ReviewData | null,
    hasComplained: false,
    complaint: null as any,
    hasComplaintFeedback: false,
    complaintFeedback: null as any,
  },
  "3": {
    id: "3",
    status: "new",
    hasReviewed: false,
    review: null as ReviewData | null,
    hasComplained: false,
    complaint: null as any,
    hasComplaintFeedback: false,
    complaintFeedback: null as any,
  },
  "4": {
    id: "4",
    status: "completed",
    hasReviewed: false,
    review: null as ReviewData | null,
    hasComplained: true,
    complaint: {
      selectedTypes: ["quality", "unprofessional"],
      description: "Chất lượng dịch vụ không đạt yêu cầu, nhân viên thiếu chuyên nghiệp trong quá trình chăm sóc.",
      urgency: "high",
      uploadedFiles: [],
      submittedAt: new Date().toISOString(),
      status: "reviewing" as ComplaintStatus,
    },
    hasComplaintFeedback: false,
    complaintFeedback: null as any,
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

export const markAppointmentAsReviewed = (id: string, reviewData?: ReviewData) => {
  if (appointmentsStore[id]) {
    appointmentsStore[id].hasReviewed = true;
    if (reviewData) {
      appointmentsStore[id].review = reviewData;
    }
    // Notify all listeners
    listeners.forEach(listener => listener());
  } else {
    // Initialize if doesn't exist
    appointmentsStore[id] = {
      id,
      status: "completed",
      hasReviewed: true,
      review: reviewData || null,
    };
    listeners.forEach(listener => listener());
  }
};

export const getAppointmentReview = (id: string): ReviewData | null => {
  return appointmentsStore[id]?.review || null;
};

export const getAppointmentHasReviewed = (id: string): boolean => {
  return appointmentsStore[id]?.hasReviewed || false;
};

export const markAppointmentAsComplained = (id: string, complaintData?: any) => {
  if (appointmentsStore[id]) {
    appointmentsStore[id].hasComplained = true;
    if (complaintData) {
      // Set default status if not provided
      if (!complaintData.status) {
        complaintData.status = "reviewing";
      }
      appointmentsStore[id].complaint = complaintData;
    }
    // Notify all listeners
    listeners.forEach(listener => listener());
  } else {
    // Initialize if doesn't exist
    const newComplaintData = complaintData || {};
    if (!newComplaintData.status) {
      newComplaintData.status = "reviewing";
    }
    appointmentsStore[id] = {
      id,
      status: "completed",
      hasReviewed: false,
      review: null,
      hasComplained: true,
      complaint: newComplaintData,
    };
    listeners.forEach(listener => listener());
  }
};

export const updateComplaintStatus = (id: string, newStatus: ComplaintStatus) => {
  if (appointmentsStore[id]?.complaint) {
    appointmentsStore[id].complaint.status = newStatus;
    // Notify all listeners
    listeners.forEach(listener => listener());
  }
};

export const getComplaintStatus = (id: string): ComplaintStatus | undefined => {
  return appointmentsStore[id]?.complaint?.status;
};

export const getAppointmentComplaint = (id: string): any => {
  return appointmentsStore[id]?.complaint || null;
};

export const getAppointmentHasComplained = (id: string): boolean => {
  return appointmentsStore[id]?.hasComplained || false;
};

export const markComplaintFeedbackSubmitted = (id: string, feedbackData?: any) => {
  if (appointmentsStore[id]) {
    appointmentsStore[id].hasComplaintFeedback = true;
    if (feedbackData) {
      appointmentsStore[id].complaintFeedback = feedbackData;
    }
    // Notify all listeners
    listeners.forEach(listener => listener());
  } else {
    // Initialize if doesn't exist
    appointmentsStore[id] = {
      id,
      status: "completed",
      hasReviewed: false,
      review: null,
      hasComplained: false,
      complaint: null,
      hasComplaintFeedback: true,
      complaintFeedback: feedbackData || null,
    };
    listeners.forEach(listener => listener());
  }
};

export const getComplaintFeedback = (id: string): any => {
  return appointmentsStore[id]?.complaintFeedback || null;
};

export const getHasComplaintFeedback = (id: string): boolean => {
  return appointmentsStore[id]?.hasComplaintFeedback || false;
};


