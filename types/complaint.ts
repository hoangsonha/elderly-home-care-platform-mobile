export interface ComplaintUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: 'admin' | 'member' | 'caregiver';
}

export interface ComplaintService {
  id: string;
  name: string;
  type: 'caregiver_service' | 'family_service' | 'other';
  caregiver?: ComplaintUser;
  family?: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export interface ComplaintEvidence {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface Complaint {
  id: string;
  type: 'salary' | 'behavior' | 'quality' | 'schedule' | 'payment' | 'other';
  title: string;
  description: string;
  complainant: ComplaintUser; // Người khiếu nại
  accused: ComplaintUser; // Người bị khiếu nại
  service: ComplaintService; // Dịch vụ liên quan
  evidences: ComplaintEvidence[];
  status: 'pending' | 'received' | 'processing' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  adminNotes?: string;
}

export type ComplaintStatus = 'pending' | 'received' | 'processing' | 'resolved' | 'rejected';
export type ComplaintType = 'salary' | 'behavior' | 'quality' | 'schedule' | 'payment' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ComplaintFormData {
  serviceId: string;
  accusedId: string;
  type: ComplaintType;
  title: string;
  description: string;
  evidences: ComplaintEvidence[];
}

export interface ComplaintTab {
  id: 'my_complaints' | 'complaints_against_me';
  title: string;
  icon: string;
}
