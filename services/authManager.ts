
import { UserProfile } from '../types';

export type AuthRole = 'guest' | 'user' | 'astrologer';

export interface AuthState {
  role: AuthRole;
  user: UserProfile | null;
  email?: string;
  isLoggedIn: boolean;
}

const STORAGE_KEY = 'astroveda_auth_state';

export const getAuthState = (): AuthState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Auth state parse error", e);
    }
  }
  return { role: 'guest', user: null, isLoggedIn: false };
};

export const saveAuthState = (state: AuthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loginUser = (profile: UserProfile, email: string) => {
  const newState: AuthState = {
    role: 'user',
    user: profile,
    email,
    isLoggedIn: true
  };
  saveAuthState(newState);
  return newState;
};

export const loginAstrologer = (profile: UserProfile, email: string) => {
  const newState: AuthState = {
    role: 'astrologer',
    user: profile,
    email,
    isLoggedIn: true
  };
  saveAuthState(newState);
  return newState;
};

export const logout = () => {
  const newState: AuthState = { role: 'guest', user: null, isLoggedIn: false };
  saveAuthState(newState);
  return newState;
};
