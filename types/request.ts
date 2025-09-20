export interface Request {
  id: string;
  type: 'booking' | 'counter' | 'modification';
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Request details
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  
  // Participants
  requester: {
    id: string;
    name: string;
    avatar: string;
    type: 'elderly' | 'caregiver';
  };
  recipient: {
    id: string;
    name: string;
    avatar: string;
    type: 'elderly' | 'caregiver';
  };
  
  // Related entities
  elderlyId?: string;
  caregiverId?: string;
  
  // Request specific data
  bookingDetails?: {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    duration: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'unlimited';
    hourlyRate?: number;
    totalAmount?: number;
    workingDays: string[];
    timeSlots: string[];
    specialRequirements?: string;
  };
  
  // Communication
  messages: RequestMessage[];
  
  // Actions history
  actions: RequestAction[];
}

export interface RequestMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
}

export interface RequestAction {
  id: string;
  action: 'created' | 'accepted' | 'rejected' | 'cancelled' | 'modified' | 'countered';
  actorId: string;
  actorName: string;
  timestamp: string;
  comment?: string;
  previousStatus?: string;
  newStatus?: string;
}

export type RequestStatus = Request['status'];
export type RequestType = Request['type'];
export type RequestPriority = Request['priority'];
