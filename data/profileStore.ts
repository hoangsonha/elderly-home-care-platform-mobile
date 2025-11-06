// Mock store for caregiver profile status
type ProfileStatus = "pending" | "rejected" | "approved";

interface ProfileStatusData {
  status: ProfileStatus;
  rejectionReason?: string;
}

// Mock data - in real app, this would come from API
const profileStatusMap: Record<string, ProfileStatusData> = {};

export const hasProfile = (userId: string): boolean => {
  return !!profileStatusMap[userId];
};

export const getProfileStatus = (userId: string): ProfileStatusData => {
  return profileStatusMap[userId] || { status: "pending" };
};

export const setProfileStatus = (
  userId: string,
  status: ProfileStatus,
  rejectionReason?: string
) => {
  profileStatusMap[userId] = {
    status,
    rejectionReason,
  };
};

export const submitProfileForReview = (userId: string) => {
  profileStatusMap[userId] = {
    status: "pending",
  };
};

export const approveProfile = (userId: string) => {
  const current = profileStatusMap[userId];
  if (current) {
    current.status = "approved";
  } else {
    profileStatusMap[userId] = { status: "approved" };
  }
};

export const rejectProfile = (userId: string, reason: string) => {
  profileStatusMap[userId] = {
    status: "rejected",
    rejectionReason: reason,
  };
};

