// Elderly Profile Types
export interface ElderlyProfile {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  address?: string;
  phone?: string;
  blood_type?: string;
  health_condition?: string;
  underlying_diseases?: string[]; // JSON string in DB
  medications?: Medication[]; // JSON string in DB
  allergies?: string[]; // JSON string in DB
  special_conditions?: string[]; // JSON string in DB
  independence_level?: IndependenceLevel; // JSON string in DB
  living_environment?: LivingEnvironment; // JSON string in DB
  hobbies?: string[]; // JSON string in DB
  favorite_activities?: string[]; // JSON string in DB
  food_preferences?: string[]; // JSON string in DB
  emergency_contact?: EmergencyContactInfo; // JSON string in DB
  created_at?: string;
  updated_at?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface IndependenceLevel {
  eating: 'independent' | 'assisted' | 'dependent';
  bathing: 'independent' | 'assisted' | 'dependent';
  mobility: 'independent' | 'assisted' | 'dependent';
  toileting: 'independent' | 'assisted' | 'dependent';
  dressing: 'independent' | 'assisted' | 'dependent';
}

export interface LivingEnvironment {
  houseType: 'private_house' | 'apartment' | 'nursing_home';
  livingWith: string[];
  accessibility: string[];
}

export interface EmergencyContactInfo {
  name: string;
  relationship: string;
  phone: string;
}

// Caregiver Types
export interface Caregiver {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  phone?: string;
  address?: string;
  experience_years?: number;
  rating: number;
  total_reviews: number;
  hourly_rate?: number;
  specializations?: string[]; // JSON string in DB
  certificates?: string[]; // JSON string in DB
  languages?: string[]; // JSON string in DB
  bio?: string;
  is_verified: boolean;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  user_id: string;
  caregiver_id: string;
  elderly_profile_id: string;
  booking_type: 'immediate' | 'schedule';
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  package_type?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time?: string;
  duration?: string;
  work_location?: string;
  tasks?: Task[]; // JSON string in DB
  notes?: string;
  total_amount?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  time?: string;
  required?: boolean;
}

// Review Types
export interface Review {
  id: string;
  appointment_id: string;
  user_id: string;
  caregiver_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

// Complaint Types
export interface Complaint {
  id: string;
  user_id: string;
  appointment_id?: string;
  caregiver_id?: string;
  title: string;
  description: string;
  category: 'service_quality' | 'behavior' | 'payment' | 'scheduling' | 'other';
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  response?: string;
  resolved_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Emergency Contact Types
export interface EmergencyContact {
  id: string;
  user_id: string;
  elderly_profile_id?: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

// Favorite Caregiver Types
export interface FavoriteCaregiver {
  id: string;
  user_id: string;
  caregiver_id: string;
  created_at?: string;
}

// Chat Message Types
export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'review' | 'complaint' | 'system' | 'chat';
  related_id?: string;
  is_read: boolean;
  created_at?: string;
}

// Database row types (with JSON strings)
export interface ElderlyProfileRow extends Omit<ElderlyProfile, 
  'underlying_diseases' | 'medications' | 'allergies' | 'special_conditions' | 
  'independence_level' | 'living_environment' | 'hobbies' | 'favorite_activities' | 
  'food_preferences' | 'emergency_contact'> {
  underlying_diseases: string;
  medications: string;
  allergies: string;
  special_conditions: string;
  independence_level: string;
  living_environment: string;
  hobbies: string;
  favorite_activities: string;
  food_preferences: string;
  emergency_contact: string;
}

export interface CaregiverRow extends Omit<Caregiver, 
  'specializations' | 'certificates' | 'languages' | 'is_verified' | 'is_available'> {
  specializations: string;
  certificates: string;
  languages: string;
  is_verified: number;
  is_available: number;
}

export interface AppointmentRow extends Omit<Appointment, 'tasks'> {
  tasks: string;
}

export interface EmergencyContactRow extends Omit<EmergencyContact, 'is_primary'> {
  is_primary: number;
}

export interface ChatMessageRow extends Omit<ChatMessage, 'is_read'> {
  is_read: number;
}

export interface NotificationRow extends Omit<Notification, 'is_read'> {
  is_read: number;
}
