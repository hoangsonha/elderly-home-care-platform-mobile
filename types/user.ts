export type UserRole = 'guest' | 'care-seeker' | 'caregiver' | 'admin';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isVerified?: boolean;
  profile?: {
    phone?: string;
    address?: string;
    avatar?: string;
    // Care Seeker specific
    elderlyCareNeeds?: string[];
    emergencyContact?: string;
    // Caregiver specific
    certifications?: string[];
    experience?: number;
    specialties?: string[];
    rating?: number;
    // Admin specific
    permissions?: string[];
  };
}

export interface RolePermissions {
  canAccessDashboard: boolean;
  canBookServices: boolean;
  canProvideServices: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  guest: {
    canAccessDashboard: false,
    canBookServices: false,
    canProvideServices: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  'care-seeker': {
    canAccessDashboard: true,
    canBookServices: true,
    canProvideServices: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  caregiver: {
    canAccessDashboard: true,
    canBookServices: false,
    canProvideServices: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerateContent: false,
  },
  admin: {
    canAccessDashboard: true,
    canBookServices: true,
    canProvideServices: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canModerateContent: true,
  },
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  guest: 'Khách',
  'care-seeker': 'Người cần chăm sóc',
  caregiver: 'Người chăm sóc',
  admin: 'Quản trị viên',
};
