export interface HiredCaregiver {
  id: string;
  name: string;
  age: number;
  avatar: string;
  isCurrentlyCaring: boolean;
  currentElderly: {
    id: string;
    name: string;
    age: number;
  }[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string;
  workingDays: string[];
  timeSlots: string[];
  status: 'active' | 'paused' | 'completed';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  scheduledTime: string; // ISO string
  duration: number; // in minutes
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  assignedTo: {
    id: string;
    name: string;
  };
  elderly: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface TaskDay {
  date: string; // YYYY-MM-DD format
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type HiredStatus = HiredCaregiver['status'];
