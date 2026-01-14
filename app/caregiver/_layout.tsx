import CaregiverSidebar from "@/components/navigation/caregiverSidebar";

export default function CaregiverLayout() {
  // Let login.tsx handle redirect, sidebar will render the correct screen
  return <CaregiverSidebar />;
}
