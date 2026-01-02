import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom hook to calculate padding bottom for screens with bottom navigation
 * Accounts for bottom navigation bar height + safe area insets (for devices with gesture navigation)
 */
export function useBottomNavPadding() {
  const insets = useSafeAreaInsets();
  
  // Bottom nav height is approximately:
  // - paddingVertical: 8 (top) + 6 (item padding) = 14
  // - icon: 40
  // - text: ~20
  // - gap: ~8
  // Total: ~82px, rounded to 80
  const BOTTOM_NAV_HEIGHT = 80;
  
  // Add safe area bottom inset (for gesture navigation phones)
  const paddingBottom = Math.max(insets.bottom, 8) + BOTTOM_NAV_HEIGHT;
  
  return paddingBottom;
}



