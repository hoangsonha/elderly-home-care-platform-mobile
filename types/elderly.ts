export interface ElderlyProfile {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  healthStatus: 'good' | 'fair' | 'poor';
  currentCaregivers: number;
  family: string;
  personalInfo: {
    name: string;
    age: number;
    phoneNumber: string;
    address: string;
  };
  medicalConditions: {
    underlyingDiseases: string[];
    specialConditions: string[];
    allergies: string[];
    medications?: { name: string; dosage: string; frequency: string }[];
  };
  independenceLevel: {
    eating: string;
    bathing: string;
    mobility: string;
    toileting: string;
    dressing: string;
  };
  careNeeds: {
    conversation: boolean;
    reminders: boolean;
    dietSupport: boolean;
    exercise: boolean;
    medicationManagement: boolean;
    companionship: boolean;
  };
  preferences: {
    hobbies: string[];
    favoriteActivities: string[];
    foodPreferences: string[];
  };
  livingEnvironment: {
    houseType: string;
    livingWith: string[];
    surroundings?: string;
    accessibility?: string[];
  };
}
