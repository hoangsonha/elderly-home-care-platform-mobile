export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'member';
  joinedDate: string;
}

export interface Elderly {
  id: string;
  name: string;
  age: number;
  healthStatus: 'good' | 'medium' | 'poor';
  avatar?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  experience: string;
  specialties: string[];
  hourlyRate: number;
  distance: string;
  isVerified: boolean;
  totalReviews: number;
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  elderly: Elderly[];
}

// ===== FAMILY REQUESTS =====
export interface HireCaregiverRequest {
  id: string;
  type: 'hire_caregiver';
  requester: FamilyMember;
  caregiver: Caregiver;
  elderly: Elderly;
  family: Family;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export interface JoinFamilyRequest {
  id: string;
  type: 'join_family';
  requester: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  targetFamily: Family;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export interface PaymentRequest {
  id: string;
  type: 'payment';
  requester: FamilyMember;
  caregiver: Caregiver;
  elderly: Elderly;
  family: Family;
  paymentInfo: {
    month: string;
    year: number;
    amount: number;
    description: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
}

export type FamilyRequest = HireCaregiverRequest | JoinFamilyRequest | PaymentRequest;

// ===== CAREGIVER REQUESTS =====
export interface VideoCallRequest {
  id: string;
  type: 'video_call';
  caregiver: Caregiver;
  family: Family;
  elderly: Elderly;
  scheduledTime: string;
  duration: number; // minutes
  status: 'waiting_response' | 'responded' | 'accepted' | 'rejected';
  caregiverResponse?: {
    message: string;
    newScheduledTime?: string;
    respondedAt: string;
  };
  createdAt: string;
}

export interface ScheduleRequest {
  id: string;
  type: 'schedule';
  caregiver: Caregiver;
  family: Family;
  elderly: Elderly;
  requestedSchedule: {
    date: string;
    timeSlots: string[];
    tasks: string[];
  };
  status: 'waiting_response' | 'responded' | 'accepted' | 'rejected';
  caregiverResponse?: {
    message: string;
    modifiedSchedule?: {
      date: string;
      timeSlots: string[];
      tasks: string[];
    };
    respondedAt: string;
  };
  createdAt: string;
}

export type CaregiverRequest = VideoCallRequest | ScheduleRequest;

// ===== REQUEST STATUS =====
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'waiting_response' | 'responded' | 'accepted';

export interface RequestAction {
  type: 'approve' | 'reject' | 'modify';
  reason?: string;
  modifiedData?: any;
}