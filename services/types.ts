/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://192.168.2.224:8000',
  ENDPOINTS: {
    MATCH_MOBILE: '/api/match-mobile',
    MATCH: '/api/match',
    CAREGIVERS: '/api/caregivers',
    REQUESTS: '/api/requests',
    HEALTH: '/health'
  },
  TIMEOUT: 30000, // 30 seconds
};

/**
 * API Response Types
 */
export interface CaregiverRecommendation {
  rank: number;
  caregiver_id: string;
  name: string;
  age: number;
  gender: string;
  rating: number;
  total_reviews: number;
  years_experience: number;
  price_per_hour: number;
  distance_km: number;
  distance: string;  // Formatted distance like "2.5 km"
  avatar: string;  // Avatar URL or placeholder
  experience: string;  // Formatted experience string
  isVerified: boolean;  // Verification status
  match_score: number;
  match_percentage: string;
  score_breakdown: {
    credential: number;
    skills: number;
    distance: number;
    time: number;
    rating: number;
    experience: number;
    price: number;
    trust: number;
  };
}

export interface FailureAnalysis {
  total_candidates: number;
  filter_statistics: {
    [key: string]: {
      failed: number;
      percentage: number;
    };
  };
  primary_reason: {
    filter: string;
    message: string;
    failed_count: number;
    failed_percentage: number;
  };
  suggestions: Array<{
    filter: string;
    suggestion: string;
  }>;
}

export interface MatchResponse {
  request_id?: string;
  care_level?: number;
  seeker_name?: string;
  location?: {
    lat: number;
    lon: number;
    address: string;
  };
  total_matches: number;
  recommendations: CaregiverRecommendation[];
  failure_analysis?: FailureAnalysis;
}

export interface MobileMatchRequest {
  seeker_name: string;
  care_level: number;
  health_status: string;
  elderly_age: number;
  caregiver_age_range?: [number, number] | null;
  gender_preference?: string | null;
  required_years_experience?: number | null;
  overall_rating_range?: [number, number] | null;
  personality: string[];
  attitude: string[];
  skills: {
    required_skills: string[];
    priority_skills: string[];
  };
  time_slots: {
    day: string;
    start: string;
    end: string;
  }[];
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  budget_per_hour: number;
  top_n?: number;
}

/**
 * API Error Types
 */
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export class ApiException extends Error {
  public status?: number;
  public details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.details = details;
  }
}
