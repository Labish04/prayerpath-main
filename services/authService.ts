import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, TOKEN_KEY } from './api';
import { ENDPOINTS } from './url';
import { AuthResponse, OnboardingData, User, BlockedApp } from '../types/auth';

const USER_KEY = 'prayer_path_user_data';

export const authService = {
  // --- API Calls ---
  
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response?.token && response?.user) {
      await this.saveSession(response.token, response.user);
    }
    return response;
  },

  async signup(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(ENDPOINTS.AUTH.SIGNUP, { name, email, password });
    if (response?.token && response?.user) {
      await this.saveSession(response.token, response.user);
    }
    return response;
  },

  async updateOnboarding(data: OnboardingData): Promise<{ message: string; user: User }> {
    return api.put<{ message: string; user: User }>(ENDPOINTS.AUTH.ONBOARDING, data);
  },

  async updateBlockedApps(blockedApps: BlockedApp[]): Promise<{ message: string; blockedApps: BlockedApp[] }> {
    return api.put<{ message: string; blockedApps: BlockedApp[] }>(ENDPOINTS.USER.BLOCKED_APPS, { blockedApps });
  },

  async updateSettings(settings: { mode?: string; frequency?: string }): Promise<{ message: string; user: User }> {
    return api.put<{ message: string; user: User }>(ENDPOINTS.USER.SETTINGS, settings);
  },

  // --- Session Management ---

  async saveSession(token: string, user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving session to AsyncStorage:', e);
      throw e;
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing session from AsyncStorage:', e);
      throw e;
    }
  },

  async getSession(): Promise<{ token: string | null; user: User | null }> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      const user = userJson ? (JSON.parse(userJson) as User) : null;
      return { token, user };
    } catch (e) {
      console.error('Error fetching session from AsyncStorage:', e);
      return { token: null, user: null };
    }
  },

  async updateUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error updating user in AsyncStorage:', e);
    }
  }
};
