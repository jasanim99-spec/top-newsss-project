import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '@/firebase/auth';

export const authService = {
  async login(email: string, pass: string): Promise<User> {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return credential.user;
  },

  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  subscribeToAuthState(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
