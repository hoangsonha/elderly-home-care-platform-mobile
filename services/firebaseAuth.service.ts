import auth from '@react-native-firebase/auth';

/**
 * Firebase Authentication Service
 * Dùng để authenticate với Firebase sau khi login với backend
 */
class FirebaseAuthService {
  /**
   * Sign in với custom token từ backend
   * Backend cần tạo custom token cho Firebase và trả về trong login response
   */
  async signInWithCustomToken(customToken: string): Promise<boolean> {
    try {
      await auth().signInWithCustomToken(customToken);
      return true;
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Sign in với email/password (nếu backend chưa có custom token)
   * Tạm thời dùng email/password để test
   */
  async signInWithEmail(email: string, password: string): Promise<boolean> {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      return true;
    } catch (error: any) {
      // Nếu user chưa có, tạo mới
      if (error.code === 'auth/user-not-found') {
        try {
          await auth().createUserWithEmailAndPassword(email, password);
          return true;
        } catch (createError: any) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  /**
   * Sign out khỏi Firebase
   * Chỉ sign out nếu có user đang authenticated
   */
  async signOut(): Promise<void> {
    try {
      // Check xem có user đang sign in không
      const currentUser = auth().currentUser;
      if (!currentUser) {
        // Không có user nào đang sign in, không cần sign out
        return;
      }
      await auth().signOut();
    } catch (error: any) {
      // Ignore error nếu không có user (auth/no-current-user)
      if (error.code === 'auth/no-current-user') {
        // Không có user, không cần sign out
        return;
      }
    }
  }

  /**
   * Get current user ID từ Firebase
   */
  getCurrentUserId(): string | null {
    const user = auth().currentUser;
    return user ? user.uid : null;
  }

  /**
   * Check xem user đã authenticated chưa
   */
  isAuthenticated(): boolean {
    return auth().currentUser !== null;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export { FirebaseAuthService };
