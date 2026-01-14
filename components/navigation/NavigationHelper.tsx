import { router } from 'expo-router';

/**
 * Navigation Helper - Tập trung quản lý navigation trong app
 */
export class NavigationHelper {
  /**
   * Navigate đến trang login
   */
  static goToLogin() {
    router.replace('/login');
  }

  /**
   * Navigate đến trang profile setup
   */
  static goToProfileSetup() {
    router.push('/profile-setup');
  }

  /**
   * Navigate đến tabs (home page)
   */
  static goToHome() {
    router.replace('/');
  }

  /**
   * Navigate đến explore tab
   */
  static goToExplore() {
    router.push('/(tabs)/explore');
  }

  /**
   * Mở modal
   */
  static openModal() {
    router.push('/modal');
  }

  /**
   * Đóng modal hoặc quay lại trang trước
   */
  static goBack() {
    if (router.canGoBack()) {
      router.back();
    }
  }

  /**
   * Reset navigation stack và đi đến trang mới
   */
  static resetTo(route: string) {
    router.replace(route);
  }

  /**
   * Check xem có thể quay lại không
   */
  static canGoBack(): boolean {
    return router.canGoBack();
  }

  /**
   * Navigate đến appointment detail (caregiver)
   */
  static goToAppointmentDetail(appointmentId: string, fromScreen?: string) {
    router.push({
      pathname: "/caregiver/appointment-detail",
      params: {
        appointmentId,
        fromScreen: fromScreen || "notification",
      },
    } as any);
  }

  /**
   * Navigate đến booking screen (caregiver)
   */
  static goToBooking(initialTab?: string, careServiceId?: string) {
    router.push({
      pathname: "/caregiver/booking",
      params: {
        initialTab: initialTab || "Tất cả",
        careServiceId: careServiceId || undefined,
      },
    } as any);
  }
}

/**
 * Routes constants - Tập trung quản lý tất cả routes
 */
export const ROUTES = {
  LOGIN: '/login',
  PROFILE_SETUP: '/profile-setup',
  HOME: '/',
  EXPLORE: '/explore',
  MODAL: '/modal',
} as const;

/**
 * Hook để sử dụng navigation dễ dàng hơn
 */
export const useNavigation = () => {
  const navigate = (route: string) => {
    router.push(route);
  };

  const replace = (route: string) => {
    router.replace(route);
  };

  const goBack = () => {
    NavigationHelper.goBack();
  };

  return {
    navigate,
    replace,
    goBack,
    routes: ROUTES,
    helper: NavigationHelper,
  };
};

